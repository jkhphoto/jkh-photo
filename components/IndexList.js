'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function IndexList({ projects }) {
  const [filter, setFilter] = useState('All')
  const [previewSrc, setPreviewSrc] = useState(null)
  const [active, setActive] = useState(false)
  const previewRef = useRef(null)
  const mx = useRef(0), my = useRef(0), px = useRef(0), py = useRef(0)

  useEffect(() => {
    let raf
    const tick = () => {
      if (active) {
        px.current += (mx.current - px.current) * 0.1
        py.current += (my.current - py.current) * 0.1
        if (previewRef.current) {
          previewRef.current.style.left = px.current + 'px'
          previewRef.current.style.top = py.current + 'px'
        }
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [active])

  useEffect(() => {
    const fn = (e) => {
      mx.current = e.clientX + 24; my.current = e.clientY - 160
      if (!active) { px.current = mx.current; py.current = my.current }
    }
    document.addEventListener('mousemove', fn)
    return () => document.removeEventListener('mousemove', fn)
  }, [active])

  if (!projects || projects.length === 0) {
    return (
      <div className="idx-page">
        <div className="idx-empty">No projects yet. Add projects in the CMS.</div>
      </div>
    )
  }

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))]
  const filtered = filter === 'All' ? projects : projects.filter(p => p.category === filter)

  return (
    <>
      <div className="idx-page">
        <div className="idx-header">
          <h1 className="idx-title">Index</h1>
        </div>

        <div className="idx-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`idx-filter ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="idx-table">
          <div className="idx-table-head">
            <span className="idx-col-num"></span>
            <span className="idx-col-name">`</span>
            <span className="idx-col-cat">Category</span>
            <span className="idx-col-client">Client</span>
            <span className="idx-col-date">Date</span>
            <span className="idx-col-loc">Location</span>
          </div>

          {filtered.map((p) => {
            const num = String(p.displayNumber || 0).padStart(2, '0')
            return (
              <Link
                key={p._sys.filename}
                href={`/projects/${p._sys.filename}`}                className="idx-row"
                onMouseEnter={() => { setPreviewSrc(p.featuredImage || null); setActive(true) }}
                onMouseLeave={() => { setActive(false); setPreviewSrc(null) }}
              >
                <span className="idx-col-num">{num}</span>
                <span className="idx-col-name">{p.title}</span>
                <span className="idx-col-cat">{p.category || ''}</span>
                <span className="idx-col-client">{p.client || ''}</span>
                <span className="idx-col-date">{p.date || ''}</span>
                <span className="idx-col-loc">{p.location || ''}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <img
        ref={previewRef}
        className={`idx-preview ${previewSrc && active ? 'show' : ''}`}
        src={previewSrc || ''}
        alt=""
      />
    </>
  )
}
