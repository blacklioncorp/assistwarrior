import { useState } from 'react'
import { OnboardingImage } from './OnboardingImage'

interface StepCompleteProps {
  vertical: 'restaurant' | 'medical' | 'lawyer'
  data: Record<string, any>
  onFinish: () => void
}

export function StepComplete({ vertical, data, onFinish }: StepCompleteProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFinish = async () => {
    setIsSubmitting(true)
    await onFinish()
  }

  // Textos y configuraciones por vertical
  let title = "¡Tu asistente está listo!"
  let subtitle = ""
  let items: { label: string; value: string; status: 'done' | 'warning' }[] = []

  if (vertical === 'restaurant') {
    title = "¡Tu asistente de pedidos está listo!"
    subtitle = `Hemos configurado ${data.business_name || 'tu negocio'} para empezar a recibir pedidos por WhatsApp automáticamente.`
    items = [
      { label: 'Tipo de negocio', value: 'Restaurante', status: 'done' },
      { label: 'Nombre', value: data.business_name, status: 'done' },
      { label: 'Modalidades', value: `${data.service_modes?.length || 0} seleccionadas`, status: 'done' },
      { label: 'Menú', value: data.menu_image_url ? 'Configurado' : 'Pendiente', status: data.menu_image_url ? 'done' : 'warning' },
      { label: 'WhatsApp', value: data.whatsapp_phone_number ? 'Conectado' : 'Pendiente', status: data.whatsapp_phone_number ? 'done' : 'warning' },
    ]
  } else if (vertical === 'medical') {
    title = "¡Tu consultorio está listo para agendar!"
    subtitle = `Hemos configurado ${data.clinic_name || 'tu clínica'} para que el asistente maneje tu agenda.`
    items = [
      { label: 'Especialidad', value: data.specialty, status: 'done' },
      { label: 'Profesional', value: data.full_name, status: 'done' },
      { label: 'Horario', value: 'Configurado', status: 'done' },
      { label: 'Google Calendar', value: data.google_calendar_email ? 'Conectado' : 'Pendiente', status: data.google_calendar_email ? 'done' : 'warning' },
      { label: 'WhatsApp', value: data.whatsapp_phone_number ? 'Conectado' : 'Pendiente', status: data.whatsapp_phone_number ? 'done' : 'warning' },
    ]
  } else if (vertical === 'lawyer') {
    title = "¡Tu despacho está listo para recibir clientes!"
    subtitle = `Hemos configurado ${data.clinic_name || 'tu firma'} para que el asistente guíe a tus clientes.`
    items = [
      { label: 'Áreas legales', value: `${data.legal_areas?.length || 0} configuradas`, status: 'done' },
      { label: 'Abogado', value: data.full_name, status: 'done' },
      { label: 'Horario', value: 'Configurado', status: 'done' },
      { label: 'Google Calendar', value: data.google_calendar_email ? 'Conectado' : 'Pendiente', status: data.google_calendar_email ? 'done' : 'warning' },
      { label: 'WhatsApp', value: data.whatsapp_phone_number ? 'Conectado' : 'Pendiente', status: data.whatsapp_phone_number ? 'done' : 'warning' },
    ]
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6 flex flex-col md:flex-row gap-12 items-center animate-in fade-in zoom-in-95 duration-700">
      
      <div className="w-full md:w-1/2">
        <OnboardingImage 
          src={process.env.NEXT_PUBLIC_IMG_ONBOARDING_COMPLETE}
          alt="Configuración completada"
          className="w-full aspect-square object-cover rounded-2xl"
        />
      </div>

      <div className="flex-1 w-full">
        <div className="mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] mb-6">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-[#F8FAFC] mb-3">{title}</h2>
          <p className="text-[#94A3B8]">{subtitle}</p>
        </div>

        <div className="bg-[#0F0F1A] border border-[#1a1a2e] rounded-xl p-6 mb-10 divide-y divide-[#1a1a2e]">
          {items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <span className="text-[#94A3B8]">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className={item.status === 'done' ? 'text-[#F8FAFC]' : 'text-amber-400'}>{item.value}</span>
                {item.status === 'done' ? (
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={handleFinish}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'bg-[#334155] text-[#94A3B8] cursor-wait' : 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:opacity-90 shadow-[0_0_20px_rgba(6,182,212,0.4)]'}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Configurando tu espacio...
              </>
            ) : (
              'Ir a mi dashboard →'
            )}
          </button>
          
          <button 
            onClick={handleFinish}
            disabled={isSubmitting}
            className="text-[#64748B] hover:text-[#94A3B8] text-sm underline transition-colors"
          >
            Configurar el resto más tarde
          </button>
        </div>

      </div>
    </div>
  )
}
