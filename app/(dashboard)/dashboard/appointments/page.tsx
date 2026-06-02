import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import { AppointmentsClient } from './AppointmentsClient'

export const metadata = { title: 'Citas' }
export const dynamic = 'force-dynamic'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all appointments for the current professional
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, patient_name, patient_phone, title, starts_at, ends_at, status, channel, notes')
    .eq('professional_id', user.id)
    .order('starts_at', { ascending: false })

  // Fetch registered patients list for selection in creation modal
  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('professional_id', user.id)
    .order('full_name', { ascending: true })

  // Fetch professional's working hours settings
  const { data: professional } = await supabase
    .from('professionals')
    .select('working_hours')
    .eq('id', user.id)
    .single()

  // Fetch active blocked slots (only future/current ones)
  const { data: blockedSlots } = await supabase
    .from('blocked_slots')
    .select('id, title, starts_at, ends_at, is_all_day')
    .eq('professional_id', user.id)
    .gte('ends_at', new Date().toISOString())
    .order('starts_at', { ascending: true })

  return (
    <AppointmentsClient
      appointments={appointments || []}
      patients={patients || []}
      blockedSlots={blockedSlots || []}
      workingHours={professional?.working_hours || {
        monday:    { start: '09:00', end: '18:00', enabled: true },
        tuesday:   { start: '09:00', end: '18:00', enabled: true },
        wednesday: { start: '09:00', end: '18:00', enabled: true },
        thursday:  { start: '09:00', end: '18:00', enabled: true },
        friday:    { start: '09:00', end: '18:00', enabled: true },
        saturday:  { start: '09:00', end: '14:00', enabled: false },
        sunday:    { start: '09:00', end: '14:00', enabled: false }
      }}
    />
  )
}
