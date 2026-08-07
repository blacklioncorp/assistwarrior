import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/utils/server'
import { google } from 'googleapis'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/calendar/callback`
    )

    // Generar la URL de autorización
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Crucial para obtener el refresh_token
      prompt: 'consent',      // Forza a mostrar la pantalla de consentimiento
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly'
      ],
      state: user.id // Pasamos el ID del usuario como state para saber de quién es al regresar
    })

    return NextResponse.redirect(url)
  } catch (error: any) {
    console.error('Error in /api/auth/calendar:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
