'use server'

import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    // Log only a generic message — never the email or user data
    console.error('[LOGIN] signInWithOtp error:', error.message)
    return redirect('/error')
  }

  return redirect('/login/confirm')
}
