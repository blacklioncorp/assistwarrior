import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Stethoscope,
  Calendar,
  MessageSquare,
  Phone,
  ChevronRight,
  Star,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  Clock,
} from 'lucide-react'

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E4A8A]">
              <Stethoscope className="h-4.5 w-4.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-base font-bold text-slate-900">Smart Receptionist</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {['Características', 'Precios', 'Testimonios'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login"
              id="cta-hero-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E4A8A] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1a3f78] transition-all"
            >
              Empezar gratis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-teal-100/60 blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 lg:px-6 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Disponible para médicos, dentistas y terapeutas
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 leading-tight sm:text-5xl lg:text-6xl">
            Tu recepción médica
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4A8A] to-[#0D9488]">
              que nunca descansa
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 leading-relaxed">
            Un asistente de IA que responde WhatsApp, agenda citas por voz y administra tu consultorio — las 24 horas, los 7 días de la semana. Sin contratar recepcionistas extra.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              id="cta-primary-btn"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#1E4A8A] px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-[#1a3f78] hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Comenzar gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              id="cta-demo-btn"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-card hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Phone className="h-4 w-4 text-teal-500" />
              Ver demo en vivo
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Sin tarjeta de crédito · Configuración en 5 minutos
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="características" className="py-16 lg:py-20 bg-white border-y border-slate-100">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Todo lo que necesitas</h2>
            <p className="mt-3 text-slate-500">Un sistema completo que trabaja mientras tú atiendes a tus pacientes</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MessageSquare,
                color: 'text-green-600 bg-green-50',
                title: 'WhatsApp Automático',
                desc: 'Responde preguntas, agenda citas y envía recordatorios por WhatsApp sin que levantes un dedo.',
              },
              {
                icon: Phone,
                color: 'text-blue-600 bg-blue-50',
                title: 'Recepción por Voz',
                desc: 'Un número dedicado que contesta llamadas, entiende al paciente y agenda la cita automáticamente.',
              },
              {
                icon: Calendar,
                color: 'text-violet-600 bg-violet-50',
                title: 'Gestión de Citas',
                desc: 'Sincroniza con Google Calendar y Cal.com. Recordatorios automáticos y confirmaciones sin esfuerzo.',
              },
              {
                icon: Shield,
                color: 'text-teal-600 bg-teal-50',
                title: 'HIPAA Friendly',
                desc: 'Datos cifrados en tránsito y en reposo. Políticas de acceso por rol. Tu consultorio, protegido.',
              },
              {
                icon: Clock,
                color: 'text-amber-600 bg-amber-50',
                title: '24/7 Sin descanso',
                desc: 'A las 2am del domingo también agenda. Tus pacientes pueden reservar en el momento que lo necesiten.',
              },
              {
                icon: Zap,
                color: 'text-red-600 bg-red-50',
                title: 'Configuración rápida',
                desc: 'Actívalo en menos de 10 minutos. Sin código, sin instalaciones. Solo configura y listo.',
              },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-6 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.color} mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Social proof / testimonials ── */}
      <section id="testimonios" className="py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Profesionales que ya confían en nosotros</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                name: 'Dr. Carlos Rodríguez',
                role: 'Médico General, CDMX',
                text: '"Antes perdía el 30% de mis llamadas. Ahora el asistente las contesta todas y yo solo reviso el dashboard."',
                rating: 5,
              },
              {
                name: 'Dra. Ana Torres',
                role: 'Dentista, Guadalajara',
                text: '"Mis pacientes adoran poder agendar por WhatsApp a las 11pm. El sistema es increíblemente fácil de usar."',
                rating: 5,
              },
              {
                name: 'Lic. Roberto Sánchez',
                role: 'Psicólogo, Monterrey',
                text: '"Reducí mis no-shows en un 60% con los recordatorios automáticos. Recuperé horas de trabajo a la semana."',
                rating: 5,
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 italic leading-relaxed">{t.text}</p>
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-xs font-semibold text-slate-800">{t.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA section ── */}
      <section className="py-16 lg:py-20 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-teal-600/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Empieza hoy, sin compromisos
          </h2>
          <p className="mt-4 text-slate-400">
            Plan gratuito disponible. Actualiza cuando quieras.
          </p>
          <Link
            href="/login"
            id="cta-footer-btn"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-[#1E4A8A] shadow-lg hover:bg-slate-100 transition-all active:scale-[0.98]"
          >
            Comenzar gratis
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E4A8A]">
              <Stethoscope className="h-3.5 w-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-bold text-slate-800">Smart Receptionist</span>
          </div>
          <p className="text-xs text-slate-400">
            © 2025 Smart Receptionist. Hecho con ❤️ para profesionales de la salud.
          </p>
        </div>
      </footer>
    </div>
  )
}
