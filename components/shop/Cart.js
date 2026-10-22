'use client'
import { useEffect, useMemo, useState } from 'react'
import { CART_KEY, announceCart } from './cartBus'

/*
  The one cart. Mounted once in the root layout so every page — shop,
  /print, project pages — shares the same sheet, the same localStorage
  state, the same checkout. Buy points dispatch jkh:cart:add; the nav
  badge listens to jkh:cart:changed.

  Needs the catalog to price lines; fetches /shop-catalog.json once on
  first use (it's a tiny static file on the same origin, cached hard).
*/

const money = (cents) =>
  `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

export default function Cart() {
  const [cart, setCart] = useState([])
  const [open, setOpen] = useState(false)
  const [catalog, setCatalog] = useState(null)
  const [fulfillment, setFulfillment] = useState('ship')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  // Boot: load state, honour /shop?add=slug.variant deep links.
  useEffect(() => {
    const c = loadCart()
    const m = new URLSearchParams(window.location.search).get('add')
    if (m) {
      const [slug, v] = m.split('.')
      const variant = Number(v) || 0
      if (!c.find((l) => l.slug === slug && l.variant === variant)) {
        c.push({ slug, variant, qty: 1 })
      }
      setOpen(true)
      window.history.replaceState(null, '', window.location.pathname)
    }
    setCart(c)
  }, [])

  // Persist + announce on every change.
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)) } catch {}
    announceCart(cart.reduce((t, l) => t + l.qty, 0))
  }, [cart])

  // The bus: adds and opens arrive from anywhere on the site.
  useEffect(() => {
    const onAdd = (e) => {
      const { slug, variant } = e.detail
      setCart((c) => {
        const hit = c.find((l) => l.slug === slug && l.variant === variant)
        if (hit)
          return c.map((l) =>
            l.slug === slug && l.variant === variant
              ? { ...l, qty: Math.min(l.qty + 1, 10) }
              : l,
          )
        return [...c, { slug, variant, qty: 1 }]
      })
      setError(null)
    }
    const onOpen = () => setOpen(true)
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('jkh:cart:add', onAdd)
    window.addEventListener('jkh:cart:open', onOpen)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('jkh:cart:add', onAdd)
      window.removeEventListener('jkh:cart:open', onOpen)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  // Catalog, fetched lazily the first time the sheet opens or cart has lines.
  useEffect(() => {
    if (catalog || (cart.length === 0 && !open)) return
    fetch('/shop-catalog.json')
      .then((r) => r.json())
      .then(setCatalog)
      .catch(() => {})
  }, [open, cart.length, catalog])

  const bump = (slug, variant, d) =>
    setCart((c) =>
      c
        .map((l) => (l.slug === slug && l.variant === variant ? { ...l, qty: l.qty + d } : l))
        .filter((l) => l.qty > 0),
    )

  const lines = useMemo(() => {
    if (!catalog) return []
    return cart
      .map((l) => {
        const p = catalog.products?.[l.slug]
        const v = p?.variants?.[l.variant]
        if (!p || !v) return null
        return { ...l, title: p.title, label: v.label, cents: v.cents }
      })
      .filter(Boolean)
  }, [cart, catalog])

  const subtotal = lines.reduce((t, l) => t + l.cents * l.qty, 0)
  const pickupEnabled = catalog?.shipping?.pickupEnabled
  const shipCents = fulfillment === 'ship' ? catalog?.shipping?.flatCents ?? 0 : 0

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

  if (!open) return null

  return (
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
          {cart.length === 0 && <p className="cart-empty">Nothing in here yet.</p>}
          {cart.length > 0 && !catalog && <p className="cart-empty">One moment…</p>}
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
              {pickupEnabled && (
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
            {!error && fulfillment === 'ship' && <p className="cart-note">US addresses only.</p>}
          </>
        )}
      </aside>
    </>
  )
}
