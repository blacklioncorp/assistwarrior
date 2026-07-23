import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Bot, Check, CheckCheck } from 'lucide-react'

export const metadata = { title: 'Conversación' }

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const conversationId = params.id

  // Fetch the conversation info
  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, patient_name, patient_phone')
    .eq('id', conversationId)
    .eq('professional_id', user.id)
    .single()

  if (!conversation) {
    redirect('/dashboard/messages')
  }

  // Clear unread count when opening the conversation
  await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId)
    .eq('professional_id', user.id)

  // Fetch all messages for this conversation
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  const name = conversation.patient_name ?? conversation.patient_phone

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl border border-slate-900 bg-[#0F0F1A] rounded-2xl overflow-hidden shadow-card">
      
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-900 bg-[#05050A]">
        <Link 
          href="/dashboard/messages"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
            {name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">{name}</h2>
            <p className="text-xs text-slate-500">{conversation.patient_phone}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[url('/img/wa-bg.png')] bg-repeat" style={{ backgroundSize: '400px' }}>
        {messages?.map((msg) => {
          const isMe = msg.sender === 'bot' || msg.sender === 'professional'
          const time = new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm relative ${
                isMe 
                  ? 'bg-emerald-900/60 text-emerald-50 border border-emerald-800/50 rounded-tr-none' 
                  : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-tl-none'
              }`}>
                
                {/* Optional: Add a small icon to distinguish bot vs manual if needed, but simple is better */}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                
                <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-emerald-400/80' : 'text-slate-500'}`}>
                  <span className="text-[10px]">{time}</span>
                  {isMe && (
                    <CheckCheck className="h-3 w-3 text-cyan-400" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {(!messages || messages.length === 0) && (
          <div className="flex items-center justify-center h-full text-sm text-slate-500 bg-slate-900/50 rounded-xl p-4 mx-auto max-w-sm text-center">
            Esta conversación no tiene mensajes almacenados.
          </div>
        )}
      </div>

      {/* Footer (Read Only Note) */}
      <div className="px-5 py-3 border-t border-slate-900 bg-slate-900/50">
        <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Bot className="h-4 w-4 text-purple-400" />
          Las respuestas son generadas y enviadas automáticamente por tu asistente IA.
        </p>
      </div>

    </div>
  )
}
