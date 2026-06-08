'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

/*
  ───────────────────────────────────────────────────────────────
  CHECKOUT
  The buy button links to whatever URL you set as `link` in
  content/print/generations.mdx — paste your Stripe Payment Link
  OR your PayPal Buy Now / PayPal.me link there. Same field, either
  processor. If `link` is empty, the button shows a disabled state
  so the page never ships a dead link.

  Optional frontmatter fields the page reads (all have fallbacks):
    price:   "$85"          edition: "First edition of 500"
    pages:   "300"          format:  "Hardcover"
    link:    "https://..."  processor: "Stripe"   ("PayPal" etc.)
    spreads: [ { image: /images/gen-01.jpg }, ... ]
  ───────────────────────────────────────────────────────────────
*/

function Reader({ item, onClose }) {
  const spreads = item?.spreads || []
  const scrollRef = useRef(null)
  const [progress, setProgress] = useState(0)

  const handleKey = useCallback((e) => { if (e.key === 'Escape') onClose() }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [handleKey])

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const pct = el.scrollTop / (el.scrollHeight - el.clientHeight || 1)
    setProgress(Math.min(1, Math.max(0, pct)))
  }

  const total = 1 + spreads.length
  const current = Math.round(progress * (total - 1)) + 1

  return (
    <div className="gen-reader">
      <div className="gen-reader-bar">
        <span className="gen-reader-title">{item.title}</span>
        <span className="gen-reader-page">{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <button className="gen-reader-close" onClick={onClose}>Close</button>
      </div>
      <div className="gen-reader-scroll" ref={scrollRef} onScroll={onScroll}>
        <div className="gen-reader-frame"><img src={item.cover} alt={item.title || ''} /></div>
        {spreads.map((s, i) => (
          <div key={i} className="gen-reader-frame"><img src={s.image} alt="" /></div>
        ))}
      </div>
      <div className="gen-reader-progress">
        <div className="gen-reader-progress-fill" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  )
}

export default function GenerationsPage({ item = {} }) {
  const [readerOpen, setReaderOpen] = useState(false)
  const spreads = item.spreads || []
  const previewRef = useRef(null)

  const price = item.price || ''
  const link = item.link || ''
  const processor = item.processor || ''
  const pages = item.pages || ''
  const format = item.format || ''
  const edition = item.edition || ''
  const buyable = Boolean(link)

  const specs = [
    format && { label: 'Format', value: format },
    pages && { label: 'Pages', value: pages },
    item.year && { label: 'Year', value: String(item.year) },
    edition && { label: 'Edition', value: edition },
  ].filter(Boolean)

  const scrollToPreview = () => {
    previewRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="gen">
      <section className="gen-hero">
        <div
          className="gen-cover"
          onClick={() => spreads.length && setReaderOpen(true)}
          role={spreads.length ? 'button' : undefined}
        >
          <img src={item.cover} alt={item.title || 'Generations'} />
          {spreads.length > 0 && <span className="gen-cover-hint">Look inside ↗</span>}
        </div>

        <div className="gen-meta">
          <span className="gen-label">Publication — {item.year || ''}</span>
          <h1 className="gen-title">{item.title || 'Generations'}</h1>

          {item.description && <p className="gen-desc">{item.description}</p>}

          {specs.length > 0 && (
            <dl className="gen-specs">
              {specs.map((s) => (
                <div key={s.label} className="gen-spec">
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="gen-purchase">
            {price && <span className="gen-price">{price}</span>}
            {buyable ? (
              <a className="gen-buy" href={link} rel="noopener">
                Buy the book
              </a>
            ) : (
              <span className="gen-buy gen-buy--off" aria-disabled="true">
                Available soon
              </span>
            )}
          </div>

          {buyable && (
            <span className="gen-secure">
              Secure checkout{processor ? ` via ${processor}` : ''} · ships worldwide
            </span>
          )}

          {spreads.length > 0 && (
            <button className="gen-preview-link" onClick={scrollToPreview}>
              Preview the spreads ↓
            </button>
          )}
        </div>
      </section>

      {spreads.length > 0 && (
        <section className="gen-preview" ref={previewRef}>
          <span className="gen-label gen-label--center">Inside the book</span>
          <div className="gen-grid">
            {spreads.map((s, i) => (
              <figure key={i} className="gen-grid-item" onClick={() => setReaderOpen(true)}>
                <img src={s.image} alt="" loading="lazy" />
              </figure>
            ))}
          </div>
          <div className="gen-preview-cta">
            {price && <span className="gen-price">{price}</span>}
            {buyable ? (
              <a className="gen-buy" href={link} rel="noopener">Buy the book</a>
            ) : (
              <span className="gen-buy gen-buy--off" aria-disabled="true">Available soon</span>
            )}
          </div>
        </section>
      )}

      {readerOpen && <Reader item={item} onClose={() => setReaderOpen(false)} />}
    </main>
  )
}
