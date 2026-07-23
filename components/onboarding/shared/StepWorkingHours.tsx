import { useState, useEffect } from 'react'

export interface WorkingHours {
  [day: string]: { enabled: boolean; start: string; end: string }
}

const DEFAULT_HOURS: WorkingHours = {
  monday: { enabled: true, start: '09:00', end: '18:00' },
  tuesday: { enabled: true, start: '09:00', end: '18:00' },
  wednesday: { enabled: true, start: '09:00', end: '18:00' },
  thursday: { enabled: true, start: '09:00', end: '18:00' },
  friday: { enabled: true, start: '09:00', end: '14:00' },
  saturday: { enabled: false, start: '09:00', end: '13:00' },
  sunday: { enabled: false, start: '00:00', end: '00:00' }
}

const DAYS_ES: Record<string, string> = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo'
}

interface StepWorkingHoursProps {
  initialData?: WorkingHours
  onNext: (data: WorkingHours) => void
  onBack: () => void
}

export function StepWorkingHours({ initialData, onNext, onBack }: StepWorkingHoursProps) {
  const [hours, setHours] = useState<WorkingHours>(initialData || DEFAULT_HOURS)

  const handleToggle = (day: string) => {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }))
  }

  const handleChange = (day: string, field: 'start' | 'end', value: string) => {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#F8FAFC] mb-3">Horario de atención</h2>
        <p className="text-[#94A3B8]">Define los días y horas en que tu asistente podrá agendar citas.</p>
      </div>

      <div className="bg-[#0F0F1A] border border-[#1a1a2e] rounded-xl p-6 mb-10 divide-y divide-[#1a1a2e]">
        {Object.entries(hours).map(([day, config]) => (
          <div key={day} className="py-4 flex items-center justify-between gap-4">
            <label className="flex items-center gap-3 w-32 cursor-pointer">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${config.enabled ? 'bg-[#8B5CF6]' : 'bg-[#334155]'}`}>
                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${config.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={config.enabled} onChange={() => handleToggle(day)} />
              <span className="text-[#F8FAFC] font-medium">{DAYS_ES[day]}</span>
            </label>

            <div className={`flex items-center gap-3 transition-opacity ${config.enabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <input 
                type="time" 
                value={config.start} 
                onChange={(e) => handleChange(day, 'start', e.target.value)}
                className="bg-[#05050A] border border-[#334155] rounded-md px-3 py-2 text-[#F8FAFC] focus:border-[#06B6D4] outline-none" 
              />
              <span className="text-[#64748B]">—</span>
              <input 
                type="time" 
                value={config.end} 
                onChange={(e) => handleChange(day, 'end', e.target.value)}
                className="bg-[#05050A] border border-[#334155] rounded-md px-3 py-2 text-[#F8FAFC] focus:border-[#06B6D4] outline-none" 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-[#94A3B8] hover:text-[#F8FAFC] font-medium transition-colors">
          &larr; Atrás
        </button>
        <button 
          onClick={() => onNext(hours)}
          className="px-8 py-3 rounded-full font-medium bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          Continuar &rarr;
        </button>
      </div>
    </div>
  )
}
