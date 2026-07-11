'use client'

import { useState } from 'react'
import { completeOnboarding } from '@/app/actions'
import { SubmitButton } from '@/components/ui/submit-button'
import {
  Activity,
  Briefcase,
  UtensilsCrossed,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BusinessType {
  id: string
  name: string
  label: string
  config: Record<string, unknown>
}

interface OnboardingViewProps {
  businessTypes: BusinessType[]
}

const iconsMap: Record<string, typeof Activity> = {
  doctor: Activity,
  dentist: Activity,
  lawfirm: Briefcase,
  restaurant: UtensilsCrossed,
}

const descMap: Record<string, string> = {
  doctor: 'Médicos, clínicas y profesionales de la salud. Agendamiento de citas y atención automática.',
  dentist: 'Dentistas y consultorios odontológicos. Control de citas, recordatorios y respuestas inteligentes.',
  lawfirm: 'Abogados, bufetes y consultores legales. Registro de casos, agendamiento de asesorías jurídicas y captación de leads.',
  restaurant: 'Restaurantes, cafeterías y comercios locales. Toma de pedidos automática por WhatsApp con dirección de entrega.',
}

export function OnboardingView({ businessTypes }: OnboardingViewProps) {
  const [selectedTypeId, setSelectedTypeId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Sort: doctor first, dentist, then lawfirm, then restaurant
  const sortedTypes = [...businessTypes].sort((a, b) => {
    const order: Record<string, number> = { doctor: 1, dentist: 2, lawfirm: 3, restaurant: 4 }
    return (order[a.name] || 99) - (order[b.name] || 99)
  })

  async function handleSubmit(formData: FormData) {
    setError(null)
    if (!selectedTypeId) {
      setError('Por favor selecciona una vertical para continuar.')
      return
    }

    formData.set('business_type_id', selectedTypeId)
    const res = await completeOnboarding(null, formData)
    if (res.error) {
      setError(res.error)
    }
  }

  return (
    <div className="min-h-screen bg-[#05050A] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl space-y-8 relative z-10 py-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-950/40 border border-purple-900/30 px-3 py-1 text-xs font-semibold text-purple-300">
            <Sparkles className="h-3.5 w-3.5" />
            Configuración inicial de Senzio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Bienvenido a tu asistente de IA
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Configura tu espacio de trabajo en 1 minuto. Selecciona el tipo de negocio que deseas automatizar.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-xl bg-red-950/30 border border-red-900/30 p-4 text-sm text-red-400 max-w-2xl mx-auto animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-8">
          {/* Vertical Grid Cards */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left">
              1. Selecciona la vertical de tu negocio
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sortedTypes.map((type) => {
                const Icon = iconsMap[type.name] || Activity
                const isSelected = selectedTypeId === type.id
                const desc = descMap[type.name] || 'Automatización inteligente de atención a clientes y agendamiento.'

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedTypeId(type.id)}
                    className={cn(
                      'flex flex-col text-left rounded-2xl border p-5 transition-all duration-200 focus:outline-none relative overflow-hidden',
                      isSelected
                        ? 'border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-950/30 ring-2 ring-purple-500/20'
                        : 'border-slate-900 bg-[#0F0F1A] hover:border-slate-800 hover:bg-slate-900/40'
                    )}
                  >
                    {/* Glowing card border selection indicator */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-r from-purple-500 to-cyan-500" />
                    )}

                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl mb-4 transition-colors',
                      isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-900 text-slate-400'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <p className="font-bold text-slate-100 text-sm">{type.label}</p>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed flex-1">
                      {desc}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form details section */}
          <div className="max-w-2xl mx-auto rounded-2xl border border-slate-900 bg-[#0F0F1A] p-6 space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              2. Datos básicos del negocio
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="clinic_name" className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Nombre de tu negocio
                </label>
                <input
                  id="clinic_name"
                  name="clinic_name"
                  type="text"
                  required
                  placeholder="Ej: Bufete Legal Ramos / Tacos El Primo"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="full_name" className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Tu nombre completo
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  placeholder="Ej: Alejandro Silva"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 flex justify-end">
              <SubmitButton pendingText="Configurando..." className="btn-primary flex items-center gap-2">
                Comenzar a automatizar
                <ArrowRight className="h-4 w-4" />
              </SubmitButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
