import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Users,
  XCircle,
  Phone,
  CalendarCheck,
  Activity,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { formatTime, formatDate } from '@/lib/utils'
import { isSameDay } from 'date-fns'
import {
  DEMO_PROFESSIONAL,
  DEMO_STATS,
  DEMO_APPOINTMENTS,
  DEMO_ACTIVITY,
  type DemoAppointment,
  type DemoActivity,
} from '@/lib/demo-data'
import {
  statusConfig,
  channelConfig,
  activityTypeConfig,
  getGreeting,
  timeAgo,
  type AppointmentStatus,
  type AppointmentChannel,
} from '@/lib/dashboard-config'

export const metadata = {
  title: 'Demo — Senzio',
  description: 'Demostración interactiva de Senzio',
}

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contacto@assistwarrior.com'

// Only show scheduled/confirmed appointments that fall on today's date
const today = new Date()
const todayAppointments = DEMO_APPOINTMENTS.filter(
  (a) =>
    (a.status === 'scheduled' || a.status === 'confirmed') &&
    isSameDay(new Date(a.starts_at), today)
)

export default function DemoPage() {
  const firstName = 'Laura'

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Demo banner */}
      <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-amber-400 px-4 py-2 text-xs font-semibold text-amber-900">
        <span>⚡ Modo Demo — datos de ejemplo</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">
          ¿Te interesa? →{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2">
            Solicitar acceso
          </a>
        </span>
      </div>

      <Sidebar professional={DEMO_PROFESSIONAL} />

      <div className="lg:pl-64">
        {/* Simplified header (no auth actions) */}
        <header className="sticky top-8 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-md px-4 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-slate-800">{DEMO_PROFESSIONAL.clinic_name}</p>
            <p className="text-xs text-slate-400 hidden sm:block">Sistema de recepción inteligente</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              DEMO
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E4A8A] text-[10px] font-bold text-white">
              LM
            </div>
          </div>
        </header>

        <main className="p-4 pb-24 lg:p-8 lg:pb-8 animate-fade-in">
          <div className="space-y-6 max-w-7xl">
            {/* Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {getGreeting()}, {firstName} 👋
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(today)} · Aquí está el resumen de tu día.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                <CheckCircle2 className="h-3 w-3" />
                {DEMO_PROFESSIONAL.specialty}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard title="Citas hoy" value={DEMO_STATS.totalTodayAppts} description={`${DEMO_STATS.confirmedToday} confirmadas`} icon={Calendar} color="blue" />
              <StatCard title="Mensajes" value={DEMO_STATS.unreadMessages} description="Sin leer" icon={MessageSquare} color="amber" />
              <StatCard title="Pacientes" value={DEMO_STATS.totalPatients} description="Total registrados" icon={Users} color="violet" />
              <StatCard title="Pendientes" value={DEMO_STATS.pendingToday} description="Por confirmar hoy" icon={Clock} color="amber" />
            </div>

            {/* Main grid */}
            <div className="grid gap-5 lg:grid-cols-5">
              {/* Appointments */}
              <section className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <h2 className="text-sm font-semibold text-slate-800">Citas de Hoy</h2>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      {todayAppointments.length}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Demo — datos de ejemplo</span>
                </div>

                {todayAppointments.length === 0 ? (
                  <EmptyState icon={Calendar} title="Sin citas para hoy" description="Las citas de WhatsApp y voz aparecerán aquí." />
                ) : (
                  <div className="divide-y divide-slate-50">
                    {todayAppointments.map((apt) => {
                      const status = statusConfig[apt.status as AppointmentStatus] ?? statusConfig.scheduled
                      const StatusIcon = status.icon
                      const channel = channelConfig[apt.channel as AppointmentChannel] ?? channelConfig.dashboard
                      return (
                        <div key={apt.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                          <div className="w-14 shrink-0 text-center">
                            <p className="text-sm font-bold text-slate-800 tabular-nums">
                              {formatTime(apt.starts_at)}
                            </p>
                          </div>
                          <div className="h-8 w-px bg-slate-100 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-800 text-sm truncate">{apt.patient_name}</p>
                              <Badge variant={channel.badge} className="hidden sm:inline-flex">{channel.label}</Badge>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{apt.title}</p>
                          </div>
                          <Badge variant={status.badge} className="shrink-0">
                            <StatusIcon className="h-3 w-3" />
                            <span className="hidden sm:inline">{status.label}</span>
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Activity */}
              <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  <h2 className="text-sm font-semibold text-slate-800">Actividad Reciente</h2>
                </div>
                <div className="px-5 py-4 space-y-4">
                  {DEMO_ACTIVITY.map((activity: DemoActivity) => {
                    const config = activityTypeConfig[activity.type] ?? activityTypeConfig.appointment_booked
                    const Icon = config.icon
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.color}`}>
                          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700 leading-snug">{activity.title}</p>
                          {activity.description && (
                            <p className="text-xs text-slate-400 truncate mt-0.5">{activity.description}</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1">{timeAgo(activity.created_at)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
