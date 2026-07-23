import { useState } from 'react'
import { OnboardingImage } from '../OnboardingImage'

interface StepConnectWhatsAppProps {
  onNext: (data: any) => void
  onBack: () => void
  onSkip: () => void
}

export function StepConnectWhatsApp({ onNext, onBack, onSkip }: StepConnectWhatsAppProps) {
  const [phone, setPhone] = useState('')
  const [metaId, setMetaId] = useState('')
  const [notificationPhone, setNotificationPhone] = useState('')

  const handleNext = () => {
    onNext({
      whatsapp_phone_number: phone,
      whatsapp_meta_id: metaId,
      orders_notification_phone: notificationPhone
    })
  }

  const isValid = phone.length > 5 && metaId.length > 5 && notificationPhone.length > 5

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6 flex flex-col md:flex-row gap-10 items-center animate-in fade-in duration-500">
      
      <div className="flex-1">
        <OnboardingImage 
          src={process.env.NEXT_PUBLIC_IMG_ONBOARDING_WHATSAPP}
          alt="Conectar WhatsApp"
          className="w-full max-w-md mx-auto aspect-square object-cover rounded-2xl"
        />
      </div>

      <div className="flex-1 w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#F8FAFC] mb-3">Conecta tu WhatsApp</h2>
          <p className="text-[#94A3B8]">Vincula tu cuenta de Meta Business para que tu asistente pueda chatear con los clientes.</p>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Número de WhatsApp público</label>
            <input 
              type="text" 
              placeholder="Ej. 52155XXXXXXXX" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-[#334155] rounded-lg px-4 py-3 text-[#F8FAFC] focus:border-[#06B6D4] outline-none transition-colors"
            />
            <p className="text-xs text-[#64748B] mt-1">El número que tus clientes usan para hacer pedidos.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Phone Number ID de Meta</label>
            <input 
              type="text" 
              placeholder="Ej. 1029384756..." 
              value={metaId}
              onChange={e => setMetaId(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-[#334155] rounded-lg px-4 py-3 text-[#F8FAFC] focus:border-[#06B6D4] outline-none transition-colors"
            />
            <p className="text-xs text-[#64748B] mt-1">Lo encuentras en Meta Business → WhatsApp → Configuración de número.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-2">Número para notificaciones de pedidos</label>
            <input 
              type="text" 
              placeholder="Ej. 52155XXXXXXXX" 
              value={notificationPhone}
              onChange={e => setNotificationPhone(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-[#334155] rounded-lg px-4 py-3 text-[#F8FAFC] focus:border-[#06B6D4] outline-none transition-colors"
            />
            <p className="text-xs text-[#64748B] mt-1">Este número recibe un WhatsApp interno cada vez que llega un pedido nuevo.</p>
          </div>
        </div>

        <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-lg p-4 mb-8">
          <p className="text-[#94A3B8] text-sm">
            📋 Para conectar tu WhatsApp necesitarás acceso a Meta Business Manager. 
            Puedes omitir este paso y conectarlo después desde Configuración → Integraciones.
          </p>
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
