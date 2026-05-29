'use server'

import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
  }

  const { error } = await supabase.auth.signInWithOtp(data)

  if (error) {
    console.error(error)
    return redirect('/error')
  }

  return redirect('/login/confirm')
}
