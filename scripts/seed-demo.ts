import { createClient } from '@supabase/supabase-js'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seed() {
  console.log('Seeding demo profile...')
  const email = 'dr.carlos@assistwarrior.com'
  const password = 'DemoAssist2026!'

  // 1. Crear o recuperar usuario en Auth
  let userId: string
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()
  if (usersError) {
    console.error('Error listUsers:', usersError)
    process.exit(1)
  }

  const existingUser = usersData.users.find(u => u.email === email)
  if (existingUser) {
    console.log('Usuario ya existe, actualizando...')
    userId = existingUser.id
    // Update password just in case
    await supabase.auth.admin.updateUserById(userId, { password })
  } else {
    console.log('Creando usuario de Auth...')
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createError || !newUser.user) {
      console.error('Error creando Auth:', createError)
      process.exit(1)
    }
    userId = newUser.user.id
    // Wait for the trigger to create the professional record
    await new Promise(r => setTimeout(r, 1000))
  }

  // 2. Actualizar tabla professionals
  console.log('Actualizando perfil profesional...')
  const { error: profError } = await supabase
    .from('professionals')
    .update({
      full_name: 'Dr. Carlos Mendoza',
      specialty: 'Cardiólogo',
      clinic_name: 'Centro Cardiológico Mendoza',
      phone_whatsapp: '+525512345678',
      google_calendar_connected: true,
      voice_enabled: true,
      n8n_webhook_url: 'https://n8n.assistwarrior.com/webhook/demo',
      plan: 'pro',
      avatar_url: 'https://i.pravatar.cc/150?u=carlos',
      tone_prompt: 'Soy el Dr. Mendoza. Respondo con amabilidad y precisión sobre temas cardiológicos.',
      working_hours: {
        "monday":    {"start": "09:00", "end": "18:00", "enabled": true},
        "tuesday":   {"start": "09:00", "end": "18:00", "enabled": true},
        "wednesday": {"start": "09:00", "end": "18:00", "enabled": true},
        "thursday":  {"start": "09:00", "end": "18:00", "enabled": true},
        "friday":    {"start": "09:00", "end": "14:00", "enabled": true},
        "saturday":  {"start": "09:00", "end": "14:00", "enabled": false},
        "sunday":    {"start": "09:00", "end": "14:00", "enabled": false}
      }
    })
    .eq('id', userId)

  if (profError) {
    console.error('Error en professionals:', profError)
  }

  // Clear previous demo data for this user
  await supabase.from('patients').delete().eq('professional_id', userId)
  await supabase.from('blocked_slots').delete().eq('professional_id', userId)
  
  // 3. Crear Pacientes
  console.log('Creando pacientes...')
  const patientsData = [
    { professional_id: userId, full_name: 'Ana Sofia Garcia', phone_whatsapp: '+525588887777', email: 'ana@gmail.com' },
    { professional_id: userId, full_name: 'Roberto Fernandez', phone_whatsapp: '+525599996666', email: 'roberto@hotmail.com' },
    { professional_id: userId, full_name: 'Luis Hernandez', phone_whatsapp: '+525544443333' }
  ]
  const { data: patients, error: patError } = await supabase.from('patients').insert(patientsData).select()
  if (patError || !patients) {
    console.error('Error pacientes:', patError)
  }

  // 4. Crear Citas
  console.log('Creando citas...')
  const today = new Date()
  
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setMinutes(30)

  const dayAfter = new Date()
  dayAfter.setDate(today.getDate() + 2)
  dayAfter.setHours(12, 0, 0, 0)
  const dayAfterEnd = new Date(dayAfter)
  dayAfterEnd.setMinutes(30)

  const aptData = [
    {
      professional_id: userId,
      patient_id: patients?.[0].id,
      patient_name: patients?.[0].full_name,
      patient_phone: patients?.[0].phone_whatsapp,
      title: 'Revisión de estudios',
      starts_at: tomorrow.toISOString(),
      ends_at: tomorrowEnd.toISOString(),
      status: 'scheduled',
      channel: 'whatsapp'
    },
    {
      professional_id: userId,
      patient_id: patients?.[1].id,
      patient_name: patients?.[1].full_name,
      patient_phone: patients?.[1].phone_whatsapp,
      title: 'Consulta primera vez',
      starts_at: dayAfter.toISOString(),
      ends_at: dayAfterEnd.toISOString(),
      status: 'confirmed',
      channel: 'voice'
    }
  ]
  const { error: aptError } = await supabase.from('appointments').insert(aptData)
  if (aptError) console.error('Error citas:', aptError)

  // 5. Crear Bloqueos
  console.log('Creando bloqueos...')
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)
  nextWeek.setHours(9, 0, 0, 0)
  const nextWeekEnd = new Date(nextWeek)
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 2)

  const { error: blockError } = await supabase.from('blocked_slots').insert([
    {
      professional_id: userId,
      title: 'Congreso Internacional de Cardiología',
      starts_at: nextWeek.toISOString(),
      ends_at: nextWeekEnd.toISOString(),
      is_all_day: true
    }
  ])
  if (blockError) console.error('Error bloqueos:', blockError)

  // 6. Conversaciones falsas
  console.log('Creando conversaciones falsas...')
  const { data: convs, error: convError } = await supabase.from('conversations').insert([
    {
      professional_id: userId,
      patient_id: patients?.[0].id,
      patient_name: patients?.[0].full_name,
      patient_phone: patients?.[0].phone_whatsapp,
      last_message_preview: '¿Me podrían agendar a las 10 am?',
      unread_count: 1
    }
  ]).select()

  if (convError || !convs) {
    console.error('Error convs:', convError)
  } else {
    await supabase.from('messages').insert([
      {
        conversation_id: convs[0].id,
        professional_id: userId,
        content: '¿Me podrían agendar a las 10 am?',
        direction: 'inbound',
        sender: 'patient'
      },
      {
        conversation_id: convs[0].id,
        professional_id: userId,
        content: '¡Claro! Quedas agendada a las 10 am de mañana.',
        direction: 'outbound',
        sender: 'ai'
      }
    ])
  }

  console.log('¡Perfil de demostración creado con éxito!')
  console.log('Usuario: dr.carlos@assistwarrior.com')
  console.log('Password: DemoAssist2026!')
}

seed().catch(console.error)
