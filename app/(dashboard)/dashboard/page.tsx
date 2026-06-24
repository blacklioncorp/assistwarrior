import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Users,
  Activity,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Badge } from '@/components/ui/badge'
import { formatTime, formatDate } from '@/lib/utils'
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
  title: 'Dashboard',
}



export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

  // ── Queries ──────────────────────────────────────────────
  const [
    { data: todayAppointments },
    { count: totalPatients },
    { count: totalTodayAppts },
    { count: confirmedToday },
    { count: unreadMessages },
    { data: recentActivity },
  ] = await Promise.all([
    // Today's scheduled appointments with patient info
    supabase
      .from('appointments')
      .select('*, patients(full_name, phone_whatsapp)')
      .eq('professional_id', user.id)
      .in('status', ['scheduled', 'confirmed'])
      .gte('starts_at', todayStart)
      .lt('starts_at', todayEnd)
      .order('starts_at', { ascending: true }),

    // Total patients
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', user.id),

    // Total today's appointments
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', user.id)
      .gte('starts_at', todayStart)
      .lt('starts_at', todayEnd),

    // Confirmed today
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', user.id)
      .eq('status', 'confirmed')
      .gte('starts_at', todayStart)
      .lt('starts_at', todayEnd),

    // Unread message threads
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', user.id)
      .gt('unread_count', 0),

    // Recent activity
    supabase
      .from('activity_log')
      .select('*')
      .eq('professional_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  // ── Professional name ─────────────────────────────────────
  const { data: prof } = await supabase
    .from('professionals')
    .select('full_name, specialty')
    .eq('id', user.id)
    .single()

  const displayName = prof?.full_name ?? user.email?.split('@')[0] ?? 'Doctor'
  const firstName = displayName.split(' ').find((n: string) => n.length > 2) ?? displayName

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Hero Greeting ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {formatDate(today)} &middot; Aquí está el resumen de tu día.
          </p>
        </div>
        {prof?.specialty && (
          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100">
            <CheckCircle2 className="h-3 w-3" />
            {prof.specialty}
          </span>
        )}
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Citas hoy"
          value={totalTodayAppts ?? 0}
          description={`${confirmedToday ?? 0} confirmadas`}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Mensajes"
          value={unreadMessages ?? 0}
          description="Sin leer"
          icon={MessageSquare}
          color={unreadMessages ? 'amber' : 'teal'}
        />
        <StatCard
          title="Pacientes"
          value={totalPatients ?? 0}
          description="Total registrados"
          icon={Users}
          color="violet"
        />
        <StatCard
          title="Pendientes"
          value={(totalTodayAppts ?? 0) - (confirmedToday ?? 0)}
          description="Por confirmar hoy"
          icon={Clock}
          color={((totalTodayAppts ?? 0) - (confirmedToday ?? 0)) > 0 ? 'amber' : 'teal'}
        />
      </div>

      {/* ── Main content grid ── */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Today's Appointments */}
        <section className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <h2 className="text-sm font-semibold text-slate-800">Citas de Hoy</h2>
              {todayAppointments && todayAppointments.length > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {todayAppointments.length}
                </span>
              )}
            </div>
            <a
              href="/dashboard/appointments"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
            >
              Ver todas →
            </a>
          </div>

          {!todayAppointments || todayAppointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Sin citas para hoy"
              description="Las citas de WhatsApp y voz aparecerán aquí automáticamente."
            />
          ) : (
            <div className="divide-y divide-slate-50">
              {todayAppointments.map((apt) => {
                const status = statusConfig[apt.status as AppointmentStatus] ?? statusConfig.scheduled
                const StatusIcon = status.icon
                const channel = channelConfig[apt.channel as AppointmentChannel] ?? channelConfig.dashboard

                return (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Time */}
                    <div className="w-14 shrink-0 text-center">
                      <p className="text-sm font-bold text-slate-800 tabular-nums">
                        {formatTime(apt.starts_at)}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-slate-100 shrink-0" />

                    {/* Patient info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {apt.patient_name}
                        </p>
                        <Badge variant={channel.badge} className="hidden sm:inline-flex">
                          {channel.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{apt.title}</p>
                    </div>

                    {/* Status */}
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

        {/* Recent Activity */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            <h2 className="text-sm font-semibold text-slate-800">Actividad Reciente</h2>
          </div>

          {!recentActivity || recentActivity.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Sin actividad reciente"
              description="La actividad del sistema aparecerá aquí."
            />
          ) : (
            <div className="px-5 py-4 space-y-4">
              {recentActivity.map((activity) => {
                const config = activityTypeConfig[activity.type] ?? activityTypeConfig.appointment_booked
                const Icon = config.icon

                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.color}`}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 leading-snug">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        {timeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
