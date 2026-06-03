'use server'

import { createClient } from '@/lib/utils/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
  }

  // Pre-flight: check user status with admin API for diagnostics
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      const { data: userList, error: listError } = await admin.auth.admin.listUsers()
      
      const matchedUser = userList?.users?.find((u: { email?: string }) => u.email === data.email)
      
      console.log('[LOGIN DEBUG] ─────────────────────────────')
      console.log('[LOGIN DEBUG] Email:', data.email)
      console.log('[LOGIN DEBUG] User found in auth.users:', !!matchedUser)
      if (matchedUser) {
        console.log('[LOGIN DEBUG] User ID:', matchedUser.id)
        console.log('[LOGIN DEBUG] Email confirmed:', matchedUser.email_confirmed_at)
        console.log('[LOGIN DEBUG] Identities count:', matchedUser.identities?.length)
        matchedUser.identities?.forEach((identity: { provider: string; identity_data?: Record<string, unknown> }, i: number) => {
          console.log(`[LOGIN DEBUG]   Identity ${i}: provider=${identity.provider}, email=${identity.identity_data?.email}`)
        })
        console.log('[LOGIN DEBUG] App metadata:', JSON.stringify(matchedUser.app_metadata))
        console.log('[LOGIN DEBUG] Banned until:', matchedUser.banned_until)
      }
      if (listError) {
        console.error('[LOGIN DEBUG] Admin listUsers error:', listError)
      }
      console.log('[LOGIN DEBUG] ─────────────────────────────')
    } catch (e) {
      console.error('[LOGIN DEBUG] Admin pre-flight failed:', e)
    }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error('[LOGIN ERROR] signInWithOtp failed:')
    console.error('[LOGIN ERROR] Message:', error.message)
    console.error('[LOGIN ERROR] Status:', error.status)
    console.error('[LOGIN ERROR] Code:', (error as { code?: string }).code)
    console.error('[LOGIN ERROR] Full error:', JSON.stringify(error, null, 2))
    return redirect('/error')
  }

  return redirect('/login/confirm')
}
