'use client'
import { useRef, useEffect, useState } from 'react'

export default function LandingPage() {
  const videoRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const script = document.createElement('script')
    script.src = 'https://subscribe-forms.beehiiv.com/embed.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      try { document.body.removeChild(script) } catch {}
    }
  }, [])

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    v.paused ? v.play() : v.pause()
  }

  return (
    <main className="landing">
      {/* Left: Video */}
      <section className="landing-left" onClick={toggle}>
        <video ref={videoRef} autoPlay muted loop playsInline>
          <source src="/video/reel.mp4" type="video/mp4" />
        </video>
      </section>

      {/* Right: Copy + Newsletter */}
      <section className={`landing-right ${mounted ? 'vis' : ''}`}>
        <div className="landing-right-inner">
          <div className="landing-status">
            <span className="landing-dot" />
            <span>Under Construction</span>
          </div>

          <p className="landing-msg">
            New site coming soon. In the meantime, sign up below to stay in the loop.
          </p>

          <div className="landing-nl">
            <div className="landing-nl-label">For Immediate Release</div>
            <p className="landing-nl-desc">
              My newsletter on what I&rsquo;m up to, work I&rsquo;m shooting, and the learnings along the way.
            </p>
            <iframe
              src="https://subscribe-forms.beehiiv.com/01f56560-70cc-494b-8e31-83ecd94e96e5"
              className="landing-nl-iframe"
              data-test-id="beehiiv-embed"
              frameBorder="0"
              scrolling="no"
              title="Newsletter subscribe"
            />
          </div>

          <div className="landing-contact">
            <a href="mailto:hello@josephkhale.com">hello@josephkhale.com</a>
            <span className="landing-sep">&middot;</span>
            <a href="https://www.instagram.com/jkh_photo/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <span className="landing-sep">&middot;</span>
            <a href="https://www.linkedin.com/in/josephkhale/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </section>
    </main>
  )
}
