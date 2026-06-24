'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-card px-8 py-10 text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Algo salió mal</h1>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            Hubo un problema al procesar tu solicitud. Por favor, intenta de nuevo o contacta al soporte si el problema persiste.
          </p>

          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E4A8A] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1a3f78] transition-all active:scale-[0.98]"
            >
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
