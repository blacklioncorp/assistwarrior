import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import { PatientsClient } from './PatientsClient'

export const metadata = { title: 'Pacientes' }

export default async function PatientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch registered patients for this professional, along with their appointment count
  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name, phone_whatsapp, email, created_at, appointments(count)')
    .eq('professional_id', user.id)
    .order('created_at', { ascending: false })

  return <PatientsClient patients={(patients || []) as any} />
}
