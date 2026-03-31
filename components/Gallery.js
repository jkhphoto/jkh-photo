'use client'
import { useEffect, useRef, useState } from 'react'

function GalleryImage({ src, onClick }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.unobserve(el) } },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`g-img ${vis ? 'vis' : ''}`} onClick={() => onClick(src)}>
      <img src={src} alt="" loading="lazy" />
    </div>
  )
}

/* Extract flat ordered image list from gallery rows */
export function extractImages(rows) {
  if (!rows) return []
  const imgs = []
  rows.forEach((row) => {
    const t = row.type || row._template
    switch (t) {
      case 'pair':
      case 'pairWide':
      case 'pairNarrow':
      case 'diptych':
        if (row.left) imgs.push(row.left)
        if (row.right) imgs.push(row.right)
        break
      case 'trio':
        if (row.img1) imgs.push(row.img1)
        if (row.img2) imgs.push(row.img2)
        if (row.img3) imgs.push(row.img3)
        break
      case 'full':
      case 'cinematic':
      case 'centered':
      case 'centeredSmall':
      case 'centeredLarge':
        if (row.image) imgs.push(row.image)
        break
      default:
        break
    }
  })
  return imgs
}

export default function Gallery({ rows, onImageClick }) {
  if (!rows || rows.length === 0) return null
  return (
    <div className="gallery">
      {rows.map((row, i) => {
        const last = i === rows.length - 1
        const style = last ? { marginBottom: 0 } : undefined
        const t = row.type || row._template
        switch (t) {
          case 'pair':
            return <div key={i} className="g-row g-pair" style={style}><GalleryImage src={row.left} onClick={onImageClick} /><GalleryImage src={row.right} onClick={onImageClick} /></div>
          case 'pairWide':
            return <div key={i} className="g-row g-pair-wide" style={style}><GalleryImage src={row.left} onClick={onImageClick} /><GalleryImage src={row.right} onClick={onImageClick} /></div>
          case 'pairNarrow':
            return <div key={i} className="g-row g-pair-narrow" style={style}><GalleryImage src={row.left} onClick={onImageClick} /><GalleryImage src={row.right} onClick={onImageClick} /></div>
          case 'trio':
            return <div key={i} className="g-row g-trio" style={style}><GalleryImage src={row.img1} onClick={onImageClick} /><GalleryImage src={row.img2} onClick={onImageClick} /><GalleryImage src={row.img3} onClick={onImageClick} /></div>
          case 'full':
            return <div key={i} className="g-row g-full" style={style}><GalleryImage src={row.image} onClick={onImageClick} /></div>
          case 'cinematic':
            return <div key={i} className="g-row g-full g-cinematic" style={style}><GalleryImage src={row.image} onClick={onImageClick} /></div>
          case 'centered':
            return <div key={i} className="g-row g-centered" style={style}><GalleryImage src={row.image} onClick={onImageClick} /></div>
          case 'centeredSmall':
            return <div key={i} className="g-row g-centered g-centered-sm" style={style}><GalleryImage src={row.image} onClick={onImageClick} /></div>
          case 'centeredLarge':
            return <div key={i} className="g-row g-centered g-centered-lg" style={style}><GalleryImage src={row.image} onClick={onImageClick} /></div>
          case 'diptych':
            return <div key={i} className="g-row g-diptych" style={style}><GalleryImage src={row.left} onClick={onImageClick} /><GalleryImage src={row.right} onClick={onImageClick} /></div>
          case 'text':
            return <div key={i} className="g-row g-text" style={style}><p>{row.content}</p></div>
          case 'spacer':
            return <div key={i} className="g-spacer" style={{ height: (row.height || 80) + 'px' }} />
          default: return null
        }
      })}
    </div>
  )
}
