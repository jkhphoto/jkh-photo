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

  COVER SLIDESHOW
  Set `covers:` as a list of image paths in the frontmatter to get a
  swipeable / scrollable cover slideshow (arrows + dots + drag/swipe):
    covers:
      - /images/generations-cover.jpeg
      - /images/gen-cover-02.jpeg
  With one image (or just the old `cover:` field) it renders a single
  static cover exactly as before. Use images of similar dimensions so
  the frame doesn't jump between slides.

  Other frontmatter fields the page reads (all have fallbacks):
    price:   "$85"          edition: "First edition of 500"
    pages:   "300"          format:  "Hardcover"
    link:    "https://..."  processor: "Stripe"   ("PayPal" etc.)
    spreads: [ { image: /images/gen-01.jpg }, ... ]
  ───────────────────────────────────────────────────────────────
*/

function CoverSlideshow({ images, alt }) {
  const trackRef = useRef(null)
  const [active, setActive] = useState(0)
  const single = images.length <= 1

  const goTo = useCallback((i) => {
    const el = trackRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(images.length - 1, i))
    const slide = el.children[clamped]
    if (slide) el.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' })
  }, [images.length])

  const onScroll = () => {
    const el = trackRef.current
    if (!el || !el.clientWidth) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    setActive(Math.max(0, Math.min(images.length - 1, i)))
  }

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1) }
  }

  return (
    <div className={`gen-cover${single ? ' gen-cover--single' : ''}`}>
      <div
        className="gen-slides"
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={single ? -1 : 0}
        onKeyDown={single ? undefined : onKey}
        aria-label={single ? undefined : 'Cover images'}
      >
        {images.map((src, i) => (
          <div className="gen-slide" key={i}>
            <img
              src={src}
              alt={i === 0 ? (alt || '') : ''}
              draggable={false}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {!single && (
        <>
          <button
            className="gen-slide-arrow gen-slide-arrow--prev"
            aria-label="Previous cover"
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
          >←</button>
          <button
            className="gen-slide-arrow gen-slide-arrow--next"
            aria-label="Next cover"
            onClick={() => goTo(active + 1)}
            disabled={active === images.length - 1}
          >→</button>

          <div className="gen-slide-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`gen-dot${i === active ? ' is-active' : ''}`}
                aria-label={`Go to cover ${i + 1}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          <span className="gen-slide-count">
            {String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </span>
        </>
      )}
    </div>
  )
}

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

  // ── Defaults baked in so the page sells even before the mdx updates ──
  const PAYPAL_LINK = 'https://www.paypal.com/ncp/payment/PKFF2PCM8PSN8'
  const DEFAULT_PRICE = '$60 pickup · $73 shipped'
  const COVER_FALLBACK = '/images/generations-cover.jpeg'

  // Cover slideshow: prefer `covers` list, else `cover`, ignoring the
  // old deleted placeholder; fall back to the real cover if nothing valid.
  const listed = (Array.isArray(item.covers) && item.covers.length)
    ? item.covers
    : [item.cover]
  let covers = listed.filter((s) => s && s !== '/images/1x1.jpg')
  if (!covers.length) covers = [COVER_FALLBACK]

  const price = item.price || DEFAULT_PRICE
  const link = item.link || PAYPAL_LINK
  const processor = item.processor || 'PayPal'
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
        <CoverSlideshow images={covers} alt={item.title || 'Generations'} />

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
                Buy now
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
              <a className="gen-buy" href={link} rel="noopener">Buy now</a>
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
