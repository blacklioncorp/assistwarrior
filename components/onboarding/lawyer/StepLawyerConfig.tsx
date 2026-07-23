import { useState } from 'react'
import { StepWorkingHours, WorkingHours } from '../shared/StepWorkingHours'

interface StepLawyerConfigProps {
  onNext: (data: any) => void
  onBack: () => void
}

const DEFAULT_TONE = "Sé profesional y empático. Explica los procesos legales en términos sencillos. Recuerda siempre que la información es orientativa y que la evaluación definitiva requiere una consulta formal con el abogado."

export function StepLawyerConfig({ onNext, onBack }: StepLawyerConfigProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [hours, setHours] = useState<WorkingHours | null>(null)
  const [aiTone, setAiTone] = useState(DEFAULT_TONE)

  if (step === 1) {
    return (
      <StepWorkingHours 
        onNext={(h) => {
          setHours(h)
          setStep(2)
        }} 
        onBack={onBack} 
      />
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#F8FAFC] mb-3">Tono de tu Asistente</h2>
        <p className="text-[#94A3B8]">Define cómo quieres que la Inteligencia Artificial interactúe con tus clientes.</p>
      </div>

      <div className="bg-[#0F0F1A] border border-[#1a1a2e] rounded-xl p-8 mb-8">
        <label className="block text-sm font-medium text-[#F8FAFC] mb-4">¿Cómo debe hablar tu asistente con los clientes?</label>
        <textarea 
          rows={6}
          value={aiTone}
          onChange={(e) => setAiTone(e.target.value)}
          className="w-full bg-[#05050A] border border-[#334155] rounded-lg px-4 py-3 text-[#F8FAFC] focus:border-[#06B6D4] outline-none resize-none transition-colors"
        />
        <p className="text-xs text-[#64748B] mt-3">Puedes personalizar esto más adelante desde Configuración.</p>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={() => setStep(1)} className="text-[#94A3B8] hover:text-[#F8FAFC] font-medium transition-colors">
          &larr; Atrás
        </button>
        <button 
          onClick={() => onNext({ working_hours: hours, ai_tone: aiTone })}
          className="px-8 py-3 rounded-full font-medium transition-all bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          Continuar &rarr;
        </button>
      </div>
    </div>
  )
}
