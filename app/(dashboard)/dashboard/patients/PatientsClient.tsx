"use client"

import { useState, useTransition } from 'react'
import { Users, Search, Phone, Calendar } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { getInitials, formatDate } from '@/lib/utils'
import { NewPatientModal } from '@/components/dashboard/modals/NewPatientModal'

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-indigo-100 text-indigo-700',
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filteredPatients.length > 0
              ? `${filteredPatients.length} paciente${filteredPatients.length !== 1 ? 's' : ''} registrado${filteredPatients.length !== 1 ? 's' : ''}`
              : 'Registro de pacientes'}
          </p>
        </div>
        <NewPatientModal />
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar por nombre, teléfono o email..."
          id="patient-search"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-card placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
        />
        {isPending && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 animate-pulse">
            Buscando...
          </div>
        )}
      </div>

      {/* Patient list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {filteredPatients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={searchTerm ? "No se encontraron pacientes" : "Sin pacientes aún"}
            description={
              searchTerm
                ? "Prueba buscando con otros términos o registra un paciente nuevo."
                : "Los pacientes aparecerán aquí automáticamente cuando agenden una cita por WhatsApp o voz."
            }
          />
        ) : (
          <div>
            {/* Table header — desktop */}
            <div className="hidden sm:grid grid-cols-12 gap-4 border-b border-slate-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <div className="col-span-4">Paciente</div>
              <div className="col-span-3">Teléfono</div>
              <div className="col-span-2 text-center">Citas</div>
              <div className="col-span-3">Registrado</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50">
              {filteredPatients.map((patient) => {
                const initials = getInitials(patient.full_name)
                const avatarColor = getAvatarColor(patient.full_name)
                const appointmentCount = patient.appointments?.[0]?.count ?? 0

                return (
                  <div
                    key={patient.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center px-5 py-4 hover:bg-slate-50/60 transition-colors cursor-pointer"
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
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {patient.full_name}
                        </p>
                        {patient.email && (
                          <p className="text-xs text-slate-400 truncate">{patient.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="sm:col-span-3 flex items-center gap-1.5 text-sm text-slate-600">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-semibold">{patient.phone_whatsapp}</span>
                    </div>

                    {/* Appointment count */}
                    <div className="sm:col-span-2 sm:text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {appointmentCount} cita{appointmentCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Registered date */}
                    <div className="sm:col-span-3">
                      <p className="text-xs text-slate-400 font-medium">
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
