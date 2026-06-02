import { createClient } from '@/lib/utils/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next')

  let next = nextParam || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      next = '/login?error=' + encodeURIComponent(error.message)
    }
  }

  return NextResponse.redirect(new URL(next, request.url))

}
