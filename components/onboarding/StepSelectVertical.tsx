import { useState } from 'react'
import { OnboardingImage } from './OnboardingImage'

interface StepSelectVerticalProps {
  onSelect: (vertical: 'restaurant' | 'medical' | 'lawyer') => void
}

export function StepSelectVertical({ onSelect }: StepSelectVerticalProps) {
  const [selectedMain, setSelectedMain] = useState<'restaurant' | 'professionals' | null>(null)
  const [selectedSub, setSelectedSub] = useState<'medical' | 'lawyer' | null>(null)

  const handleNext = () => {
    if (selectedMain === 'restaurant') {
      onSelect('restaurant')
    } else if (selectedMain === 'professionals' && selectedSub) {
      onSelect(selectedSub)
    }
  }

  const isNextEnabled = selectedMain === 'restaurant' || (selectedMain === 'professionals' && selectedSub !== null)

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#F8FAFC] mb-4">¡Bienvenido a Senzio!</h1>
        <p className="text-lg text-[#94A3B8]">¿Qué tipo de negocio te gustaría automatizar?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Restaurant Card */}
        <div
          className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
            selectedMain === 'restaurant' ? 'border-[#06B6D4] shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-[#1a1a2e] hover:border-[#334155]'
          }`}
          onClick={() => {
            setSelectedMain('restaurant')
            setSelectedSub(null)
          }}
        >
          <OnboardingImage
            src="https://fltidvkbnkyfwhiyjtlm.supabase.co/storage/v1/object/public/imagesandlogos/modal_restaurantes.jpg"
            alt="Restaurantes"
            className="w-full h-48 object-cover"
          />
          <div className="p-6 bg-[#05050A]">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-[#F8FAFC]">Pedidos para Restaurantes</h3>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMain === 'restaurant' ? 'border-[#06B6D4]' : 'border-[#64748B]'}`}>
                {selectedMain === 'restaurant' && <div className="w-3 h-3 rounded-full bg-[#06B6D4]" />}
              </div>
            </div>
            <p className="text-[#94A3B8] text-sm">
              Automatiza pedidos por WhatsApp para tu restaurante, taquería, cafetería o cualquier negocio de comida.
            </p>
          </div>
        </div>

        {/* Professionals Card */}
        <div
          className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
            selectedMain === 'professionals' ? 'border-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'border-[#1a1a2e] hover:border-[#334155]'
          }`}
          onClick={() => setSelectedMain('professionals')}
        >
          <OnboardingImage
            src="https://fltidvkbnkyfwhiyjtlm.supabase.co/storage/v1/object/public/imagesandlogos/modal_legales.jpg"
            alt="Profesionales"
            className="w-full h-48 object-cover"
          />
          <div className="p-6 bg-[#05050A]">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-[#F8FAFC]">Agendamiento de Citas</h3>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMain === 'professionals' ? 'border-[#8B5CF6]' : 'border-[#64748B]'}`}>
                {selectedMain === 'professionals' && <div className="w-3 h-3 rounded-full bg-[#8B5CF6]" />}
              </div>
            </div>
            <p className="text-[#94A3B8] text-sm">
              Agenda citas automáticamente para consultorios médicos, despachos de abogados y cualquier servicio profesional.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-selector inline para Profesionales */}
      {selectedMain === 'professionals' && (
        <div className="bg-[#0F0F1A] border border-[#1a1a2e] rounded-xl p-6 mb-10 max-w-2xl mx-auto animate-in slide-in-from-top-4 fade-in duration-300">
          <h4 className="text-[#F8FAFC] font-medium mb-4">¿Cuál es tu especialidad?</h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className={`flex-1 flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-colors ${selectedSub === 'medical' ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : 'border-[#334155] hover:border-[#475569]'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSub === 'medical' ? 'border-[#8B5CF6]' : 'border-[#64748B]'}`}>
                {selectedSub === 'medical' && <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />}
              </div>
              <span className="text-[#F8FAFC]">Médico / Consultorio</span>
            </label>
            <label className={`flex-1 flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-colors ${selectedSub === 'lawyer' ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : 'border-[#334155] hover:border-[#475569]'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSub === 'lawyer' ? 'border-[#8B5CF6]' : 'border-[#64748B]'}`}>
                {selectedSub === 'lawyer' && <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />}
              </div>
              <span className="text-[#F8FAFC]">Abogado / Despacho</span>
            </label>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleNext}
          disabled={!isNextEnabled}
          className={`px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2
            ${isNextEnabled 
              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
              : 'bg-[#334155] text-[#94A3B8] cursor-not-allowed'
            }`}
        >
          Siguiente &rarr;
        </button>
      </div>
    </div>
  )
}
