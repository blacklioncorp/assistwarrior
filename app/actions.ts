'use server'

import { createClient } from '@/lib/utils/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import Stripe from 'stripe'

// Initialize Stripe (will fail gracefully if keys are placeholder)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia' as any,
})

// ── Zod Validation Schemas ──

const newPatientSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone_whatsapp: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
})

const newAppointmentSchema = z.object({
  patient_id: z.string().uuid('Debes seleccionar un paciente válido').optional().or(z.literal('')),
  new_patient_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional().or(z.literal('')),
  new_patient_phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos').optional().or(z.literal('')),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  starts_at: z.string().datetime(),
  duration_minutes: z.number().int().positive().default(30),
  notes: z.string().optional(),
})

const settingsSchema = z.object({
  full_name: z.string().min(2, 'Nombre inválido').optional(),
  clinic_name: z.string().optional(),
  specialty: z.string().optional(),
  phone_whatsapp: z.string().optional(),
  tone_prompt: z.string().optional(),
  whatsapp_phone_number_id: z.string().optional(),
  voice_phone_number: z.string().optional(),
  voice_enabled: z.boolean().optional(),
})

// ── Actions ──

/**
 * Creates a new patient associated with the authenticated professional.
 */
export async function createPatient(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const validatedFields = newPatientSchema.safeParse({
    full_name: formData.get('full_name'),
    phone_whatsapp: formData.get('phone_whatsapp'),
    email: formData.get('email'),
    notes: formData.get('notes'),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { full_name, phone_whatsapp, email, notes } = validatedFields.data

  const { data, error } = await supabase
    .from('patients')
    .insert({
      professional_id: user.id,
      full_name,
      phone_whatsapp,
      email: email || null,
      notes,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique constraint violation (professional_id + phone)
      return { error: 'Ya existe un paciente con este número de WhatsApp' }
    }
    return { error: 'Error al registrar paciente: ' + error.message }
  }

  // Also log activity
  await supabase.from('activity_log').insert({
    professional_id: user.id,
    type: 'new_patient',
    title: 'Nuevo paciente registrado',
    description: `${full_name} fue registrado desde el dashboard`,
    related_id: data.id
  })

  revalidatePath('/dashboard/patients')
  revalidatePath('/dashboard')
  return { success: true, data }
}

/**
 * Creates a new appointment, performing local availability & working hours checks.
 */
export async function createAppointment(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const startsAt = formData.get('starts_at') as string
  const duration = parseInt(formData.get('duration_minutes') as string || '30', 10)
  
  const validatedFields = newAppointmentSchema.safeParse({
    patient_id: formData.get('patient_id'),
    new_patient_name: formData.get('new_patient_name'),
    new_patient_phone: formData.get('new_patient_phone'),
    title: formData.get('title'),
    starts_at: startsAt,
    duration_minutes: duration,
    notes: formData.get('notes'),
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const { patient_id, new_patient_name, new_patient_phone, title, starts_at, duration_minutes, notes } = validatedFields.data

  let finalPatientId = patient_id
  let patientName = ''
  let patientPhone = ''

  if (patient_id) {
    // Fetch patient name and phone for denormalization
    const { data: patient } = await supabase
      .from('patients')
      .select('full_name, phone_whatsapp')
      .eq('id', patient_id)
      .single()

    if (!patient) return { error: 'Paciente no encontrado' }
    patientName = patient.full_name
    patientPhone = patient.phone_whatsapp
  } else if (new_patient_name && new_patient_phone) {
    // Check if patient with this WhatsApp already exists for this professional
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id, full_name, phone_whatsapp')
      .eq('professional_id', user.id)
      .eq('phone_whatsapp', new_patient_phone)
      .maybeSingle()

    if (existingPatient) {
      finalPatientId = existingPatient.id
      patientName = existingPatient.full_name
      patientPhone = existingPatient.phone_whatsapp
    } else {
      // Create new patient inline
      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert({
          professional_id: user.id,
          full_name: new_patient_name,
          phone_whatsapp: new_patient_phone,
        })
        .select()
        .single()

      if (patientError) {
        return { error: 'Error al registrar paciente rápido: ' + patientError.message }
      }

      finalPatientId = newPatient.id
      patientName = newPatient.full_name
      patientPhone = newPatient.phone_whatsapp

      // Log activity for new patient
      await supabase.from('activity_log').insert({
        professional_id: user.id,
        type: 'new_patient',
        title: 'Nuevo paciente registrado',
        description: `${new_patient_name} fue registrado automáticamente al agendar cita`,
        related_id: newPatient.id
      })
    }
  } else {
    return { error: 'Debes seleccionar un paciente existente o ingresar los datos de uno nuevo.' }
  }

  // Calculate ends_at
  const start = new Date(starts_at)
  const end = new Date(start.getTime() + duration_minutes * 60000)

  // 1. Working Hours Check
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayName = daysOfWeek[start.getDay()]

  const { data: profInfo } = await supabase
    .from('professionals')
    .select('working_hours')
    .eq('id', user.id)
    .single()

  if (profInfo?.working_hours) {
    const hours = profInfo.working_hours as Record<string, { start: string; end: string; enabled: boolean }>
    const dayConfig = hours[dayName]
    
    if (!dayConfig || !dayConfig.enabled) {
      return { error: 'No tienes consultas habilitadas para este día de la semana.' }
    }

    // Parse working hours "HH:MM"
    const [startHour, startMin] = dayConfig.start.split(':').map(Number)
    const [endHour, endMin] = dayConfig.end.split(':').map(Number)

    const workStart = new Date(start)
    workStart.setHours(startHour, startMin, 0, 0)

    const workEnd = new Date(start)
    workEnd.setHours(endHour, endMin, 0, 0)

    if (start < workStart || end > workEnd) {
      return { error: `La cita debe agendarse dentro de tu horario de atención: ${dayConfig.start} - ${dayConfig.end}` }
    }
  }

  // 2. Collision overlap check (starts_at < end AND ends_at > start)
  const { data: collisions } = await supabase
    .from('appointments')
    .select('id')
    .eq('professional_id', user.id)
    .in('status', ['scheduled', 'confirmed'])
    .lt('starts_at', end.toISOString())
    .gt('ends_at', start.toISOString())

  if (collisions && collisions.length > 0) {
    return { error: 'Ya tienes una cita agendada que coincide con este horario.' }
  }

  // 2b. Blocked slots check (starts_at < ends_at_blocked AND ends_at > starts_at_blocked)
  const { data: blockedSlots, error: blockedError } = await supabase
    .from('blocked_slots')
    .select('id, title')
    .eq('professional_id', user.id)
    .lt('starts_at', end.toISOString())
    .gt('ends_at', start.toISOString())

  if (blockedError) {
    console.error('Error checking blocked slots:', blockedError)
  }

  if (blockedSlots && blockedSlots.length > 0) {
    return {
      error: `El horario seleccionado coincide con un bloqueo: "${blockedSlots[0].title}". Por favor elige otro horario.`
    }
  }

  // 3. Create appointment
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      professional_id: user.id,
      patient_id: finalPatientId || null,
      patient_name: patientName,
      patient_phone: patientPhone,
      title,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      notes,
      channel: 'dashboard',
      status: 'scheduled'
    })
    .select()
    .single()

  if (error) return { error: 'Error al agendar cita: ' + error.message }

  // Log activity
  await supabase.from('activity_log').insert({
    professional_id: user.id,
    type: 'appointment_booked',
    title: `Cita agendada para ${patientName}`,
    description: `Consulta manual programada a las ${start.toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'})}`,
    related_id: data.id
  })

  revalidatePath('/dashboard/appointments')
  revalidatePath('/dashboard')
  return { success: true, data }
}

/**
 * Cancels an appointment.
 */
export async function cancelAppointment(appointmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)
    .eq('professional_id', user.id)

  if (error) return { error: 'Error al cancelar la cita: ' + error.message }

  // Log activity
  await supabase.from('activity_log').insert({
    professional_id: user.id,
    type: 'appointment_cancelled',
    title: 'Cita cancelada',
    description: 'Una cita fue cancelada manualmente desde el panel',
    related_id: appointmentId
  })

  revalidatePath('/dashboard/appointments')
  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Reschedules an appointment.
 */
export async function rescheduleAppointment(appointmentId: string, newStartsAt: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Fetch appointment to check duration
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .eq('professional_id', user.id)
    .single()

  if (!appointment) return { error: 'Cita no encontrada' }

  const start = new Date(newStartsAt)
  const durationMs = new Date(appointment.ends_at).getTime() - new Date(appointment.starts_at).getTime()
  const end = new Date(start.getTime() + durationMs)

  // Overlap check
  const { data: collisions } = await supabase
    .from('appointments')
    .select('id')
    .eq('professional_id', user.id)
    .neq('id', appointmentId)
    .in('status', ['scheduled', 'confirmed'])
    .lt('starts_at', end.toISOString())
    .gt('ends_at', start.toISOString())

  if (collisions && collisions.length > 0) {
    return { error: 'Ya tienes una cita agendada que coincide con este horario.' }
  }

  // Blocked slots check
  const { data: blockedSlots, error: blockedError } = await supabase
    .from('blocked_slots')
    .select('id, title')
    .eq('professional_id', user.id)
    .lt('starts_at', end.toISOString())
    .gt('ends_at', start.toISOString())

  if (blockedError) {
    console.error('Error checking blocked slots:', blockedError)
  }

  if (blockedSlots && blockedSlots.length > 0) {
    return {
      error: `El horario seleccionado coincide con un bloqueo: "${blockedSlots[0].title}". Por favor elige otro horario.`
    }
  }

  const { error } = await supabase
    .from('appointments')
    .update({
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      status: 'scheduled'
    })
    .eq('id', appointmentId)
    .eq('professional_id', user.id)

  if (error) return { error: 'Error al reagendar la cita: ' + error.message }

  // Log activity
  await supabase.from('activity_log').insert({
    professional_id: user.id,
    type: 'appointment_booked',
    title: `Cita reagendada para ${appointment.patient_name}`,
    description: `Nueva hora: ${start.toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'})}`,
    related_id: appointmentId
  })

  revalidatePath('/dashboard/appointments')
  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Updates settings for the authenticated professional, including tone prompt and business_config fields.
 */
export async function updateSettings(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const validatedFields = settingsSchema.safeParse({
    full_name: formData.get('full_name') ?? undefined,
    clinic_name: formData.get('clinic_name') ?? undefined,
    specialty: formData.get('specialty') ?? undefined,
    phone_whatsapp: formData.get('phone_whatsapp') ?? undefined,
    tone_prompt: formData.get('tone_prompt') ?? undefined,
    whatsapp_phone_number_id: formData.get('whatsapp_phone_number_id') ?? undefined,
  })

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  // Build the standard update payload (only non-empty values)
  const updatePayload: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(validatedFields.data)) {
    if (val !== undefined && val !== null) {
      updatePayload[key] = val
    }
  }

  // ── Handle business_config fields ──
  // These go into the JSONB business_config column and are merged with existing data.
  const businessConfigKeys = ['menu', 'modalities', 'orders_notification_phone', 'menu_image_url']
  const businessConfigUpdates: Record<string, unknown> = {}

  for (const key of businessConfigKeys) {
    const val = formData.get(key)
    if (val !== null) {
      if (key === 'menu' || key === 'modalities') {
        try {
          businessConfigUpdates[key] = JSON.parse(val as string)
        } catch {
          return { error: `Formato inválido para ${key}` }
        }
      } else {
        businessConfigUpdates[key] = val
      }
    }
  }

  if (Object.keys(businessConfigUpdates).length > 0) {
    // Fetch existing config to merge
    const { data: existing } = await supabase
      .from('professionals')
      .select('business_config')
      .eq('id', user.id)
      .single()

    const currentConfig = (existing?.business_config as Record<string, unknown>) ?? {}
    updatePayload.business_config = { ...currentConfig, ...businessConfigUpdates }
  }

  if (Object.keys(updatePayload).length === 0) {
    return { success: true } // nothing to update
  }

  const { error } = await supabase
    .from('professionals')
    .update(updatePayload)
    .eq('id', user.id)

  if (error) return { error: 'Error al actualizar configuración: ' + error.message }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

/**
 * Completes the onboarding process for new professionals.
 */
export async function completeOnboarding(prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const businessTypeId = formData.get('business_type_id') as string
  const clinicName = formData.get('clinic_name') as string
  const fullName = formData.get('full_name') as string

  if (!businessTypeId || businessTypeId.trim() === '') {
    return { error: 'Debes seleccionar un tipo de negocio' }
  }
  if (!clinicName || clinicName.trim().length < 3) {
    return { error: 'El nombre del negocio debe tener al menos 3 caracteres' }
  }
  if (!fullName || fullName.trim().length < 3) {
    return { error: 'Tu nombre completo debe tener al menos 3 caracteres' }
  }

  // Determine a default tone prompt based on selected business type
  const { data: btype } = await supabase
    .from('business_types')
    .select('name')
    .eq('id', businessTypeId)
    .single()

  let tone_prompt = 'Sé amable y profesional.'
  if (btype?.name === 'lawfirm') {
    tone_prompt = 'Sé sumamente profesional, empático y claro. Enfatiza que la asesoría definitiva requiere una cita formal.'
  } else if (btype?.name === 'restaurant') {
    tone_prompt = 'Sé amigable, rápido y servicial. Ayuda al comensal a armar su pedido y confirma cantidades de forma clara.'
  } else {
    tone_prompt = 'Sé empático, cálido y profesional. Ayuda al paciente a resolver sus dudas y confirma sus datos antes de agendar.'
  }

  const { error } = await supabase
    .from('professionals')
    .update({
      business_type_id: businessTypeId,
      clinic_name: clinicName.trim(),
      full_name: fullName.trim(),
      tone_prompt,
      business_config: btype?.name === 'restaurant' ? { menu: [], orders_notification_phone: '' } : { modalities: ['Presencial'] }
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'Error al guardar la configuración inicial: ' + error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}



/**
 * Uploads a profile avatar image to Supabase Storage and updates the professional's avatar_url.
 */
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const file = formData.get('avatar') as File
  if (!file || file.size === 0) return { error: 'No se seleccionó ningún archivo' }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Formato no soportado. Usa JPG, PNG, WebP o GIF.' }
  }

  // Max 2MB
  if (file.size > 2 * 1024 * 1024) {
    return { error: 'La imagen no debe pesar más de 2MB.' }
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const filePath = `${user.id}/avatar.${ext}`

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminSupabase = createAdminClient()

  // Ensure 'avatars' bucket exists
  try {
    const { data: buckets } = await adminSupabase.storage.listBuckets()
    if (!buckets || !buckets.find(b => b.name === 'avatars')) {
      await adminSupabase.storage.createBucket('avatars', { public: true })
    }
  } catch (e) {
    console.error('Error checking/creating avatars bucket:', e)
  }

  // Upload to Supabase Storage (bucket: avatars)
  const { error: uploadError } = await adminSupabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    return { error: 'Error al subir imagen: ' + uploadError.message }
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  const avatar_url = publicUrlData.publicUrl

  // Update professional record
  const { error: updateError } = await supabase
    .from('professionals')
    .update({ avatar_url })
    .eq('id', user.id)

  if (updateError) {
    return { error: 'Error al guardar URL de avatar: ' + updateError.message }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { success: true, avatar_url }
}

/**
 * Initiates a Stripe Checkout session for a specific subscription plan.
 */
export async function createStripeCheckoutSession(plan: 'pro' | 'basic' = 'pro') {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: professional } = await supabase
    .from('professionals')
    .select('stripe_customer_id, email, full_name')
    .eq('id', user.id)
    .single()

  if (!professional) return { error: 'Profesional no encontrado' }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey || stripeSecretKey === 'sk_test_placeholder') {
    // Graceful fallback for demonstration mode
    return {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing?status=success_mock&plan=${plan}`,
      warning: 'Claves de Stripe no configuradas en el servidor. Se simulará el proceso de pago.'
    }
  }

  try {
    let stripeCustomerId = professional.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: professional.email,
        name: professional.full_name || undefined,
        metadata: { professional_id: user.id },
      })
      stripeCustomerId = customer.id

      await supabase
        .from('professionals')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id)
    }

    const priceId = plan === 'pro'
      ? process.env.STRIPE_PRO_PRICE_ID
      : process.env.STRIPE_BASIC_PRICE_ID

    if (!priceId) {
      return { error: `Precio de Stripe no configurado para el plan: ${plan}` }
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/billing?status=cancelled`,
      client_reference_id: user.id,
    })

    revalidatePath('/dashboard/billing')
    return { url: session.url }
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return { error: 'Error al procesar checkout de Stripe: ' + error.message }
  }
}

/**
 * Saves Web Push Notifications Subscription info.
 */
export async function savePushSubscription(subscription: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      professional_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    }, { onConflict: 'endpoint' })

  if (error) return { error: 'Error al guardar suscripción push: ' + error.message }
  return { success: true }
}

