'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function HomeProjectList({ projects }) {
  const [previewSrc, setPreviewSrc] = useState(null)
  const [active, setActive] = useState(false)
  const previewRef = useRef(null)
  const sectionRef = useRef(null)
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

  useEffect(() => {
    const clock = document.querySelector('.clock-corner')
    if (!clock || !sectionRef.current) return
    const io = new IntersectionObserver(([e]) => {
      clock.style.opacity = e.isIntersecting ? '0' : ''
      clock.style.pointerEvents = e.isIntersecting ? 'none' : ''
    }, { threshold: 0.05 })
    io.observe(sectionRef.current)
    return () => io.disconnect()
  }, [])

  if (!projects || projects.length === 0) return null

  return (
    <>
      <section className="projects" ref={sectionRef}>
        <ul className="proj-list">
          {projects.map((p) => {
            const num = String(p.displayNumber || 0).padStart(2, '0')
            return (
              <li key={p._sys.filename} className="proj-item"
                onMouseEnter={() => { setPreviewSrc(p.featuredImage || null); setActive(true) }}
                onMouseLeave={() => { setActive(false); setPreviewSrc(null) }}>
                <Link href={`/projects/${p._sys.filename}`}>
                  <span className="proj-item-name">{p.title}</span>
                  <span className="proj-item-tag">{p.category}</span>
                  <span className="proj-item-num">[{num}]</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
      <footer className="home-footer">
        <div className="foot-l">© 2025 JKH Photo — Brooklyn, NY</div>
        <div className="foot-r">
          <a href="https://www.instagram.com/jkh_photo" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.linkedin.com/in/josephkhale/" target="_blank" rel="noopener">LinkedIn</a>
          <a href="mailto:hello@josephkhale.com">Email</a>
        </div>
      </footer>
      <img ref={previewRef} className={`proj-preview ${previewSrc && active ? 'show' : ''}`} src={previewSrc || ''} alt="" />
    </>
  )
}
