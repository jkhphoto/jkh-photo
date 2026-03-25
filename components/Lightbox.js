'use client'
import { useEffect, useCallback } from 'react'

export default function Lightbox({ src, onClose }) {
  const handleKey = useCallback((e) => { if (e.key === 'Escape') onClose() }, [onClose])
  useEffect(() => {
    if (src) { document.body.style.overflow = 'hidden'; document.addEventListener('keydown', handleKey) }
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleKey) }
  }, [src, handleKey])
  if (!src) return null
  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={(e) => { e.stopPropagation(); onClose() }}>Close [Esc]</button>
      <img src={src} alt="" />
    </div>
  )
}
