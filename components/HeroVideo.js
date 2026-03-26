'use client'
import { useRef } from 'react'

export default function HeroVideo() {
  const ref = useRef(null)
  const toggle = () => {
    const v = ref.current
    if (!v) return
    v.paused ? v.play() : v.pause()
  }
  return (
    <div className="hero-video" onClick={toggle}>
      <video ref={ref} autoPlay muted loop playsInline>
        <source src="/video/reel.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
