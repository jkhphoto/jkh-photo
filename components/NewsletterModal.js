'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

export default function NewsletterModal({ onClose }) {
  const [email, setEmail] = useState('')
  const inputRef = useRef(null)

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKey)
    if (inputRef.current) inputRef.current.focus()
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [handleKey])

  const handleSubmit = () => {
    if (!email) return
    window.open(
      `https://forimmediaterelease.beehiiv.com/subscribe?email=${encodeURIComponent(email)}`,
      '_blank'
    )
    onClose()
  }

  return (
    <div className="nl-overlay" onClick={onClose}>
      <div className="nl-modal" onClick={(e) => e.stopPropagation()}>
        <button className="nl-close" onClick={onClose}>Close [Esc]</button>
        <div className="nl-header">For Immediate Release</div>
        <p className="nl-desc">Newsletter on the business of freelance photography, creative entrepreneurship, and the stories behind the work.</p>
        <div className="nl-form-wrap">
          <input
            ref={inputRef}
            type="email"
            className="nl-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          />
          <button
            className="nl-submit"
            onClick={handleSubmit}
            disabled={!email}
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  )
}
