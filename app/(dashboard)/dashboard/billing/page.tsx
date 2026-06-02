import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import { CreditCard, CheckCircle, Sparkles, Zap, Shield, Headphones, Clock } from 'lucide-react'
import Link from 'next/link'
import { UpgradeButton, ManageBillingButton } from '@/components/dashboard/BillingButtons'

export const metadata = { title: 'Facturación' }
export const dynamic = 'force-dynamic'

interface BillingPageProps {
  searchParams: Promise<{
    status?: string
    plan?: string
  }>
}

const basicFeatures = [
  { label: 'Hasta 50 citas/mes', included: true },
  { label: '1 número de WhatsApp', included: true },
  { label: 'Respuestas automáticas IA', included: true },
  { label: 'Dashboard básico', included: true },
  { label: 'Llamadas de voz', included: false },
  { label: 'Google Calendar sync', included: false },
  { label: 'Citas ilimitadas', included: false },
  { label: 'Soporte prioritario', included: false },
]

const proFeatures = [
  { label: 'Citas ilimitadas', included: true },
  { label: '1 número de WhatsApp', included: true },
  { label: 'Respuestas automáticas IA', included: true },
  { label: 'Dashboard completo + analytics', included: true },
  { label: 'Llamadas de voz (Telnyx)', included: true },
  { label: 'Google Calendar sync', included: true },
  { label: 'Notificaciones push', included: true },
  { label: 'Soporte prioritario 24/7', included: true },
]

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const { status, plan } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (status === 'success_mock' && (plan === 'pro' || plan === 'basic')) {
    await supabase
      .from('professionals')
      .update({ plan, plan_status: 'active' })
      .eq('id', user.id)
    
    redirect('/dashboard/billing')
  }

  const { data: professional } = await supabase
    .from('professionals')
    .select('plan, plan_status, stripe_customer_id, stripe_subscription_id, full_name')
    .eq('id', user.id)
    .single()

  const currentPlan = professional?.plan ?? 'basic'
  const isPro = currentPlan === 'pro'

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Facturación</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestiona tu plan y método de pago
        </p>
      </div>

      {/* Current plan status banner */}
      <div
        className={`rounded-2xl p-5 border ${isPro
            ? 'bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200'
            : 'bg-slate-50 border-slate-200'
          }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${isPro ? 'bg-[#1E4A8A] text-white' : 'bg-slate-200 text-slate-500'
              }`}
          >
            {isPro ? <Sparkles className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">
              Plan actual:{' '}
              <span className={isPro ? 'text-[#1E4A8A]' : 'text-slate-600'}>
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPro
                ? 'Tienes acceso completo a todas las funciones de Smart Receptionist.'
                : 'Actualiza a Pro para desbloquear llamadas de voz, calendario y más.'}
            </p>
          </div>
          {isPro && professional?.stripe_customer_id && (
            <ManageBillingButton />
          )}
        </div>
      </div>

      {/* Plan comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Basic */}
        <div
          className={`rounded-2xl border p-6 ${!isPro
              ? 'border-[#1E4A8A] ring-2 ring-[#1E4A8A]/20 bg-white shadow-blue-glow'
              : 'border-slate-200 bg-white shadow-card'
            }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-bold text-slate-900">Basic</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                $999
                <span className="text-sm font-normal text-slate-500">/mes</span>
              </p>
            </div>
            {!isPro && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                Plan actual
              </span>
            )}
          </div>
          <ul className="space-y-2.5 mb-6">
            {basicFeatures.map((f) => (
              <li key={f.label} className="flex items-center gap-2.5 text-sm">
                <CheckCircle
                  className={`h-4 w-4 shrink-0 ${f.included ? 'text-teal-500' : 'text-slate-200'
                    }`}
                />
                <span className={f.included ? 'text-slate-700' : 'text-slate-300'}>
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
          {isPro && (
            <button
              id="downgrade-btn"
              className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cambiar a Basic
            </button>
          )}
        </div>

        {/* Pro */}
        <div
          className={`rounded-2xl border p-6 relative overflow-hidden ${isPro
              ? 'border-[#1E4A8A] ring-2 ring-[#1E4A8A]/20 bg-white shadow-blue-glow'
              : 'border-slate-200 bg-white shadow-card'
            }`}
        >
          {/* Gradient accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1E4A8A] to-[#0D9488]" />

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-slate-900">Pro</p>
                <Sparkles className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                $2,999
                <span className="text-sm font-normal text-slate-500">/mes</span>
              </p>
            </div>
            {isPro && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                Plan actual
              </span>
            )}
          </div>
          <ul className="space-y-2.5 mb-6">
            {proFeatures.map((f) => (
              <li key={f.label} className="flex items-center gap-2.5 text-sm">
                <CheckCircle className="h-4 w-4 shrink-0 text-teal-500" />
                <span className="text-slate-700">{f.label}</span>
              </li>
            ))}
          </ul>
          {!isPro && (
            <UpgradeButton />
          )}
        </div>
      </div>

      {/* Invoice history placeholder */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h2 className="text-sm font-semibold text-slate-800">Historial de pagos</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
            <CreditCard className="h-6 w-6 text-slate-300" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-600">Sin facturas aún</p>
          <p className="mt-1 text-xs text-slate-400">
            Tus facturas aparecerán aquí después de tu primer pago.
          </p>
        </div>
      </section>
    </div>
  )
}
