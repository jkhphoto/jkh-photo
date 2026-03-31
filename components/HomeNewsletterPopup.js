'use client'
import { useState, useEffect } from 'react'
import NewsletterModal from './NewsletterModal'

export default function HomeNewsletterPopup() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('nl-dismissed')) return
    const timer = setTimeout(() => setShow(true), 6000)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setShow(false)
    sessionStorage.setItem('nl-dismissed', '1')
  }

  if (!show) return null
  return <NewsletterModal onClose={handleClose} />
}
