'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

function PrintItem({ item, index, onClick }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.unobserve(el) } },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`print-item ${vis ? 'vis' : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => onClick(index)}
    >
      <div className="print-cover">
        <img src={item.cover} alt={item.title || ''} />
      </div>
      <div className="print-info">
        <span className="print-title">{item.title}</span>
        {item.year && <span className="print-year">{item.year}</span>}
      </div>
      {item.description && <p className="print-desc">{item.description}</p>}
      {item.link && (
        <a href={item.link} target="_blank" rel="noopener" className="print-link" onClick={(e) => e.stopPropagation()}>
          Purchase ↗
        </a>
      )}
    </div>
  )
}

function PrintLightbox({ items, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)
  const item = items[current]
  const spreads = item?.spreads || []

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowRight' && current < items.length - 1) setCurrent(current + 1)
    if (e.key === 'ArrowLeft' && current > 0) setCurrent(current - 1)
  }, [onClose, current, items.length])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [handleKey])

  return (
    <div className="print-lb">
      <div className="print-lb-top">
        <span className="print-lb-title">{item.title}</span>
        <button className="print-lb-close" onClick={onClose}>Close [Esc]</button>
      </div>
      <div className="print-lb-scroll">
        <div className="print-lb-cover">
          <img src={item.cover} alt={item.title || ''} />
        </div>
        {spreads.map((s, i) => (
          <div key={i} className="print-lb-spread">
            <img src={s.image} alt="" />
          </div>
        ))}
        {item.description && (
          <div className="print-lb-desc">
            <p>{item.description}</p>
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener" className="print-lb-link">
                Purchase ↗
              </a>
            )}
          </div>
        )}
      </div>
      {items.length > 1 && (
        <div className="print-lb-nav">
          <button disabled={current === 0} onClick={() => setCurrent(current - 1)}>← Prev</button>
          <span>{current + 1} / {items.length}</span>
          <button disabled={current === items.length - 1} onClick={() => setCurrent(current + 1)}>Next →</button>
        </div>
      )}
    </div>
  )
}

export default function PrintGrid({ items }) {
  const [lbIndex, setLbIndex] = useState(null)

  if (!items || items.length === 0) {
    return (
      <div className="print-page">
        <div className="print-header">
          <h1 className="print-page-title">Print</h1>
        </div>
        <div className="print-empty">No publications yet. Add print items in the CMS.</div>
      </div>
    )
  }

  return (
    <>
      <div className="print-page">
        <div className="print-header">
          <h1 className="print-page-title">Print</h1>
          <span className="print-count">{items.length} Publications</span>
        </div>
        <div className="print-grid">
          {items.map((item, i) => (
            <PrintItem key={i} item={item} index={i} onClick={() => setLbIndex(i)} />
          ))}
        </div>
      </div>

      {lbIndex !== null && (
        <PrintLightbox items={items} startIndex={lbIndex} onClose={() => setLbIndex(null)} />
      )}
    </>
  )
}
