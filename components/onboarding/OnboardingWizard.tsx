'use client'

import { useState } from 'react'
import { StepSelectVertical } from './StepSelectVertical'

interface WizardState {
  vertical: 'restaurant' | 'medical' | 'lawyer' | null
  step: number
  data: Record<string, any>
}

export function OnboardingWizard() {
  const [state, setState] = useState<WizardState>({
    vertical: null,
    step: 1,
    data: {}
  })

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const handleSelectVertical = (vertical: 'restaurant' | 'medical' | 'lawyer') => {
    updateState({ vertical, step: 2 })
  }

  return (
    <div className="min-h-screen bg-[#05050A] text-[#F8FAFC] font-sans selection:bg-[#8B5CF6]/30">
      {/* Top Navbar / Progress Bar Area */}
      <header className="w-full h-16 flex items-center px-6 border-b border-[#1a1a2e]">
        <div className="text-xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">
          Senzio
        </div>
        
        {state.step > 1 && (
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium text-[#94A3B8]">
              Paso {state.step} de {state.vertical === 'restaurant' ? 4 : 4}
            </span>
            <div className="w-48 h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] transition-all duration-300"
                style={{ width: `${(state.step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {state.step === 1 && (
          <StepSelectVertical onSelect={handleSelectVertical} />
        )}
        {state.step > 1 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Vertical: {state.vertical}</h2>
            <p className="text-[#94A3B8]">Paso {state.step} en construcción (mostraremos los demás pasos más adelante).</p>
            <button 
              className="mt-6 px-4 py-2 bg-[#1a1a2e] hover:bg-[#334155] rounded-md transition-colors"
              onClick={() => updateState({ step: 1, vertical: null })}
            >
              Reiniciar
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
