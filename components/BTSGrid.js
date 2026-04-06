'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function thumbSrc(src) {
  if (!src) return src
  // /images/bts/foo.jpg → /images/bts/thumbs/foo.jpg
  const parts = src.split('/')
  const filename = parts.pop()
  return [...parts, 'thumbs', filename].join('/')
}

function BTSImage({ src, index, onClick }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.unobserve(el) } },
      { threshold: 0.05, rootMargin: '200px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`bts-item ${vis ? 'vis' : ''}`}
      onClick={() => onClick(index)}
    >
      {vis && <img src={thumbSrc(src)} alt="" />}
    </div>
  )
}

function BTSLightbox({ images, startIndex, onClose }) {
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
    const items = container.querySelectorAll('.bts-lb-item')

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

  return (
    <div className="bts-lb">
      <div className="bts-lb-top">
        <span className="bts-lb-counter">{pad(current)} / {pad(total)}</span>
        <button className="bts-lb-close" onClick={onClose}>Close</button>
      </div>
      <div className="bts-lb-scroll" ref={scrollRef}>
        {images.map((img, i) => (
          <div key={i} className="bts-lb-item">
            <img src={img.image} alt="" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BTSGrid({ images }) {
  const [lbIndex, setLbIndex] = useState(null)
  const shuffled = useMemo(() => shuffle(images || []), [])

  if (!images || images.length === 0) {
    return (
      <div className="bts-page">
        <div className="bts-header">
          <h1 className="bts-title">BTS</h1>
        </div>
        <div className="bts-empty">Add BTS images in the CMS.</div>
      </div>
    )
  }

  return (
    <>
      <div className="bts-page">
        <div className="bts-header">
          <h1 className="bts-title">BTS</h1>
        </div>
        <div className="bts-grid">
          {shuffled.map((img, i) => (
            <BTSImage key={i} src={img.image} index={i} onClick={() => setLbIndex(i)} />
          ))}
        </div>
      </div>

      {lbIndex !== null && (
        <BTSLightbox images={shuffled} startIndex={lbIndex} onClose={() => setLbIndex(null)} />
      )}
    </>
  )
}
