import Link from 'next/link'

export const metadata = { title: 'Not Found — JKH Photo' }

export default function NotFound() {
  return (
    <div className="err">
      <p className="err-label">404 — This frame doesn&rsquo;t exist</p>
      <div className="err-actions">
        <Link href="/">Home</Link>
        <Link href="/idx">Index</Link>
      </div>
    </div>
  )
}
