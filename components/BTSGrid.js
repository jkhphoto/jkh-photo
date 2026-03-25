'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

function BTSImage({ src, index, onClick }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.unobserve(el) } },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`bts-item ${vis ? 'vis' : ''}`}
      style={{ animationDelay: `${(index % 8) * 0.06}s` }}
      onClick={() => onClick(index)}
    >
      <img src={src} alt="" loading="lazy" />
    </div>
  )
}

function BTSLightbox({ images, startIndex, onClose }) {
  const scrollRef = useRef(null)

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

  return (
    <div className="bts-lb" onClick={onClose}>
      <button className="bts-lb-close" onClick={(e) => { e.stopPropagation(); onClose() }}>
        Close [Esc]
      </button>
      <div className="bts-lb-scroll" ref={scrollRef} onClick={(e) => e.stopPropagation()}>
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

  if (!images || images.length === 0) {
    return (
      <div className="bts-page">
        <div className="bts-header">
          <h1 className="bts-title">BTS</h1>
        </div>
        <div className="bts-empty">No images yet. Add BTS images in the CMS.</div>
      </div>
    )
  }

  return (
    <>
      <div className="bts-page">
        <div className="bts-header">
          <h1 className="bts-title">BTS</h1>
          <span className="bts-count">{images.length} Images</span>
        </div>
        <div className="bts-grid">
          {images.map((img, i) => (
            <BTSImage key={i} src={img.image} index={i} onClick={() => setLbIndex(i)} />
          ))}
        </div>
      </div>

      {lbIndex !== null && (
        <BTSLightbox images={images} startIndex={lbIndex} onClose={() => setLbIndex(null)} />
      )}
    </>
  )
}
