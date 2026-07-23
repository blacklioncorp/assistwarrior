import { useState } from 'react'
import { OnboardingImage } from '../OnboardingImage'

interface StepMedicalIntegrationsProps {
  onNext: (data: any) => void
  onBack: () => void
  onSkip: () => void
  title?: string
}

export function StepMedicalIntegrations({ onNext, onBack, onSkip, title = "Conecta tus herramientas" }: StepMedicalIntegrationsProps) {
  const [phone, setPhone] = useState('')
  const [metaId, setMetaId] = useState('')
  const [calendarEmail, setCalendarEmail] = useState('')

  const handleNext = () => {
    onNext({
      whatsapp_phone_number: phone,
      whatsapp_meta_id: metaId,
      google_calendar_email: calendarEmail
    })
  }

  const isValid = phone.length > 5 && metaId.length > 5 && calendarEmail.length > 5 && calendarEmail.includes('@')

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6 flex flex-col md:flex-row gap-10 items-start animate-in fade-in duration-500">
      
      <div className="flex-1 sticky top-8">
        <OnboardingImage 
          src={process.env.NEXT_PUBLIC_IMG_ONBOARDING_WHATSAPP}
          alt="Conectar Integraciones"
          className="w-full max-w-md mx-auto aspect-square object-cover rounded-2xl"
        />
      </div>

      <div className="flex-1 w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#F8FAFC] mb-3">{title}</h2>
          <p className="text-[#94A3B8]">Vincula tu WhatsApp y Google Calendar para automatizar tu agenda.</p>
        </div>

        {/* Sección WhatsApp */}
        <div className="bg-[#0F0F1A] border border-[#1a1a2e] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-medium text-[#F8FAFC] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#06B6D4]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            WhatsApp Business API
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#F8FAFC] mb-1">Número público (con código de país)</label>
              <input 
                type="text" 
                placeholder="Ej. 52155XXXXXXXX" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-[#05050A] border border-[#334155] rounded-lg px-3 py-2 text-[#F8FAFC] focus:border-[#06B6D4] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F8FAFC] mb-1">Meta Phone Number ID</label>
              <input 
                type="text" 
                placeholder="Ej. 1029384756" 
                value={metaId}
                onChange={e => setMetaId(e.target.value)}
                className="w-full bg-[#05050A] border border-[#334155] rounded-lg px-3 py-2 text-[#F8FAFC] focus:border-[#06B6D4] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sección Google Calendar */}
        <div className="bg-[#0F0F1A] border border-[#1a1a2e] rounded-xl p-6 mb-8">
          <h3 className="text-lg font-medium text-[#F8FAFC] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#8B5CF6]" fill="currentColor" viewBox="0 0 24 24"><path d="M16.924 2.85h-1.42V1.424A1.424 1.424 0 0 0 14.08 0a1.425 1.425 0 0 0-1.424 1.424V2.85h-1.314V1.424A1.424 1.424 0 0 0 9.919 0a1.425 1.425 0 0 0-1.424 1.424V2.85H7.18V1.424A1.424 1.424 0 0 0 5.757 0 1.425 1.425 0 0 0 4.333 1.424V2.85H2.912A2.915 2.915 0 0 0 0 5.764v15.324A2.915 2.915 0 0 0 2.912 24h14.012A2.915 2.915 0 0 0 19.836 21.088V5.764a2.915 2.915 0 0 0-2.912-2.914zM18.423 21.088a1.5 1.5 0 0 1-1.5 1.5H2.912a1.5 1.5 0 0 1-1.5-1.5V9.458h17.011zm0-13.04H1.412V5.764a1.5 1.5 0 0 1 1.5-1.5h1.42v1.425a1.425 1.425 0 0 0 2.85 0V4.264h1.314v1.425a1.425 1.425 0 0 0 2.849 0V4.264h1.314v1.425a1.425 1.425 0 0 0 2.85 0V4.264h1.42a1.5 1.5 0 0 1 1.5 1.5z"/></svg>
            Google Calendar
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#F8FAFC] mb-1">Tu correo de Google (Gmail / Workspace)</label>
              <input 
                type="email" 
                placeholder="tu@gmail.com" 
                value={calendarEmail}
                onChange={e => setCalendarEmail(e.target.value)}
                className="w-full bg-[#05050A] border border-[#334155] rounded-lg px-3 py-2 text-[#F8FAFC] focus:border-[#8B5CF6] outline-none"
              />
            </div>
            <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-lg p-3">
              <p className="text-[#94A3B8] text-sm">
                📅 Comparte tu calendario con <strong className="text-[#F8FAFC]">senzio-calendario@gmail.com</strong> con permisos de "Realizar cambios" para que el asistente agende citas por ti.
              </p>
            </div>
          </div>
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
              disabled={!isValid}
              className={`px-8 py-3 rounded-full font-medium transition-all ${isValid ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-[#334155] text-[#94A3B8] cursor-not-allowed'}`}
            >
              Continuar &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
