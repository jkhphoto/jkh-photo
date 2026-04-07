'use client'
import { useEffect, useRef, useState, useMemo } from 'react'

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

function GalleryVideo({ src }) {
  const ref = useRef(null)
  const vidRef = useRef(null)
  const [vis, setVis] = useState(false)
  const [paused, setPaused] = useState(false)

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

  const handleClick = () => {
    const v = vidRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPaused(false)
    } else {
      v.pause()
      setPaused(true)
    }
  }

  return (
    <div ref={ref} className={`g-img g-video ${vis ? 'vis' : ''} ${paused ? 'paused' : ''}`} onClick={handleClick}>
      <video
        ref={vidRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
      />
    </div>
  )
}

/* ── Mosaic: justified flexbox rows ── */
function MosaicImage({ src, onClick, style }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.unobserve(el) } },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`g-mosaic-img ${vis ? 'vis' : ''}`} onClick={() => onClick(src)} style={style}>
      <img src={src} alt="" loading="lazy" />
    </div>
  )
}

function GalleryMosaic({ images, onImageClick }) {
  const containerRef = useRef(null)
  const [ratios, setRatios] = useState(null)
  const [containerW, setContainerW] = useState(0)
  const gap = 6
  const targetH = 280

  /* Shuffle once on mount — stable across re-renders */
  const shuffled = useMemo(() => {
    if (!images || images.length === 0) return []
    const arr = images.map(img => typeof img === 'string' ? img : img.image)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [images])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setContainerW(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (shuffled.length === 0) return
    let cancelled = false
    Promise.all(
      shuffled.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image()
            img.onload = () => resolve(img.naturalWidth / img.naturalHeight)
            img.onerror = () => resolve(1.5)
            img.src = src
          })
      )
    ).then((r) => {
      if (!cancelled) setRatios(r)
    })
    return () => { cancelled = true }
  }, [shuffled])

  const rows = useMemo(() => {
    if (!ratios || !containerW) return null
    const result = []
    let i = 0
    while (i < shuffled.length) {
      let rowRatioSum = 0
      let rowItems = []
      while (i < shuffled.length) {
        rowRatioSum += ratios[i]
        rowItems.push({ src: shuffled[i], ratio: ratios[i] })
        i++
        const rowW = containerW - gap * (rowItems.length - 1)
        const rowH = rowW / rowRatioSum
        if (rowH <= targetH) break
      }
      const totalGap = gap * (rowItems.length - 1)
      const rowH = (containerW - totalGap) / rowRatioSum
      result.push({ items: rowItems, height: rowH })
    }
    return result
  }, [ratios, containerW, shuffled, gap, targetH])

  return (
    <div ref={containerRef} className="g-mosaic">
      {rows &&
        rows.map((row, ri) => (
          <div key={ri} className="g-mosaic-row" style={{ height: row.height, gap }}>
            {row.items.map((item, ii) => (
              <MosaicImage
                key={`${ri}-${ii}`}
                src={item.src}
                onClick={onImageClick}
                style={{ width: item.ratio * row.height, flexShrink: 0, flexGrow: 0 }}
              />
            ))}
          </div>
        ))}
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
      case 'mosaic':
        if (row.images) row.images.forEach((img) => {
          const src = typeof img === 'string' ? img : img.image
          if (src) imgs.push(src)
        })
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
          case 'video':
            return <div key={i} className="g-row g-full" style={style}><GalleryVideo src={row.video} /></div>
          case 'videoFull':
            return <div key={i} className="g-row g-full g-cinematic" style={style}><GalleryVideo src={row.video} /></div>
          case 'mosaic':
            return <div key={i} style={style}><GalleryMosaic images={row.images} onImageClick={onImageClick} /></div>
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
