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
import { useBusinessType } from "@/hooks/useBusinessType"

export function NewPatientModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const { labels } = useBusinessType()

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

  const titleUpper = labels.clientSingular.charAt(0).toUpperCase() + labels.clientSingular.slice(1)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 transition-colors active:scale-[0.98]">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo {labels.clientSingular}</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0F0F1A] border-slate-900 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-slate-100 text-lg font-bold">Añadir {titleUpper}</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Ingresa los datos del {labels.clientSingular}. Si escribe por WhatsApp, se añadirá automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4 pt-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-900/30 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-slate-300 text-xs font-semibold">Nombre completo</Label>
            <Input id="full_name" name="full_name" required placeholder="Ej. Juan Pérez" className="bg-slate-950 border-slate-800 focus:border-purple-500 text-slate-100" />
            {fieldErrors.full_name && (
              <p className="text-xs text-red-500">{fieldErrors.full_name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone_whatsapp" className="text-slate-300 text-xs font-semibold">Teléfono (WhatsApp)</Label>
            <Input 
              id="phone_whatsapp" 
              name="phone_whatsapp" 
              required 
              type="tel"
              placeholder="+52 1 55 1234 5678" 
              className="bg-slate-950 border-slate-800 focus:border-purple-500 text-slate-100"
            />
            {fieldErrors.phone_whatsapp && (
              <p className="text-xs text-red-500">{fieldErrors.phone_whatsapp[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-300 text-xs font-semibold">Correo electrónico (opcional)</Label>
            <Input id="email" name="email" type="email" placeholder="juan@ejemplo.com" className="bg-slate-950 border-slate-800 focus:border-purple-500 text-slate-100" />
            {fieldErrors.email && (
              <p className="text-xs text-red-500">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-slate-300 text-xs font-semibold">Notas (opcional)</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Detalles, gustos, observaciones o notas adicionales..." 
              className="bg-slate-950 border-slate-800 focus:border-purple-500 text-slate-100 min-h-[80px]"
            />
            {fieldErrors.notes && (
              <p className="text-xs text-red-500">{fieldErrors.notes[0]}</p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-900/60 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-900 rounded-xl transition-colors"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
            <SubmitButton pendingText="Guardando..." className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 text-xs font-semibold">
              Guardar
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
