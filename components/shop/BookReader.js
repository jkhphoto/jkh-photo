'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/*
  The flip-through, living on the product page since /print went away:
  a trigger link and the fullscreen scroll reader (cover, spreads,
  colophon, progress bar). Spreads come from the matching entry in
  content/print — still edited there in the CMS.
*/

export default function BookReader({ title, cover, spreads, description }) {
  const [open, setOpen] = useState(false)
  if (!spreads || spreads.length === 0) return null
  return (
    <>
      <button type="button" className="product-related" onClick={() => setOpen(true)}>
        Flip through the book →
      </button>
      {open && (
        <Reader
          title={title}
          cover={cover}
          spreads={spreads}
          description={description}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

function Reader({ title, cover, spreads, description, onClose }) {
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

  // Portaled to the body: the trigger lives inside the sticky meta
  // column, whose stacking context would otherwise pin the fullscreen
  // reader underneath the nav.
  return createPortal(
    <div className="book-reader">
      <div className="book-reader-bar">
        <span className="book-reader-title">{title}</span>
        <span className="book-reader-page">{currentPage} / {totalPages}</span>
        <button className="book-reader-close" onClick={onClose}>Close</button>
      </div>
      <div className="book-reader-scroll" ref={scrollRef} onScroll={handleScroll}>
        <div className="book-reader-page-wrap">
          <img src={cover} alt={title || ''} />
        </div>
        {spreads.map((src, i) => (
          <div key={i} className="book-reader-page-wrap">
            <img src={src} alt={title || 'JKH Photo'} />
          </div>
        ))}
        {description && (
          <div className="book-reader-colophon">
            <p>{description}</p>
          </div>
        )}
      </div>
      <div className="book-reader-progress">
        <div className="book-reader-progress-fill" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>,
    document.body,
  )
}
