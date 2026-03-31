'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// Real-ish price history for Samsung T7 2TB based on actual market data
// Launched at ~$399, dropped to $99 on BF 2023, spiked to $500+ in 2026 memory shortage
function generateHistory() {
  const data = []
  const now = Date.now()
  const startDate = now - 540 * 86400000 // ~18 months back

  // Price journey: start ~180, BF dip to ~109, rise through shortage to current ~330
  const keyframes = [
    { day: 0, price: 179.99 },
    { day: 20, price: 185.99 },
    { day: 40, price: 172.99 },
    { day: 55, price: 164.99 },
    { day: 70, price: 155.99 },
    { day: 90, price: 148.99 },
    { day: 110, price: 139.99 },
    { day: 130, price: 124.99 },
    { day: 150, price: 109.99 },
    { day: 160, price: 89.99 },  // flash sale crater
    { day: 165, price: 74.99 },  // BF absolute bottom
    { day: 170, price: 69.99 },  // THE DIP
    { day: 175, price: 84.99 },  // bounce
    { day: 185, price: 109.99 },
    { day: 200, price: 139.99 },
    { day: 220, price: 159.99 },
    { day: 240, price: 189.99 }, // shortage whispers
    { day: 260, price: 219.99 },
    { day: 275, price: 259.99 },
    { day: 290, price: 289.99 },
    { day: 310, price: 329.99 },
    { day: 330, price: 369.99 },
    { day: 350, price: 419.99 }, // panic buying
    { day: 370, price: 459.99 },
    { day: 390, price: 499.99 }, // peak insanity
    { day: 410, price: 479.99 },
    { day: 430, price: 449.99 }, // slight cool off
    { day: 450, price: 419.99 },
    { day: 470, price: 389.99 },
    { day: 490, price: 359.99 },
    { day: 510, price: 339.99 },
    { day: 530, price: 349.99 }, // dead cat bounce
    { day: 540, price: 332.99 }, // current
  ]

  for (let d = 0; d <= 540; d++) {
    // interpolate between keyframes
    let lo = keyframes[0], hi = keyframes[keyframes.length - 1]
    for (let k = 0; k < keyframes.length - 1; k++) {
      if (d >= keyframes[k].day && d <= keyframes[k + 1].day) {
        lo = keyframes[k]; hi = keyframes[k + 1]; break
      }
    }
    const t = hi.day === lo.day ? 1 : (d - lo.day) / (hi.day - lo.day)
    const base = lo.price + (hi.price - lo.price) * t
    const noise = (Math.sin(d * 7.3) * 8 + Math.cos(d * 2.1) * 6 + Math.sin(d * 13.7) * 4) // aggressive wobble
    const price = Math.round((base + noise) * 100) / 100

    data.push({ t: startDate + d * 86400000, price })
  }

  return data
}

const RANGES = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 540 },
]

const HEADLINES = [
  'BREAKING: MEMORY SHORTAGE ENTERS 9TH MONTH',
  'SSDT7 UP 400% FROM NOVEMBER LOW — IS IT TOO LATE TO BUY?',
  'SAMSUNG T7 NOW WORTH MORE THAN SOME USED CAMERAS',
  'PHOTOGRAPHERS HOARD SSDS LIKE TOILET PAPER IN 2020',
  'WALL ST CONFUSED BY HARD DRIVE BECOMING ASSET CLASS',
  'ANALYSTS UPGRADE SSDT7 TO "STRONG BUY" (THEY NEED ONE)',
  '"I SOLD MY T7 AND PAID RENT" — REDDIT USER',
  'SSD FUTURES MARKET OPENS ON NASDAQ (NOT REALLY)',
]

