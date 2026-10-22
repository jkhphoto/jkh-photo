'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { openCart, readCartCount } from './shop/cartBus'

export default function Nav() {
  const ref = useRef(null)
  const last = useRef(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const pathname = usePathname()

  // Cart count: seed from storage, then follow the global cart's announcements.
  useEffect(() => {
    setCartCount(readCartCount())
    const onChanged = (e) => setCartCount(e.detail.count)
    window.addEventListener('jkh:cart:changed', onChanged)
    return () => window.removeEventListener('jkh:cart:changed', onChanged)
  }, [])

  const showCart = () => {
    setMenuOpen(false)
    openCart()
  }

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Hide/show nav on scroll
  useEffect(() => {
    const fn = () => {
      if (menuOpen) return
      const y = window.pageYOffset
      const nav = ref.current
      if (!nav) return
      if (y > window.innerHeight * 0.3) {
        if (y > last.current + 3) nav.classList.add('out')
        else if (y < last.current - 3) nav.classList.remove('out')
      } else nav.classList.remove('out')
      last.current = y
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [menuOpen])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/idx', label: 'Index' },
    { href: '/bts', label: 'BTS' },
    { href: '/shop', label: 'Shop' },
    { href: '/info', label: 'Info' },
  ]

  return (
    <>
      <nav ref={ref} className={menuOpen ? 'menu-open' : ''}>
        <Link href="/" className="logo">JKH Photo</Link>

        {/* Desktop links */}
        <div className="links">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
          {cartCount > 0 && (
            <button type="button" className="nav-cart" onClick={showCart}>
              Cart ({cartCount})
            </button>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Fullscreen mobile menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks.map(l => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
        {cartCount > 0 && (
          <button type="button" className="nav-cart" onClick={showCart}>
            Cart ({cartCount})
          </button>
        )}
        <div className="mobile-menu-contact">
          <a href="mailto:hello@josephkhale.com">hello@josephkhale.com</a>
          <a href="tel:5187950309">518-795-0309</a>
        </div>
      </div>
    </>
  )
}
