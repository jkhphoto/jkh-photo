'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

const SEGMENTS = [
  'MORE',
  '$500',
  'DOUBLE IT',
  'WAY MORE',
  '$2,500',
  'ADD A ZERO',
  'MORE THAN THAT',
  '$10,000',
  'SERIOUSLY MORE',
  'RAISE YOUR RATE',
  '$50/HR LOL',
  'CHARGE MORE',
]

const COLORS = [
  '#0a0a0a', '#1a1a1a', '#0a0a0a', '#1a1a1a',
  '#0a0a0a', '#1a1a1a', '#0a0a0a', '#1a1a1a',
  '#0a0a0a', '#1a1a1a', '#0a0a0a', '#1a1a1a',
]

const RESPONSES = [
  'The answer is always more.',
  'You\'re undercharging. You know it.',
  'Double it and add a travel fee.',
  'If they don\'t flinch, it\'s too low.',
  'Your mom thinks you should charge more.',
  'Add a licensing fee on top.',
  'The exposure won\'t pay rent.',
  'Remember: they have a budget. They just won\'t tell you.',
  'Whatever you\'re thinking, add 40%.',
  'Cost of living went up. So should your rate.',
]

export default function ChargeWheel() {
  const canvasRef = useRef(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [response, setResponse] = useState(null)
  const angleRef = useRef(0)
  const velRef = useRef(0)
  const rafRef = useRef(null)

  const segCount = SEGMENTS.length
  const segAngle = (Math.PI * 2) / segCount

  const draw = useCallback((angle) => {
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const size = 280
    cvs.width = size * dpr
    cvs.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const r = size / 2 - 4

    // draw segments
    for (let i = 0; i < segCount; i++) {
      const startA = angle + i * segAngle
      const endA = startA + segAngle

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, startA, endA)
      ctx.closePath()
      ctx.fillStyle = COLORS[i]
      ctx.fill()

      // segment border
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
      ctx.stroke()

      // text
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(startA + segAngle / 2)
      ctx.fillStyle = i % 2 === 0 ? '#f5f4f0' : 'rgba(245,244,240,0.7)'
      ctx.font = `500 8px 'Azeret Mono', monospace`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(SEGMENTS[i], r - 14, 0)
      ctx.restore()
    }

    // center circle
    ctx.beginPath()
    ctx.arc(cx, cy, 24, 0, Math.PI * 2)
    ctx.fillStyle = '#f5f4f0'
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 1
    ctx.stroke()

    // center text
    ctx.fillStyle = '#0a0a0a'
    ctx.font = `500 7px 'Azeret Mono', monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('SPIN', cx, cy)

    // pointer (top)
    ctx.beginPath()
    ctx.moveTo(cx, 2)
    ctx.lineTo(cx - 8, -6)
    ctx.lineTo(cx + 8, -6)
    ctx.closePath()
    ctx.fillStyle = '#6B4C3B'
    ctx.fill()

    // outer ring
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [segCount, segAngle])

  // animation loop
  const loop = useCallback(() => {
    if (velRef.current < 0.001) {
      setSpinning(false)
      // determine which segment the pointer is on
      // pointer is at top (angle = -PI/2)
      const norm = (((-angleRef.current - Math.PI / 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const idx = Math.floor(norm / segAngle) % segCount

      // always override to a "charge more" answer
      const moreSegments = [0, 2, 3, 6, 8, 9, 11]
      const landed = SEGMENTS[idx]
      setResult(landed)
      setResponse(RESPONSES[Math.floor(Math.random() * RESPONSES.length)])
      return
    }

    angleRef.current += velRef.current
    velRef.current *= 0.985 // friction
    draw(angleRef.current)
    rafRef.current = requestAnimationFrame(loop)
  }, [draw, segAngle, segCount])

  const spin = useCallback(() => {
    if (spinning) return
    setSpinning(true)
    setResult(null)
    setResponse(null)
    velRef.current = 0.25 + Math.random() * 0.2
    rafRef.current = requestAnimationFrame(loop)
  }, [spinning, loop])

  // initial draw
  useEffect(() => {
    draw(angleRef.current)
  }, [draw])

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  return (
    <div className="charge-widget">
      <div className="charge-canvas-wrap" onClick={spin}>
        <canvas
          ref={canvasRef}
          style={{ width: 280, height: 280, cursor: spinning ? 'default' : 'pointer' }}
        />
      </div>
      {result && (
        <div className="charge-result">
          <div className="charge-answer">{result}</div>
          <div className="charge-wisdom">{response}</div>
        </div>
      )}
      {!result && !spinning && (
        <div className="charge-hint">CLICK THE WHEEL</div>
      )}
    </div>
  )
}
