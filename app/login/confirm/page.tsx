import Link from 'next/link'
import { Stethoscope, Mail } from 'lucide-react'

export const metadata = {
  title: 'Revisa tu correo — Smart Receptionist',
}

export default function LoginConfirmPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E4A8A] shadow-sm">
              <Stethoscope className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-lg font-bold text-slate-900">Smart Receptionist</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-card px-8 py-10 text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 border border-teal-100">
            <Mail className="h-7 w-7 text-[#0D9488]" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Revisa tu correo</h1>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            Te hemos enviado un enlace de acceso seguro a tu correo electrónico.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Si no lo encuentras, revisa tu carpeta de spam.
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <Link
              href="/login"
              className="text-sm font-medium text-[#1E4A8A] hover:text-[#1a3f78] transition-colors"
            >
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
