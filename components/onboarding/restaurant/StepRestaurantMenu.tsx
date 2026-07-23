import { useState } from 'react'

interface StepRestaurantMenuProps {
  onNext: (data: any) => void
  onBack: () => void
  onSkip: () => void
}

export function StepRestaurantMenu({ onNext, onBack, onSkip }: StepRestaurantMenuProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'builder'>('image')
  const [imageUrl, setImageUrl] = useState('')

  const handleNext = () => {
    onNext({ menu_image_url: imageUrl })
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500">
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#F8FAFC] mb-3">Tu menú</h2>
        <p className="text-[#94A3B8]">Sube una foto de tu menú o créalo paso a paso para que la IA lo entienda.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-[#0F0F1A] border border-[#1a1a2e] p-1 rounded-lg inline-flex">
          <button 
            onClick={() => setActiveTab('image')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'image' ? 'bg-[#1a1a2e] text-[#F8FAFC] shadow-sm' : 'text-[#64748B] hover:text-[#94A3B8]'}`}
          >
            Subir Imagen
          </button>
          <button 
            onClick={() => setActiveTab('builder')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'builder' ? 'bg-[#1a1a2e] text-[#F8FAFC] shadow-sm' : 'text-[#64748B] hover:text-[#94A3B8]'}`}
          >
            Constructor de Menú
          </button>
        </div>
      </div>

      <div className="bg-[#0F0F1A] border border-[#1a1a2e] rounded-xl p-8 mb-8 min-h-[300px]">
        {activeTab === 'image' ? (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-[#334155] rounded-lg p-10 hover:border-[#8B5CF6] transition-colors cursor-pointer bg-[#05050A]">
            <div className="w-16 h-16 bg-[#1a1a2e] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <h3 className="text-[#F8FAFC] font-medium mb-1">Arrastra tu menú aquí o haz clic para seleccionar</h3>
            <p className="text-[#64748B] text-sm">Formatos soportados: JPG, PNG, PDF. Máximo 5MB.</p>
            
            {/* Campo temporal para simular URL en el wizard por ahora */}
            <div className="mt-6 w-full max-w-md">
              <input 
                type="text" 
                placeholder="O pega una URL directa por ahora..." 
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full bg-[#0F0F1A] border border-[#334155] rounded-lg px-4 py-2 text-sm text-[#F8FAFC] focus:border-[#06B6D4] outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-16 h-16 bg-[#1a1a2e] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#06B6D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <h3 className="text-[#F8FAFC] font-medium mb-2">Constructor Avanzado</h3>
            <p className="text-[#94A3B8] max-w-md mx-auto mb-6">Podrás crear categorías y platillos con precios y variantes desde la sección de Configuración una vez termines de configurar tu cuenta.</p>
            <button onClick={onSkip} className="px-6 py-2 border border-[#334155] rounded-md text-[#F8FAFC] hover:bg-[#1a1a2e] transition-colors">
              Configurarlo más tarde
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-[#94A3B8] hover:text-[#F8FAFC] font-medium transition-colors">
          &larr; Atrás
        </button>
        <div className="flex gap-4">
          <button onClick={onSkip} className="px-6 py-3 rounded-full font-medium text-[#94A3B8] hover:bg-[#1a1a2e] transition-colors">
            Omitir por ahora
          </button>
          <button 
            onClick={handleNext}
            className="px-8 py-3 rounded-full font-medium transition-all bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            Continuar &rarr;
          </button>
        </div>
      </div>

    </div>
  )
}
