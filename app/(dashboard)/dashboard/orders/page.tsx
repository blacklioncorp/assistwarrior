import { createClient } from '@/lib/utils/server'
import { redirect } from 'next/navigation'
import { OrdersKanban } from './OrdersKanban'

export const metadata = { title: 'Órdenes' }
export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch orders (using appointments table for now)
  // Fetch all scheduled and confirmed orders, plus recent completed/cancelled
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayIso = yesterday.toISOString()

  const { data: rawOrders } = await supabase
    .from('appointments')
    .select('id, patient_name, patient_phone, title, starts_at, status, notes')
    .eq('professional_id', user.id)
    .gte('starts_at', yesterdayIso)
    .order('starts_at', { ascending: false })
    .limit(100)

  // Filter to keep active ones, or recently completed/cancelled
  const orders = (rawOrders || []).filter((order) => {
    if (order.status === 'scheduled' || order.status === 'confirmed') return true
    // If completed or cancelled, only show if from today
    const orderDate = new Date(order.starts_at)
    return orderDate > yesterday
  })

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-[1600px] mx-auto overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Tablero de Órdenes</h1>
          <p className="text-sm text-slate-400 mt-1">Gestiona los pedidos de tus clientes en tiempo real.</p>
        </div>
      </div>
      <OrdersKanban initialOrders={orders} />
    </div>
  )
}
