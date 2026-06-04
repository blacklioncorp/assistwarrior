// ─── Demo hardcoded data ───────────────────────────────────────────────────
// Used by /demo route — no Supabase required

export const DEMO_PROFESSIONAL = {
  full_name: 'Dra. Laura Méndez',
  email: 'demo@smartreceptionist.mx',
  specialty: 'Medicina General',
  clinic_name: 'Clínica Demo',
  plan: 'pro',
  plan_status: 'active',
  is_superadmin: false,
  avatar_url: null,
}

// ISO timestamps for today
function todayAt(h: number, m = 0): string {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60 * 1000).toISOString()
}

export const DEMO_STATS = {
  totalTodayAppts: 8,
  confirmedToday: 5,
  unreadMessages: 3,
  totalPatients: 142,
  pendingToday: 3,
}

export type DemoAppointment = {
  id: string
  patient_name: string
  patient_phone: string
  title: string
  starts_at: string
  ends_at: string
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  channel: 'whatsapp' | 'voice' | 'dashboard' | 'calcom'
  notes?: string
}

export const DEMO_APPOINTMENTS: DemoAppointment[] = [
  { id: '1', patient_name: 'María González',    patient_phone: '+52 55 1234 5678', title: 'Revisión general anual',        starts_at: todayAt(9, 0),  ends_at: todayAt(9, 30),  status: 'completed',  channel: 'whatsapp' },
  { id: '2', patient_name: 'Carlos Hernández',  patient_phone: '+52 55 2345 6789', title: 'Control de presión arterial',   starts_at: todayAt(9, 30), ends_at: todayAt(10, 15), status: 'completed',  channel: 'voice'     },
  { id: '3', patient_name: 'Ana Martínez',      patient_phone: '+52 55 3456 7890', title: 'Primera consulta',              starts_at: todayAt(10, 30),ends_at: todayAt(11, 0),  status: 'confirmed',  channel: 'whatsapp' },
  { id: '4', patient_name: 'Roberto López',     patient_phone: '+52 55 4567 8901', title: 'Dolor agudo zona lumbar',       starts_at: todayAt(11, 0), ends_at: todayAt(12, 0),  status: 'confirmed',  channel: 'voice'     },
  { id: '5', patient_name: 'Sofía Ramírez',     patient_phone: '+52 55 5678 9012', title: 'Consulta general',              starts_at: todayAt(12, 0), ends_at: todayAt(12, 30), status: 'scheduled',  channel: 'dashboard' },
  { id: '6', patient_name: 'Jorge Torres',      patient_phone: '+52 55 6789 0123', title: 'Revisión resultados laboratorio',starts_at: todayAt(13, 30),ends_at: todayAt(14, 0),  status: 'scheduled',  channel: 'whatsapp' },
  { id: '7', patient_name: 'Valentina Cruz',    patient_phone: '+52 55 7890 1234', title: 'Consulta dermatología',         starts_at: todayAt(15, 0), ends_at: todayAt(15, 45), status: 'confirmed',  channel: 'calcom'   },
  { id: '8', patient_name: 'Miguel Flores',     patient_phone: '+52 55 8901 2345', title: 'Nuevo paciente — chequeo',      starts_at: todayAt(16, 0), ends_at: todayAt(16, 30), status: 'scheduled',  channel: 'voice'     },
]

export type DemoActivity = {
  id: string
  type: string
  title: string
  description?: string
  created_at: string
}

export const DEMO_ACTIVITY: DemoActivity[] = [
  { id: '1', type: 'appointment_booked',    title: 'Nueva cita agendada',           description: 'Valentina Cruz — 15:00 vía Cal.com',    created_at: minutesAgo(12) },
  { id: '2', type: 'new_message',           title: 'Mensaje de WhatsApp recibido',  description: 'Sofía Ramírez: "¿Cuánto dura la consulta?"', created_at: minutesAgo(28) },
  { id: '3', type: 'appointment_confirmed', title: 'Cita confirmada por paciente',  description: 'Ana Martínez confirmó para las 10:30',    created_at: minutesAgo(45) },
  { id: '4', type: 'call_received',         title: 'Llamada recibida',              description: 'Roberto López — 4 min 22 seg',            created_at: minutesAgo(72) },
  { id: '5', type: 'new_patient',           title: 'Nuevo paciente registrado',     description: 'Miguel Flores añadido al sistema',        created_at: minutesAgo(110) },
  { id: '6', type: 'appointment_cancelled', title: 'Cita cancelada',                description: 'Luis Pérez canceló cita de las 14:00',    created_at: minutesAgo(180) },
]
