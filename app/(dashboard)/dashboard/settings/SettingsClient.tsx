'use client'

import { useState, useEffect } from 'react'
import { updateSettings, savePushSubscription, removePushSubscription, deleteBlockedSlot, uploadAvatar } from '@/app/actions'
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
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  UtensilsCrossed,
  X,
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

interface MenuItem {
  nombre: string
  precio: number
  max_piezas: number
  disponible: boolean
}

interface MenuCategory {
  categoria: string
  platillos: MenuItem[]
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
    business_config?: Record<string, unknown> | null
  }
  initialBlockedSlots: BlockedSlot[]
  businessTypeName?: string
}

// ── All available integrations ──
const allIntegrations = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Recibe y responde mensajes automáticamente desde WhatsApp.',
    icon: MessageSquare,
    color: 'text-green-400 bg-green-950/30 border border-green-900/30',
    connectedKey: null as null | string,
    alwaysConnected: true,
    visibleFor: ['all'],
  },
  {
    id: 'voice',
    name: 'Llamadas de Voz',
    description: 'Un número de teléfono dedicado para agendar por voz.',
    icon: Phone,
    color: 'text-blue-400 bg-blue-950/30 border border-blue-900/30',
    connectedKey: 'voice_enabled',
    alwaysConnected: false,
    visibleFor: ['clinic', 'lawfirm'],
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sincroniza las citas automáticamente con tu calendario.',
    icon: Calendar,
    color: 'text-red-400 bg-red-950/30 border border-red-900/30',
    connectedKey: 'google_calendar_connected',
    alwaysConnected: false,
    visibleFor: ['clinic', 'lawfirm'],
  },
  {
    id: 'calcom',
    name: 'Cal.com',
    description: 'Integración con Cal.com para páginas de reserva online.',
    icon: CalendarCheck,
    color: 'text-purple-400 bg-purple-950/30 border border-purple-900/30',
    connectedKey: 'calcom_api_key',
    alwaysConnected: false,
    visibleFor: ['clinic', 'lawfirm'],
  },
]

function formatBlockedRange(slot: BlockedSlot): string {
  const start = new Date(slot.starts_at)
  const end = new Date(slot.ends_at)
  const dateOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }

  if (slot.is_all_day) {
    const startStr = start.toLocaleDateString('es-MX', dateOpts)
    const displayEnd = new Date(end)
    displayEnd.setDate(displayEnd.getDate() - 1)
    const endStr = displayEnd.toLocaleDateString('es-MX', dateOpts)
    return startStr === endStr ? startStr : `${startStr} – ${endStr}`
  }

  const startDate = start.toLocaleDateString('es-MX', dateOpts)
  const startTime = start.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const endTime = end.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const endDate = end.toLocaleDateString('es-MX', dateOpts)

  if (startDate === endDate) {
    return `${startDate}, ${startTime} – ${endTime}`
  }
  return `${startDate} ${startTime} – ${endDate} ${endTime}`
}

