import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type ColorScheme = 'blue' | 'teal' | 'amber' | 'red' | 'violet' | 'emerald'

const colorMap: Record<ColorScheme, { icon: string; bg: string; border: string; value: string }> = {
  blue: {
    icon: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-l-blue-500',
    value: 'text-slate-900',
  },
  teal: {
    icon: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-l-teal-500',
    value: 'text-slate-900',
  },
  amber: {
    icon: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-l-amber-500',
    value: 'text-slate-900',
  },
  red: {
    icon: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-l-red-500',
    value: 'text-slate-900',
  },
  violet: {
    icon: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-l-violet-500',
    value: 'text-slate-900',
  },
  emerald: {
    icon: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-l-emerald-500',
    value: 'text-slate-900',
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
        'relative bg-white rounded-2xl p-5 shadow-card border border-slate-100',
        'border-l-4 transition-shadow duration-200 hover:shadow-card-hover',
        colors.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <p className={cn('mt-2 text-3xl font-bold tabular-nums', colors.value)}>
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
          {trend && (
            <p className={cn(
              'mt-1.5 text-xs font-medium',
              trend.value >= 0 ? 'text-teal-600' : 'text-red-600'
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
