'use client'
import { useState, useEffect } from 'react'

/*
  The bottom banner appears once the page header has scrolled away, and
  hides again while a full-bleed image owns the screen.

  The fix here is the hide condition. It used to test intersectionRatio >
  0.7 — 70% of the *image* being visible — which an image taller than the
  viewport can never reach, since the ratio is visible area over element
  area. A 4000x3000 rendered 1376px tall in a 900px window tops out at
  0.65, so the banner never hid on it. Measured against these images:

    4000x2662 -> 1230 tall -> max ratio 0.73  (hid, barely)
    4000x3000 -> 1376 tall -> max ratio 0.65  (never hid)

  Coverage is now measured against the viewport instead, which holds for
  any image shape at any window size.

  Both conditions are evaluated in one handler that also runs on mount, so
  the banner is correct before the first scroll rather than relying on a
  scroll event to initialise. .proj-head is looked up inside the handler:
  the previous version resolved it once at mount and returned early if it
  was absent, which bailed out before attaching the listener and left no
  way to recover.
*/
const COVERAGE = 0.7

export default function ProjectBanner({ title, category, date, number, location, client }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const evaluate = () => {
      const head = document.querySelector('.proj-head')
      const pastHeader = head ? head.getBoundingClientRect().bottom < 0 : true

      const vh = window.innerHeight || 1
      let covered = 0
      document.querySelectorAll('.g-cinematic').forEach((el) => {
        const r = el.getBoundingClientRect()
        const h = Math.min(r.bottom, vh) - Math.max(r.top, 0)
        if (h > covered) covered = h
      })
      const imageOwnsScreen = covered / vh >= COVERAGE

      setVisible(pastHeader && !imageOwnsScreen)
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        evaluate()
        ticking = false
      })
    }

    evaluate()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const num = number ? String(number).padStart(2, '0') : null

  return (
    <div className={`proj-banner ${visible ? 'show' : ''}`}>
      <span className="proj-banner-title">{title}</span>
      <div className="proj-banner-meta">
        {category && <span className="proj-banner-cat">{category}</span>}
        {date && <span className="proj-banner-date">{date}</span>}
        {client && <span className="proj-banner-client">{client}</span>}
        {location && <span className="proj-banner-loc">{location}</span>}
        {num && <span className="proj-banner-num">[{num}]</span>}
      </div>
    </div>
  )
}
