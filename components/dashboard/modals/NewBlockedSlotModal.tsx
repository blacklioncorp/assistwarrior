"use client"

import { useState } from "react"
import { createBlockedSlot } from "@/app/actions"
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
import { SubmitButton } from "@/components/ui/submit-button"
import { AlertCircle, CalendarOff, Plus } from "lucide-react"

interface BlockedSlot {
  id: string
  title: string
  starts_at: string
  ends_at: string
  is_all_day: boolean
}

interface Props {
  children?: React.ReactNode
  onCreated?: (slot: BlockedSlot) => void
  onSuccess?: () => void
}

export function NewBlockedSlotModal({ children, onCreated, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAllDay, setIsAllDay] = useState(false)

  async function action(formData: FormData) {
    setError(null)
    
    const startsAt = formData.get("starts_at") as string
    const endsAt = formData.get("ends_at") as string
    
    if (!startsAt || !endsAt) {
      setError("Debes seleccionar fecha y hora de inicio y fin")
      return
    }

    const start = new Date(startsAt)
    const end = new Date(endsAt)

    if (end <= start) {
      setError("La fecha y hora de fin debe ser posterior a la de inicio")
      return
    }

    const result = await createBlockedSlot(null, formData)
    
    if (result.error) {
      setError(result.error)
      return
    }
    
    if (result.success) {
      setOpen(false)
      setError(null)
      setIsAllDay(false)
      if (onCreated && result.data) {
        onCreated(result.data as BlockedSlot)
      }
      if (onSuccess) {
        onSuccess()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#1E4A8A] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1a3f78] transition-colors active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            <span>Nuevo Bloqueo</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarOff className="h-5 w-5 text-red-500" />
            Bloquear Horario
          </DialogTitle>
          <DialogDescription>
            Establece un periodo de tiempo en el que no estarás disponible para recibir consultas.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4 pt-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="title">Motivo o título del bloqueo</Label>
            <Input 
              id="title" 
              name="title" 
              required 
              placeholder="Ej. Congreso Médico, Almuerzo, Vacaciones..." 
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="starts_at">Fecha y hora de inicio</Label>
            <Input 
              id="starts_at" 
              name="starts_at" 
              type={isAllDay ? "date" : "datetime-local"}
              required 
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ends_at">Fecha y hora de fin</Label>
            <Input 
              id="ends_at" 
              name="ends_at" 
              type={isAllDay ? "date" : "datetime-local"}
              required 
            />
          </div>

          {/* All-day toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_all_day"
              name="is_all_day"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#1E4A8A] focus:ring-[#1E4A8A]"
            />
            <label htmlFor="is_all_day" className="text-sm text-slate-700 select-none cursor-pointer">
              Todo el día (sin horario específico)
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
            <SubmitButton pendingText="Creando..." className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6">
              Confirmar Bloqueo
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
