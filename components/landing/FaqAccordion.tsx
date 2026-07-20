"use client"

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: '¿Necesito saber programar para usar Senzio?',
    answer: 'No. El proceso completo de configuración está diseñado para que cualquier dueño de negocio lo haga en menos de 10 minutos desde el panel web. No se requieren conocimientos técnicos.',
  },
  {
    question: '¿Qué pasa si el bot no entiende una pregunta del cliente?',
    answer: 'El agente está entrenado para reconocer cuando una pregunta está fuera de su alcance. En esos casos escala automáticamente al dueño del negocio con un aviso por WhatsApp para que atienda personalmente.',
  },
  {
    question: '¿Puedo usar mi número de WhatsApp actual?',
    answer: 'Sí. Conectamos tu número de WhatsApp Business existente. Si aún no tienes uno, te guiamos paso a paso para activarlo sin costo.',
  },
  {
    question: '¿Cuánto tiempo tarda en estar funcionando?',
    answer: 'La configuración inicial toma menos de 10 minutos. En ese tiempo defines el perfil de tu negocio, conectas WhatsApp y el agente ya está listo para atender.',
  },
  {
    question: '¿Qué pasa con mis datos y los de mis clientes?',
    answer: 'Toda la información está cifrada de extremo a extremo y almacenada en servidores seguros. Senzio nunca comparte ni vende datos de tus clientes a terceros.',
  },
  {
    question: '¿Puedo cancelar en cualquier momento?',
    answer: 'Sí. No hay contratos de permanencia. Puedes cancelar tu plan desde el panel en cualquier momento y seguirás teniendo acceso hasta el fin del periodo pagado.',
  },
  {
    question: '¿Funciona para cualquier tipo de negocio?',
    answer: 'Actualmente Senzio tiene verticales preconfiguradas para clínicas médicas, despachos de abogados y restaurantes/comercios. Si tu negocio es de otro tipo, contáctanos — podemos evaluar una configuración personalizada.',
  }
]

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {faqs.map((faq, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-[#1a1a2e] bg-[#0F0F1A] overflow-hidden transition-all"
        >
          <button
            onClick={() => toggle(idx)}
            className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <span className={`text-base font-semibold transition-colors ${openIndex === idx ? 'text-purple-400' : 'text-[#F8FAFC]'}`}>
              {faq.question}
            </span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-purple-400' : 'text-slate-500'}`}
            />
          </button>
          
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-6 pb-5 pt-0 text-sm text-slate-400 leading-relaxed">
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
