import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

// Friendly medical SVG illustrations
function CalendarIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="20" width="60" height="50" rx="8" fill="#EEF4FF" stroke="#BFDBFE" strokeWidth="2"/>
      <rect x="10" y="20" width="60" height="18" rx="8" fill="#BFDBFE"/>
      <rect x="10" y="30" width="60" height="8" fill="#BFDBFE"/>
      <circle cx="26" cy="20" r="5" fill="#1E4A8A"/>
      <circle cx="54" cy="20" r="5" fill="#1E4A8A"/>
      <rect cx="26" y="15" width="4" height="10" rx="2" fill="white" x="24"/>
      <rect cx="54" y="15" width="4" height="10" rx="2" fill="white" x="52"/>
      <rect x="20" y="48" width="10" height="8" rx="3" fill="#BFDBFE"/>
      <rect x="35" y="48" width="10" height="8" rx="3" fill="#BFDBFE"/>
      <rect x="50" y="48" width="10" height="8" rx="3" fill="#BFDBFE"/>
      <rect x="20" y="60" width="10" height="4" rx="2" fill="#E0E7FF"/>
      <rect x="35" y="60" width="10" height="4" rx="2" fill="#E0E7FF"/>
    </svg>
  )
}

function MessageIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="18" width="48" height="36" rx="8" fill="#EEF4FF" stroke="#BFDBFE" strokeWidth="2"/>
      <path d="M8 46 L20 58 L32 46" fill="#EEF4FF" stroke="#BFDBFE" strokeWidth="2"/>
      <rect x="18" y="28" width="28" height="3" rx="1.5" fill="#BFDBFE"/>
      <rect x="18" y="35" width="20" height="3" rx="1.5" fill="#BFDBFE"/>
      <rect x="24" y="30" width="40" height="30" rx="8" fill="#F0FDFA" stroke="#99F6E4" strokeWidth="2"/>
      <rect x="32" y="38" width="24" height="3" rx="1.5" fill="#99F6E4"/>
      <rect x="32" y="45" width="16" height="3" rx="1.5" fill="#99F6E4"/>
    </svg>
  )
}

function PatientsIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="40" cy="28" r="14" fill="#EEF4FF" stroke="#BFDBFE" strokeWidth="2"/>
      <circle cx="40" cy="25" r="7" fill="#BFDBFE"/>
      <path d="M16 62c0-13.255 10.745-22 24-22s24 8.745 24 22" stroke="#BFDBFE" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <rect x="35" y="20" width="10" height="10" rx="2" fill="white" opacity="0.7"/>
      <rect x="39" y="22" width="2" height="6" rx="1" fill="#1E4A8A"/>
      <rect x="37" y="24" width="6" height="2" rx="1" fill="#1E4A8A"/>
    </svg>
  )
}

function GenericIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="40" cy="40" r="30" fill="#EEF4FF" stroke="#BFDBFE" strokeWidth="2"/>
      <circle cx="40" cy="40" r="18" fill="#BFDBFE" opacity="0.5"/>
      <rect x="35" y="30" width="10" height="20" rx="2" fill="#1E4A8A" opacity="0.3"/>
      <rect x="30" y="35" width="20" height="10" rx="2" fill="#1E4A8A" opacity="0.3"/>
    </svg>
  )
}

const illustrationMap: Record<string, React.ReactNode> = {
  calendar: <CalendarIllustration />,
  message: <MessageIllustration />,
  patients: <PatientsIllustration />,
  default: <GenericIllustration />,
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      {/* Soft illustration background */}
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50">
        {Icon ? (
          <Icon className="h-9 w-9 text-slate-300" strokeWidth={1.5} />
        ) : (
          illustrationMap.default
        )}
      </div>

      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-xs text-slate-400 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
