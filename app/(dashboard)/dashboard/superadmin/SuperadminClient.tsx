"use client"

import { useState, useTransition } from 'react'
import {
  Users,
  Calendar,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  ListTodo,
  TrendingUp,
  Mail,
  UserCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SubmitButton } from '@/components/ui/submit-button'
import { getInitials } from '@/lib/utils'
import { 
  updateProfessionalPlan, 
  toggleProfessionalStatus, 
  addSuperadminEmail, 
  removeSuperadminEmail,
  getProfessionals,
  getGlobalStats,
  getAuditLogs,
  getSuperadminEmails
} from '@/app/actions/superadmin'

interface StatRow {
  totalProfessionals: number
  totalAppointments: number
  totalPatients: number
  plans: { basic: number; pro: number; trial: number }
}

interface ProfessionalRow {
  id: string
  full_name: string | null
  email: string
  specialty: string | null
  clinic_name: string | null
  plan: 'pro' | 'basic' | 'trial'
  plan_status: string
  is_active: boolean
  is_superadmin: boolean
  created_at: string
  patientCount: number
  appointmentCount: number
}

interface AuditLogRow {
  id: string
  admin_id: string
  action: string
  target_professional_id: string | null
  details: any
  created_at: string
  professionals: { full_name: string | null; email: string } | null
}

interface AdminEmailRow {
  id: string
  email: string
  created_at: string
}

interface SuperadminClientProps {
  initialStats: StatRow
  initialProfessionals: ProfessionalRow[]
  initialAuditLogs: AuditLogRow[]
  initialAdminEmails: AdminEmailRow[]
  currentUserEmail: string
}

