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

  const [
    { data: todayAppointments },
    { count: totalPatients },
    { count: totalTodayAppts },
    { count: confirmedToday },
    { count: unreadMessages },
    { data: recentActivity },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*, patients(full_name, phone_whatsapp)')
      .eq('professional_id', user.id)
      .in('status', ['scheduled', 'confirmed'])
      .gte('starts_at', todayStart)
      .lt('starts_at', todayEnd)
      .order('starts_at', { ascending: true }),

    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', user.id),

    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', user.id)
      .gte('starts_at', todayStart)
      .lt('starts_at', todayEnd),

    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', user.id)
      .eq('status', 'confirmed')
      .gte('starts_at', todayStart)
      .lt('starts_at', todayEnd),

    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('professional_id', user.id)
      .gt('unread_count', 0),

    supabase
      .from('activity_log')
      .select('*')
      .eq('professional_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const { data: prof } = await supabase
    .from('professionals')
    .select('full_name, specialty, business_type:business_types(name)')
    .eq('id', user.id)
    .single()

  const displayName = prof?.full_name ?? user.email?.split('@')[0] ?? 'Usuario'
  const firstName = displayName.split(' ').find((n: string) => n.length > 2) ?? displayName

  // Determine vertical labels
  const businessTypeName = (prof?.business_type as { name?: string } | null)?.name ?? ''
  const isRestaurant = businessTypeName === 'restaurant'
  const isLawFirm = businessTypeName === 'lawfirm'

  const appointmentLabel = isRestaurant ? 'Pedidos' : isLawFirm ? 'Consultas' : 'Citas'
  const clientLabel = isLawFirm ? 'Casos' : 'Clientes'

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Hero Greeting ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {formatDate(today)} &middot; Aquí está el resumen de tu día.
          </p>
        </div>
        {prof?.specialty && (
          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-purple-950/30 border border-purple-900/30 px-3 py-1 text-xs font-medium text-purple-300">
            <CheckCircle2 className="h-3 w-3" />
            {prof.specialty}
          </span>
        )}
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title={`${appointmentLabel} hoy`}
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
          title={clientLabel}
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
        {/* Today's Appointments / Orders / Consultations */}
        <section className="lg:col-span-3 card-dark overflow-hidden">
          <div className="section-header-dark">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              <h2 className="text-sm font-semibold text-slate-100">
                {isRestaurant ? 'Pedidos de Hoy' : isLawFirm ? 'Consultas de Hoy' : 'Citas de Hoy'}
              </h2>
              {todayAppointments && todayAppointments.length > 0 && (
                <span className="rounded-full bg-purple-950/50 border border-purple-900/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                  {todayAppointments.length}
                </span>
              )}
            </div>
            <a
              href="/dashboard/appointments"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-colors"
            >
              Ver todas →
            </a>
          </div>

          {!todayAppointments || todayAppointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={`Sin ${appointmentLabel.toLowerCase()} para hoy`}
              description="Los registros de WhatsApp aparecerán aquí automáticamente."
            />
          ) : (
            <div className="divide-y divide-slate-900">
              {todayAppointments.map((apt) => {
                const status = statusConfig[apt.status as AppointmentStatus] ?? statusConfig.scheduled
                const StatusIcon = status.icon
                const channel = channelConfig[apt.channel as AppointmentChannel] ?? channelConfig.dashboard

                return (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-900/40 transition-colors"
                  >
                    {/* Time */}
                    <div className="w-14 shrink-0 text-center">
                      <p className="text-sm font-bold text-slate-100 tabular-nums">
                        {formatTime(apt.starts_at)}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-slate-800 shrink-0" />

                    {/* Patient info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-100 text-sm truncate">
                          {apt.patient_name}
                        </p>
                        <Badge variant={channel.badge} className="hidden sm:inline-flex">
                          {channel.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{apt.title}</p>
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
        <section className="lg:col-span-2 card-dark overflow-hidden">
          <div className="section-header-dark">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
              <h2 className="text-sm font-semibold text-slate-100">Actividad Reciente</h2>
            </div>
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
                      <p className="text-sm font-medium text-slate-200 leading-snug">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-600 mt-1">
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
