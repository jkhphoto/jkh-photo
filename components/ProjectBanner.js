'use client'
import { useState, useEffect } from 'react'

export default function ProjectBanner({ title, category, date, number, location, client }) {
  const [show, setShow] = useState(false)
  const [hideForImage, setHideForImage] = useState(false)

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

  useEffect(() => {
    const targets = document.querySelectorAll('.g-cinematic')
    if (!targets.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const any = entries.some(e => e.isIntersecting && e.intersectionRatio > 0.7)
        setHideForImage(any)
      },
      { threshold: 0.7 }
    )
    targets.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  const num = number ? String(number).padStart(2, '0') : null

  return (
    <div className={`proj-banner ${show && !hideForImage ? 'show' : ''}`}>
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
