'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

// Fake historical price data for Samsung T7 1TB — loosely based on real price swings
const BASE_PRICE = 89.99
function generateHistory(days) {
  const data = []
  let price = 109.99 // start price ~18 months ago
  const now = Date.now()
  for (let i = days; i >= 0; i--) {
    const t = now - i * 86400000
    // trend downward from ~110 to ~90 with volatility
    const trend = -0.03
    const noise = (Math.random() - 0.48) * 3.5
    const seasonal = Math.sin(i / 45) * 4
    price = Math.max(64, Math.min(135, price + trend + noise + seasonal))
    data.push({ t, price: Math.round(price * 100) / 100 })
  }
  // pin last price to current
  data[data.length - 1].price = BASE_PRICE
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

export default function T7Ticker() {
  const [allData] = useState(() => generateHistory(540))
  const [range, setRange] = useState('1Y')
  const canvasRef = useRef(null)
  const [hover, setHover] = useState(null)

  const rangeObj = RANGES.find(r => r.label === range)
  const data = allData.slice(-rangeObj.days)
  const prices = data.map(d => d.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const current = prices[prices.length - 1]
  const first = prices[0]
  const change = current - first
  const changePct = ((change / first) * 100)
  const isUp = change >= 0

  const W = 500
  const H = 200

  // draw chart
  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    cvs.width = W * dpr
    cvs.height = H * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, W, H)

    const pad = { top: 10, bottom: 20, left: 0, right: 0 }
    const cw = W - pad.left - pad.right
    const ch = H - pad.top - pad.bottom
    const priceRange = max - min || 1

    // grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.04)'
    ctx.lineWidth = 1
    for (let i = 0; i < 4; i++) {
      const y = pad.top + (ch / 3) * i
      ctx.beginPath()
      ctx.moveTo(pad.left, y)
      ctx.lineTo(W - pad.right, y)
      ctx.stroke()
    }

    // line
    const color = isUp ? '#2d8a4e' : '#c44'
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.lineJoin = 'round'
    ctx.beginPath()
    data.forEach((d, i) => {
      const x = pad.left + (i / (data.length - 1)) * cw
      const y = pad.top + (1 - (d.price - min) / priceRange) * ch
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // gradient fill
    const lastX = pad.left + cw
    const lastY = pad.top + (1 - (data[data.length - 1].price - min) / priceRange) * ch
    ctx.lineTo(lastX, H)
    ctx.lineTo(pad.left, H)
    ctx.closePath()
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, isUp ? 'rgba(45,138,78,0.12)' : 'rgba(204,68,68,0.12)')
    grad.addColorStop(1, 'rgba(245,244,240,0)')
    ctx.fillStyle = grad
    ctx.fill()

    // hover line
    if (hover !== null && hover >= 0 && hover < data.length) {
      const hx = pad.left + (hover / (data.length - 1)) * cw
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(hx, pad.top)
      ctx.lineTo(hx, H - pad.bottom)
      ctx.stroke()
      ctx.setLineDash([])

      const hy = pad.top + (1 - (data[hover].price - min) / priceRange) * ch
      ctx.beginPath()
      ctx.arc(hx, hy, 3, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    }
  }, [data, min, max, isUp, hover])

  const handleMouseMove = useCallback((e) => {
    const cvs = canvasRef.current
    if (!cvs) return
    const rect = cvs.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = x / rect.width
    const idx = Math.round(ratio * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, idx)))
  }, [data.length])

  const handleMouseLeave = useCallback(() => setHover(null), [])

  const displayPrice = hover !== null ? data[hover]?.price : current
  const displayDate = hover !== null ? new Date(data[hover]?.t) : new Date()
  const displayChange = hover !== null ? (data[hover]?.price - first) : change
  const displayPct = hover !== null ? ((data[hover]?.price - first) / first * 100) : changePct
  const displayUp = displayChange >= 0

  return (
    <div className="t7-widget">
      <div className="t7-header">
        <div className="t7-name">
          <span className="t7-ticker">T7-1TB</span>
          <span className="t7-full">Samsung T7 Portable SSD · 1TB</span>
        </div>
        <div className="t7-price-row">
          <span className="t7-price">${displayPrice.toFixed(2)}</span>
          <span className={`t7-change ${displayUp ? 'up' : 'down'}`}>
            {displayUp ? '+' : ''}{displayChange.toFixed(2)} ({displayUp ? '+' : ''}{displayPct.toFixed(2)}%)
          </span>
        </div>
        {hover !== null && (
          <div className="t7-hover-date">
            {displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
      </div>

      <div className="t7-chart">
        <canvas
          ref={canvasRef}
          style={{ width: W, height: H }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      <div className="t7-ranges">
        {RANGES.map(r => (
          <button
            key={r.label}
            className={`t7-range ${range === r.label ? 'active' : ''}`}
            onClick={() => { setRange(r.label); setHover(null) }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="t7-stats">
        <div className="t7-stat">
          <span className="t7-stat-label">HIGH</span>
          <span className="t7-stat-val">${max.toFixed(2)}</span>
        </div>
        <div className="t7-stat">
          <span className="t7-stat-label">LOW</span>
          <span className="t7-stat-val">${min.toFixed(2)}</span>
        </div>
        <div className="t7-stat">
          <span className="t7-stat-label">AVG</span>
          <span className="t7-stat-val">${(prices.reduce((a, b) => a + b) / prices.length).toFixed(2)}</span>
        </div>
        <div className="t7-stat">
          <span className="t7-stat-label">VOL</span>
          <span className="t7-stat-val">1TB</span>
        </div>
      </div>

      <div className="t7-disclaimer">Not a real stock. It's a hard drive.</div>
    </div>
  )
}
