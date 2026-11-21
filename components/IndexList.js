'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

/*
  The Index: every job as a photo tile, in justified rows — each frame
  uncropped at its own shape, every frame in a row the same height. A
  tile's share of the row is its width÷height (--r), known at build time;
  when it isn't (or EXIF rotation makes it wrong), the loaded image
  corrects it.
*/

const FALLBACK_RATIO = 1.5

export default function IndexList({ projects }) {
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState(searchParams.get('filter') || 'All')
  const [tagFilter, setTagFilter] = useState(searchParams.get('tag') || null)
  const [loadedRatio, setLoadedRatio] = useState({})

  // Tag buttons on project pages link here as /idx?tag=…
  useEffect(() => {
    const f = searchParams.get('filter')
    const t = searchParams.get('tag')
    if (f) { setFilter(f); setTagFilter(null) }
    if (t) { setTagFilter(t); setFilter('All') }
  }, [searchParams])

  if (!projects || projects.length === 0) {
    return (
      <div className="idx-page">
        <div className="idx-empty">No projects yet.</div>
      </div>
    )
  }

  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))]

  let filtered = projects
  if (tagFilter) filtered = filtered.filter((p) => p.tags.includes(tagFilter))
  else if (filter !== 'All') filtered = filtered.filter((p) => p.category === filter)

  const pickCategory = (cat) => {
    setFilter(cat)
    setTagFilter(null)
    window.history.replaceState(null, '', cat === 'All' ? '/idx' : `/idx?filter=${encodeURIComponent(cat)}`)
  }

  const onImgLoad = (slug, img) => {
    if (!img || !img.naturalHeight) return
    const r = img.naturalWidth / img.naturalHeight
    setLoadedRatio((prev) => (Math.abs((prev[slug] ?? 0) - r) < 0.001 ? prev : { ...prev, [slug]: r }))
  }

  return (
    <div className="idx-page">
      <div className="idx-header">
        <h1 className="idx-title">Index</h1>
        <div className="idx-filters">
          {tagFilter ? (
            <>
              <button className="idx-filter active">{tagFilter}</button>
              <button className="idx-filter" onClick={() => pickCategory('All')}>× Clear</button>
            </>
          ) : (
            categories.map((cat) => (
              <button
                key={cat}
                className={`idx-filter ${filter === cat ? 'active' : ''}`}
                onClick={() => pickCategory(cat)}
              >
                {cat}
              </button>
            ))
          )}
          <span className="idx-count">
            {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
          </span>
        </div>
      </div>

      <div className="idx-grid">
        {filtered.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="idx-tile"
            style={{ '--r': loadedRatio[p.slug] ?? p.ratio ?? FALLBACK_RATIO }}
          >
            <div className="idx-img">
              {p.cover && (
                <img
                  src={p.cover}
                  alt={`${p.title} — JKH Photo`}
                  loading="lazy"
                  onLoad={(e) => onImgLoad(p.slug, e.currentTarget)}
                  ref={(el) => { if (el && el.complete) onImgLoad(p.slug, el) }}
                />
              )}
            </div>
            <div className="idx-cap">
              <span className="idx-num">{p.num}</span>
              <span className="idx-name">{p.title}</span>
            </div>
            <div className="idx-meta">{[p.client, p.date].filter(Boolean).join(' · ')}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
