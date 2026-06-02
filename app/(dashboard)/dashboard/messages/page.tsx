import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import { MessageSquare, Phone, CheckCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { getInitials } from '@/lib/utils'

export const metadata = { title: 'Mensajes' }

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
]

function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % avatarColors.length
  return avatarColors[index]
}

interface ConversationRow {
  id: string
  patient_name: string | null
  patient_phone: string
  status: string
  last_message_at: string
  last_message_preview: string | null
  unread_count: number
  // virtual: derived from messages relation
  channel?: string
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Conversations ordered by most recent
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, patient_name, patient_phone, status, last_message_at, last_message_preview, unread_count')
    .eq('professional_id', user.id)
    .order('last_message_at', { ascending: false })

  const convs = (conversations ?? []) as ConversationRow[]
  const totalUnread = convs.reduce((acc, c) => acc + (c.unread_count ?? 0), 0)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Mensajes</h1>
            {totalUnread > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                {totalUnread} sin leer
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Conversaciones de WhatsApp y llamadas de voz
          </p>
        </div>
      </div>

      {/* Conversations list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {convs.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Sin mensajes aún"
            description="Las conversaciones de WhatsApp y llamadas de voz aparecerán aquí cuando los pacientes contacten a tu asistente."
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {convs.map((conv) => {
              const name = conv.patient_name ?? conv.patient_phone
              const initials = getInitials(name)
              const avatarColor = getAvatarColor(name)
              const hasUnread = conv.unread_count > 0

              return (
                <div
                  key={conv.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`Conversación con ${name}`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${avatarColor}`}
                    >
                      {initials}
                    </div>
                    {/* Channel indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm">
                      <MessageSquare className="h-2.5 w-2.5 text-green-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm truncate ${
                          hasUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                        }`}
                      >
                        {name}
                      </p>
                      <p
                        className={`text-[10px] shrink-0 ${
                          hasUnread ? 'font-semibold text-blue-600' : 'text-slate-400'
                        }`}
                      >
                        {timeAgo(conv.last_message_at)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className={`text-xs truncate ${
                          hasUnread ? 'text-slate-600' : 'text-slate-400'
                        }`}
                      >
                        {conv.last_message_preview ?? 'Sin mensajes aún'}
                      </p>
                      {hasUnread && (
                        <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#1E4A8A] text-[10px] font-bold text-white">
                          {conv.unread_count > 9 ? '9+' : conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Note about read-only AI conversations */}
      {convs.length > 0 && (
        <p className="text-center text-xs text-slate-400 pb-2">
          Las conversaciones son gestionadas por tu asistente IA.{' '}
          <a href="/dashboard/settings" className="text-blue-600 hover:underline">
            Configura el tono aquí →
          </a>
        </p>
      )}
    </div>
  )
}
