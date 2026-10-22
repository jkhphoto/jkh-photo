'use client'

/*
  The cart is one global sheet (components/shop/Cart.js, mounted in the
  layout) and its buy points — the shop grid, product pages, the nav
  badge. They're separate client islands, so they talk over window
  events instead of threading context through server pages:

    jkh:cart:add      {slug, variant}  → Cart adds the line
    jkh:cart:open                      → Cart opens the sheet
    jkh:cart:changed  {count}          → Cart announces its new count

  State itself lives in Cart + localStorage; everyone else just sends
  or listens.
*/

export const CART_KEY = 'jkh-cart-v1'

export const addToCart = (slug, variant) =>
  window.dispatchEvent(new CustomEvent('jkh:cart:add', { detail: { slug, variant } }))

export const openCart = () => window.dispatchEvent(new CustomEvent('jkh:cart:open'))

export const announceCart = (count) =>
  window.dispatchEvent(new CustomEvent('jkh:cart:changed', { detail: { count } }))

export const readCartCount = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    return Array.isArray(raw) ? raw.reduce((t, l) => t + (Number(l.qty) || 0), 0) : 0
  } catch {
    return 0
  }
}
