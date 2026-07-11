'use client'

import { useProfessional } from '@/contexts/ProfessionalContext'

export type BusinessVertical = 'clinic' | 'lawfirm' | 'restaurant' | 'unknown'

export interface BusinessTypeLabels {
  appointments: string       // e.g. "Citas" | "Consultas" | "Pedidos"
  clients: string            // e.g. "Clientes" | "Casos" | "Clientes"
  appointmentSingular: string // e.g. "cita" | "consulta" | "pedido"
  clientSingular: string      // e.g. "cliente" | "caso" | "cliente"
  showBlocked: boolean
}

const labelsByVertical: Record<BusinessVertical, BusinessTypeLabels> = {
  clinic: {
    appointments: 'Citas',
    clients: 'Clientes',
    appointmentSingular: 'cita',
    clientSingular: 'cliente',
    showBlocked: true,
  },
  lawfirm: {
    appointments: 'Consultas',
    clients: 'Casos',
    appointmentSingular: 'consulta',
    clientSingular: 'caso',
    showBlocked: true,
  },
  restaurant: {
    appointments: 'Pedidos',
    clients: 'Clientes',
    appointmentSingular: 'pedido',
    clientSingular: 'cliente',
    showBlocked: false,
  },
  unknown: {
    appointments: 'Citas',
    clients: 'Clientes',
    appointmentSingular: 'cita',
    clientSingular: 'cliente',
    showBlocked: true,
  },
}

export function useBusinessType() {
  const { businessTypeName } = useProfessional()

  const isLawFirm = businessTypeName === 'lawfirm'
  const isRestaurant = businessTypeName === 'restaurant'
  const isClinic = !isLawFirm && !isRestaurant

  const vertical: BusinessVertical = isLawFirm
    ? 'lawfirm'
    : isRestaurant
      ? 'restaurant'
      : isClinic
        ? 'clinic'
        : 'unknown'

  return {
    businessTypeName,
    vertical,
    isClinic,
    isLawFirm,
    isRestaurant,
    labels: labelsByVertical[vertical],
  }
}
