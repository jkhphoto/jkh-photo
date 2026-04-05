'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

export default function Credits({ credits, tags }) {
  const [open, setOpen] = useState(false)
  const creditsRef = useRef(null)
  const hasTags = tags && tags.length > 0
  const hasCredits = credits && credits.length > 0

  if (!hasCredits && !hasTags) return null

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next && creditsRef.current) {
      setTimeout(() => {
        creditsRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 100)
    }
  }

  return (
    <div ref={creditsRef} className={`credits ${open ? 'open' : ''}`}>
      <div className="credits-toggle-row">
        {hasCredits ? (
          <button className="credits-toggle" onClick={handleToggle}>
            <span>Credits</span>
            <span className="credits-icon">+</span>
          </button>
        ) : (
          <div className="credits-toggle-placeholder" />
        )}
        {hasTags && (
          <div className="proj-tags">
            {tags.filter(Boolean).map((tag) => (
              <Link key={tag} href={`/idx?tag=${encodeURIComponent(tag)}`} className="proj-tag">
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
      {hasCredits && (
        <div className="credits-body">
          <div className="credits-list">
            {credits.map((c, i) => <span key={i}>{c.role}: {c.name}</span>)}
          </div>
        </div>
      )}
    </div>
  )
}
