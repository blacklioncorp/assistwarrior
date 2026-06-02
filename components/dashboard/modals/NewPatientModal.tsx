"use client"

import { useState } from "react"
import { createPatient } from "@/app/actions"
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
import { AlertCircle, UserPlus } from "lucide-react"

export function NewPatientModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function action(formData: FormData) {
    setError(null)
    setFieldErrors({})
    
    const result = await createPatient(null, formData)
    
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
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#1E4A8A] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1a3f78] transition-colors active:scale-[0.98]">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo paciente</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Paciente</DialogTitle>
          <DialogDescription>
            Ingresa los datos del paciente. Si agendan por WhatsApp, se añadirán automáticamente.
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
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input id="full_name" name="full_name" required placeholder="Ej. Juan Pérez" />
            {fieldErrors.full_name && (
              <p className="text-xs text-red-500">{fieldErrors.full_name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone_whatsapp">Teléfono (WhatsApp)</Label>
            <Input 
              id="phone_whatsapp" 
              name="phone_whatsapp" 
              required 
              type="tel"
              placeholder="+52 1 55 1234 5678" 
            />
            {fieldErrors.phone_whatsapp && (
              <p className="text-xs text-red-500">{fieldErrors.phone_whatsapp[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico (opcional)</Label>
            <Input id="email" name="email" type="email" placeholder="juan@ejemplo.com" />
            {fieldErrors.email && (
              <p className="text-xs text-red-500">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Alergias, padecimientos, observaciones previas..." 
            />
            {fieldErrors.notes && (
              <p className="text-xs text-red-500">{fieldErrors.notes[0]}</p>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
            <SubmitButton pendingText="Guardando..." className="bg-[#1E4A8A] hover:bg-[#1a3f78] rounded-xl px-6">
              Guardar
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
