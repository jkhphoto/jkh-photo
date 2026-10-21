import Link from 'next/link'
import ClearCart from './ClearCart'

export const metadata = { title: 'Thank you — JKH Photo' }

export default function ThanksPage() {
  return (
    <div className="err">
      <ClearCart />
      <p className="err-label">Order received — thank you</p>
      <p
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--dim)',
          letterSpacing: '0.04em',
          maxWidth: 420,
          textAlign: 'center',
          lineHeight: 1.7,
        }}
      >
        A receipt is on its way to your email. Picking up in NYC? Reply to
        it and we&rsquo;ll set a time.
      </p>
      <div className="err-actions">
        <Link href="/shop">Back to the shop</Link>
        <Link href="/">Home</Link>
      </div>
    </div>
  )
}
