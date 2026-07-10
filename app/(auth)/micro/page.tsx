"use client"

import { useState } from "react"
import { loginMicro } from "./actions"
import { Stethoscope, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react"
import { SubmitButton } from "@/components/ui/submit-button"

export default function MicroPage() {
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await loginMicro(null, formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090D16] relative overflow-hidden px-4">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-blue-600/5 blur-3xl -translate-x-1/2 translate-y-1/2" />

      {/* Main card with golden border */}
      <div className="relative w-full max-w-md rounded-3xl border border-amber-500/25 bg-slate-900/40 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-amber-950/20">
        <div className="flex flex-col items-center text-center">
          {/* Gold Shield Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 mb-6">
            <ShieldCheck className="h-7 w-7 text-black" strokeWidth={2} />
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">Acceso Administrativo</h2>
          <p className="mt-2 text-xs text-slate-400 max-w-xs">
            Esta es una sección restringida para la administración del portal Senzio.
          </p>
        </div>

        {sent ? (
          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-950/20 p-5 text-center">
            <h3 className="text-sm font-semibold text-amber-300">Enlace de acceso enviado</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Hemos enviado un enlace seguro a tu correo electrónico. Por favor, revisa tu bandeja de entrada y haz clic en el enlace para ingresar al panel de Superadmin.
            </p>
          </div>
        ) : (
          <form action={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-400 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Correo Electrónico Autorizado
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@smartreceptionist.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors"
              />
            </div>

            <SubmitButton pendingText="Verificando..." className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl py-3 active:scale-[0.98]">
              Enviar Enlace Administrativo
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </SubmitButton>
          </form>
        )}

        <div className="mt-6 border-t border-slate-800/80 pt-5 text-center flex justify-center items-center gap-1.5 text-[10px] text-slate-500">
          <Stethoscope className="h-3.5 w-3.5" />
          <span>Senzio Cloud Admin Console</span>
        </div>
      </div>
    </div>
  )
}
