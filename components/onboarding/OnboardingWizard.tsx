'use client'

import { useState } from 'react'
import { StepSelectVertical } from './StepSelectVertical'
import { StepComplete } from './StepComplete'

// Shared
import { StepConnectWhatsApp } from './shared/StepConnectWhatsApp'

// Restaurant
import { StepRestaurantBasic } from './restaurant/StepRestaurantBasic'
import { StepRestaurantMenu } from './restaurant/StepRestaurantMenu'

// Medical
import { StepMedicalBasic } from './medical/StepMedicalBasic'
import { StepMedicalIntegrations } from './medical/StepMedicalIntegrations'

// Lawyer
import { StepLawyerBasic } from './lawyer/StepLawyerBasic'
import { StepLawyerConfig } from './lawyer/StepLawyerConfig'

// Server Action
import { completeOnboarding } from '@/app/actions'

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

  const handleNext = (stepData: any = {}) => {
    setState(prev => ({
      ...prev,
      step: prev.step + 1,
      data: { ...prev.data, ...stepData }
    }))
  }

  const handleBack = () => {
    setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }))
  }

  const handleSkip = () => {
    setState(prev => ({ ...prev, step: prev.step + 1 }))
  }

  const handleFinish = async () => {
    try {
      await completeOnboarding({ vertical: state.vertical, data: state.data })
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Hubo un error al guardar tu configuración. Por favor intenta de nuevo.')
    }
  }

  // Lógica para renderizar el paso correcto
  const renderStep = () => {
    if (state.step === 1) {
      return <StepSelectVertical onSelect={(vertical) => updateState({ vertical, step: 2 })} />
    }

    if (state.vertical === 'restaurant') {
      switch (state.step) {
        case 2: return <StepRestaurantBasic onNext={handleNext} onBack={handleBack} />
        case 3: return <StepRestaurantMenu onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />
        case 4: return <StepConnectWhatsApp onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />
        case 5: return <StepComplete vertical="restaurant" data={state.data} onFinish={handleFinish} />
      }
    }

    if (state.vertical === 'medical') {
      switch (state.step) {
        case 2: return <StepMedicalBasic onNext={handleNext} onBack={handleBack} />
        case 3: return <StepLawyerConfig onNext={handleNext} onBack={handleBack} /> // Medical usa el mismo component de horas
        case 4: return <StepMedicalIntegrations onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />
        case 5: return <StepComplete vertical="medical" data={state.data} onFinish={handleFinish} />
      }
    }

    if (state.vertical === 'lawyer') {
      switch (state.step) {
        case 2: return <StepLawyerBasic onNext={handleNext} onBack={handleBack} />
        case 3: return <StepLawyerConfig onNext={handleNext} onBack={handleBack} />
        case 4: return <StepMedicalIntegrations onNext={handleNext} onBack={handleBack} onSkip={handleSkip} title="Conecta tus integraciones" />
        case 5: return <StepComplete vertical="lawyer" data={state.data} onFinish={handleFinish} />
      }
    }

    return null
  }

  // El médico en el paso 3 usa el componente de horas pero sin la parte de "tono"
  // Modificaré el OnboardingWizard para que pase el componente correcto. 
  // Wait, I created StepWorkingHours as a shared component, but StepLawyerConfig includes both working hours AND tone. 
  // For Medical, they only need working hours. I will render StepWorkingHours directly for Medical.
  
  if (state.vertical === 'medical' && state.step === 3) {
      const { StepWorkingHours } = require('./shared/StepWorkingHours')
      return (
        <div className="min-h-screen bg-[#05050A] text-[#F8FAFC] font-sans selection:bg-[#8B5CF6]/30 flex flex-col">
          <header className="w-full h-16 flex items-center px-6 border-b border-[#1a1a2e]">
            <div className="text-xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">
              Senzio
            </div>
            <div className="ml-auto flex items-center gap-4">
              <span className="text-sm font-medium text-[#94A3B8]">
                Paso 3 de 4
              </span>
              <div className="w-48 h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] transition-all duration-300" style={{ width: '75%' }} />
              </div>
            </div>
          </header>
          <main className="flex-1">
            <StepWorkingHours onNext={(hours: any) => handleNext({ working_hours: hours })} onBack={handleBack} />
          </main>
        </div>
      )
  }

  const totalSteps = 4
  const currentProgress = state.step > 4 ? 4 : (state.step === 1 ? 0 : state.step - 1)
  const isCompleteStep = state.step === 5

  return (
    <div className="min-h-screen bg-[#05050A] text-[#F8FAFC] font-sans selection:bg-[#8B5CF6]/30 flex flex-col">
      {/* Top Navbar / Progress Bar Area */}
      {!isCompleteStep && (
        <header className="w-full h-16 flex items-center px-6 border-b border-[#1a1a2e]">
          <div className="text-xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent">
            Senzio
          </div>
          
          {state.step > 1 && (
            <div className="ml-auto flex items-center gap-4">
              <span className="text-sm font-medium text-[#94A3B8]">
                Paso {state.step - 1} de {totalSteps}
              </span>
              <div className="w-48 h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] transition-all duration-300"
                  style={{ width: \`\${(currentProgress / totalSteps) * 100}%\` }}
                />
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {renderStep()}
      </main>
    </div>
  )
}
