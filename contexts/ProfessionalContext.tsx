'use client'

import { createContext, useContext } from 'react'

interface ProfessionalContextValue {
  businessTypeName: string
  fullName: string | null
  email: string
}

const ProfessionalContext = createContext<ProfessionalContextValue>({
  businessTypeName: '',
  fullName: null,
  email: '',
})

export function ProfessionalProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: ProfessionalContextValue
}) {
  return (
    <ProfessionalContext.Provider value={value}>
      {children}
    </ProfessionalContext.Provider>
  )
}

export function useProfessional() {
  return useContext(ProfessionalContext)
}
