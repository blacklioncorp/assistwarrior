'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export function PricingList() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'semiannual' | 'annual'>('monthly')

  const getPrice = (basePrice: number) => {
    if (billingCycle === 'semiannual') return Math.round(basePrice * 0.85) // 15% off
    if (billingCycle === 'annual') return Math.round(basePrice * 0.80) // 20% off
    return basePrice
  }

  const plans = [
    {
      id: 'agenda-pro',
      name: 'Plan Agenda Pro',
      target: 'Dirigido a: Dentistas, Abogados, Consultorios, Barberías.',
      basePrice: 1400,
      features: [
        '1 Conexión de WhatsApp.',
        'Integración automática con Google Calendar.',
        'Agendamiento y confirmación de citas 24/7.',
        'Recordatorios automáticos pre-cita (Evita ausencias).',
        'Contactos/Leads ilimitados.',
        'Configuración inicial "Llave en mano" incluida.',
      ],
      popular: false,
    },
    {
      id: 'food-delivery',
      name: 'Plan Food & Delivery',
      target: 'Dirigido a: Restaurantes, Pizzerías, Cafeterías, Cocinas.',
      basePrice: 1700,
      features: [
        'Todo lo del Plan Agenda Pro.',
        'Menú interactivo dentro de WhatsApp.',
        'Panel de gestión de pedidos en tiempo real para cocina.',
        'Cálculo automático de costos y datos de entrega.',
        'Notificaciones de estatus del pedido.',
      ],
      popular: false,
    },
    {
      id: 'agenda-pro-2',
      name: 'Plan Agenda Pro',
      target: 'Dirigido a: Dentistas, Abogados, Consultorios, Barberías.',
      basePrice: 1400,
      features: [
        '1 Conexión de WhatsApp.',
        'Integración automática con Google Calendar.',
        'Agendamiento y confirmación de citas 24/7.',
        'Recordatorios automáticos pre-cita (Evita ausencias).',
        'Contactos/Leads ilimitados.',
        'Configuración inicial "Llave en mano" incluida.',
      ],
      popular: false,
    },
  ]

  return (
    <div className="w-full flex flex-col items-center">
      {/* Toggle */}
      <div className="mb-12 relative flex items-center bg-[#2B2B36] rounded-full p-1 border border-slate-700/50 max-w-sm w-full mx-auto shadow-xl">
        <div className="absolute -top-6 w-full flex justify-between px-4">
          <span className="text-[10px] font-bold text-white opacity-0">1 mes</span>
          <span className="text-[10px] font-bold text-white">Ahorra 15%</span>
          <span className="text-[10px] font-bold text-white">Ahorra 20%</span>
        </div>
        
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${billingCycle === 'monthly' ? 'bg-[#5F9CF4] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          1 mes
        </button>
        <button
          onClick={() => setBillingCycle('semiannual')}
          className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${billingCycle === 'semiannual' ? 'bg-[#5F9CF4] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          6 meses
        </button>
        <button
          onClick={() => setBillingCycle('annual')}
          className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${billingCycle === 'annual' ? 'bg-[#5F9CF4] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          Anual
        </button>
      </div>

      {/* Plans */}
      <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto w-full">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className="flex flex-col rounded-3xl p-8 border border-slate-800 bg-[#252530] shadow-xl"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed min-h-[40px]">{plan.target}</p>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-extrabold text-white">${getPrice(plan.basePrice).toLocaleString('en-US')}</span>
                <span className="text-sm font-bold text-slate-300 uppercase">MXN</span>
              </div>
              <div className="h-[1px] w-full bg-slate-500/30 mt-6 mx-auto max-w-[200px]" />
            </div>

            <Link
              href="/login"
              className="w-full rounded-2xl bg-[#D946EF] hover:bg-[#C026D3] py-3.5 text-center text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] mb-8"
            >
              Comenzar Ahora
            </Link>

            <ul className="flex-1 space-y-4">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[13px] text-slate-300">
                  <span className="text-slate-400 font-bold">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
