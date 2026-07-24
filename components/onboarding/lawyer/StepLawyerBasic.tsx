import { useState } from 'react'
import { OnboardingImage } from '../OnboardingImage'

interface StepLawyerBasicProps {
  onNext: (data: any) => void
  onBack: () => void
}

const LEGAL_AREAS = ['Laboral', 'Civil', 'Penal', 'Familiar', 'Mercantil', 'Corporativo', 'Otro']
const MODALITIES = [
  { id: 'in_person', label: '🏢 Presencial' },
  { id: 'video_call', label: '💻 Videollamada' },
  { id: 'phone_call', label: '📞 Llamada telefónica' }
]

export function StepLawyerBasic({ onNext, onBack }: StepLawyerBasicProps) {
  const [name, setName] = useState('')
  const [firm, setFirm] = useState('')
  const [areas, setAreas] = useState<string[]>([])
  const [modalities, setModalities] = useState<string[]>([])

  const toggleArea = (area: string) => {
    setAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])
  }

  const toggleModality = (id: string) => {
    setModalities(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  const isValid = name.trim().length > 0 && firm.trim().length > 0 && areas.length > 0 && modalities.length > 0

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-6 flex flex-col md:flex-row gap-12 animate-in fade-in duration-500">
      
      <div className="w-full md:w-1/3">
        <OnboardingImage 
          src={process.env.NEXT_PUBLIC_IMG_ONBOARDING_ABOGADO}
          alt="Despacho de abogados"
          className="w-full aspect-[4/5] object-cover rounded-2xl sticky top-8"
        />
      </div>

      <div className="flex-1">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#F8FAFC] mb-3">Configura tu despacho</h2>
          <p className="text-[#94A3B8]">Danos los detalles para que el asistente canalice correctamente a los clientes.</p>
        </div>

        <div className="space-y-8 mb-10">
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Nombre completo del abogado</label>
            <input 
              type="text" 
              placeholder="Ej. Lic. María González Pérez" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-[#334155] rounded-lg px-4 py-3 text-[#F8FAFC] focus:border-[#06B6D4] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Nombre del despacho</label>
            <input 
              type="text" 
              placeholder="Ej. Bufete González & Asociados" 
              value={firm}
              onChange={e => setFirm(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-[#334155] rounded-lg px-4 py-3 text-[#F8FAFC] focus:border-[#06B6D4] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-3">Área(s) del derecho</label>
            <div className="flex flex-wrap gap-3">
              {LEGAL_AREAS.map(a => (
                <button
                  key={a}
                  onClick={() => toggleArea(a)}
                  className={`px-4 py-2 rounded-full border text-sm transition-colors ${areas.includes(a) ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#F8FAFC]' : 'bg-[#0F0F1A] border-[#334155] text-[#94A3B8] hover:border-[#475569]'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-3">Modalidades de atención</label>
            <div className="space-y-3">
              {MODALITIES.map(mode => (
                <label 
                  key={mode.id} 
                  onClick={() => toggleModality(mode.id)}
                  className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-colors ${modalities.includes(mode.id) ? 'border-[#06B6D4] bg-[#06B6D4]/10' : 'border-[#334155] bg-[#0F0F1A] hover:border-[#475569]'}`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${modalities.includes(mode.id) ? 'border-[#06B6D4] bg-[#06B6D4]' : 'border-[#64748B]'}`}>
                    {modalities.includes(mode.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-[#F8FAFC]">{mode.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-[#1a1a2e]">
          <button onClick={onBack} className="text-[#94A3B8] hover:text-[#F8FAFC] font-medium transition-colors">
            &larr; Atrás
          </button>
          <button 
            onClick={() => onNext({ full_name: name, clinic_name: firm, legal_areas: areas, modalities })}
            disabled={!isValid}
            className={`px-8 py-3 rounded-full font-medium transition-all ${isValid ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-[#334155] text-[#94A3B8] cursor-not-allowed'}`}
          >
            Continuar &rarr;
          </button>
        </div>

      </div>
    </div>
  )
}
