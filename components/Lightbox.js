'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

export default function Lightbox({ images, startIndex, onClose }) {
  const scrollRef = useRef(null)
  const [current, setCurrent] = useState(startIndex + 1)
  const total = images.length

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [handleKey])

  useEffect(() => {
    if (scrollRef.current && startIndex > 0) {
      const target = scrollRef.current.children[startIndex]
      if (target) target.scrollIntoView({ behavior: 'instant' })
    }
  }, [startIndex])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const items = container.querySelectorAll('.proj-lb-item')

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Array.from(items).indexOf(entry.target)
            if (idx !== -1) setCurrent(idx + 1)
          }
        })
      },
      { root: container, threshold: 0.5 }
    )

    items.forEach((item) => io.observe(item))
    return () => io.disconnect()
  }, [])

  const pad = (n) => String(n).padStart(2, '0')

  if (!images || images.length === 0) return null

  return (
    <div className="proj-lb">
      <div className="proj-lb-top">
        <span className="proj-lb-counter">{pad(current)} / {pad(total)}</span>
        <button className="proj-lb-close" onClick={onClose}>Close [Esc]</button>
      </div>
      <div className="proj-lb-scroll" ref={scrollRef}>
        {images.map((src, i) => (
          <div key={i} className="proj-lb-item">
            <img src={src} alt="" />
          </div>
        ))}
      </div>
    </div>
  )
}
