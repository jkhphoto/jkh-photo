'use client'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

/*
  The whole shop interaction in one client island: product variant rows
  add to a localStorage cart, the cart is a right-hand sheet, checkout
  POSTs {slug, variant, qty} to /api/checkout and follows the Stripe
  URL. Prices shown here are from build-time content; the charge is
  priced server-side from the same content, so the two can't disagree
  for longer than a deploy.
*/

const KEY = 'jkh-cart-v1'

const money = (cents) =>
  `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export default function ShopClient({ products, shipping }) {
  const [cart, setCart] = useState([])
  const [open, setOpen] = useState(false)
  const [fulfillment, setFulfillment] = useState('ship')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cart = loadCart()
    // Deep link from a product page: /shop?add=slug.variantIndex lands
    // with the item in the cart and the sheet open — "Buy now" without
    // a detour. Ensure-don't-duplicate, then clean the URL.
    const m = new URLSearchParams(window.location.search).get('add')
    if (m) {
      const [slug, v] = m.split('.')
      const variant = Number(v) || 0
      if (!cart.find((l) => l.slug === slug && l.variant === variant)) {
        cart.push({ slug, variant, qty: 1 })
      }
      setOpen(true)
      window.history.replaceState(null, '', window.location.pathname)
    }
    setCart(cart)
  }, [])
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(cart)) } catch {}
  }, [cart])
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const byKey = (slug, variant) => (l) => l.slug === slug && l.variant === variant

  const [justAdded, setJustAdded] = useState(null)
  const add = (slug, variant) => {
    setCart((c) => {
      const hit = c.find(byKey(slug, variant))
      if (hit)
        return c.map((l) => (byKey(slug, variant)(l) ? { ...l, qty: Math.min(l.qty + 1, 10) } : l))
      return [...c, { slug, variant, qty: 1 }]
    })
    // Quiet confirmation at the point of click — the cart count ticks up
    // and the row says so. Opening the sheet on every add felt like being
    // marched to the till.
    setJustAdded(`${slug}:${variant}`)
    setTimeout(() => setJustAdded((k) => (k === `${slug}:${variant}` ? null : k)), 1400)
    setError(null)
  }
  const bump = (slug, variant, d) =>
    setCart((c) =>
      c
        .map((l) => (byKey(slug, variant)(l) ? { ...l, qty: l.qty + d } : l))
        .filter((l) => l.qty > 0),
    )

  const lines = useMemo(
    () =>
      cart
        .map((l) => {
          const p = products[l.slug]
          const v = p?.variants?.[l.variant]
          if (!p || !v) return null
          return { ...l, title: p.title, label: v.label, cents: v.cents }
        })
        .filter(Boolean),
    [cart, products],
  )
  const subtotal = lines.reduce((t, l) => t + l.cents * l.qty, 0)
  const shipCents = fulfillment === 'ship' ? shipping.flatCents : 0
  const count = lines.reduce((t, l) => t + l.qty, 0)

  const checkout = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          items: lines.map((l) => ({ slug: l.slug, variant: l.variant, qty: l.qty })),
          fulfillment,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 503) {
        setError("Checkout isn't live yet — email hello@josephkhale.com to order.")
      } else if (res.status === 409) {
        setError('Something in your cart just sold out. Remove it and try again.')
      } else if (!res.ok || !data.url) {
        setError("Couldn't start checkout — try again in a minute.")
      } else {
        window.location.href = data.url
        return
      }
    } catch {
      setError("Couldn't start checkout — try again in a minute.")
    }
    setBusy(false)
  }

  return (
    <>
      <button type="button" className="shop-cart-open" onClick={() => setOpen(true)}>
        Cart{count > 0 ? ` (${count})` : ''}
      </button>

      {Object.entries(products).map(([slug, p]) => (
        <ShopVariants key={slug} slug={slug} product={p} onAdd={add} justAdded={justAdded} />
      ))}

      {open && (
        <>
          <div className="cart-scrim" onClick={() => setOpen(false)} />
          <aside className="cart" aria-label="Cart">
            <div className="cart-head">
              <p className="cart-title">Cart</p>
              <button type="button" className="cart-close" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="cart-lines">
              {lines.length === 0 && <p className="cart-empty">Nothing in here yet.</p>}
              {lines.map((l) => (
                <div key={`${l.slug}:${l.variant}`} className="cart-line">
                  <span className="cart-line-name">{l.title}</span>
                  {l.label && <span className="cart-line-variant">{l.label}</span>}
                  <span className="cart-line-qty">
                    <button type="button" onClick={() => bump(l.slug, l.variant, -1)} aria-label="Fewer">−</button>
                    <span>{l.qty}</span>
                    <button type="button" onClick={() => bump(l.slug, l.variant, +1)} aria-label="More">+</button>
                  </span>
                  <span className="cart-line-price">{money(l.cents * l.qty)}</span>
                </div>
              ))}
            </div>

            {lines.length > 0 && (
              <>
                <div className="cart-fulfillment">
                  <button
                    type="button"
                    className={fulfillment === 'ship' ? 'on' : ''}
                    onClick={() => setFulfillment('ship')}
                  >
                    Ship (US)
                  </button>
                  {shipping.pickupEnabled && (
                    <button
                      type="button"
                      className={fulfillment === 'pickup' ? 'on' : ''}
                      onClick={() => setFulfillment('pickup')}
                    >
                      NYC pickup
                    </button>
                  )}
                </div>
                <div className="cart-totals">
                  <div className="cart-totals-row">
                    <span>Subtotal</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <div className="cart-totals-row">
                    <span>{fulfillment === 'ship' ? 'US shipping' : 'Pickup'}</span>
                    <span>{shipCents ? money(shipCents) : 'Free'}</span>
                  </div>
                  <div className="cart-totals-row total">
                    <span>Total</span>
                    <span>{money(subtotal + shipCents)}</span>
                  </div>
                </div>
                <button type="button" className="cart-checkout" onClick={checkout} disabled={busy}>
                  {busy ? 'One moment…' : 'Check out'}
                </button>
                {error && <p className="cart-note">{error}</p>}
                {!error && fulfillment === 'ship' && (
                  <p className="cart-note">US addresses only.</p>
                )}
              </>
            )}
          </aside>
        </>
      )}
    </>
  )
}

/**
 * Renders into the per-product slot the server page leaves open —
 * variant rows live inside each product card, but state lives up here.
 */
function ShopVariants({ slug, product, onAdd, justAdded }) {
  const [mount, setMount] = useState(null)
  useEffect(() => {
    setMount(document.getElementById(`shop-variants-${slug}`))
  }, [slug])
  if (!mount) return null
  return createPortal(
    <div className="shop-variants">
      {product.soldOut ? (
        <p className="shop-soldout-flag">Sold out</p>
      ) : (
        product.variants.map((v, i) => (
          <button
            key={i}
            type="button"
            className="shop-variant"
            disabled={v.soldOut}
            onClick={() => onAdd(slug, i)}
          >
            <span className="shop-variant-label">{v.label}</span>
            <span className="shop-variant-price">{money(v.cents)}</span>
            <span className={`shop-variant-add${justAdded === `${slug}:${i}` ? ' shop-variant-add--done' : ''}`}>
              {v.soldOut ? '' : justAdded === `${slug}:${i}` ? 'Added ✓' : 'Add →'}
            </span>
          </button>
        ))
      )}
    </div>,
    mount,
  )
}
