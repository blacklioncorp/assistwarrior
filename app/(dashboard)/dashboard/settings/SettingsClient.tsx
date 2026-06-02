'use client'

import { useState, useEffect, useTransition } from 'react'
import { updateSettings, savePushSubscription, removePushSubscription, deleteBlockedSlot, createBlockedSlot, uploadAvatar } from '@/app/actions'
import { SubmitButton } from '@/components/ui/submit-button'
import {
  User,
  Puzzle,
  Bell,
  CheckCircle,
  XCircle,
  MessageSquare,
  Phone,
  Calendar,
  CalendarCheck,
  HelpCircle,
  AlertCircle,
  Save,
  Ban,
  Trash2,
  Plus,
  CalendarX,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewBlockedSlotModal } from '@/components/dashboard/modals/NewBlockedSlotModal'

interface BlockedSlot {
  id: string
  title: string
  starts_at: string
  ends_at: string
  is_all_day: boolean
}

interface SettingsClientProps {
  professional: {
    full_name?: string | null
    email: string
    specialty?: string | null
    clinic_name?: string | null
    phone_whatsapp?: string | null
    google_calendar_connected?: boolean | null
    calcom_api_key?: string | null
    voice_enabled?: boolean | null
    voice_phone_number?: string | null
    working_hours?: Record<string, { start: string; end: string; enabled: boolean }> | null
    tone_prompt?: string | null
    avatar_url?: string | null
  }
  initialBlockedSlots: BlockedSlot[]
}


const tabs = [
  { id: 'profile',       label: 'Perfil',          icon: User },
  { id: 'integrations',  label: 'Integraciones',   icon: Puzzle },
  { id: 'notifications', label: 'Notificaciones',  icon: Bell },
  { id: 'blocked',       label: 'Bloqueos',         icon: Ban },
]

const integrations = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Recibe y responde mensajes automáticamente desde WhatsApp.',
    icon: MessageSquare,
    color: 'text-green-600 bg-green-50',
    connectedKey: null, 
    alwaysConnected: true,
  },
  {
    id: 'voice',
    name: 'Llamadas de Voz',
    description: 'Un número de teléfono dedicado para agendar por voz.',
    icon: Phone,
    color: 'text-blue-600 bg-blue-50',
    connectedKey: 'voice_enabled',
    alwaysConnected: false,
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sincroniza las citas automáticamente con tu calendario.',
    icon: Calendar,
    color: 'text-red-600 bg-red-50',
    connectedKey: 'google_calendar_connected',
    alwaysConnected: false,
  },
  {
    id: 'calcom',
    name: 'Cal.com',
    description: 'Integración con Cal.com para páginas de reserva online.',
    icon: CalendarCheck,
    color: 'text-violet-600 bg-violet-50',
    connectedKey: 'calcom_api_key',
    alwaysConnected: false,
  },
]

function formatBlockedRange(slot: BlockedSlot): string {
  const start = new Date(slot.starts_at)
  const end = new Date(slot.ends_at)
  const dateOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }

  if (slot.is_all_day) {
    // All day: just show date range
    const startStr = start.toLocaleDateString('es-MX', dateOpts)
    // subtract 1 day from end (exclusive) for display
    const displayEnd = new Date(end)
    displayEnd.setDate(displayEnd.getDate() - 1)
    const endStr = displayEnd.toLocaleDateString('es-MX', dateOpts)
    return startStr === endStr ? startStr : `${startStr} – ${endStr}`
  }

  // Timed: show date + time range
  const startDate = start.toLocaleDateString('es-MX', dateOpts)
  const startTime = start.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const endTime = end.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const endDate = end.toLocaleDateString('es-MX', dateOpts)

  if (startDate === endDate) {
    return `${startDate}, ${startTime} – ${endTime}`
  }
  return `${startDate} ${startTime} – ${endDate} ${endTime}`
}

