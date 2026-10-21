'use client'
import { useEffect } from 'react'

/** Landing here means Stripe confirmed payment — empty the cart. */
export default function ClearCart() {
  useEffect(() => {
    try { localStorage.removeItem('jkh-cart-v1') } catch {}
  }, [])
  return null
}
