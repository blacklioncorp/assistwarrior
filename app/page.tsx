import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DemoVideo } from '@/components/landing/DemoVideo'
import { FaqAccordion } from '@/components/landing/FaqAccordion'
import {
  Calendar,
  MessageSquare,
  Phone,
  ChevronRight,
  Star,
  ArrowRight,
  Shield,
  Zap,
  Clock,
  Sparkles,
  Layers,
  Scale,
  UtensilsCrossed,
  Stethoscope,
  CheckCircle,
} from 'lucide-react'

// Custom Senzio Logo SVG Component
function SenzioLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="senzio-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8B5CF6" />
          <stop offset="100%" stop-color="#06B6D4" />
        </linearGradient>
      </defs>
      <path 
        d="M35,25 C45,15 65,15 75,30 C85,45 65,55 50,50 C35,45 15,55 25,70 C35,85 55,85 65,75" 
        stroke="url(#senzio-logo-grad)" 
        strokeWidth="10" 
        strokeLinecap="round" 
      />
      <circle cx="35" cy="25" r="7" fill="#8B5CF6" />
      <circle cx="65" cy="75" r="7" fill="#06B6D4" />
      <circle cx="50" cy="50" r="5" fill="#F8FAFC" />
    </svg>
  )
}

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#05050A] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-[#05050A]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <SenzioLogo className="h-7 w-7 animate-pulse-soft" />
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Senzio
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {['Características', 'Verticales', 'Testimonios'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login"
              id="cta-hero-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-cyan-500/10 transition-all active:scale-[0.98]"
            >
              Empezar gratis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36">
        {/* Glow Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />
          <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 lg:px-6 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3.5 py-1.5 text-xs font-semibold text-purple-300">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Agentes de IA conversacional multi-vertical</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight sm:text-5xl lg:text-6xl tracking-tight">
            Automatiza tu negocio con
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400">
              agentes de IA 24/7
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Senzio despliega agentes autónomos por WhatsApp y llamadas de voz que responden dudas, agendan citas y cierran ventas para despachos de abogados, restaurantes, consultorios y más.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              id="cta-primary-btn"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-purple-500/20 transition-all active:scale-[0.98]"
            >
              Comenzar gratis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              id="cta-demo-btn"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0F0F1A] px-6 py-3.5 text-base font-semibold text-slate-300 shadow-xl hover:bg-[#181829] hover:text-white transition-all"
            >
              <Phone className="h-4 w-4 text-cyan-400" />
              Ver demo en vivo
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Sin tarjeta de crédito · Configuración lista en 5 minutos
          </p>
        </div>
      </section>

      {/* ── Demo Video Placeholder ── */}
      <section className="pb-24 pt-4 px-4 lg:px-6 relative z-10">
        <DemoVideo videoUrl={process.env.NEXT_PUBLIC_DEMO_VIDEO_URL} />
      </section>

      {/* ── Verticals Section ── */}
      <section id="verticales" className="py-20 bg-[#0A0A0F] border-y border-slate-900/60">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Diseñado para cualquier vertical
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Cada negocio tiene necesidades distintas. Senzio se adapta a tu rubro con plantillas preconfiguradas.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Scale,
                title: "Despachos de Abogados",
                desc: "Filtra prospectos calificados, recopila detalles preliminares del caso y agenda asesorías iniciales integradas a tu calendario de manera segura.",
                badge: "Legal"
              },
              {
                icon: UtensilsCrossed,
                title: "Restaurantes & Catering",
                desc: "Automatiza reservaciones de mesas, gestiona pedidos a domicilio de forma directa y responde dudas de menú y horarios sin interferir con la cocina.",
                badge: "Food & Drinks"
              },
              {
                icon: Stethoscope,
                title: "Clínicas & Profesionales",
                desc: "Administra el agendamiento de pacientes, coordina recordatorios automáticos de citas de salud y agiliza las consultas generales 24/7.",
                badge: "Salud"
              }
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="relative rounded-2xl border border-slate-900 bg-[#0F0F1A] p-8 hover:border-slate-800 transition-all hover:scale-[1.01] group">
                  <div className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-widest text-cyan-400/80 bg-cyan-950/40 px-2 py-1 rounded-md border border-cyan-800/30">
                    {item.badge}
                  </div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 text-purple-400 group-hover:text-cyan-400 transition-colors mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="características" className="py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Todo lo que necesitas para automatizar
            </h2>
            <p className="mt-3 text-slate-400">
              Un motor inteligente enfocado en liberar tu tiempo y multiplicar tus ventas
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MessageSquare,
                color: 'text-purple-400 bg-purple-950/20 border-purple-900/30',
                title: 'WhatsApp Conversacional',
                desc: 'Responde dudas del negocio, envía catálogos interactivos, agenda citas y procesa confirmaciones de forma automatizada.',
              },
              {
                icon: Phone,
                color: 'text-cyan-400 bg-cyan-950/20 border-cyan-900/30',
                title: 'Agendamiento por Voz',
                desc: 'Un agente de voz dedicado que atiende llamadas tradicionales, entiende la petición del usuario y gestiona su reserva al instante.',
              },
              {
                icon: Calendar,
                color: 'text-pink-400 bg-pink-950/20 border-pink-900/30',
                title: 'Sincronización de Calendario',
                desc: 'Integración en tiempo real con Google Calendar y Cal.com para evitar dobles reservas y bloquear horarios no hábiles.',
              },
              {
                icon: Shield,
                color: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30',
                title: 'Seguridad Empresarial',
                desc: 'Cifrado de datos de extremo a extremo, resguardo de conversaciones y control estricto de roles de administrador.',
              },
              {
                icon: Clock,
                color: 'text-amber-400 bg-amber-950/20 border-amber-900/30',
                title: 'Disponibilidad 24/7',
                desc: 'No pierdas un cliente a altas horas de la noche. El agente responde de inmediato incluso fines de semana.',
              },
              {
                icon: Layers,
                color: 'text-indigo-400 bg-indigo-950/20 border-indigo-900/30',
                title: 'Multicomportamiento (IA)',
                desc: 'Personaliza las instrucciones y la base de conocimiento para que el bot hable con la identidad única de tu marca.',
              },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-900 bg-[#0F0F1A] p-6 hover:border-slate-800 transition-all"
                >
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${feature.color} mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonios" className="py-20 bg-[#0A0A0F] border-t border-slate-900/60">
        <div className="mx-auto max-w-5xl px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Líderes de negocio que automatizan con Senzio
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                name: 'Lic. Javier Mendoza',
                role: 'Socio Fundador, Mendoza Abogados',
                text: '"El agente de IA filtra a las personas que buscan asesoría gratuita y agenda directamente a los clientes que pagan. Nos ahorra 15 horas semanales."',
                rating: 5,
              },
              {
                name: 'Sofía Landa',
                role: 'Gerente, Nutripass Bistro',
                text: '"Tener el bot respondiendo cotizaciones de eventos por WhatsApp nos ayudó a aumentar un 40% nuestras reservas corporativas este mes."',
                rating: 5,
              },
              {
                name: 'Dr. Carlos Mendoza',
                role: 'Director Médico, Clinic Group',
                text: '"Mis pacientes reservan citas de seguimiento al instante por WhatsApp a cualquier hora del día sin saturar la recepción."',
                rating: 5,
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-slate-900 bg-[#0F0F1A] p-6 shadow-xl"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-purple-400 fill-purple-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed">{t.text}</p>
                <div className="mt-6 pt-4 border-t border-slate-900">
                  <p className="text-xs font-semibold text-white">{t.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="precios" className="py-24 bg-[#05050A]">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Planes simples, resultados reales
            </h2>
            <p className="mt-4 text-slate-400">
              Sin contratos. Sin sorpresas. Cancela cuando quieras.
            </p>
          </div>

          <PricingList />
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="py-24 bg-[#0F0F1A] border-t border-slate-900/60">
        <div className="mx-auto max-w-4xl px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Preguntas frecuentes
            </h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* ── CTA section ── */}
      <section className="py-24 bg-gradient-to-b from-[#05050A] to-[#0F0F1A] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-purple-600/10 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-cyan-600/10 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
            Empieza hoy a automatizar tu negocio
          </h2>
          <p className="mt-4 text-slate-400">
            Crea tu primer agente conversacional inteligente de prueba gratis.
          </p>
          <Link
            href="/login"
            id="cta-footer-btn"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-[#05050A] hover:bg-slate-100 transition-all active:scale-[0.98]"
          >
            Comenzar gratis
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-900 bg-[#05050A] py-8">
        <div className="mx-auto max-w-6xl px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SenzioLogo className="h-6 w-6" />
            <span className="text-sm font-bold text-white">Senzio</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <Link href="/terminos" className="text-xs text-slate-400 hover:text-white transition-colors">Términos y Condiciones</Link>
              <Link href="/privacidad" className="text-xs text-slate-400 hover:text-white transition-colors">Aviso de Privacidad</Link>
            </div>
            <p className="text-xs text-slate-500">
              © 2026 Senzio. Agentes inteligentes conversacionales multi-vertical.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

async function PricingList() {
  let plans: any[] = []
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/pricing`, { 
      next: { revalidate: 3600 } 
    })
    
    if (res.ok) {
      const data = await res.json()
      plans = data.plans || []
    }
  } catch (error) {
    console.error("Failed to fetch pricing", error)
  }

  if (plans.length === 0) {
    return <div className="text-center text-slate-500">Cargando planes...</div>
  }

  return (
    <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
      {plans.map((plan) => (
        <div 
          key={plan.id} 
          className={`relative flex flex-col rounded-3xl p-8 border ${plan.es_popular ? 'border-purple-500/50 bg-[#120F24] shadow-2xl shadow-purple-900/20' : 'border-slate-800 bg-[#0F0F1A]'}`}
        >
          {plan.es_popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-1 text-xs font-bold text-white shadow-lg">
              Más popular
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-xl font-bold text-white">{plan.nombre}</h3>
            <p className="mt-2 text-sm text-slate-400 h-10">{plan.descripcion}</p>
          </div>

          <div className="mb-8">
            {plan.es_contacto ? (
              <span className="text-4xl font-extrabold text-white">A la medida</span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">${plan.precio_mxn}</span>
                <span className="text-sm font-medium text-slate-400">/ mes</span>
              </div>
            )}
          </div>

          <ul className="mb-8 flex-1 space-y-4">
            {Array.isArray(plan.features) && plan.features.map((feature: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle className="h-5 w-5 shrink-0 text-cyan-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {plan.es_contacto ? (
            <Link
              href="https://wa.me/5215555555555" // Replace with actual number
              className="mt-auto block w-full rounded-xl border border-slate-700 bg-transparent px-4 py-3 text-center text-sm font-bold text-white hover:bg-slate-800 transition-colors"
            >
              Contactar
            </Link>
          ) : (
            <Link
              href="/login"
              className={`mt-auto block w-full rounded-xl px-4 py-3 text-center text-sm font-bold text-white transition-all ${plan.es_popular ? 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              Comenzar gratis
            </Link>
          )}
        </div>
      ))}
      <div className="md:col-span-3 text-center mt-4">
        <p className="text-sm text-slate-500">
          Todos los planes incluyen 14 días de prueba gratis · Sin tarjeta de crédito
        </p>
      </div>
    </div>
  )
}

