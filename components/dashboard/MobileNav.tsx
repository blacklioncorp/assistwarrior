'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/appointments', label: 'Citas', icon: Calendar },
  { href: '/dashboard/messages', label: 'Mensajes', icon: MessageSquare },
  { href: '/dashboard/patients', label: 'Pacientes', icon: Users },
  { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white border-t border-slate-200"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-around pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive =
            pathname === tab.href ||
            (tab.href !== '/dashboard' && pathname.startsWith(tab.href))

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2.5 min-w-[56px] transition-colors duration-150',
                isActive
                  ? 'text-[#1E4A8A]'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-transform duration-150',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span
                className={cn(
                  'text-[10px] font-medium leading-none',
                  isActive ? 'text-[#1E4A8A]' : 'text-slate-400'
                )}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