export function SettingsClient({ professional, initialBlockedSlots }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)

  const [avatarUploading, setAvatarUploading] = useState(false)

  // Blocked slots state
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(initialBlockedSlots)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [blockedError, setBlockedError] = useState<string | null>(null)

  useEffect(() => {
    // Check if there's an existing push subscription in the browser
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(sub => {
          if (sub) {
            setPushEnabled(true)
          }
        })
      })
    }
  }, [])

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async function togglePushNotifications(enabled: boolean) {
    setPushLoading(true)
    setError(null)
    try {
      const registration = await navigator.serviceWorker.ready
      if (enabled) {
        // Subscribe
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidPublicKey || vapidPublicKey.includes('CAMBIA_POR')) {
          throw new Error('VAPID key no configurada en el entorno')
        }
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        })
        
        const res = await savePushSubscription(JSON.parse(JSON.stringify(subscription)))
        if (res.error) throw new Error(res.error)
        
        setPushEnabled(true)
      } else {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
          await removePushSubscription(subscription.endpoint)
        }
        setPushEnabled(false)
      }
    } catch (err: any) {
      setError(err.message || 'Error al cambiar notificaciones push')
      // Revert UI state if failed
      setPushEnabled(!enabled)
    } finally {
      setPushLoading(false)
    }
  }

  async function handleProfileSubmit(formData: FormData) {
    setError(null)
    const res = await updateSettings(null, formData)
    if (res.error) {
      setError(res.error)
    } else if (res.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('avatar', file)

    const res = await uploadAvatar(formData)
    if (res.error) {
      setError(res.error)
    } else if (res.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setAvatarUploading(false)
  }

  function isConnected(integration: typeof integrations[0]): boolean {
    if (integration.alwaysConnected) return true
    if (!integration.connectedKey) return false
    const val = professional[integration.connectedKey as keyof typeof professional]
    return !!val
  }

  async function handleDeleteBlockedSlot(id: string) {
    if (!confirm('¿Eliminar este bloqueo de horario?')) return
    setDeletingId(id)
    setBlockedError(null)
    const res = await deleteBlockedSlot(id)
    if (res.error) {
      setBlockedError(res.error)
    } else {
      setBlockedSlots(prev => prev.filter(s => s.id !== id))
    }
    setDeletingId(null)
  }

  function handleBlockedSlotCreated(slot: BlockedSlot) {
    setBlockedSlots(prev => [slot, ...prev])
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="mt-1 text-sm text-slate-500">
          Personaliza tu asistente y gestiona integraciones
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              id={`settings-tab-${tab.id}`}
              className={cn(
                'flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-[#1E4A8A] text-[#1E4A8A]'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <form action={handleProfileSubmit} className="space-y-5">
          {/* Avatar placeholder */}
          <div className="flex items-center gap-5">
            {professional.avatar_url ? (
              <img src={professional.avatar_url} alt="Avatar" className="h-16 w-16 rounded-full object-cover shadow-md" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1E4A8A] text-2xl font-bold text-white shadow-md">
                {(professional.full_name ?? professional.email)[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-800">Foto de perfil</p>
              <label className="mt-1 inline-block text-xs text-blue-600 hover:underline cursor-pointer">
                {avatarUploading ? 'Subiendo...' : 'Cambiar foto'}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/jpeg, image/png, image/webp, image/gif" 
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
              </label>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo" id="full_name" defaultValue={professional.full_name ?? ''} />
            <Field label="Email" id="email" defaultValue={professional.email} type="email" disabled />
            <Field label="Clínica / Consultorio" id="clinic_name" defaultValue={professional.clinic_name ?? ''} />
            <Field label="Especialidad" id="specialty" defaultValue={professional.specialty ?? ''} />
            <Field label="Teléfono WhatsApp del negocio" id="phone_whatsapp" defaultValue={professional.phone_whatsapp ?? ''} />
          </div>

          {/* Tone prompt */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label htmlFor="tone_prompt" className="text-xs font-semibold text-slate-700">
                Tono del asistente IA
              </label>
              <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <textarea
              id="tone_prompt"
              name="tone_prompt"
              rows={3}
              defaultValue={professional.tone_prompt ?? ''}
              placeholder='Ej: "Sé amable y profesional. Usa un lenguaje cálido pero directo. Siempre confirma los datos antes de agendar."'
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none transition-colors"
            />

            <p className="mt-1.5 text-[11px] text-slate-400">
              Describe cómo debe hablar tu asistente con los pacientes. Esto guía las respuestas automáticas.
            </p>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 pt-2">
            <SubmitButton pendingText="Guardando..." className="bg-[#1E4A8A] hover:bg-[#1a3f78] rounded-xl px-5">
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </SubmitButton>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-teal-600 animate-fade-in">
                <CheckCircle className="h-4 w-4" />
                Guardado
              </span>
            )}
          </div>
        </form>
      )}

      {/* ── Integrations Tab ── */}
      {activeTab === 'integrations' && (
        <div className="space-y-3">
          {integrations.map((integration) => {
            const Icon = integration.icon
            const connected = isConnected(integration)

            return (
              <div
                key={integration.id}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card"
              >
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', integration.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{integration.name}</p>
                    <span
                      className={cn(
                        'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        connected
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {connected ? (
                        <><CheckCircle className="h-2.5 w-2.5" /> Conectado</>
                      ) : (
                        <><XCircle className="h-2.5 w-2.5" /> Desconectado</>
                      )}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{integration.description}</p>
                </div>
                <button
                  type="button"
                  id={`integration-${integration.id}-btn`}
                  className={cn(
                    'shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors',
                    connected
                      ? 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      : 'bg-[#1E4A8A] text-white hover:bg-[#1a3f78]'
                  )}
                >
                  {connected ? 'Configurar' : 'Conectar'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Notifications Tab ── */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Notificaciones Push</h3>
            
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-700">Recibir notificaciones push</p>
                <p className="text-xs text-slate-400 mt-0.5">Te enviaremos alertas al navegador (incluso si está cerrado).</p>
              </div>
              <label
                className={cn(
                  "relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors",
                  pushEnabled ? "bg-[#1E4A8A]" : "bg-slate-200",
                  pushLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={pushEnabled}
                  disabled={pushLoading}
                  onChange={(e) => togglePushNotifications(e.target.checked)}
                />
                <span 
                  className={cn(
                    "absolute left-1 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    pushEnabled && "translate-x-5"
                  )} 
                />
              </label>
            </div>

            <div className="space-y-4 opacity-50">
              <p className="text-xs text-slate-500 mb-2 font-medium">Categorías (Próximamente)</p>
              {[
                { id: 'notif-new-appointment', label: 'Nueva cita agendada', desc: 'Cuando el asistente agenda una cita nueva' },
                { id: 'notif-cancelled',        label: 'Cita cancelada',      desc: 'Cuando un paciente cancela una cita' },
                { id: 'notif-new-message',      label: 'Nuevo mensaje',       desc: 'Cuando un paciente escribe un mensaje' },
              ].map((notif) => (
                <div key={notif.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{notif.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{notif.desc}</p>
                  </div>
                  <label
                    htmlFor={notif.id}
                    className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#1E4A8A]"
                  >
                    <input type="checkbox" id={notif.id} defaultChecked disabled className="peer sr-only" />
                    <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform translate-x-4" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Blocked Slots Tab ── */}
      {activeTab === 'blocked' && (
        <div className="space-y-4">
          {/* Header with action */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Bloqueos de Horario</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Vacaciones, congresos, ausencias y horarios reservados que impiden el agendamiento.
              </p>
            </div>
            <NewBlockedSlotModal onCreated={handleBlockedSlotCreated} />
          </div>

          {blockedError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <p>{blockedError}</p>
            </div>
          )}

          {/* List */}
          {blockedSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-4">
                <CalendarX className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Sin bloqueos configurados</p>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                Agrega vacaciones, almuerzos o ausencias para que el asistente no agende citas en esos horarios.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedSlots.map((slot) => {
                const isPast = new Date(slot.ends_at) < new Date()
                return (
                  <div
                    key={slot.id}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border bg-white px-5 py-4 shadow-card transition-all duration-200",
                      isPast ? "border-slate-100 opacity-60" : "border-slate-100 hover:shadow-card-hover"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      slot.is_all_day ? "bg-orange-50 text-orange-500" : "bg-amber-50 text-amber-500"
                    )}>
                      {slot.is_all_day ? (
                        <CalendarX className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{slot.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5" suppressHydrationWarning>{formatBlockedRange(slot)}</p>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isPast && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          Expirado
                        </span>
                      )}
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        slot.is_all_day 
                          ? "bg-orange-100 text-orange-600"
                          : "bg-amber-100 text-amber-600"
                      )}>
                        {slot.is_all_day ? 'Todo el día' : 'Horario específico'}
                      </span>
                      
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteBlockedSlot(slot.id)}
                        disabled={deletingId === slot.id}
                        title="Eliminar bloqueo"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Info box */}
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 p-4">
            <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Los bloqueos activos impiden que el asistente, WhatsApp, voz o el dashboard manual agende citas durante ese período.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  id,
  defaultValue,
  type = 'text',
  disabled = false,
}: {
  label: string
  id: string
  defaultValue: string
  type?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
      />
    </div>
  )
}