export default function T7Ticker() {
  const [allData] = useState(generateHistory)
  const [range, setRange] = useState('1Y')
  const canvasRef = useRef(null)
  const [hover, setHover] = useState(null)
  const [headline] = useState(() => HEADLINES[Math.floor(Math.random() * HEADLINES.length)])
  const [tickTime, setTickTime] = useState(new Date())

  useEffect(() => {
    const i = setInterval(() => setTickTime(new Date()), 1000)
    return () => clearInterval(i)
  }, [])

  const rangeObj = RANGES.find(r => r.label === range)
  const data = useMemo(() => allData.slice(-rangeObj.days), [allData, rangeObj.days])
  const prices = data.map(d => d.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const current = prices[prices.length - 1]
  const first = prices[0]
  const change = current - first
  const changePct = (change / first) * 100
  const isUp = change >= 0

  const W = 900, H = 220

  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    cvs.width = W * dpr; cvs.height = H * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const pad = { top: 8, bottom: 16, left: 0, right: 0 }
    const cw = W, ch = H - pad.top - pad.bottom
    const pr = max - min || 1

    ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 1
    for (let i = 0; i < 4; i++) {
      const y = pad.top + (ch / 3) * i
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }

    const color = isUp ? '#2d8a4e' : '#c44'
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'
    ctx.beginPath()
    data.forEach((d, i) => {
      const x = (i / (data.length - 1)) * cw
      const y = pad.top + (1 - (d.price - min) / pr) * ch
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()

    ctx.lineTo(cw, H); ctx.lineTo(0, H); ctx.closePath()
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, isUp ? 'rgba(45,138,78,0.1)' : 'rgba(204,68,68,0.1)')
    grad.addColorStop(1, 'rgba(245,244,240,0)')
    ctx.fillStyle = grad; ctx.fill()

    if (hover !== null && hover >= 0 && hover < data.length) {
      const hx = (hover / (data.length - 1)) * cw
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
      ctx.beginPath(); ctx.moveTo(hx, pad.top); ctx.lineTo(hx, H - pad.bottom); ctx.stroke()
      ctx.setLineDash([])
      const hy = pad.top + (1 - (data[hover].price - min) / pr) * ch
      ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2)
      ctx.fillStyle = color; ctx.fill()
    }
  }, [data, min, max, isUp, hover, W, H])

  const handleMouseMove = useCallback((e) => {
    const cvs = canvasRef.current; if (!cvs) return
    const rect = cvs.getBoundingClientRect()
    const idx = Math.round(((e.clientX - rect.left) / rect.width) * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, idx)))
  }, [data.length])

  const dp = hover !== null ? data[hover]?.price : current
  const dd = hover !== null ? new Date(data[hover]?.t) : new Date()
  const dc = hover !== null ? (data[hover]?.price - first) : change
  const dPct = hover !== null ? ((data[hover]?.price - first) / first * 100) : changePct
  const dUp = dc >= 0

  return (
    <div className="t7-widget">
      <div className="t7-marquee">
        <span className="t7-marquee-text">
          {headline} · SSDT7 {dUp ? '▲' : '▼'} ${dp.toFixed(2)} · VOL: 2TB · MKT CAP: LOL ·&nbsp;
          {headline} · SSDT7 {dUp ? '▲' : '▼'} ${dp.toFixed(2)} · VOL: 2TB · MKT CAP: LOL ·&nbsp;
        </span>
      </div>

      <div className="t7-header">
        <div className="t7-name">
          <span className="t7-ticker">SSDT7</span>
          <span className="t7-full">Samsung T7 Portable SSD · 2TB</span>
          <span className="t7-live">{tickTime.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>
        <div className="t7-price-row">
          <span className="t7-price">${dp.toFixed(2)}</span>
          <span className={`t7-change ${dUp ? 'up' : 'down'}`}>
            {dUp ? '▲' : '▼'} {dUp ? '+' : ''}{dc.toFixed(2)} ({dUp ? '+' : ''}{dPct.toFixed(2)}%)
          </span>
        </div>
        {hover !== null && (
          <div className="t7-hover-date">{dd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        )}
      </div>

      <div className="t7-chart">
        <canvas ref={canvasRef} style={{ width: W, height: H }} onMouseMove={handleMouseMove} onMouseLeave={() => setHover(null)} />
      </div>

      <div className="t7-ranges">
        {RANGES.map(r => (
          <button key={r.label} className={`t7-range ${range === r.label ? 'active' : ''}`}
            onClick={() => { setRange(r.label); setHover(null) }}>{r.label}</button>
        ))}
      </div>

      <div className="t7-stats">
        <div className="t7-stat"><span className="t7-stat-label">HIGH</span><span className="t7-stat-val">${max.toFixed(2)}</span></div>
        <div className="t7-stat"><span className="t7-stat-label">LOW</span><span className="t7-stat-val">${min.toFixed(2)}</span></div>
        <div className="t7-stat"><span className="t7-stat-label">AVG</span><span className="t7-stat-val">${(prices.reduce((a, b) => a + b) / prices.length).toFixed(2)}</span></div>
        <div className="t7-stat"><span className="t7-stat-label">P/E</span><span className="t7-stat-val">N/A</span></div>
        <div className="t7-stat"><span className="t7-stat-label">DIV</span><span className="t7-stat-val">0 GB</span></div>
        <div className="t7-stat"><span className="t7-stat-label">VOL</span><span className="t7-stat-val">2TB</span></div>
      </div>

      <div className="t7-disclaimer">Not financial advice. This is a hard drive.</div>
    </div>
  )
}
