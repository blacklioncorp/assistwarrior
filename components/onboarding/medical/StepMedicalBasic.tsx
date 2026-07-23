import { useState } from 'react'
import { OnboardingImage } from '../OnboardingImage'

interface StepMedicalBasicProps {
  onNext: (data: any) => void
  onBack: () => void
}

const SPECIALTIES = ['Médico General', 'Dentista', 'Psicólogo', 'Nutriólogo', 'Ginecólogo', 'Pediatra', 'Otro']

export function StepMedicalBasic({ onNext, onBack }: StepMedicalBasicProps) {
  const [name, setName] = useState('')
  const [clinic, setClinic] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [duration, setDuration] = useState('30')

  const isValid = name.trim().length > 0 && clinic.trim().length > 0 && specialty.length > 0

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-6 flex flex-col md:flex-row gap-12 animate-in fade-in duration-500">
      
      <div className="w-full md:w-1/3">
        <OnboardingImage 
          src={process.env.NEXT_PUBLIC_IMG_ONBOARDING_MEDICO}
          alt="Consultorio Médico"
          className="w-full aspect-[4/5] object-cover rounded-2xl sticky top-8"
        />
      </div>

      <div className="flex-1">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#F8FAFC] mb-3">Configura tu consultorio</h2>
          <p className="text-[#94A3B8]">Ayúdanos a entender cómo funciona tu práctica médica.</p>
        </div>

        <div className="space-y-8 mb-10">
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Nombre completo del profesional</label>
            <input 
              type="text" 
              placeholder="Ej. Dr. Juan García López" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-[#334155] rounded-lg px-4 py-3 text-[#F8FAFC] focus:border-[#06B6D4] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Nombre de la clínica / consultorio</label>
            <input 
              type="text" 
              placeholder="Ej. Consultorio Dental García" 
              value={clinic}
              onChange={e => setClinic(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-[#334155] rounded-lg px-4 py-3 text-[#F8FAFC] focus:border-[#06B6D4] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-3">Especialidad principal</label>
            <div className="flex flex-wrap gap-3">
              {SPECIALTIES.map(s => (
                <button
                  key={s}
                  onClick={() => setSpecialty(s)}
                  className={`px-4 py-2 rounded-full border text-sm transition-colors ${specialty === s ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#F8FAFC]' : 'bg-[#0F0F1A] border-[#334155] text-[#94A3B8] hover:border-[#475569]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-3">Duración estándar de la consulta</label>
            <div className="flex flex-wrap gap-4">
              {['15', '30', '45', '60'].map(mins => (
                <label key={mins} className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer border transition-colors ${duration === mins ? 'border-[#06B6D4] bg-[#06B6D4]/10' : 'border-[#334155] bg-[#0F0F1A] hover:border-[#475569]'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${duration === mins ? 'border-[#06B6D4]' : 'border-[#64748B]'}`}>
                    {duration === mins && <div className="w-2 h-2 rounded-full bg-[#06B6D4]" />}
                  </div>
                  <span className="text-[#F8FAFC]">{mins} min</span>
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
            onClick={() => onNext({ full_name: name, clinic_name: clinic, specialty, duration_minutes: parseInt(duration) })}
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
