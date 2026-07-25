import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { professional_id, patient_phone, patient_name, message, sender, conversation_id } = body

    if (!message || !sender) {
      return NextResponse.json({ success: false, error: 'Faltan parámetros: message o sender' }, { status: 400 })
    }
    if (!conversation_id && (!professional_id || !patient_phone)) {
      return NextResponse.json(
        { success: false, error: 'Se requiere conversation_id, O BIEN professional_id y patient_phone' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    let finalConversationId = conversation_id
    let finalProfessionalId = professional_id

    if (!finalConversationId) {
      // 1. Verificar o crear paciente
      let patientId: string

      const { data: existingPatient, error: e1 } = await admin
        .from('patients')
        .select('id')
        .eq('professional_id', professional_id)
        .eq('phone_whatsapp', patient_phone)
        .maybeSingle()

      if (e1) throw new Error('Error al buscar paciente: ' + e1.message)

      if (existingPatient) {
        patientId = existingPatient.id
      } else {
        const { data: newPatient, error: patientError } = await admin
          .from('patients')
          .insert({
            professional_id,
            full_name: patient_name || 'Desconocido',
            phone_whatsapp: patient_phone,
          })
          .select('id')
          .single()

        if (patientError) throw new Error('Error al crear paciente: ' + patientError.message)
        patientId = newPatient.id
      }

      // 2. Verificar o crear conversación
      const { data: existingConversation, error: e2 } = await admin
        .from('conversations')
        .select('id, unread_count')
        .eq('professional_id', professional_id)
        .eq('patient_id', patientId)
        .maybeSingle()
        
      if (e2) throw new Error('Error al buscar conversación: ' + e2.message)

      if (existingConversation) {
        finalConversationId = existingConversation.id
        
        // Si el mensaje es del usuario, incrementar unread_count
        if (sender === 'user') {
          const { error: e3 } = await admin
            .from('conversations')
            .update({ unread_count: (existingConversation.unread_count ?? 0) + 1 })
            .eq('id', finalConversationId)
          if (e3) throw new Error('Error al actualizar unread_count: ' + e3.message)
        }
      } else {
        const { data: newConversation, error: convError } = await admin
          .from('conversations')
          .insert({
            professional_id,
            patient_id: patientId,
            patient_phone: patient_phone,
            patient_name: patient_name || 'Desconocido',
            unread_count: sender === 'user' ? 1 : 0,
          })
          .select('id')
          .single()

        if (convError) throw new Error('Error al crear conversación: ' + convError.message)
        finalConversationId = newConversation.id
      }
    } else {
      // Si ya me mandan el conversation_id, sacar el professional_id de ahí si no lo mandaron
      if (!finalProfessionalId) {
        const { data: convData } = await admin.from('conversations').select('professional_id').eq('id', finalConversationId).single()
        if (convData) finalProfessionalId = convData.professional_id
      }
    }

    // 3. Guardar el mensaje
    const { error: msgError } = await admin
      .from('messages')
      .insert({
        conversation_id: finalConversationId,
        professional_id: finalProfessionalId,
        sender,
        direction: sender === 'user' ? 'inbound' : 'outbound',
        content: message,
        created_at: new Date().toISOString(),
      })

    if (msgError) throw new Error('Error al guardar mensaje: ' + msgError.message)

    return NextResponse.json({ success: true, conversation_id: finalConversationId })
  } catch (err: any) {
    console.error('[n8n/chat POST]', err.message)
    return NextResponse.json(
      { success: false, error: err.message, stack: err.stack },
      { status: 500 }
    )
  }
}
