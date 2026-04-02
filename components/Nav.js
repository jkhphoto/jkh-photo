'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const ref = useRef(null)
  const last = useRef(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

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
    { href: '/print', label: 'Print' },
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
      </div>
    </>
  )
}
