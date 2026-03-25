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

export default function Gallery({ rows, onImageClick }) {
  if (!rows || rows.length === 0) return null
  return (
    <div className="gallery">
      {rows.map((row, i) => {
        const last = i === rows.length - 1
        const style = last ? { marginBottom: 0 } : undefined
        const t = row.__typename?.replace('ProjectGallery', '') || row._template
        switch (t) {
          case 'pair': case 'Pair':
            return <div key={i} className="g-row g-pair" style={style}><GalleryImage src={row.left} onClick={onImageClick} /><GalleryImage src={row.right} onClick={onImageClick} /></div>
          case 'pairWide': case 'PairWide':
            return <div key={i} className="g-row g-pair-wide" style={style}><GalleryImage src={row.left} onClick={onImageClick} /><GalleryImage src={row.right} onClick={onImageClick} /></div>
          case 'pairNarrow': case 'PairNarrow':
            return <div key={i} className="g-row g-pair-narrow" style={style}><GalleryImage src={row.left} onClick={onImageClick} /><GalleryImage src={row.right} onClick={onImageClick} /></div>
          case 'trio': case 'Trio':
            return <div key={i} className="g-row g-trio" style={style}><GalleryImage src={row.img1} onClick={onImageClick} /><GalleryImage src={row.img2} onClick={onImageClick} /><GalleryImage src={row.img3} onClick={onImageClick} /></div>
          case 'full': case 'Full':
            return <div key={i} className="g-row g-full" style={style}><GalleryImage src={row.image} onClick={onImageClick} /></div>
          case 'cinematic': case 'Cinematic':
            return <div key={i} className="g-row g-full g-cinematic" style={style}><GalleryImage src={row.image} onClick={onImageClick} /></div>
          default: return null
        }
      })}
    </div>
  )
}
