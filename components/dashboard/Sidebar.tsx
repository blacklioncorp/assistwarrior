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
  Stethoscope,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/dashboard/appointments',
    label: 'Citas',
    icon: Calendar,
    exact: false,
  },
  {
    href: '/dashboard/messages',
    label: 'Mensajes',
    icon: MessageSquare,
    exact: false,
  },
  {
    href: '/dashboard/patients',
    label: 'Pacientes',
    icon: Users,
    exact: false,
  },
]

const bottomNavItems = [
  {
    href: '/dashboard/settings',
    label: 'Configuración',
    icon: Settings,
    exact: false,
  },
  {
    href: '/dashboard/billing',
    label: 'Facturación',
    icon: CreditCard,
    exact: false,
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
}


function NavLink({
  item,
  pathname,
}: {
  item: (typeof navItems)[0]
  pathname: string
}) {
  const Icon = item.icon
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + '/')

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'border-l-2 border-blue-400 bg-slate-800 text-white pl-[10px]'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      )}
    >
      <Icon
        className={cn(
          'h-5 w-5 shrink-0 transition-colors',
          isActive
            ? 'text-blue-400'
            : 'text-slate-500 group-hover:text-slate-300'
        )}
        strokeWidth={isActive ? 2.5 : 1.75}
      />
      <span className="flex-1">{item.label}</span>
      {isActive && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
      )}
    </Link>
  )
}

export function Sidebar({ professional }: SidebarProps) {
  const pathname = usePathname()
  const displayName = professional.full_name ?? professional.email.split('@')[0]
  const initials = getInitials(displayName)
  const isPro = professional.plan === 'pro'

  return (
    <aside
      className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col"
      style={{ backgroundColor: 'hsl(222 47% 7%)' }}
      role="navigation"
      aria-label="Menú lateral"
    >
      {/* ── Logo ── */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E4A8A] shadow-lg shadow-blue-900/40">
          <Stethoscope className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white leading-tight">
            Smart Receptionist
          </p>
          <p className="truncate text-[10px] font-medium text-slate-400 tracking-wide uppercase mt-0.5">
            {professional.specialty ?? professional.clinic_name ?? 'Plataforma médica'}
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
              }}
              pathname={pathname}
            />
          )}
        </div>


        {/* ── Divider ── */}
        <div className="my-4 border-t border-slate-800" />

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
            className="group flex items-center gap-3 rounded-xl border border-blue-900/50 bg-gradient-to-r from-blue-900/40 to-slate-800/40 p-3 transition-all duration-200 hover:border-blue-700/50 hover:from-blue-900/60"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/20">
              <Sparkles className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white">Actualizar a Pro</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Llamadas + WhatsApp ilimitadas
              </p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </Link>
        </div>
      )}

      {/* ── Professional profile ── */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E4A8A] text-xs font-bold text-white ring-2 ring-blue-900">
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
                ? 'bg-blue-600/30 text-blue-300'
                : 'bg-slate-700 text-slate-400'
            )}
          >
            {professional.plan ?? 'basic'}
          </span>
        </div>
      </div>
    </aside>
  )
}