export function SettingsClient({ professional, initialBlockedSlots, businessTypeName = '' }: SettingsClientProps) {
  const isRestaurant = businessTypeName === 'restaurant'
  const isLawFirm = businessTypeName === 'lawfirm'
  const verticalKey = isRestaurant ? 'restaurant' : isLawFirm ? 'lawfirm' : 'clinic'

  // ── Dynamic tabs based on vertical ──
  const tabs = [
    { id: 'profile',       label: 'Perfil',          icon: User },
    { id: 'integrations',  label: 'Integraciones',   icon: Puzzle },
    { id: 'notifications', label: 'Notificaciones',  icon: Bell },
    ...(!isRestaurant ? [{ id: 'blocked', label: 'Bloqueos', icon: Ban }] : []),
  ]

  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(initialBlockedSlots)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [blockedError, setBlockedError] = useState<string | null>(null)

  // Modalities (law firm)
  const [modalities, setModalities] = useState<string[]>(
    (professional.business_config?.modalities as string[] | undefined) ?? []
  )

  // Menu state (restaurant)
  const existingMenu = (professional.business_config?.menu as MenuCategory[] | undefined) ?? []
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(existingMenu)
  const [menuImageUrl] = useState<string>(
    (professional.business_config?.menu_image_url as string | undefined) ?? ''
  )
  const [menuSaving, setMenuSaving] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(sub => {
          if (sub) setPushEnabled(true)
        })
      })
    }
  }, [])

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
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
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
          await removePushSubscription(subscription.endpoint)
        }
        setPushEnabled(false)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cambiar notificaciones push')
      setPushEnabled(!enabled)
    } finally {
      setPushLoading(false)
    }
  }

  async function handleProfileSubmit(formData: FormData) {
    // Inject modalities if law firm
    if (isLawFirm) {
      formData.set('modalities', JSON.stringify(modalities))
    }
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

  function isConnected(integration: typeof allIntegrations[0]): boolean {
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

  // ── Menu helpers ──
  function addCategory() {
    setMenuCategories(prev => [...prev, { categoria: 'Nueva categoría', platillos: [] }])
  }

  function removeCategory(ci: number) {
    setMenuCategories(prev => prev.filter((_, i) => i !== ci))
  }

  function moveCategoryUp(ci: number) {
    if (ci === 0) return
    setMenuCategories(prev => {
      const arr = [...prev]
      ;[arr[ci - 1], arr[ci]] = [arr[ci], arr[ci - 1]]
      return arr
    })
  }

  function moveCategoryDown(ci: number) {
    setMenuCategories(prev => {
      if (ci === prev.length - 1) return prev
      const arr = [...prev]
      ;[arr[ci], arr[ci + 1]] = [arr[ci + 1], arr[ci]]
      return arr
    })
  }

  function updateCategoryName(ci: number, name: string) {
    setMenuCategories(prev => prev.map((c, i) => i === ci ? { ...c, categoria: name } : c))
  }

  function addPlatillo(ci: number) {
    setMenuCategories(prev => prev.map((c, i) =>
      i === ci
        ? { ...c, platillos: [...c.platillos, { nombre: '', precio: 0, max_piezas: 10, disponible: true }] }
        : c
    ))
  }

  function removePlatillo(ci: number, pi: number) {
    setMenuCategories(prev => prev.map((c, i) =>
      i === ci ? { ...c, platillos: c.platillos.filter((_, j) => j !== pi) } : c
    ))
  }

  function updatePlatillo(ci: number, pi: number, field: keyof MenuItem, value: string | number | boolean) {
    setMenuCategories(prev => prev.map((c, i) =>
      i === ci
        ? { ...c, platillos: c.platillos.map((p, j) => j === pi ? { ...p, [field]: value } : p) }
        : c
    ))
  }

  function movePlatilloUp(ci: number, pi: number) {
    if (pi === 0) return
    setMenuCategories(prev => prev.map((c, i) => {
      if (i !== ci) return c
      const arr = [...c.platillos]
      ;[arr[pi - 1], arr[pi]] = [arr[pi], arr[pi - 1]]
      return { ...c, platillos: arr }
    }))
  }

  function movePlatilloDown(ci: number, pi: number) {
    setMenuCategories(prev => prev.map((c, i) => {
      if (i !== ci) return c
      if (pi === c.platillos.length - 1) return c
      const arr = [...c.platillos]
      ;[arr[pi], arr[pi + 1]] = [arr[pi + 1], arr[pi]]
      return { ...c, platillos: arr }
    }))
  }

  async function saveMenu() {
    setMenuSaving(true)
    const formData = new FormData()
    formData.set('menu', JSON.stringify(menuCategories))
    const res = await updateSettings(null, formData)
    if (res.error) setError(res.error)
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setMenuSaving(false)
  }

  // ── Notification categories by vertical ──
  const notifCategories = isRestaurant
    ? [
        { id: 'notif-new-order',       label: 'Nuevo pedido recibido',  desc: 'Cuando llega un pedido nuevo por WhatsApp' },
        { id: 'notif-order-cancelled', label: 'Pedido cancelado',       desc: 'Cuando un cliente cancela un pedido' },
        { id: 'notif-new-message',     label: 'Nuevo mensaje',          desc: 'Cuando un cliente escribe un mensaje' },
      ]
    : [
        { id: 'notif-new-appointment', label: isLawFirm ? 'Consulta agendada'    : 'Nueva cita agendada', desc: isLawFirm ? 'Cuando el asistente agenda una consulta jurídica' : 'Cuando el asistente agenda una cita nueva' },
        { id: 'notif-cancelled',       label: isLawFirm ? 'Consulta cancelada'   : 'Cita cancelada',      desc: 'Cuando un cliente cancela su cita' },
        { id: 'notif-new-message',     label: 'Nuevo mensaje',                    desc: 'Cuando un cliente escribe un mensaje' },
      ]

  // ── Visible integrations ──
  const visibleIntegrations = allIntegrations.filter(
    i => i.visibleFor.includes('all') || i.visibleFor.includes(verticalKey)
  )

  // ── Vertical profile labels ──
  const labels = {
    businessName: isRestaurant ? 'Nombre del restaurante' : isLawFirm ? 'Nombre del despacho' : 'Clínica / Consultorio',
    specialty: isLawFirm ? 'Área del derecho' : 'Especialidad',
    toneHelp: isLawFirm
      ? 'Describe cómo debe hablar tu asistente con tus clientes. Esto guía las respuestas automáticas.'
      : isRestaurant
        ? 'Describe el tono del asistente al atender a tus clientes y tomar pedidos.'
        : 'Describe cómo debe hablar tu asistente con los pacientes. Esto guía las respuestas automáticas.',
    tonePlaceholder: isRestaurant
      ? 'Ej: "Sé amigable, rápido y servicial. Ayuda al comensal a armar su pedido y confirma cantidades."'
      : isLawFirm
        ? 'Ej: "Sé sumamente profesional, empático y claro. Enfatiza que la asesoría definitiva requiere una cita formal."'
        : 'Ej: "Sé empático, cálido y profesional. Ayuda al paciente a resolver sus dudas y confirma sus datos antes de agendar."',
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="mt-1 text-sm text-slate-400">
          Personaliza tu asistente y gestiona integraciones
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-900 overflow-x-auto">
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
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-900/30 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <form action={handleProfileSubmit} className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            {professional.avatar_url ? (
              <img src={professional.avatar_url} alt="Avatar" className="h-16 w-16 rounded-full object-cover shadow-md ring-2 ring-purple-900/30" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 text-2xl font-bold text-white shadow-md">
                {(professional.full_name ?? professional.email)[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-200">Foto de perfil</p>
              <label className="mt-1 inline-block text-xs text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer transition-colors">
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
            <DarkField label="Nombre completo" id="full_name" defaultValue={professional.full_name ?? ''} />
            <DarkField label="Email" id="email" defaultValue={professional.email} type="email" disabled />
            <DarkField label={labels.businessName} id="clinic_name" defaultValue={professional.clinic_name ?? ''} />
            {!isRestaurant && (
              <DarkField label={labels.specialty} id="specialty" defaultValue={professional.specialty ?? ''} />
            )}
            <DarkField label="Teléfono WhatsApp del negocio" id="phone_whatsapp" defaultValue={professional.phone_whatsapp ?? ''} />
            {isRestaurant && (
              <div>
                <DarkField
                  label="Número de notificación de pedidos"
                  id="orders_notification_phone"
                  defaultValue={(professional.business_config?.orders_notification_phone as string | undefined) ?? ''}
                  placeholder="5214499990000"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Este número recibe un WhatsApp cada vez que llega un pedido nuevo. Puede ser diferente al número público.
                </p>
              </div>
            )}
          </div>

          {/* Law firm modalities */}
          {isLawFirm && (
            <div>
              <p className="label-dark">Modalidades de atención</p>
              <div className="flex flex-wrap gap-3 mt-1">
                {['Presencial', 'Videollamada', 'Llamada telefónica'].map((m) => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-700 bg-[#0F0F1A] accent-purple-500"
                      checked={modalities.includes(m)}
                      onChange={(e) => {
                        if (e.target.checked) setModalities(prev => [...prev, m])
                        else setModalities(prev => prev.filter(x => x !== m))
                      }}
                    />
                    <span className="text-sm text-slate-300">{m}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tone prompt */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label htmlFor="tone_prompt" className="label-dark">
                Tono del asistente IA
              </label>
              <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <textarea
              id="tone_prompt"
              name="tone_prompt"
              rows={3}
              defaultValue={professional.tone_prompt ?? ''}
              placeholder={labels.tonePlaceholder}
              className="textarea-dark"
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              {labels.toneHelp}
            </p>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 pt-2">
            <SubmitButton pendingText="Guardando..." className="btn-primary">
              <Save className="h-4 w-4" />
              Guardar cambios
            </SubmitButton>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-cyan-400 animate-fade-in">
                <CheckCircle className="h-4 w-4" />
                Guardado
              </span>
            )}
          </div>
        </form>
      )}

      {/* ── Restaurant Menu Tab (within profile, separate block) ── */}
      {activeTab === 'profile' && isRestaurant && (
        <div className="space-y-5 pt-4 border-t border-slate-900">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-200">Menú del restaurante</h3>
          </div>

          {/* Part 1 — Menu image */}
          <div className="card-dark p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-300">Imagen del menú</p>
            <p className="text-[11px] text-slate-500">Esta imagen se muestra al cliente cuando pregunta por el menú.</p>
            {menuImageUrl ? (
              <div className="relative w-full max-w-xs">
                <img src={menuImageUrl} alt="Menú" className="rounded-xl border border-slate-800 w-full object-contain max-h-48" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40 py-8 gap-2">
                <ImageIcon className="h-8 w-8 text-slate-600" />
                <p className="text-xs text-slate-500">Sin imagen de menú</p>
              </div>
            )}
            <label className="inline-flex items-center gap-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors">
              <Plus className="h-3.5 w-3.5" />
              {menuImageUrl ? 'Cambiar imagen' : 'Subir imagen del menú'}
              <input type="file" className="hidden" accept="image/jpeg,image/png,application/pdf" />
            </label>
          </div>

          {/* Part 2 — Structured menu */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-300">Menú estructurado</p>
              <button
                type="button"
                onClick={addCategory}
                className="flex items-center gap-1.5 rounded-lg border border-purple-900/40 bg-purple-950/20 px-3 py-1.5 text-xs font-medium text-purple-400 hover:bg-purple-950/40 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar categoría
              </button>
            </div>

            {menuCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 py-8 gap-2">
                <UtensilsCrossed className="h-8 w-8 text-slate-700" />
                <p className="text-xs text-slate-500">Sin categorías. Agrega una para empezar.</p>
              </div>
            )}

            {menuCategories.map((cat, ci) => (
              <div key={ci} className="card-dark overflow-hidden">
                {/* Category header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-900 bg-slate-900/30">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveCategoryUp(ci)} disabled={ci === 0}
                      className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-colors">
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => moveCategoryDown(ci)} disabled={ci === menuCategories.length - 1}
                      className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-colors">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    value={cat.categoria}
                    onChange={(e) => updateCategoryName(ci, e.target.value)}
                    className="flex-1 bg-transparent text-sm font-semibold text-slate-100 focus:outline-none placeholder:text-slate-600"
                    placeholder="Nombre de la categoría"
                  />
                  <button type="button" onClick={() => removeCategory(ci)}
                    className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Platillos */}
                <div className="p-3 space-y-2">
                  {cat.platillos.map((platillo, pi) => (
                    <div key={pi} className="flex items-center gap-2 rounded-lg bg-slate-900/40 border border-slate-900 px-3 py-2">
                      <div className="flex flex-col gap-0.5">
                        <button type="button" onClick={() => movePlatilloUp(ci, pi)} disabled={pi === 0}
                          className="text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors">
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button type="button" onClick={() => movePlatilloDown(ci, pi)} disabled={pi === cat.platillos.length - 1}
                          className="text-slate-600 hover:text-slate-300 disabled:opacity-30 transition-colors">
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                      <input
                        value={platillo.nombre}
                        onChange={(e) => updatePlatillo(ci, pi, 'nombre', e.target.value)}
                        placeholder="Nombre del platillo"
                        className="flex-1 min-w-0 bg-transparent text-sm text-slate-100 focus:outline-none placeholder:text-slate-600"
                      />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-slate-500">$</span>
                        <input
                          type="number"
                          value={platillo.precio}
                          onChange={(e) => updatePlatillo(ci, pi, 'precio', Number(e.target.value))}
                          className="w-16 bg-[#0F0F1A] border border-slate-800 rounded text-xs text-slate-100 px-2 py-1 focus:outline-none focus:border-purple-500"
                          min={0}
                        />
                        <span className="text-[10px] text-slate-600">máx</span>
                        <input
                          type="number"
                          value={platillo.max_piezas}
                          onChange={(e) => updatePlatillo(ci, pi, 'max_piezas', Number(e.target.value))}
                          className="w-12 bg-[#0F0F1A] border border-slate-800 rounded text-xs text-slate-100 px-2 py-1 focus:outline-none focus:border-purple-500"
                          min={1}
                        />
                        <label className="relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors"
                          style={{ backgroundColor: platillo.disponible ? '#8B5CF6' : '#1e293b' }}>
                          <input type="checkbox" className="peer sr-only" checked={platillo.disponible}
                            onChange={(e) => updatePlatillo(ci, pi, 'disponible', e.target.checked)} />
                          <span className={cn("absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform", platillo.disponible ? "translate-x-4" : "translate-x-0.5")} />
                        </label>
                        <button type="button" onClick={() => removePlatillo(ci, pi)}
                          className="text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button type="button" onClick={() => addPlatillo(ci)}
                    className="flex items-center gap-1.5 w-full justify-center rounded-lg border border-dashed border-slate-800 py-2 text-xs text-slate-500 hover:text-cyan-400 hover:border-cyan-900/40 transition-colors">
                    <Plus className="h-3 w-3" />
                    Agregar platillo
                  </button>
                </div>
              </div>
            ))}

            {menuCategories.length > 0 && (
              <button
                type="button"
                onClick={saveMenu}
                disabled={menuSaving}
                className="btn-primary disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {menuSaving ? 'Guardando menú...' : 'Guardar menú'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Integrations Tab ── */}
      {activeTab === 'integrations' && (
        <div className="space-y-3">
          {visibleIntegrations.map((integration) => {
            const Icon = integration.icon
            const connected = isConnected(integration)

            return (
              <div
                key={integration.id}
                className="flex items-center gap-4 card-dark p-5"
              >
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', integration.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-100">{integration.name}</p>
                    <span
                      className={cn(
                        'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        connected
                          ? 'bg-cyan-950/40 text-cyan-400'
                          : 'bg-slate-800 text-slate-500'
                      )}
                    >
                      {connected ? (
                        <><CheckCircle className="h-2.5 w-2.5" /> Conectado</>
                      ) : (
                        <><XCircle className="h-2.5 w-2.5" /> Desconectado</>
                      )}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{integration.description}</p>
                </div>
                <button
                  type="button"
                  id={`integration-${integration.id}-btn`}
                  className={cn(
                    'shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors',
                    connected
                      ? 'border border-slate-800 text-slate-400 hover:bg-slate-900'
                      : 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:from-purple-500 hover:to-cyan-400'
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
          <div className="card-dark p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Notificaciones Push</h3>

            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-900">
              <div>
                <p className="text-sm font-medium text-slate-300">Recibir notificaciones push</p>
                <p className="text-xs text-slate-500 mt-0.5">Te enviaremos alertas al navegador (incluso si está cerrado).</p>
              </div>
              <label
                className={cn(
                  "relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors",
                  pushEnabled ? "bg-purple-600" : "bg-slate-800",
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
              {notifCategories.map((notif) => (
                <div key={notif.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-300">{notif.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                  </div>
                  <label
                    htmlFor={notif.id}
                    className="relative inline-flex h-5 w-9 items-center rounded-full bg-purple-600"
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

      {/* ── Blocked Slots Tab (only for non-restaurant) ── */}
      {activeTab === 'blocked' && !isRestaurant && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-200">Bloqueos de Horario</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Vacaciones, ausencias y horarios reservados que impiden el agendamiento.
              </p>
            </div>
            <NewBlockedSlotModal onCreated={handleBlockedSlotCreated} />
          </div>

          {blockedError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-900/30 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              <p>{blockedError}</p>
            </div>
          )}

          {blockedSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 mb-4">
                <CalendarX className="h-6 w-6 text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-400">Sin bloqueos configurados</p>
              <p className="mt-1 text-xs text-slate-600 max-w-xs">
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
                      "flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-200",
                      isPast
                        ? "border-slate-900 bg-[#0F0F1A] opacity-60"
                        : "border-slate-900 bg-[#0F0F1A] hover:border-slate-800"
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      slot.is_all_day ? "bg-orange-950/30 text-orange-400" : "bg-amber-950/30 text-amber-400"
                    )}>
                      {slot.is_all_day ? <CalendarX className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-100 truncate">{slot.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5" suppressHydrationWarning>{formatBlockedRange(slot)}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isPast && (
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          Expirado
                        </span>
                      )}
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        slot.is_all_day
                          ? "bg-orange-950/30 text-orange-400"
                          : "bg-amber-950/30 text-amber-400"
                      )}>
                        {slot.is_all_day ? 'Todo el día' : 'Horario específico'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteBlockedSlot(slot.id)}
                        disabled={deletingId === slot.id}
                        title="Eliminar bloqueo"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-red-950/30 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex items-start gap-3 rounded-xl bg-purple-950/20 border border-purple-900/30 p-4">
            <AlertCircle className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-xs text-purple-300">
              Los bloqueos activos impiden que el asistente agende citas durante ese período.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Dark Mode Field Component ──
function DarkField({
  label,
  id,
  defaultValue,
  type = 'text',
  disabled = false,
  placeholder,
}: {
  label: string
  id: string
  defaultValue: string
  type?: string
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="label-dark">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        placeholder={placeholder}
        className="input-dark"
      />
    </div>
  )
}
