import { createClient } from '@/lib/utils/server'
import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_NEXT_PATHS = ['/dashboard', '/dashboard/superadmin', '/login'] as const

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next')

  // Validate `next` against a strict whitelist to prevent open redirects
  const next: string =
    nextParam && (ALLOWED_NEXT_PATHS as readonly string[]).includes(nextParam)
      ? nextParam
      : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(
        new URL('/login?error=' + encodeURIComponent(error.message), request.url)
      )
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