export function SuperadminClient({
  initialStats,
  initialProfessionals,
  initialAuditLogs,
  initialAdminEmails,
  currentUserEmail
}: SuperadminClientProps) {
  const [activeTab, setActiveTab] = useState<'doctors' | 'whitelist' | 'audit'>('doctors')
  const [stats, setStats] = useState<StatRow>(initialStats)
  const [professionals, setProfessionals] = useState<ProfessionalRow[]>(initialProfessionals)
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>(initialAuditLogs)
  const [adminEmails, setAdminEmails] = useState<AdminEmailRow[]>(initialAdminEmails)

  // Filters & search
  const [searchTerm, setSearchTerm] = useState('')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Refresh page data
  const refreshData = async () => {
    try {
      const s = await getGlobalStats()
      const p = await getProfessionals()
      const a = await getAuditLogs()
      const e = await getSuperadminEmails()
      setStats(s)
      setProfessionals(p as any)
      setAuditLogs(a as any)
      setAdminEmails(e as any)
    } catch (err: any) {
      console.error('Error refreshing admin dashboard data:', err)
    }
  }

  // Handle Plan update
  const handlePlanChange = async (id: string, plan: 'pro' | 'basic' | 'trial') => {
    setErrorMessage(null)
    setSuccessMessage(null)
    startTransition(async () => {
      const res = await updateProfessionalPlan(id, plan)
      if (res.error) {
        setErrorMessage(res.error)
      } else {
        setSuccessMessage('Plan del profesional actualizado con éxito.')
        await refreshData()
      }
    })
  }

  // Handle Active/Suspended toggle
  const handleToggleStatus = async (id: string, name: string | null) => {
    if (!confirm(`¿Estás seguro de que deseas cambiar el estado de la cuenta de ${name || 'este profesional'}?`)) return
    setErrorMessage(null)
    setSuccessMessage(null)
    startTransition(async () => {
      const res = await toggleProfessionalStatus(id)
      if (res.error) {
        setErrorMessage(res.error)
      } else {
        setSuccessMessage('Estado de la cuenta actualizado con éxito.')
        await refreshData()
      }
    })
  }

  // Handle Admin Promotion/Demotion
  const handleToggleAdmin = async (email: string, isCurrentlyAdmin: boolean) => {
    setErrorMessage(null)
    setSuccessMessage(null)
    startTransition(async () => {
      let res
      if (isCurrentlyAdmin) {
        if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
          setErrorMessage('No puedes quitarte los permisos de administrador a ti mismo.')
          return
        }
        res = await removeSuperadminEmail(email)
      } else {
        res = await addSuperadminEmail(email)
      }

      if (res.error) {
        setErrorMessage(res.error)
      } else {
        setSuccessMessage(`Permisos de administrador actualizados para ${email}.`)
        await refreshData()
      }
    })
  }

  // Handle Whitelist Add Email
  const handleAddWhitelist = async (formData: FormData) => {
    setErrorMessage(null)
    setSuccessMessage(null)
    const email = formData.get('email') as string
    if (!email) return

    startTransition(async () => {
      const res = await addSuperadminEmail(email)
      if (res.error) {
        setErrorMessage(res.error)
      } else {
        setSuccessMessage(`Correo ${email} añadido a la lista blanca de administradores.`);
        (document.getElementById('whitelist-add-form') as HTMLFormElement)?.reset()
        await refreshData()
      }
    })
  }

  // Filter professionals list locally
  const filteredProfessionals = professionals.filter((prof) => {
    // 1. Search term filter
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      const match = 
        (prof.full_name || '').toLowerCase().includes(s) ||
        (prof.email || '').toLowerCase().includes(s) ||
        (prof.specialty || '').toLowerCase().includes(s)
      if (!match) return false
    }

    // 2. Plan filter
    if (planFilter !== 'all' && prof.plan !== planFilter) {
      return false
    }

    // 3. Status filter
    if (statusFilter !== 'all') {
      const expectedActive = statusFilter === 'active'
      if (prof.is_active !== expectedActive) return false
    }

    return true
  })

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Consola del Superadmin</h1>
            <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-200">
              Control Global
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Administración del sistema, planes, usuarios y auditoría de la plataforma
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={isPending}
          className="self-start sm:self-center inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isPending && 'animate-spin'}`} />
          Sincronizar
        </button>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-xl bg-teal-50 border border-teal-200 p-4 text-sm text-teal-700">
          <CheckCircle className="h-5 w-5 shrink-0 text-teal-500" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* ── Global Stats Grid ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Médicos Totales</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalProfessionals}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
            <span className="font-semibold text-blue-600">{stats.plans.pro} Pro</span>
            <span>·</span>
            <span>{stats.plans.basic} Basic</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Citas Agendadas</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Calendar className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalAppointments}</p>
          <p className="text-[10px] text-slate-400 mt-1">En toda la plataforma</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pacientes Totales</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <UserCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalPatients}</p>
          <p className="text-[10px] text-slate-400 mt-1">Registrados por médicos</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversión Premium</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {stats.totalProfessionals > 0 
              ? `${Math.round((stats.plans.pro / stats.totalProfessionals) * 100)}%` 
              : '0%'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Suscritos a plan Pro</p>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex gap-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'doctors'
              ? 'border-[#1E4A8A] text-[#1E4A8A]'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Users className="h-4 w-4" />
          Médicos Registrados ({professionals.length})
        </button>
        <button
          onClick={() => setActiveTab('whitelist')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'whitelist'
              ? 'border-[#1E4A8A] text-[#1E4A8A]'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Lista Blanca de Admins ({adminEmails.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'audit'
              ? 'border-[#1E4A8A] text-[#1E4A8A]'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <ListTodo className="h-4 w-4" />
          Registro de Auditoría
        </button>
      </div>

      {/* ── TAB: DOCTORS ── */}
      {activeTab === 'doctors' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, correo, especialidad o clínica..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">Todos los planes</option>
                <option value="pro">Plan Pro</option>
                <option value="basic">Plan Básico</option>
                <option value="trial">Plan Trial</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Suspendidos</option>
              </select>
            </div>
          </div>

          {/* List/Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-x-auto">
            {filteredProfessionals.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                No se encontraron médicos con los filtros aplicados.
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-sm text-slate-600 min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">Nombre</th>
                    <th className="px-5 py-3">Especialidad / Clínica</th>
                    <th className="px-5 py-3 text-center">Citas / Pacientes</th>
                    <th className="px-5 py-3">Plan / Estado</th>
                    <th className="px-5 py-3">Rol</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredProfessionals.map((prof) => {
                    const initials = getInitials(prof.full_name || prof.email)
                    return (
                      <tr 
                        key={prof.id} 
                        className={`hover:bg-slate-50/60 transition-colors ${!prof.is_active && 'opacity-65 bg-slate-50/20'}`}
                      >
                        {/* Name + Email */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">
                                {prof.full_name || 'Sin nombre'}
                              </p>
                              <p className="text-xs text-slate-400 truncate">{prof.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Clinic & Specialty */}
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700 truncate">{prof.specialty || 'No especificada'}</p>
                          <p className="text-xs text-slate-400 truncate">{prof.clinic_name || 'Sin consultorio'}</p>
                        </td>

                        {/* Stats */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Badge variant="outline" className="font-semibold text-slate-600 bg-slate-50">
                              {prof.appointmentCount} Citas
                            </Badge>
                            <Badge variant="outline" className="font-semibold text-slate-600 bg-slate-50">
                              {prof.patientCount} Pacientes
                            </Badge>
                          </div>
                        </td>

                        {/* Plan and Active status */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={prof.plan}
                                disabled={isPending}
                                onChange={(e) => handlePlanChange(prof.id, e.target.value as any)}
                                className={`text-xs font-bold rounded-lg border border-slate-200 px-2 py-0.5 outline-none focus:ring-1 focus:ring-blue-400 bg-white ${
                                  prof.plan === 'pro' ? 'text-blue-700 border-blue-200 bg-blue-50/40' : 'text-slate-600'
                                }`}
                              >
                                <option value="pro">Pro</option>
                                <option value="basic">Basic</option>
                                <option value="trial">Trial</option>
                              </select>
                              <span className="text-[10px] text-slate-400 font-medium lowercase">({prof.plan_status})</span>
                            </div>
                            <div>
                              {prof.is_active ? (
                                <Badge variant="success" className="text-[10px] py-0 px-1.5">Activo</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-[10px] py-0 px-1.5">Suspendido</Badge>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Admin privileges */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleAdmin(prof.email, prof.is_superadmin)}
                            disabled={isPending}
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            {prof.is_superadmin ? (
                              <>
                                <ShieldCheck className="h-4.5 w-4.5 text-amber-500" />
                                <span className="font-semibold text-amber-700">Superadmin</span>
                              </>
                            ) : (
                              <>
                                <Shield className="h-4.5 w-4.5 text-slate-300" />
                                <span className="text-slate-400">Médico</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Action buttons */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(prof.id, prof.full_name)}
                              disabled={isPending}
                              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                                prof.is_active
                                  ? 'border border-red-200 bg-white text-red-600 hover:bg-red-50'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {prof.is_active ? 'Suspender' : 'Reactivar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: WHITELIST ── */}
      {activeTab === 'whitelist' && (
        <div className="grid gap-6 md:grid-cols-[1fr_380px] animate-fade-in">
          {/* Whitelist Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Administradores Autorizados</h3>
            <div className="divide-y divide-slate-100">
              {adminEmails.map((item) => {
                const isCurrentUser = item.email.toLowerCase() === currentUserEmail.toLowerCase()
                return (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.email}</p>
                        <p className="text-[10px] text-slate-400" suppressHydrationWarning>Autorizado el {new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleToggleAdmin(item.email, true)}
                        disabled={isPending}
                        className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover administrador"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    {isCurrentUser && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-md">Tu cuenta</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add email sidebar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 self-start space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-800">Añadir Administrador</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              El correo que agregues será autorizado en la ruta de inicio `/micro` y se le asignarán permisos globales de Superadmin de forma automática cuando inicie sesión.
            </p>
            <form id="whitelist-add-form" action={handleAddWhitelist} className="space-y-3">
              <div className="space-y-1">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="ejemplo@correo.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <SubmitButton pendingText="Añadiendo..." className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2 flex items-center justify-center gap-1.5 font-semibold text-xs">
                <Plus className="h-3.5 w-3.5" />
                Agregar Admin
              </SubmitButton>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB: AUDIT LOGS ── */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 animate-fade-in space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ListTodo className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Historial de Auditoría de Superadmin</h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            {auditLogs.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-xs">Sin registros de auditoría aún.</p>
            ) : (
              auditLogs.map((log) => {
                const adminName = log.professionals?.full_name || log.professionals?.email || 'Admin Desconocido'
                return (
                  <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">{adminName}</span>
                        <span className="text-slate-300">|</span>
                        <span className="font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">{log.action}</span>
                      </div>
                      {log.details && (
                        <p className="text-slate-400 text-[10px] leading-relaxed">
                          Detalles: {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium shrink-0">
                      {new Date(log.created_at).toLocaleString('es-MX')}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
