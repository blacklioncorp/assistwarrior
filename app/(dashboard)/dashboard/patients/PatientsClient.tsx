"use client"

import { useState, useTransition } from 'react'
import { Users, Search, Phone, Calendar } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { getInitials, formatDate } from '@/lib/utils'
import { NewPatientModal } from '@/components/dashboard/modals/NewPatientModal'
import { useBusinessType } from '@/hooks/useBusinessType'

const avatarColors = [
  'bg-blue-950/40 text-blue-300 border border-blue-900/30',
  'bg-teal-950/40 text-teal-300 border border-teal-900/30',
  'bg-violet-950/40 text-violet-300 border border-violet-900/30',
  'bg-amber-950/40 text-amber-300 border border-amber-900/30',
  'bg-rose-950/40 text-rose-300 border border-rose-900/30',
  'bg-emerald-950/40 text-emerald-300 border border-emerald-900/30',
]

function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % avatarColors.length
  return avatarColors[index]
}

interface PatientRow {
  id: string
  full_name: string
  phone_whatsapp: string
  email: string | null
  created_at: string
  appointments?: { count: number }[] | null
}

interface PatientsClientProps {
  patients: PatientRow[]
}

export function PatientsClient({ patients }: PatientsClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [deferredSearch, setDeferredSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  // Handle search input change with transition deferral
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchTerm(val)
    startTransition(() => {
      setDeferredSearch(val)
    })
  }

  // Filter patient list based on search term
  const filteredPatients = patients.filter((patient) => {
    if (!deferredSearch) return true
    const s = deferredSearch.toLowerCase()
    return (
      patient.full_name.toLowerCase().includes(s) ||
      patient.phone_whatsapp.toLowerCase().includes(s) ||
      (patient.email && patient.email.toLowerCase().includes(s))
    )
  })

  const { labels } = useBusinessType()

  return (
    <div className="space-y-6 max-w-4xl text-slate-100">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{labels.clients}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {filteredPatients.length > 0
              ? `${filteredPatients.length} ${labels.clientSingular}${filteredPatients.length !== 1 ? 's' : ''} registrado${filteredPatients.length !== 1 ? 's' : ''}`
              : `Registro de ${labels.clients.toLowerCase()}`}
          </p>
        </div>
        <NewPatientModal />
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
        <input
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar por nombre, teléfono o email..."
          id="patient-search"
          className="w-full rounded-xl border border-slate-900 bg-[#0F0F1A] py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
        />
        {isPending && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 animate-pulse">
            Buscando...
          </div>
        )}
      </div>

      {/* Patient list */}
      <div className="bg-[#0F0F1A] rounded-2xl border border-slate-900 overflow-hidden">
        {filteredPatients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={searchTerm ? `No se encontraron ${labels.clients.toLowerCase()}` : `Sin ${labels.clients.toLowerCase()} aún`}
            description={
              searchTerm
                ? `Prueba buscando con otros términos o registra un ${labels.clientSingular} nuevo.`
                : `Los ${labels.clients.toLowerCase()} aparecerán aquí automáticamente cuando contacten al asistente.`
            }
          />
        ) : (
          <div>
            {/* Table header — desktop */}
            <div className="hidden sm:grid grid-cols-12 gap-4 border-b border-slate-900/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <div className="col-span-4">{labels.clientSingular.charAt(0).toUpperCase() + labels.clientSingular.slice(1)}</div>
              <div className="col-span-3">Teléfono</div>
              <div className="col-span-2 text-center">{labels.appointments}</div>
              <div className="col-span-3">Registrado</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-900">
              {filteredPatients.map((patient) => {
                const initials = getInitials(patient.full_name)
                const avatarColor = getAvatarColor(patient.full_name)
                const appointmentCount = patient.appointments?.[0]?.count ?? 0

                return (
                  <div
                    key={patient.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center px-5 py-4 hover:bg-slate-900/40 transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver perfil de ${patient.full_name}`}
                  >
                    {/* Name + Email */}
                    <div className="sm:col-span-4 flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor}`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">
                          {patient.full_name}
                        </p>
                        {patient.email && (
                          <p className="text-xs text-slate-500 truncate">{patient.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="sm:col-span-3 flex items-center gap-1.5 text-sm text-slate-300">
                      <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate font-semibold">{patient.phone_whatsapp}</span>
                    </div>

                    {/* Appointment count */}
                    <div className="sm:col-span-2 sm:text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 bg-slate-950 border border-slate-900 px-2 py-1 rounded-lg">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {appointmentCount} {labels.appointmentSingular}{appointmentCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Registered date */}
                    <div className="sm:col-span-3">
                      <p className="text-xs text-slate-500 font-medium">
                        {formatDate(patient.created_at, { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