/**
 * Deletes Web Push Notifications Subscription info.
 */
export async function removePushSubscription(endpoint: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('professional_id', user.id)
    .eq('endpoint', endpoint)

  if (error) return { error: 'Error al eliminar suscripción push: ' + error.message }
  return { success: true }
}

/**
 * Creates a new blocked slot for the authenticated professional.
 */
export async function createBlockedSlot(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const title = formData.get('title') as string
  const starts_at = formData.get('starts_at') as string
  const ends_at = formData.get('ends_at') as string
  const is_all_day = formData.get('is_all_day') === 'on'

  if (!title || title.trim().length < 2) {
    return { error: 'El título del bloqueo debe tener al menos 2 caracteres' }
  }
  if (!starts_at || !ends_at) {
    return { error: 'Las fechas de inicio y fin son requeridas' }
  }

  let start = new Date(starts_at)
  let end = new Date(ends_at)

  // For all-day blocks, parse date-only strings and normalize to full day boundaries
  if (is_all_day) {
    // starts_at will be "YYYY-MM-DD" — set to start of that day (local midnight → UTC)
    const [sy, sm, sd] = starts_at.split('-').map(Number)
    start = new Date(sy, sm - 1, sd, 0, 0, 0, 0)

    const [ey, em, ed] = ends_at.split('-').map(Number)
    // end is exclusive: next day midnight
    end = new Date(ey, em - 1, ed + 1, 0, 0, 0, 0)
  }

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { error: 'Formato de fecha inválido' }
  }
  if (end <= start) {
    return { error: 'La fecha de fin debe ser posterior a la fecha de inicio' }
  }

  const { data, error } = await supabase
    .from('blocked_slots')
    .insert({
      professional_id: user.id,
      title: title.trim(),
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      is_all_day,
    })
    .select()
    .single()

  if (error) {
    return { error: 'Error al crear el bloqueo: ' + error.message }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/appointments')
  return { success: true, data }
}

