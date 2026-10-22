'use client'
import { useState } from 'react'
import { addToCart } from './cartBus'

/*
  The buy point. Variant rows that add to the one global cart — hosted
  by the shop grid (portaled into each card), /print, and project pages.
  Confirmation is quiet: the row says "Added ✓" and the nav count ticks.
*/

const money = (cents) =>
  `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`

export default function VariantRows({ slug, product }) {
  const [justAdded, setJustAdded] = useState(null)

  const add = (i) => {
    addToCart(slug, i)
    setJustAdded(i)
    setTimeout(() => setJustAdded((k) => (k === i ? null : k)), 1400)
  }

  if (product.soldOut) return <p className="shop-soldout-flag">Sold out</p>

  return (
    <div className="shop-variants">
      {product.variants.map((v, i) => (
        <button
          key={i}
          type="button"
          className="shop-variant"
          disabled={v.soldOut}
          onClick={() => add(i)}
        >
          <span className="shop-variant-label">{v.label}</span>
          <span className="shop-variant-price">{money(v.cents)}</span>
          <span className={`shop-variant-add${justAdded === i ? ' shop-variant-add--done' : ''}`}>
            {v.soldOut ? '' : justAdded === i ? 'Added ✓' : 'Add →'}
          </span>
        </button>
      ))}
    </div>
  )
}
