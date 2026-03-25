'use client'
import { useState } from 'react'

export default function Credits({ credits }) {
  const [open, setOpen] = useState(false)
  if (!credits || credits.length === 0) return null
  return (
    <div className={`credits ${open ? 'open' : ''}`}>
      <button className="credits-toggle" onClick={() => setOpen(!open)}>
        <span>Credits</span>
        <span className="credits-icon">+</span>
      </button>
      <div className="credits-body">
        <div className="credits-list">
          {credits.map((c, i) => <span key={i}>{c.role}: {c.name}</span>)}
        </div>
      </div>
    </div>
  )
}
