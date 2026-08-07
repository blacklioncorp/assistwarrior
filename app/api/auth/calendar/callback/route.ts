import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { google } from 'googleapis'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state') // Este es el professional_id

    if (!code || !state) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/calendar/callback`
    )

    const { tokens } = await oauth2Client.getToken(code)

    if (tokens.refresh_token) {
      const supabaseAdmin = createAdminClient()
      
      // Guardar el refresh token en la base de datos
      const { error: upsertError } = await supabaseAdmin
        .from('google_tokens')
        .upsert({
          professional_id: state,
          refresh_token: tokens.refresh_token,
          updated_at: new Date().toISOString()
        })

      if (upsertError) {
        console.error('Error guardando token:', upsertError)
        return NextResponse.json({ error: 'Error guardando token' }, { status: 500 })
      }

      // Marcar en la tabla professionals que ya conectó el calendario
      await supabaseAdmin
        .from('professionals')
        .update({ google_calendar_connected: true })
        .eq('id', state)
    }

    // Redirigir de vuelta a los ajustes
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=integrations`)
  } catch (error: any) {
    console.error('Error en callback:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
