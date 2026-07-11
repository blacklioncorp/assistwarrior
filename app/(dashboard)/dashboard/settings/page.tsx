import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './SettingsClient'

export const metadata = { title: 'Configuración' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: professional },
    { data: blockedSlots }
  ] = await Promise.all([
    supabase
      .from('professionals')
      .select('id, full_name, email, specialty, clinic_name, phone_whatsapp, google_calendar_connected, calcom_api_key, voice_enabled, voice_phone_number, working_hours, tone_prompt, avatar_url, business_config, business_type:business_types(name)')
      .eq('id', user.id)
      .single(),
    supabase
      .from('blocked_slots')
      .select('*')
      .eq('professional_id', user.id)
      .order('starts_at', { ascending: false })
  ])

  const businessTypeName = (professional?.business_type as { name?: string } | null)?.name ?? ''

  const prof = professional ?? {
    full_name: null,
    email: user.email ?? '',
    specialty: null,
    clinic_name: null,
    phone_whatsapp: null,
    google_calendar_connected: false,
    calcom_api_key: null,
    voice_enabled: false,
    voice_phone_number: null,
    working_hours: null,
    tone_prompt: '',
    avatar_url: null,
    business_config: null,
  }

  return (
    <SettingsClient
      professional={prof}
      initialBlockedSlots={blockedSlots || []}
      businessTypeName={businessTypeName}
    />
  )
}
