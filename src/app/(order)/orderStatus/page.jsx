'use client'
 
import OrderSuccess from '@/Components/order/OrderSuccess'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
 
const Page = () => {
  // ── LOGIC UNTOUCHED ─────────────────────────────────────────
  const router = useRouter()
  const search = useSearchParams()
  const orderId = search.get("oid")
  const orderNumber = search.get("num")
 
  useEffect(() => {
    if (!orderId || !orderNumber) { router.replace("/") }
  }, [orderId, orderNumber])
 
  if (!orderId) return null
  // ── END LOGIC ────────────────────────────────────────────────
 
  return (
    <OrderSuccess
      orderId={`${orderNumber}`}
      onTrack={() => router.push(`/orderDetails/${orderId}`)}
      onHome={() => router.push("/")}
    />
  )
}
 
export default Page
 
 