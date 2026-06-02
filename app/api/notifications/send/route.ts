import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

// Configure web-push with defensive checks for build time
try {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  const privateKey = process.env.VAPID_PRIVATE_KEY || ''
  if (publicKey && privateKey) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
      publicKey,
      privateKey
    )
  }
} catch (e) {
  console.warn('Web-push VAPID keys not configured properly yet.')
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // 1. Authenticate the request from n8n using N8N_WEBHOOK_SECRET
    const authHeader = req.headers.get('authorization')
    const secret = process.env.N8N_WEBHOOK_SECRET

    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request body
    const body = await req.json()
    const { professional_id, title, message, url } = body

    if (!professional_id || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: professional_id, title, message' },
        { status: 400 }
      )
    }

    // 3. Get all push subscriptions for this professional
    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('professional_id', professional_id)

    if (error) throw error

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: false, reason: 'No active subscriptions found' })
    }

    const payload = JSON.stringify({
      title,
      message,
      url: url || '/dashboard'
    })

    // 4. Send push to all active endpoints
    const results = await Promise.allSettled(
      subscriptions.map((sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        }
        return webpush.sendNotification(pushSubscription, payload)
      })
    )

    // Optional: cleanup expired subscriptions if web-push throws 410 Gone
    for (let i = 0; i < results.length; i++) {
      const res = results[i]
      if (res.status === 'rejected' && res.reason?.statusCode === 410) {
        await supabaseAdmin
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscriptions[i].endpoint)
      }
    }

    const successful = results.filter((r) => r.status === 'fulfilled').length

    return NextResponse.json({ 
      success: true, 
      sent: successful, 
      total: subscriptions.length 
    })
  } catch (err: any) {
    console.error('Push notification error:', err)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
