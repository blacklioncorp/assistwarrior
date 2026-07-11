"use client"

import { useState, useTransition } from 'react'
import { cancelAppointment } from '@/app/actions'
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Phone,
  Monitor,
  MessageSquare,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { formatTime, cn } from '@/lib/utils'
import { NewAppointmentModal } from '@/components/dashboard/modals/NewAppointmentModal'

import { useBusinessType } from '@/hooks/useBusinessType'

type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
type AppointmentChannel = 'whatsapp' | 'voice' | 'dashboard' | 'calcom'

const statusConfig: Record<AppointmentStatus, {
  label: string
  badge: 'success' | 'info' | 'destructive' | 'secondary' | 'warning'
  icon: React.ElementType
  dot: string
}> = {
  scheduled:  { label: 'Pendiente',  badge: 'warning',     icon: Clock,         dot: 'bg-amber-400' },
  confirmed:  { label: 'Confirmada', badge: 'success',     icon: CheckCircle2,  dot: 'bg-teal-400' },
  cancelled:  { label: 'Cancelada',  badge: 'destructive', icon: XCircle,       dot: 'bg-red-400' },
  completed:  { label: 'Completada', badge: 'secondary',   icon: CheckCircle2,  dot: 'bg-slate-400' },
  no_show:    { label: 'No completada', badge: 'warning',   icon: AlertCircle,   dot: 'bg-orange-400' },
}

const channelConfig: Record<AppointmentChannel, {
  label: string
  badge: 'whatsapp' | 'voice' | 'dashboard' | 'calcom'
  icon: React.ElementType
}> = {
  whatsapp:  { label: 'WhatsApp', badge: 'whatsapp',  icon: MessageSquare },
  voice:     { label: 'Voz',      badge: 'voice',     icon: Phone },
  dashboard: { label: 'Manual',   badge: 'dashboard', icon: Monitor },
  calcom:    { label: 'Cal.com',  badge: 'calcom',    icon: Calendar },
}

interface AppointmentRow {
  id: string
  patient_name: string
  title: string
  starts_at: string
  ends_at: string
  status: string
  channel: string
  notes?: string | null
  patient_phone?: string | null
}

interface Patient {
  id: string
  full_name: string
}

interface WorkingHours {
  start: string
  end: string
  enabled: boolean
}

interface ProfessionalWorkingHours {
  monday: WorkingHours
  tuesday: WorkingHours
  wednesday: WorkingHours
  thursday: WorkingHours
  friday: WorkingHours
  saturday: WorkingHours
  sunday: WorkingHours
}

interface BlockedSlot {
  id: string
  title: string
  starts_at: string
  ends_at: string
  is_all_day: boolean
}

interface AppointmentsClientProps {
  appointments: AppointmentRow[]
  patients: Patient[]
  workingHours: ProfessionalWorkingHours
  blockedSlots: BlockedSlot[]
}

export function AppointmentsClient({ appointments, patients, workingHours, blockedSlots }: AppointmentsClientProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all')
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)
  const { labels } = useBusinessType()

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true
    if (filter === 'pending') return apt.status === 'scheduled' || apt.status === 'confirmed'
    if (filter === 'completed') return apt.status === 'completed'
    if (filter === 'cancelled') return apt.status === 'cancelled'
    return true
  })

  // Group appointments by date
  const grouped = filteredAppointments.reduce((acc, apt) => {
    const key = new Date(apt.starts_at).toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    if (!acc[key]) acc[key] = []
    acc[key].push(apt)
    return acc
  }, {} as Record<string, AppointmentRow[]>)

  const dateGroups = Object.entries(grouped)

  const handleCancel = (id: string) => {
    if (!confirm(`¿Estás seguro de que deseas cancelar este ${labels.appointmentSingular}?`)) return

    startTransition(async () => {
      setActionError(null)
      const res = await cancelAppointment(id)
      if (res.error) {
        setActionError(res.error)
      }
    })
  }

  const filterTabs = [
    { id: 'all', label: 'Todos' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'completed', label: 'Completados' },
    { id: 'cancelled', label: 'Cancelados' },
  ] as const

  return (
    <div className="space-y-6 max-w-4xl text-slate-100">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{labels.appointments}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Gestiona y consulta todos tus {labels.appointments.toLowerCase()}
          </p>
        </div>
        <NewAppointmentModal 
          patients={patients} 
          workingHours={workingHours}
          blockedSlots={blockedSlots}
        />
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-900/30 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          <p>{actionError}</p>
        </div>
      )}

      {/* Status filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200",
              filter === tab.id
                ? "bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-900/10"
                : "border-slate-800 bg-[#0F0F1A] text-slate-400 hover:border-slate-700 hover:text-slate-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments list */}
      {dateGroups.length === 0 ? (
        <div className="bg-[#0F0F1A] rounded-2xl border border-slate-900 shadow-card">
          <EmptyState
            icon={Calendar}
            title={filter === 'all' ? `Sin ${labels.appointments.toLowerCase()} registrados` : `No se encontraron ${labels.appointments.toLowerCase()}`}
            description={
              filter === 'all' 
                ? `Los ${labels.appointments.toLowerCase()} agendados aparecerán aquí automáticamente.` 
                : `No tienes ${labels.appointments.toLowerCase()} con estado "${filterTabs.find(t => t.id === filter)?.label}" en este momento.`
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {dateGroups.map(([dateLabel, apts]) => (
            <section key={dateLabel}>
              {/* Date label */}
              <div className="mb-3 flex items-center gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 capitalize">
                  {dateLabel}
                </p>
                <div className="flex-1 h-px bg-slate-900" />
                <span className="text-xs text-slate-500 font-medium">{apts.length} {labels.appointmentSingular}{apts.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {apts.map((apt) => {
                  const status = statusConfig[apt.status as AppointmentStatus] ?? statusConfig.scheduled
                  const channel = channelConfig[apt.channel as AppointmentChannel] ?? channelConfig.dashboard
                  const StatusIcon = status.icon
                  const ChannelIcon = channel.icon
                  const canCancel = apt.status === 'scheduled' || apt.status === 'confirmed'

                  return (
                    <div
                      key={apt.id}
                      className="group flex items-center gap-4 rounded-2xl border border-slate-900 bg-[#0F0F1A] px-5 py-4 shadow-card hover:bg-slate-900/20 transition-all duration-200"
                    >
                      {/* Status dot */}
                      <div
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 rounded-full",
                          status.dot
                        )}
                      />

                      {/* Time */}
                      <div className="w-20 shrink-0">
                        <p className="text-sm font-bold text-slate-200 tabular-nums">
                          {formatTime(apt.starts_at)}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {formatTime(apt.ends_at)}
                        </p>
                      </div>

                      {/* Patient info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-200 truncate text-sm">
                          {apt.patient_name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-400 truncate">{apt.title}</p>
                          {apt.patient_phone && (
                            <p className="text-[10px] text-slate-500 hidden sm:block">
                              · {apt.patient_phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Badges & Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={channel.badge} className="hidden sm:inline-flex gap-1">
                          <ChannelIcon className="h-3 w-3" />
                          {channel.label}
                        </Badge>
                        <Badge variant={status.badge} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          <span>{status.label}</span>
                        </Badge>
                        
                        {/* Cancel button */}
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(apt.id)}
                            disabled={isPending}
                            title={`Cancelar ${labels.appointmentSingular}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-950/20 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
