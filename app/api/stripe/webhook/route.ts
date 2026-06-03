import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-05-27.dahlia',
  })
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe()
    const supabaseAdmin = getSupabaseAdmin()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    const body = await req.text()
    const headerPayload = await headers()
    const signature = headerPayload.get('stripe-signature') as string

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: err.message }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Ensure client_reference_id contains the professional's UUID
        const professionalId = session.client_reference_id
        if (!professionalId) break

        await supabaseAdmin
          .from('professionals')
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            plan: 'pro',
            plan_status: 'active'
          })
          .eq('id', professionalId)
        
        break
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find professional by Stripe Customer ID
        const { data: professional } = await supabaseAdmin
          .from('professionals')
          .select('id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single()

        if (professional) {
          const status = subscription.status
          await supabaseAdmin
            .from('professionals')
            .update({
              plan_status: status,
              plan: status === 'active' || status === 'trialing' ? 'pro' : 'basic'
            })
            .eq('id', professional.id)
        }
        
        break
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
