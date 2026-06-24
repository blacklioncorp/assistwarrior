/**
 * Shared dashboard configuration: status labels, channel labels, activity icons,
 * and utility functions used by both the real dashboard and the demo page.
 */

import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  CalendarCheck,
  Users,
  MessageSquare,
  Phone,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type AppointmentChannel = 'whatsapp' | 'voice' | 'dashboard' | 'calcom'

// ── Status config ──────────────────────────────────────────────────────────

export const statusConfig: Record<
  AppointmentStatus,
  {
    label: string
    badge: 'success' | 'info' | 'destructive' | 'secondary' | 'warning'
    icon: React.ElementType
  }
> = {
  scheduled: { label: 'Pendiente',  badge: 'warning',     icon: Clock },
  confirmed: { label: 'Confirmada', badge: 'success',     icon: CheckCircle2 },
  cancelled: { label: 'Cancelada',  badge: 'destructive', icon: XCircle },
  completed: { label: 'Completada', badge: 'secondary',   icon: CheckCircle2 },
  no_show:   { label: 'No asistió', badge: 'warning',     icon: AlertCircle },
}

// ── Channel config ─────────────────────────────────────────────────────────

export const channelConfig: Record<
  AppointmentChannel,
  { label: string; badge: 'whatsapp' | 'voice' | 'dashboard' | 'calcom' }
> = {
  whatsapp:  { label: 'WhatsApp', badge: 'whatsapp' },
  voice:     { label: 'Voz',      badge: 'voice'    },
  dashboard: { label: 'Manual',   badge: 'dashboard' },
  calcom:    { label: 'Cal.com',  badge: 'calcom'   },
}

// ── Activity type config ───────────────────────────────────────────────────

export const activityTypeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  appointment_booked:    { icon: CalendarCheck, color: 'text-blue-500 bg-blue-100' },
  appointment_cancelled: { icon: XCircle,       color: 'text-red-500 bg-red-100' },
  appointment_confirmed: { icon: CheckCircle2,  color: 'text-teal-500 bg-teal-100' },
  new_patient:           { icon: Users,         color: 'text-violet-500 bg-violet-100' },
  new_message:           { icon: MessageSquare, color: 'text-amber-500 bg-amber-100' },
  call_received:         { icon: Phone,         color: 'text-blue-500 bg-blue-100' },
}

// ── Utility functions ──────────────────────────────────────────────────────

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Ahora mismo'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours}h`
  return `Hace ${Math.floor(hours / 24)}d`
}
