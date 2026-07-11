'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  Settings,
  CreditCard,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Ban,
  Briefcase,
  UtensilsCrossed,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

// Reusable Custom Senzio Logo SVG
function SenzioLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="side-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <path
        d="M35,25 C45,15 65,15 75,30 C85,45 65,55 50,50 C35,45 15,55 25,70 C35,85 55,85 65,75"
        stroke="url(#side-logo-grad)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle cx="35" cy="25" r="8" fill="#8B5CF6" />
      <circle cx="65" cy="75" r="8" fill="#06B6D4" />
    </svg>
  )
}

// Vertical icon for the sidebar subtitle
function VerticalIcon({ businessTypeName }: { businessTypeName: string }) {
  if (businessTypeName === 'lawfirm') return <Briefcase className="h-3 w-3" />
  if (businessTypeName === 'restaurant') return <UtensilsCrossed className="h-3 w-3" />
  return null
}

// Build nav items dynamically based on vertical
function buildNavItems(businessTypeName: string) {
  const isRestaurant = businessTypeName === 'restaurant'
  const isLawFirm = businessTypeName === 'lawfirm'

  return [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
      visible: true,
    },
    {
      href: '/dashboard/appointments',
      label: isRestaurant ? 'Pedidos' : isLawFirm ? 'Consultas' : 'Citas',
      icon: Calendar,
      exact: false,
      visible: true,
    },
    {
      href: '/dashboard/messages',
      label: 'Mensajes',
      icon: MessageSquare,
      exact: false,
      visible: true,
    },
    {
      href: '/dashboard/patients',
      label: isLawFirm ? 'Casos' : 'Clientes',
      icon: Users,
      exact: false,
      visible: true,
    },
    // Bloqueos: hidden for restaurants
    {
      href: '/dashboard/settings?tab=blocked',
      label: 'Bloqueos',
      icon: Ban,
      exact: false,
      visible: !isRestaurant,
    },
  ].filter(item => item.visible)
}

const bottomNavItems = [
  {
    href: '/dashboard/settings',
    label: 'Configuración',
    icon: Settings,
    exact: false,
    visible: true,
  },
  {
    href: '/dashboard/billing',
    label: 'Facturación',
    icon: CreditCard,
    exact: false,
    visible: true,
  },
]

interface SidebarProps {
  professional: {
    full_name?: string | null
    email: string
    specialty?: string | null
    clinic_name?: string | null
    plan?: string | null
    plan_status?: string | null
    is_superadmin?: boolean | null
  }
  businessTypeName?: string
}

function NavLink({
  item,
  pathname,
}: {
  item: ReturnType<typeof buildNavItems>[0]
  pathname: string
}) {
  const Icon = item.icon
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href.split('?')[0] + '/')

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'border-l-2 border-purple-500 bg-slate-900 text-white pl-[10px]'
          : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
      )}
    >
      <Icon
        className={cn(
          'h-5 w-5 shrink-0 transition-colors',
          isActive
            ? 'text-purple-400'
            : 'text-slate-500 group-hover:text-slate-300'
        )}
        strokeWidth={isActive ? 2.5 : 1.75}
      />
      <span className="flex-1">{item.label}</span>
      {isActive && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
      )}
    </Link>
  )
}

export function Sidebar({ professional, businessTypeName = '' }: SidebarProps) {
  const pathname = usePathname()
  const displayName = professional.full_name ?? professional.email.split('@')[0]
  const initials = getInitials(displayName)
  const isPro = professional.plan === 'pro'
  const navItems = buildNavItems(businessTypeName)

  // Subtitle under "Senzio" branding
  const verticalLabel: Record<string, string> = {
    doctor: 'Clínica / Salud',
    dentist: 'Odontología',
    lawfirm: 'Despacho de Abogados',
    restaurant: 'Restaurante',
  }
  const subtitle = verticalLabel[businessTypeName] || professional.specialty || professional.clinic_name || 'Agente de IA'

  return (
    <aside
      className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col border-r border-slate-900/60"
      style={{ backgroundColor: '#07070C' }}
      role="navigation"
      aria-label="Menú lateral"
    >
      {/* ── Logo ── */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-900/60 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 shadow-lg shadow-purple-950/20">
          <SenzioLogo className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white leading-tight">
            Senzio
          </p>
          <p className="truncate text-[10px] font-medium text-slate-400 tracking-wide uppercase mt-0.5 flex items-center gap-1">
            <VerticalIcon businessTypeName={businessTypeName} />
            {subtitle}
          </p>
        </div>
      </div>

      {/* ── Main Nav ── */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
          {professional.is_superadmin && (
            <NavLink
              item={{
                href: '/dashboard/superadmin',
                label: 'Superadmin',
                icon: ShieldCheck,
                exact: false,
                visible: true,
              }}
              pathname={pathname}
            />
          )}
        </div>

        {/* ── Divider ── */}
        <div className="my-4 border-t border-slate-900/60" />

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Cuenta
        </p>
        <div className="space-y-0.5">
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>

      {/* ── Plan badge ── */}
      {!isPro && (
        <div className="px-3 pb-3">
          <Link
            href="/dashboard/billing"
            className="group flex items-center gap-3 rounded-xl border border-purple-950/40 bg-gradient-to-r from-purple-950/20 to-slate-900/20 p-3 transition-all duration-200 hover:border-purple-800/40 hover:from-purple-950/30"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white">Actualizar a Pro</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                WhatsApp + atención ilimitados
              </p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </Link>
        </div>
      )}

      {/* ── Professional profile ── */}
      <div className="border-t border-slate-900/60 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 text-xs font-bold text-white ring-2 ring-purple-900/30">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-200 leading-tight">
              {displayName}
            </p>
            <p className="truncate text-[10px] text-slate-500 mt-0.5">
              {professional.email}
            </p>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
              isPro
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'bg-slate-800 text-slate-400'
            )}
          >
            {professional.plan ?? 'basic'}
          </span>
        </div>
      </div>
    </aside>
  )
}
