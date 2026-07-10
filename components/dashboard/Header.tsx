import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import { Bell, LogOut, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

interface HeaderProps {
  professional: {
    full_name?: string | null
    email: string
    clinic_name?: string | null
    avatar_url?: string | null
  }
  unreadCount?: number
}

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export function Header({ professional, unreadCount = 0 }: HeaderProps) {
  const displayName = professional.full_name ?? professional.email.split('@')[0]
  const initials = getInitials(displayName)
  const clinicLabel = professional.clinic_name ?? 'Mi Negocio'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-900/60 bg-[#05050A]/85 backdrop-blur-md px-4 lg:px-8">
      {/* Left: Clinic name / breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {clinicLabel}
          </p>
          <p className="text-xs text-slate-500 hidden sm:block">
            Sistema de recepción inteligente
          </p>
        </div>
      </div>

      {/* Right: Search + Notifications + Avatar */}
      <div className="flex items-center gap-1.5">
        {/* Search button */}
        <button
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          aria-label="Buscar"
          id="header-search-btn"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notification bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
          id="notification-bell"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white ring-2 ring-[#05050A]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Separator */}
        <div className="mx-1 h-5 w-px bg-slate-800 hidden sm:block" />

        {/* User menu / Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-slate-300 hover:bg-slate-900 hover:text-white transition-colors group"
            title={`Cerrar sesión (${displayName})`}
            id="sign-out-btn"
          >
            <Avatar className="h-7 w-7">
              {professional.avatar_url && (
                <AvatarImage src={professional.avatar_url} alt={displayName} className="object-cover" />
              )}
              <AvatarFallback className="text-[10px] font-bold bg-purple-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium truncate max-w-[120px] text-slate-200">
              {displayName}
            </span>
            <LogOut className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-slate-300 hidden sm:block" />
          </button>
        </form>
      </div>
    </header>
  )
}
