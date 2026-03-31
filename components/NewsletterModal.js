'use client'
import { useEffect, useCallback } from 'react'

export default function NewsletterModal({ onClose }) {
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [handleKey])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://subscribe-forms.beehiiv.com/embed.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      try { document.body.removeChild(script) } catch {}
    }
  }, [])

  return (
    <div className="nl-overlay" onClick={onClose}>
      <div className="nl-modal" onClick={(e) => e.stopPropagation()}>
        <button className="nl-close" onClick={onClose}>Close [Esc]</button>
        <div className="nl-header">For Immediate Release</div>
        <p className="nl-desc">Newsletter on the business of freelance photography, creative entrepreneurship, and the stories behind the work.</p>
        <iframe
          src="https://subscribe-forms.beehiiv.com/01f56560-70cc-494b-8e31-83ecd94e96e5"
          className="nl-iframe"
          data-test-id="beehiiv-embed"
          frameBorder="0"
          scrolling="no"
          title="Newsletter subscribe"
        />
      </div>
    </div>
  )
}
