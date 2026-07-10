'use client';

import { login } from '@/app/login/actions';
import { ArrowRight, Shield, Clock, Star } from 'lucide-react';

const features = [
  { icon: Shield,      text: 'Datos cifrados y seguros' },
  { icon: Clock,       text: 'Agentes activos 24/7' },
  { icon: Star,        text: 'Múltiples verticales de negocio' },
]

// Custom Senzio Logo SVG
function SenzioLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="login-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8B5CF6" />
          <stop offset="100%" stop-color="#06B6D4" />
        </linearGradient>
      </defs>
      <path 
        d="M35,25 C45,15 65,15 75,30 C85,45 65,55 50,50 C35,45 15,55 25,70 C35,85 55,85 65,75" 
        stroke="url(#login-logo-grad)" 
        strokeWidth="12" 
        strokeLinecap="round" 
      />
      <circle cx="35" cy="25" r="8" fill="#8B5CF6" />
      <circle cx="65" cy="75" r="8" fill="#06B6D4" />
    </svg>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-[#05050A] text-slate-100">
      {/* ── Left panel: Brand ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#07070C] p-12 relative overflow-hidden border-r border-slate-900/60">
        {/* Background gradient orbs */}
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-cyan-500/5 blur-3xl -translate-x-1/2 translate-y-1/2" />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 shadow-lg shadow-purple-950/20">
              <SenzioLogo className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Senzio</span>
          </div>
        </div>

        {/* Headline */}
        <div className="relative space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Tus agentes
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                conversacionales
              </span>
              <br />
              disponibles 24/7
            </h1>
            <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-sm">
              Automatiza la atención, responde WhatsApp y agenda citas para despachos de abogados, restaurantes, consultorios y negocios.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
                  <Icon className="h-3.5 w-3.5 text-purple-400" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="relative rounded-2xl border border-slate-900 bg-[#0F0F1A] p-5 shadow-xl">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 text-purple-400 fill-purple-400" />
            ))}
          </div>
          <p className="text-sm text-slate-300 italic leading-relaxed">
            &quot;Reduje el tiempo de atención y agendamiento en un 70%. Mis clientes agendan a cualquier hora de forma autónoma.&quot;
          </p>
          <p className="mt-2.5 text-xs text-slate-500">— Lic. Javier Mendoza, Mendoza Abogados</p>
        </div>
      </div>

      {/* ── Right panel: Login form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#05050A] px-6 py-12 lg:px-16">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
            <SenzioLogo className="h-5 w-5" />
          </div>
          <span className="text-base font-bold text-white">Senzio</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Bienvenido de vuelta</h2>
            <p className="mt-2 text-sm text-slate-400">
              Ingresa tu email y te enviaremos un enlace seguro de acceso.
            </p>
          </div>

          {/* Form */}
          <form action={login} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-slate-300"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="contacto@miempresa.com"
                className="w-full rounded-xl border border-slate-800 bg-[#0F0F1A] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors shadow-inner"
              />
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-cyan-500/10 transition-all active:scale-[0.98]"
            >
              Continuar con email
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-900" />
            <span className="text-xs text-slate-500">acceso seguro</span>
            <div className="flex-1 h-px bg-slate-900" />
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-900 bg-[#0F0F1A] px-4 py-3">
            <Shield className="h-4 w-4 text-cyan-400 shrink-0" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Usamos magic links: no hay contraseña que recordar ni que pueda ser robada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
