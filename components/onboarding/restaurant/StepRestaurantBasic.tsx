import { useState } from 'react'
import { OnboardingImage } from '../OnboardingImage'

interface StepRestaurantBasicProps {
  onNext: (data: any) => void
  onBack: () => void
}

const CUISINES = ['🌮 Tacos / Antojitos', '🍔 Comida Rápida', '☕ Cafetería & Postres', '🍣 Sushi / Asiática', 'Otro']
const SERVICE_MODES = [
  { id: 'dine_in', label: '🍽️ Servir en local' },
  { id: 'takeaway', label: '🛍️ Para llevar (Pick up)' },
  { id: 'delivery', label: '🛵 A domicilio (Delivery)' }
]

export function StepRestaurantBasic({ onNext, onBack }: StepRestaurantBasicProps) {
  const [name, setName] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [modes, setModes] = useState<string[]>([])
  const [currency, setCurrency] = useState('MXN')

  const toggleMode = (id: string) => {
    setModes(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  const isValid = name.trim().length > 0 && cuisine.length > 0 && modes.length > 0

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-6 flex flex-col md:flex-row gap-12 animate-in fade-in duration-500">
      
      <div className="w-full md:w-1/3">
        <OnboardingImage 
          src="https://fltidvkbnkyfwhiyjtlm.supabase.co/storage/v1/object/public/imagesandlogos/modal_restaurantes.jpg"
          alt="Restaurante"
          className="w-full aspect-[4/5] object-cover rounded-2xl sticky top-8"
        />
      </div>

      <div className="flex-1">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#F8FAFC] mb-3">Configura tu asistente</h2>
          <p className="text-[#94A3B8]">Empecemos con la información básica de tu negocio.</p>
        </div>

        <div className="space-y-8 mb-10">
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Nombre del restaurante / negocio</label>
            <input 
              type="text" 
              placeholder="Ej. Taquería El Pastor" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-[#334155] rounded-lg px-4 py-3 text-[#F8FAFC] focus:border-[#06B6D4] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-3">Tipo de cocina o especialidad</label>
            <div className="flex flex-wrap gap-3">
              {CUISINES.map(c => (
                <button
                  key={c}
                  onClick={() => setCuisine(c)}
                  className={`px-4 py-2 rounded-full border text-sm transition-colors ${cuisine === c ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#F8FAFC]' : 'bg-[#0F0F1A] border-[#334155] text-[#94A3B8] hover:border-[#475569]'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-3">¿Cómo atiendes a tus clientes?</label>
            <div className="space-y-3">
              {SERVICE_MODES.map(mode => (
                <label 
                  key={mode.id} 
                  onClick={() => toggleMode(mode.id)}
                  className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-colors ${modes.includes(mode.id) ? 'border-[#06B6D4] bg-[#06B6D4]/10' : 'border-[#334155] bg-[#0F0F1A] hover:border-[#475569]'}`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${modes.includes(mode.id) ? 'border-[#06B6D4] bg-[#06B6D4]' : 'border-[#64748B]'}`}>
                    {modes.includes(mode.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-[#F8FAFC]">{mode.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Moneda local</label>
            <select 
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full md:w-1/2 bg-[#0F0F1A] border border-[#334155] rounded-lg px-4 py-3 text-[#F8FAFC] focus:border-[#06B6D4] outline-none transition-colors appearance-none"
            >
              <option value="MXN">MXN ($)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="COP">COP ($)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-[#1a1a2e]">
          <button onClick={onBack} className="text-[#94A3B8] hover:text-[#F8FAFC] font-medium transition-colors">
            &larr; Atrás
          </button>
          <button 
            onClick={() => onNext({ business_name: name, cuisine_type: cuisine, service_modes: modes, currency })}
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
