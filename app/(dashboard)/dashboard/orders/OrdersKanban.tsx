'use client'

import { useState } from 'react'
import { createClient } from '@/lib/utils/client'
import { formatTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, XCircle, ChefHat, Phone, MapPin, CreditCard } from 'lucide-react'
import { toast } from 'react-hot-toast'

type OrderStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled'

interface Order {
  id: string
  patient_name: string
  patient_phone: string | null
  title: string
  starts_at: string
  status: OrderStatus
  notes: string | null
}

interface OrdersKanbanProps {
  initialOrders: Order[]
}

const columns: { id: OrderStatus; label: string; icon: any; color: string }[] = [
  { id: 'scheduled', label: 'Nuevos', icon: Clock, color: 'text-amber-400' },
  { id: 'confirmed', label: 'En Preparación', icon: ChefHat, color: 'text-blue-400' },
  { id: 'completed', label: 'Entregados', icon: CheckCircle2, color: 'text-emerald-400' },
  { id: 'cancelled', label: 'Cancelados', icon: XCircle, color: 'text-rose-400' },
]

export function OrdersKanban({ initialOrders }: OrdersKanbanProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const supabase = createClient()

  const updateOrderStatus = async (orderId: string, action: string) => {
    try {
      setLoadingId(orderId)
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('No user')

      const res = await fetch('/api/n8n/appointments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_N8N_API_KEY}`,
        },
        body: JSON.stringify({
          appointment_id: orderId,
          professional_id: userData.user.id,
          action,
        }),
      })

      if (!res.ok) {
        throw new Error('Error updating order')
      }

      // Map action to status
      let newStatus: OrderStatus = 'scheduled'
      if (action === 'confirm') newStatus = 'confirmed'
      if (action === 'complete') newStatus = 'completed'
      if (action === 'cancel') newStatus = 'cancelled'

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      toast.success('Estado actualizado')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo actualizar el estado')
    } finally {
      setLoadingId(null)
    }
  }

  // Helper to parse the reason string from n8n (Order details | Delivery | Payment | Address)
  const parseOrderDetails = (title: string) => {
    const parts = title.split(' | ')
    return {
      details: parts[0] || title,
      delivery: parts[1] || 'No especificado',
      payment: parts[2] ? parts[2].replace('Pago: ', '') : 'No especificado',
      address: parts[3] ? parts[3].replace('Entrega: ', '') : 'No especificado',
    }
  }

  return (
    <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colOrders = orders.filter((o) => o.status === col.id)
        return (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col bg-slate-900/50 rounded-xl border border-slate-800/60 overflow-hidden h-full">
            <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <col.icon className={`w-4 h-4 ${col.color}`} />
                <h3 className="font-semibold text-slate-100">{col.label}</h3>
              </div>
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                {colOrders.length}
              </Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {colOrders.map((order) => {
                const parsed = parseOrderDetails(order.title)
                const isLoading = loadingId === order.id

                return (
                  <div key={order.id} className={`card-dark p-4 flex flex-col gap-3 relative ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-100 text-sm">{order.patient_name}</p>
                        <p className="text-xs font-medium text-purple-400">{formatTime(order.starts_at)}</p>
                      </div>
                      <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">
                        {parsed.delivery}
                      </Badge>
                    </div>

                    <div className="text-sm text-slate-300 bg-slate-900/50 p-2 rounded-md border border-slate-800/50">
                      {parsed.details}
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs text-slate-400">
                      {order.patient_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span className="truncate">{order.patient_phone}</span>
                        </div>
                      )}
                      {parsed.address !== 'No especificado' && (
                        <div className="flex items-center gap-2 text-amber-200/80">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{parsed.address}</span>
                        </div>
                      )}
                      {parsed.payment !== 'No especificado' && (
                        <div className="flex items-center gap-2 text-emerald-200/80">
                          <CreditCard className="w-3 h-3 shrink-0" />
                          <span className="truncate">{parsed.payment}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-slate-800/60">
                      {order.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'confirm')}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-1.5 rounded-md transition-colors"
                          >
                            Preparar
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancel')}
                            className="flex-1 bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400 text-xs font-medium py-1.5 rounded-md transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'complete')}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium py-1.5 rounded-md transition-colors"
                          >
                            Entregar
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'revert_to_scheduled')}
                            className="flex-none px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium py-1.5 rounded-md transition-colors"
                            title="Regresar a Nuevos"
                          >
                            ←
                          </button>
                        </>
                      )}

                      {(order.status === 'completed' || order.status === 'cancelled') && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'revert_to_scheduled')}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium py-1.5 rounded-md transition-colors"
                        >
                          Reabrir orden
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {colOrders.length === 0 && (
                <div className="h-24 flex items-center justify-center text-sm text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  Sin órdenes
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
