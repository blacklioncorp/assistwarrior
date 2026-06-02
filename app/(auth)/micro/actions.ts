'use server'

import { createClient } from '@/lib/utils/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Handles passwordless login for superadmins.
 * Validates that the email is whitelisted before sending the Supabase OTP magic link.
 */
export async function loginMicro(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string || '').toLowerCase().trim()
  if (!email) {
    return { error: 'El correo electrónico es requerido.' }
  }

  // 1. Verify if email is in the admin whitelist
  const envEmails = (process.env.SUPERADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())

  let isAllowed = envEmails.includes(email)

  if (!isAllowed) {
    try {
      const adminClient = createAdminClient()
      const { data } = await adminClient
        .from('superadmin_emails')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (data) isAllowed = true
    } catch (e) {
      console.error('Error querying DB admin list:', e)
    }
  }

  if (!isAllowed) {
    return { error: 'Acceso no autorizado.' }
  }

  // 2. Trigger Supabase OTP auth
  const supabase = await createClient()
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard/superadmin`
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  })

  if (error) {
    console.error('Superadmin login OTP error:', error)
    return { error: 'Error al enviar enlace de acceso: ' + error.message }
  }

  return { success: true }
}
