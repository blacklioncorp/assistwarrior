"use client"

import { useState, useMemo } from "react"
import { createAppointment } from "@/app/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SubmitButton } from "@/components/ui/submit-button"
import { AlertCircle, CalendarPlus, Clock, UserPlus, Users, Ban } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

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

interface Props {
  children?: React.ReactNode
  patients: Patient[]
  workingHours: ProfessionalWorkingHours
  blockedSlots?: BlockedSlot[]
}

export function NewAppointmentModal({ children, patients, workingHours, blockedSlots = [] }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>('existing')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")

  // Build a Set of blocked date strings (YYYY-MM-DD) for all-day blocks
  const allDayBlockedDates = useMemo(() => {
    const set = new Set<string>()
    for (const slot of blockedSlots) {
      if (!slot.is_all_day) continue
      const start = new Date(slot.starts_at)
      const end = new Date(slot.ends_at)
      // Iterate each day in range
      const current = new Date(start)
      while (current < end) {
        set.add(current.toISOString().slice(0, 10))
        current.setDate(current.getDate() + 1)
      }
    }
    return set
  }, [blockedSlots])

  // Build a list of timed blocked intervals for non-all-day blocks
  const timedBlocks = useMemo(() =>
    blockedSlots
      .filter(s => !s.is_all_day)
      .map(s => ({ start: new Date(s.starts_at), end: new Date(s.ends_at), title: s.title })),
    [blockedSlots]
  )

  // Check if a given date has any blocked time slots (partial blocking)
  function hasPartialBlocking(date: Date): boolean {
    const dayStr = date.toISOString().slice(0, 10)
    return timedBlocks.some(b => b.start.toISOString().slice(0, 10) === dayStr || b.end.toISOString().slice(0, 10) === dayStr)
  }

  // Calculate available time slots for the selected date, excluding blocked intervals
  const { availableSlots, blockedSlotTimes } = useMemo(() => {
    if (!selectedDate) return { availableSlots: [], blockedSlotTimes: new Set<string>() }
    
    const dayOfWeek = selectedDate.getDay() // 0 = Sunday, 1 = Monday...
    const daysMap: (keyof ProfessionalWorkingHours)[] = [
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
    ]
    const dayConfig = workingHours[daysMap[dayOfWeek]]
    
    if (!dayConfig || !dayConfig.enabled) return { availableSlots: [], blockedSlotTimes: new Set<string>() }
    
    const slots: string[] = []
    const blocked = new Set<string>()
    const [startHour, startMin] = dayConfig.start.split(':').map(Number)
    const [endHour, endMin] = dayConfig.end.split(':').map(Number)
    
    let current = new Date(selectedDate)
    current.setHours(startHour, startMin, 0, 0)
    
    const end = new Date(selectedDate)
    end.setHours(endHour, endMin, 0, 0)
    
    // Generate 30 min slots
    while (current < end) {
      const slotStr = current.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      const slotEnd = new Date(current)
      slotEnd.setMinutes(slotEnd.getMinutes() + 30)

      // Check if this slot overlaps any timed block
      const isBlocked = timedBlocks.some(b => {
        return current < b.end && slotEnd > b.start
      })

      slots.push(slotStr)
      if (isBlocked) blocked.add(slotStr)
      current.setMinutes(current.getMinutes() + 30)
    }
    
    return { availableSlots: slots, blockedSlotTimes: blocked }
  }, [selectedDate, workingHours, timedBlocks])

  // Determine active blocking info for selected date
  const selectedDateBlockInfo = useMemo(() => {
    if (!selectedDate) return null
    const dayStr = selectedDate.toISOString().slice(0, 10)
    if (allDayBlockedDates.has(dayStr)) {
      const slot = blockedSlots.find(s => {
        if (!s.is_all_day) return false
        const start = new Date(s.starts_at)
        const end = new Date(s.ends_at)
        const sel = new Date(selectedDate)
        sel.setHours(12, 0, 0, 0)
        return sel >= start && sel < end
      })
      return slot ? { type: 'all_day' as const, title: slot.title } : null
    }
    return null
  }, [selectedDate, allDayBlockedDates, blockedSlots])

  async function action(formData: FormData) {
    setError(null)
    setFieldErrors({})
    
    if (!selectedDate || !selectedTime) {
      setError('Debes seleccionar una fecha y hora')
      return
    }

    // Combine date and time
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const finalDate = new Date(selectedDate)
    finalDate.setHours(hours, minutes, 0, 0)
    
    formData.append('starts_at', finalDate.toISOString())

    // Clear patient_id if we are creating a new patient, and vice versa
    if (patientMode === 'new') {
      formData.set('patient_id', '')
    } else {
      formData.set('new_patient_name', '')
      formData.set('new_patient_phone', '')
    }
    
    const result = await createAppointment(null, formData)
    
    if (result.errors) {
      setFieldErrors(result.errors)
      return
    }
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.success) {
      setOpen(false)
      setSelectedDate(undefined)
      setSelectedTime("")
      setPatientMode('existing')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#1E4A8A] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1a3f78] transition-colors active:scale-[0.98]">
            <CalendarPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Cita</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Agendar Cita</DialogTitle>
          <DialogDescription>
            Selecciona la fecha, hora y el paciente para agendar la cita médica.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="pt-4">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              {/* Patient selection toggle */}
              <div className="space-y-1.5">
                <Label>Paciente</Label>
                <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setPatientMode('existing')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all",
                      patientMode === 'existing'
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Paciente Existente
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientMode('new')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all",
                      patientMode === 'new'
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Paciente Nuevo
                  </button>
                </div>
              </div>

              {/* Render Existing Patient Selector */}
              {patientMode === 'existing' && (
                <div className="space-y-1.5">
                  <select 
                    id="patient_id" 
                    name="patient_id" 
                    required={patientMode === 'existing'}
                    defaultValue=""
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1E4A8A] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Selecciona un paciente</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                  {fieldErrors.patient_id && (
                    <p className="text-xs text-red-500">{fieldErrors.patient_id[0]}</p>
                  )}
                </div>
              )}

              {/* Render New Patient Fields (Sub-form) */}
              {patientMode === 'new' && (
                <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/30 p-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="new_patient_name">Nombre completo</Label>
                    <Input 
                      id="new_patient_name" 
                      name="new_patient_name" 
                      required={patientMode === 'new'} 
                      placeholder="Ej. Juan Pérez" 
                      className="bg-white"
                    />
                    {fieldErrors.new_patient_name && (
                      <p className="text-xs text-red-500">{fieldErrors.new_patient_name[0]}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new_patient_phone">Teléfono (WhatsApp)</Label>
                    <Input 
                      id="new_patient_phone" 
                      name="new_patient_phone" 
                      required={patientMode === 'new'} 
                      placeholder="+52 1 55 1234 5678" 
                      className="bg-white"
                    />
                    {fieldErrors.new_patient_phone && (
                      <p className="text-xs text-red-500">{fieldErrors.new_patient_phone[0]}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="title">Motivo de consulta</Label>
                <Input id="title" name="title" required defaultValue="Consulta General" />
                {fieldErrors.title && (
                  <p className="text-xs text-red-500">{fieldErrors.title[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="duration_minutes">Duración (minutos)</Label>
                <select 
                  id="duration_minutes" 
                  name="duration_minutes" 
                  defaultValue="30"
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#1E4A8A]"
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1 hora 30 min</option>
                  <option value="120">2 horas</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  placeholder="Síntomas principales, preparación..." 
                  className="min-h-[60px]"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <Label className="mb-2 block">Fecha y Hora</Label>

              {/* Legend */}
              {blockedSlots.length > 0 && (
                <div className="mb-2 flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-400 inline-block" />
                    Bloqueado
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-300 inline-block" />
                    Bloqueo parcial
                  </span>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-white p-2 mb-4 shadow-sm">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    setSelectedTime("")
                  }}
                  disabled={(date) => {
                    if (date < new Date(new Date().setHours(0,0,0,0))) return true
                    const dayStr = date.toISOString().slice(0, 10)
                    return allDayBlockedDates.has(dayStr)
                  }}
                  modifiers={{
                    allDayBlocked: (date) => allDayBlockedDates.has(date.toISOString().slice(0, 10)),
                    partialBlocked: (date) => hasPartialBlocking(date) && !allDayBlockedDates.has(date.toISOString().slice(0, 10)),
                  }}
                  modifiersClassNames={{
                    allDayBlocked: 'day-all-blocked',
                    partialBlocked: 'day-partial-blocked',
                  }}
                  className="mx-auto"
                />
              </div>

              {/* All-day block warning */}
              {selectedDate && selectedDateBlockInfo?.type === 'all_day' && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
                  <Ban className="h-3.5 w-3.5 shrink-0" />
                  <span>Bloqueado: <strong>{selectedDateBlockInfo.title}</strong></span>
                </div>
              )}

              {selectedDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Clock className="h-4 w-4 text-slate-400" />
                    Horarios Disponibles
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {availableSlots.length > 0 ? availableSlots.map(time => {
                      const isBlocked = blockedSlotTimes.has(time)
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => !isBlocked && setSelectedTime(time)}
                          disabled={isBlocked}
                          title={isBlocked ? 'Horario bloqueado' : undefined}
                          className={cn(
                            "rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                            isBlocked
                              ? "border-red-100 bg-red-50 text-red-300 cursor-not-allowed line-through"
                              : selectedTime === time 
                                ? "border-[#1E4A8A] bg-[#1E4A8A] text-white hover:bg-[#1a3f78]" 
                                : "border-slate-200 bg-white text-slate-700 hover:border-[#1E4A8A] hover:bg-blue-50"
                          )}
                        >
                          {time}
                        </button>
                      )
                    }) : (
                      <p className="col-span-3 text-xs text-slate-500 text-center py-2">
                        No hay horarios disponibles este día.
                      </p>
                    )}
                  </div>

                  {/* Show blocking info for partial days */}
                  {blockedSlotTimes.size > 0 && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-[10px] text-amber-700">
                      <Ban className="h-3 w-3 shrink-0" />
                      <span>Los horarios tachados están bloqueados y no pueden agendarse.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
            <SubmitButton pendingText="Agendando..." className="bg-[#1E4A8A] hover:bg-[#1a3f78] rounded-xl px-6">
              Confirmar Cita
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
