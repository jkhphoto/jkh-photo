'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function HomeProjectList({ projects }) {
  const sectionRef = useRef(null)
  const itemsRef = useRef([])

  // Fade clock when section is in view
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

  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('hp-vis')
      })
    }, { threshold: 0.1 })
    itemsRef.current.forEach(el => el && io.observe(el))
    return () => io.disconnect()
  }, [projects])

  if (!projects || projects.length === 0) return null

  // Limit to 6 featured projects
  const featured = projects.slice(0, 6)

  return (
    <>
      <section className="hp-projects" ref={sectionRef}>
        <div className="hp-grid">
          {featured.map((p, i) => {
            const num = String(p.displayNumber || i + 1).padStart(2, '0')
            const hasImg = !!p.featuredImage
            return (
              <Link
                key={p._sys.filename}
                href={`/projects/${p._sys.filename}`}
                className={`hp-card hp-card-${i}`}
                ref={el => itemsRef.current[i] = el}
              >
                {hasImg && (
                  <div className="hp-card-img">
                    <img src={p.featuredImage} alt={p.title} />
                  </div>
                )}
                <div className="hp-card-info">
                  <span className="hp-card-num">{num}</span>
                  <h3 className="hp-card-title">{p.title}</h3>
                  <span className="hp-card-cat">{p.category || ''}</span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="hp-view-all">
          <Link href="/idx">View All Projects →</Link>
        </div>
      </section>

      <footer className="home-footer">
        <div className="foot-l">© 2025 JKH Photo — Brooklyn, NY</div>
        <div className="foot-r">
          <a href="https://www.instagram.com/jkh_photo" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.linkedin.com/in/josephkhale/" target="_blank" rel="noopener">LinkedIn</a>
          <a href="mailto:hello@josephkhale.com">Email</a>
        </div>
      </footer>
    </>
  )
}
