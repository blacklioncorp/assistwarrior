"use client"

import { useState } from "react"
import { createStripeCheckoutSession } from "@/app/actions"
import { Loader2 } from "lucide-react"

export function UpgradeButton() {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    const res = await createStripeCheckoutSession()
    if (res.url) {
      // In a real scenario with Stripe keys, this would be an actual URL
      if (res.url.startsWith('#')) {
        alert(res.warning || "Checkout URL received")
      } else {
        window.location.href = res.url
      }
    } else if (res.error) {
      alert(res.error)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1E4A8A] py-2.5 text-sm font-semibold text-white hover:bg-[#1a3f78] transition-colors shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? "Cargando..." : "Actualizar a Pro →"}
    </button>
  )
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false)

  async function handleManage() {
    setLoading(true)
    const res = await createStripeCheckoutSession() // Or createStripePortalSession
    if (res.url) {
      if (res.url.startsWith('#')) {
        alert(res.warning || "Portal URL received")
      } else {
        window.location.href = res.url
      }
    } else if (res.error) {
      alert(res.error)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="rounded-xl flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      Gestionar suscripción
    </button>
  )
}