/**
 * Deletes a blocked slot belonging to the authenticated professional.
 */
export async function deleteBlockedSlot(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('blocked_slots')
    .delete()
    .eq('id', id)
    .eq('professional_id', user.id)

  if (error) {
    return { error: 'Error al eliminar el bloqueo: ' + error.message }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/appointments')
  return { success: true }
}

/**
 * Fetches all blocked slots for a given professional.
 */
export async function getBlockedSlots(professionalId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blocked_slots')
    .select('*')
    .eq('professional_id', professionalId)
    .order('starts_at', { ascending: false })

  if (error) {
    console.error('Error fetching blocked slots:', error)
    return []
  }

  return data || []
}

/**
 * Connects a specific integration (google_calendar, calcom, voice, etc.)
 */
export async function connectIntegration(integrationId: string, value?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  let updatePayload: Record<string, any> = {}

  if (integrationId === 'google_calendar') {
    updatePayload = { google_calendar_connected: true }
  } else if (integrationId === 'calcom') {
    if (!value) return { error: 'Se requiere la API Key de Cal.com' }
    updatePayload = { calcom_api_key: value }
  } else if (integrationId === 'voice') {
    if (!value) return { error: 'Se requiere el número de teléfono para llamadas por voz' }
    updatePayload = { voice_enabled: true, voice_phone_number: value }
  } else if (integrationId === 'whatsapp') {
    if (!value) return { error: 'Se requiere el Phone Number ID de WhatsApp' }
    updatePayload = { whatsapp_phone_number_id: value }
  } else {
    return { error: 'Integración no soportada' }
  }

  const { error } = await supabase
    .from('professionals')
    .update(updatePayload)
    .eq('id', user.id)

  if (error) return { error: 'Error al conectar la integración: ' + error.message }

  // Log activity
  await supabase.from('activity_log').insert({
    professional_id: user.id,
    type: 'new_patient', // Generic or we can use another string
    title: `Integración conectada`,
    description: `Se conectó la integración con ${integrationId}`,
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

/**
 * Disconnects a specific integration
 */
export async function disconnectIntegration(integrationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  let updatePayload: Record<string, any> = {}

  if (integrationId === 'google_calendar') {
    updatePayload = { google_calendar_connected: false }
  } else if (integrationId === 'calcom') {
    updatePayload = { calcom_api_key: null }
  } else if (integrationId === 'voice') {
    updatePayload = { voice_enabled: false, voice_phone_number: null }
  } else if (integrationId === 'whatsapp') {
    updatePayload = { whatsapp_phone_number_id: null }
  } else {
    return { error: 'Integración no soportada' }
  }

  const { error } = await supabase
    .from('professionals')
    .update(updatePayload)
    .eq('id', user.id)

  if (error) return { error: 'Error al desconectar la integración: ' + error.message }

  // Log activity
  await supabase.from('activity_log').insert({
    professional_id: user.id,
    type: 'new_patient',
    title: `Integración desconectada`,
    description: `Se desconectó la integración con ${integrationId}`,
  })

  revalidatePath('/dashboard/settings')
  return { success: true }
}

/**
 * Uploads a restaurant menu image to Supabase Storage and updates the professional's business_config.
 */
export async function uploadMenuImage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const file = formData.get('menu_image') as File
  if (!file || file.size === 0) return { error: 'No se seleccionó ningún archivo' }

  // Validate file type (allowing pdf, jpg, png, webp, gif)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Formato no soportado. Usa JPG, PNG, WebP o PDF.' }
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'La imagen del menú no debe pesar más de 5MB.' }
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const filePath = `${user.id}/menu.${ext}`

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminSupabase = createAdminClient()

  // Ensure 'menus' bucket exists
  try {
    const { data: buckets } = await adminSupabase.storage.listBuckets()
    if (!buckets || !buckets.find(b => b.name === 'menus')) {
      await adminSupabase.storage.createBucket('menus', { public: true })
    }
  } catch (e) {
    console.error('Error checking/creating menus bucket:', e)
  }

  // Upload to Supabase Storage (bucket: menus)
  const { error: uploadError } = await adminSupabase.storage
    .from('menus')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    return { error: 'Error al subir imagen del menú: ' + uploadError.message }
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('menus')
    .getPublicUrl(filePath)

  const menu_image_url = publicUrlData.publicUrl

  // Fetch existing business_config to merge
  const { data: existing } = await supabase
    .from('professionals')
    .select('business_config')
    .eq('id', user.id)
    .single()

  const currentConfig = (existing?.business_config as Record<string, unknown>) ?? {}
  const newConfig = { ...currentConfig, menu_image_url }

  // Update professional record
  const { error: updateError } = await supabase
    .from('professionals')
    .update({ business_config: newConfig })
    .eq('id', user.id)

  if (updateError) {
    return { error: 'Error al guardar URL del menú: ' + updateError.message }
  }

  revalidatePath('/dashboard/settings')
  return { success: true, menu_image_url }
}

