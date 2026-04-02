'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

function PrintSection({ item, index }) {
  const [readerOpen, setReaderOpen] = useState(false)
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  const spreads = item?.spreads || []
  const num = String(index + 1).padStart(2, '0')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.unobserve(el) } },
      { threshold: 0.05 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <section ref={ref} className={`print-section ${vis ? 'vis' : ''}`}>
        <div className="print-section-num">{num}</div>
        <div className="print-section-cover" onClick={() => setReaderOpen(true)}>
          <img src={item.cover} alt={item.title || ''} />
        </div>

        <div className="print-section-meta">
          <h2 className="print-section-title">{item.title}</h2>
          <div className="print-section-details">
            {item.year && <span>{item.year}</span>}
            {item.description && <span className="print-section-desc">{item.description}</span>}
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener" className="print-section-link">
                Available ↗
              </a>
            )}
          </div>
        </div>

        {spreads.length > 0 && (
          <div className="print-filmstrip">
            <div className="print-filmstrip-track">
              {spreads.map((s, i) => (
                <div key={i} className="print-filmstrip-frame" onClick={() => setReaderOpen(true)}>
                  <img src={s.image} alt="" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {readerOpen && (
        <PrintReader item={item} onClose={() => setReaderOpen(false)} />
      )}
    </>
  )
}

function PrintReader({ item, onClose }) {
  const spreads = item?.spreads || []
  const scrollRef = useRef(null)
  const [progress, setProgress] = useState(0)

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

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const pct = el.scrollTop / (el.scrollHeight - el.clientHeight)
    setProgress(Math.min(1, Math.max(0, pct)))
  }

  const totalPages = 1 + spreads.length
  const currentPage = Math.round(progress * (totalPages - 1)) + 1

  return (
    <div className="print-reader">
      <div className="print-reader-bar">
        <span className="print-reader-title">{item.title}</span>
        <span className="print-reader-page">{currentPage} / {totalPages}</span>
        <button className="print-reader-close" onClick={onClose}>Close</button>
      </div>
      <div className="print-reader-scroll" ref={scrollRef} onScroll={handleScroll}>
        <div className="print-reader-page-wrap">
          <img src={item.cover} alt={item.title || ''} />
        </div>
        {spreads.map((s, i) => (
          <div key={i} className="print-reader-page-wrap">
            <img src={s.image} alt="" />
          </div>
        ))}
        {(item.description || item.link) && (
          <div className="print-reader-colophon">
            {item.description && <p>{item.description}</p>}
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener">
                Available ↗
              </a>
            )}
          </div>
        )}
      </div>
      <div className="print-reader-progress">
        <div className="print-reader-progress-fill" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  )
}

export default function PrintGrid({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="print-page">
        <div className="print-header">
          <h1 className="print-page-title">Print</h1>
        </div>
        <div className="print-empty">No publications yet.</div>
      </div>
    )
  }

  return (
    <div className="print-page">
      <div className="print-header">
        <span className="print-header-label">Archive</span>
        <h1 className="print-page-title">Print</h1>
      </div>
      {items.map((item, i) => (
        <PrintSection key={i} item={item} index={i} />
      ))}
    </div>
  )
}
