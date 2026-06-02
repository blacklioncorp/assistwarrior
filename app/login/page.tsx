'use client';

import { login } from '@/app/login/actions';
import { Stethoscope, ArrowRight, Shield, Clock, Star } from 'lucide-react';

const features = [
  { icon: Shield,      text: 'Datos cifrados y seguros' },
  { icon: Clock,       text: 'Asistente disponible 24/7' },
  { icon: Star,        text: 'Más de 500 profesionales activos' },
]

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* ── Left panel: Brand ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#0F172A] p-12 relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-teal-600/10 blur-3xl -translate-x-1/2 translate-y-1/2" />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E4A8A] shadow-lg shadow-blue-900/50">
              <Stethoscope className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-lg font-bold text-white">Smart Receptionist</span>
          </div>
        </div>

        {/* Headline */}
        <div className="relative space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Tu recepcionista
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                inteligente
              </span>
              <br />
              disponible 24/7
            </h1>
            <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-sm">
              Automatiza citas, responde WhatsApp y gestiona llamadas. Para médicos, dentistas y todo profesional de la salud.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800">
                  <Icon className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-800/50 p-5">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <p className="text-sm text-slate-300 italic leading-relaxed">
            &quot;Reduje el tiempo de recepción en un 70%. Mis pacientes pueden agendar a cualquier hora.&quot;
          </p>
          <p className="mt-2.5 text-xs text-slate-500">— Dra. María González, Medicina Familiar</p>
        </div>
      </div>

      {/* ── Right panel: Login form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#F8FAFC] px-6 py-12 lg:px-16">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E4A8A]">
            <Stethoscope className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-base font-bold text-slate-900">Smart Receptionist</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Bienvenido de vuelta</h2>
            <p className="mt-2 text-sm text-slate-500">
              Ingresa tu email y te enviaremos un enlace seguro de acceso.
            </p>
          </div>

          {/* Form */}
          <form action={login} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="dr.garcia@clinica.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-card placeholder:text-slate-400 focus:border-[#1E4A8A] focus:outline-none focus:ring-2 focus:ring-[#1E4A8A]/20 transition-colors"
              />
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E4A8A] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1a3f78] transition-all active:scale-[0.98]"
            >
              Continuar con email
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">acceso seguro</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <Shield className="h-4 w-4 text-teal-500 shrink-0" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Usamos magic links: no hay contraseña que recordar ni que pueda ser robada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
