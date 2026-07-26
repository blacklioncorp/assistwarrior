import Link from 'next/link'
import { Mail } from 'lucide-react'

export const metadata = {
  title: 'Revisa tu correo — Senzio',
}

// Custom Senzio Logo SVG
function SenzioLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <img 
      src="https://fltidvkbnkyfwhiyjtlm.supabase.co/storage/v1/object/public/imagesandlogos/iconlogo.png" 
      alt="Senzio Icon" 
      className={className} 
    />
  )
}

export default function LoginConfirmPage() {
  return (
    <div className="min-h-screen bg-[#05050A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 shadow-sm">
              <SenzioLogo className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Senzio</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-900 bg-[#0F0F1A] shadow-xl px-8 py-10 text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-purple-950/20 border border-purple-900/30">
            <Mail className="h-7 w-7 text-purple-400" />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">Revisa tu correo</h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Te hemos enviado un enlace de acceso seguro a tu correo electrónico.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Si no lo encuentras, revisa tu carpeta de correo no deseado (spam).
          </p>

          <div className="mt-8 pt-6 border-t border-slate-900">
            <Link
              href="/login"
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
