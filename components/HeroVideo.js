'use client'
import { useRef, useEffect, useState } from 'react'

export default function HeroVideo() {
  const ref = useRef(null)
  const [hidden, setHidden] = useState(false)
  const toggle = () => {
    const v = ref.current
    if (!v) return
    v.paused ? v.play() : v.pause()
  }
  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="hero-video" onClick={toggle}>
      <video ref={ref} autoPlay muted loop playsInline>
        <source src="/video/reel.mp4" type="video/mp4" />
      </video>
      <div className={`scroll-hint ${hidden ? 'hidden' : ''}`}>
        <span className="scroll-hint-line" />
      </div>
    </div>
  )
}
