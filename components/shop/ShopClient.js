'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import VariantRows from './VariantRows'
import { openCart, readCartCount } from './cartBus'

/*
  The shop page's client shell. Cart state and the sheet live in the
  global Cart (mounted in the layout); this just hosts the page's buy
  points — variant rows portaled into each product card's slot — and a
  header button that opens the shared sheet.
*/

export default function ShopClient({ products }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(readCartCount())
    const onChanged = (e) => setCount(e.detail.count)
    window.addEventListener('jkh:cart:changed', onChanged)
    return () => window.removeEventListener('jkh:cart:changed', onChanged)
  }, [])

  return (
    <>
      <button type="button" className="shop-cart-open" onClick={openCart}>
        Cart{count > 0 ? ` (${count})` : ''}
      </button>
      {Object.entries(products).map(([slug, p]) => (
        <ShopVariants key={slug} slug={slug} product={p} />
      ))}
    </>
  )
}

/**
 * Renders into the per-product slot the server page leaves open —
 * variant rows live inside each product card.
 */
function ShopVariants({ slug, product }) {
  const [mount, setMount] = useState(null)
  useEffect(() => {
    setMount(document.getElementById(`shop-variants-${slug}`))
  }, [slug])
  if (!mount) return null
  return createPortal(<VariantRows slug={slug} product={product} />, mount)
}
