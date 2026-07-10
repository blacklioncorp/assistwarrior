import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type ColorScheme = 'blue' | 'teal' | 'amber' | 'red' | 'violet' | 'emerald'

const colorMap: Record<ColorScheme, { icon: string; bg: string; border: string; value: string }> = {
  blue: {
    icon: 'text-blue-400',
    bg: 'bg-blue-950/20 border border-blue-900/30',
    border: 'border-l-blue-500',
    value: 'text-white',
  },
  teal: {
    icon: 'text-cyan-400',
    bg: 'bg-cyan-950/20 border border-cyan-900/30',
    border: 'border-l-cyan-500',
    value: 'text-white',
  },
  amber: {
    icon: 'text-amber-400',
    bg: 'bg-amber-950/20 border border-amber-900/30',
    border: 'border-l-amber-500',
    value: 'text-white',
  },
  red: {
    icon: 'text-red-400',
    bg: 'bg-red-950/20 border border-red-900/30',
    border: 'border-l-red-500',
    value: 'text-white',
  },
  violet: {
    icon: 'text-purple-400',
    bg: 'bg-purple-950/20 border border-purple-900/30',
    border: 'border-l-purple-500',
    value: 'text-white',
  },
  emerald: {
    icon: 'text-emerald-400',
    bg: 'bg-emerald-950/20 border border-emerald-900/30',
    border: 'border-l-emerald-500',
    value: 'text-white',
  },
}

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon: LucideIcon
  color?: ColorScheme
  trend?: {
    value: number
    label: string
  }
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = 'blue',
  trend,
}: StatCardProps) {
  const colors = colorMap[color]

  return (
    <div
      className={cn(
        'relative bg-[#0F0F1A] rounded-2xl p-5 shadow-xl border border-slate-900/60',
        'border-l-4 transition-all duration-200 hover:border-slate-800',
        colors.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {title}
          </p>
          <p className={cn('mt-2 text-3xl font-bold tabular-nums', colors.value)}>
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          )}
          {trend && (
            <p className={cn(
              'mt-1.5 text-xs font-medium',
              trend.value >= 0 ? 'text-cyan-400' : 'text-red-400'
            )}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('flex-shrink-0 rounded-xl p-2.5', colors.bg)}>
          <Icon className={cn('h-5 w-5', colors.icon)} />
        </div>
      </div>
    </div>
  )
}
