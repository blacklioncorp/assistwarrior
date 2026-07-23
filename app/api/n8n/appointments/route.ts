import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyN8nSecret } from '@/lib/utils/verify-n8n-secret'

// ── Zod schemas ──────────────────────────────────────────────────────────────

const channelEnum = z.enum(['whatsapp', 'voice', 'dashboard', 'calcom'])

const postBodySchema = z.object({
  professional_id: z.string().uuid('professional_id debe ser un UUID válido'),
  patient_phone: z.string().min(7, 'patient_phone requerido'),
  patient_name: z.string().min(2, 'patient_name requerido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date debe ser YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'time debe ser HH:MM'),
  duration_minutes: z.number().int().positive().default(30),
  reason: z.string().min(1, 'reason requerido'),
  channel: channelEnum.default('whatsapp'),
})

const patchBodySchema = z.object({
  appointment_id: z.string().uuid('appointment_id debe ser un UUID válido'),
  professional_id: z.string().uuid('professional_id debe ser un UUID válido'),
  action: z.enum(['cancel', 'confirm']),
})

// ── POST — Agendar cita ───────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Auth
    if (!verifyN8nSecret(req.headers.get('authorization'))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate body
    const rawBody = await req.json()
    const parsed = postBodySchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const {
      professional_id,
      patient_phone,
      patient_name,
      date,
      time,
      duration_minutes,
      reason,
      channel,
    } = parsed.data

    const admin = createAdminClient()

    // 3. Verify professional exists, is active and has a valid plan
    const { data: professional, error: profError } = await admin
      .from('professionals')
      .select('id, is_active, plan_status, full_name')
      .eq('id', professional_id)
      .maybeSingle()

    if (profError) throw profError

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Profesional no encontrado' },
        { status: 403 }
      )
    }

    if (!professional.is_active) {
      return NextResponse.json(
        { success: false, error: 'La cuenta del profesional está suspendida' },
        { status: 403 }
      )
    }

    const validPlanStatuses = ['active', 'trialing']
    if (!validPlanStatuses.includes(professional.plan_status)) {
      return NextResponse.json(
        { success: false, error: 'El plan del profesional no está activo o en periodo de prueba' },
        { status: 403 }
      )
    }

    // 4. Build ISO timestamps
    const startsAt = new Date(`${date}T${time}:00`)
    if (isNaN(startsAt.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Fecha u hora inválida' },
        { status: 400 }
      )
    }
    const endsAt = new Date(startsAt.getTime() + duration_minutes * 60_000)

    // 5. Find or create patient
    let patientId: string
    let resolvedPatientName = patient_name

    const { data: existingPatient } = await admin
      .from('patients')
      .select('id, full_name')
      .eq('professional_id', professional_id)
      .eq('phone_whatsapp', patient_phone)
      .maybeSingle()

    if (existingPatient) {
      patientId = existingPatient.id
      resolvedPatientName = existingPatient.full_name
    } else {
      const { data: newPatient, error: patientError } = await admin
        .from('patients')
        .insert({
          professional_id,
          full_name: patient_name,
          phone_whatsapp: patient_phone,
        })
        .select('id')
        .single()

      if (patientError) throw patientError
      patientId = newPatient.id
    }

    // 6. Check blocked_slots overlap
    const { data: blockedSlots } = await admin
      .from('blocked_slots')
      .select('id, title')
      .eq('professional_id', professional_id)
      .lt('starts_at', endsAt.toISOString())
      .gt('ends_at', startsAt.toISOString())

    if (blockedSlots && blockedSlots.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `El horario coincide con un bloqueo: "${blockedSlots[0].title}". Elige otro horario.`,
        },
        { status: 409 }
      )
    }

    // 7. Check appointments overlap
    const { data: collisions } = await admin
      .from('appointments')
      .select('id')
      .eq('professional_id', professional_id)
      .in('status', ['scheduled', 'confirmed'])
      .lt('starts_at', endsAt.toISOString())
      .gt('ends_at', startsAt.toISOString())

    if (collisions && collisions.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una cita en ese horario. Elige otro.' },
        { status: 409 }
      )
    }

    // 8. Insert appointment
    const { data: appointment, error: apptError } = await admin
      .from('appointments')
      .insert({
        professional_id,
        patient_id: patientId,
        patient_name: resolvedPatientName,
        patient_phone,
        title: reason,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: 'scheduled',
        channel,
      })
      .select('id, starts_at, ends_at')
      .single()

    if (apptError) throw apptError

    // 9. Insert activity log
    await admin.from('activity_log').insert({
      professional_id,
      type: 'appointment_booked',
      title: `Cita agendada para ${resolvedPatientName}`,
      description: `Consulta vía ${channel} el ${date} a las ${time}`,
      related_id: appointment.id,
      created_at: new Date().toISOString(),
    })

    // 10. Upsert conversation + insert message
    const { data: conversation } = await admin
      .from('conversations')
      .select('id, unread_count')
      .eq('professional_id', professional_id)
      .eq('patient_id', patientId)
      .maybeSingle()

    if (conversation) {
      await admin
        .from('conversations')
        .update({ unread_count: (conversation.unread_count ?? 0) + 1 })
        .eq('id', conversation.id)

      await admin.from('messages').insert({
        conversation_id: conversation.id,
        sender: 'system',
        content: `Cita agendada para el ${date} a las ${time}: ${reason}`,
        created_at: new Date().toISOString(),
      })
    } else {
      const { data: newConversation } = await admin
        .from('conversations')
        .insert({
          professional_id,
          patient_id: patientId,
          patient_phone: patient_phone,
          patient_name: patient_name || 'Desconocido',
          unread_count: 1,
        })
        .select('id')
        .single()

      if (newConversation) {
        await admin.from('messages').insert({
          conversation_id: newConversation.id,
          sender: 'system',
          content: `Cita agendada para el ${date} a las ${time}: ${reason}`,
          created_at: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      appointment_id: appointment.id,
      starts_at: appointment.starts_at,
      ends_at: appointment.ends_at,
    })
  } catch (err: unknown) {
    console.error('[n8n/appointments POST]', err instanceof Error ? err.message : String(err))
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ── PATCH — Cancelar o confirmar cita ─────────────────────────────────────────

export async function PATCH(req: Request) {
  try {
    // 1. Auth
    if (!verifyN8nSecret(req.headers.get('authorization'))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate body
    const rawBody = await req.json()
    const parsed = patchBodySchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { appointment_id, professional_id, action } = parsed.data

    const admin = createAdminClient()

    // 3. Verify appointment belongs to this professional and is in a mutable state
    const { data: appt, error: fetchError } = await admin
      .from('appointments')
      .select('id, status, patient_name')
      .eq('id', appointment_id)
      .eq('professional_id', professional_id)
      .maybeSingle()

    if (fetchError) throw fetchError

    if (!appt) {
      return NextResponse.json(
        { success: false, error: 'Cita no encontrada o no pertenece a este profesional' },
        { status: 404 }
      )
    }

    if (!['scheduled', 'confirmed'].includes(appt.status)) {
      return NextResponse.json(
        { success: false, error: `La cita ya tiene estado "${appt.status}" y no puede modificarse` },
        { status: 409 }
      )
    }

    const newStatus = action === 'cancel' ? 'cancelled' : 'confirmed'
    const activityType = action === 'cancel' ? 'appointment_cancelled' : 'appointment_confirmed'
    const activityTitle =
      action === 'cancel'
        ? `Cita cancelada para ${appt.patient_name}`
        : `Cita confirmada para ${appt.patient_name}`

    // 4. Update status
    const { error: updateError } = await admin
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointment_id)

    if (updateError) throw updateError

    // 5. Insert activity log
    await admin.from('activity_log').insert({
      professional_id,
      type: activityType,
      title: activityTitle,
      related_id: appointment_id,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, appointment_id, status: newStatus })
  } catch (err: unknown) {
    console.error('[n8n/appointments PATCH]', err instanceof Error ? err.message : String(err))
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
