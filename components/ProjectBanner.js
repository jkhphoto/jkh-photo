'use client'
import { useState, useEffect } from 'react'

export default function ProjectBanner({ title, category, date, number, location }) {
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
    const targets = document.querySelectorAll('.g-cinematic, .g-full, .g-centered')
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
        {category && <span>{category}</span>}
        {date && <span>{date}</span>}
        {location && <span>{location}</span>}
        {num && <span>[{num}]</span>}
      </div>
    </div>
  )
}
