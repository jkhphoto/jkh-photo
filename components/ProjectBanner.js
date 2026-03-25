'use client'
import { useState, useEffect } from 'react'

export default function ProjectBanner({ title, category, date, number, location }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const head = document.querySelector('.proj-head')
    if (!head) return
    let ticking = false
    const fn = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setShow(head.getBoundingClientRect().bottom < 0)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className={`proj-banner ${show ? 'show' : ''}`}>
      <span className="proj-banner-title">{title}</span>
      <div className="proj-banner-meta">
        {category && <span>{category}</span>}
        {date && <span>{date}</span>}
        {location && <span>{location}</span>}
        {number && <span>[{String(number).padStart(2, '0')}]</span>}
      </div>
    </div>
  )
}
