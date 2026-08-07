import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyN8nSecret } from '@/lib/utils/verify-n8n-secret'
import { google } from 'googleapis'

const postBodySchema = z.object({
  professional_id: z.string().uuid('professional_id debe ser un UUID válido'),
  summary: z.string().min(1, 'summary requerido'),
  description: z.string().optional(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
})

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar autenticación de n8n
    if (!verifyN8nSecret(req.headers.get('Authorization'))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Parsear el payload
    const body = await req.json()
    const parsed = postBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.errors },
        { status: 400 }
      )
    }

    const { professional_id, summary, description, starts_at, ends_at } = parsed.data

    // 3. Obtener el refresh_token del profesional
    const supabaseAdmin = createAdminClient()
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('google_tokens')
      .select('refresh_token')
      .eq('professional_id', professional_id)
      .single()

    if (tokenError || !tokenData?.refresh_token) {
      return NextResponse.json(
        { error: 'El profesional no tiene Google Calendar conectado' },
        { status: 400 }
      )
    }

    // 4. Configurar el cliente de Google OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/calendar/callback`
    )

    oauth2Client.setCredentials({
      refresh_token: tokenData.refresh_token
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // 5. Crear el evento en el calendario principal del profesional
    const event = {
      summary,
      description,
      start: {
        dateTime: starts_at,
      },
      end: {
        dateTime: ends_at,
      },
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    })

    return NextResponse.json({
      success: true,
      event: response.data,
    })

  } catch (error: any) {
    console.error('Error in /api/n8n/calendar/create-event:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
