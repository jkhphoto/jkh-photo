'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Nav() {
  const ref = useRef(null)
  const last = useRef(0)

  useEffect(() => {
    const fn = () => {
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
  }, [])

  return (
    <nav ref={ref}>
      <Link href="/" className="logo">JKH Photo</Link>
      <div className="links">
        <Link href="/">Work</Link>
        <Link href="/info">Info</Link>
      </div>
    </nav>
  )
}
