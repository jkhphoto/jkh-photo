'use client'
import { useRef, useEffect, useCallback, useState } from 'react'

const W = 560
const H = 400
const GRAVITY = 0.4
const BOUNCE = 0.7
const FRICTION = 0.999

export default function GravitySandbox() {
  const canvasRef = useRef(null)
  const balls = useRef([])
  const raf = useRef(null)
  const [count, setCount] = useState(0)

  const addBall = useCallback((e) => {
    const cvs = canvasRef.current
    if (!cvs) return
    const rect = cvs.getBoundingClientRect()
    const scaleX = W / rect.width
    const scaleY = H / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    const r = 6 + Math.random() * 14
    const hue = Math.random() * 360
    balls.current.push({
      x, y, r,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 2,
      color: `hsl(${hue}, 55%, 50%)`,
    })
    setCount(balls.current.length)
  }, [])

  const clear = useCallback(() => {
    balls.current = []
    setCount(0)
  }, [])

  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    cvs.width = W * dpr
    cvs.height = H * dpr
    ctx.scale(dpr, dpr)

    const loop = () => {
      raf.current = requestAnimationFrame(loop)
      ctx.fillStyle = '#f5f4f0'
      ctx.fillRect(0, 0, W, H)

      // grid
      ctx.fillStyle = 'rgba(0,0,0,0.03)'
      for (let x = 0; x < W; x += 20) {
        for (let y = 0; y < H; y += 20) {
          ctx.beginPath()
          ctx.arc(x + 10, y + 10, 0.8, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      const all = balls.current
      for (let i = 0; i < all.length; i++) {
        const b = all[i]
        b.vy += GRAVITY
        b.vx *= FRICTION
        b.x += b.vx
        b.y += b.vy

        // walls
        if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx) * BOUNCE }
        if (b.x + b.r > W) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * BOUNCE }
        if (b.y + b.r > H) { b.y = H - b.r; b.vy = -Math.abs(b.vy) * BOUNCE }
        if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy) * BOUNCE }

        // ball-ball collisions
        for (let j = i + 1; j < all.length; j++) {
          const o = all[j]
          const dx = o.x - b.x
          const dy = o.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const minDist = b.r + o.r
          if (dist < minDist && dist > 0) {
            const nx = dx / dist
            const ny = dy / dist
            const overlap = minDist - dist
            b.x -= nx * overlap * 0.5
            b.y -= ny * overlap * 0.5
            o.x += nx * overlap * 0.5
            o.y += ny * overlap * 0.5
            const dvx = b.vx - o.vx
            const dvy = b.vy - o.vy
            const dot = dvx * nx + dvy * ny
            if (dot > 0) {
              b.vx -= dot * nx * BOUNCE
              b.vy -= dot * ny * BOUNCE
              o.vx += dot * nx * BOUNCE
              o.vy += dot * ny * BOUNCE
            }
          }
        }

        // draw
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = b.color
        ctx.fill()
      }
    }

    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  // touch support
  const handleTouch = useCallback((e) => {
    e.preventDefault()
    const touch = e.changedTouches[0]
    const cvs = canvasRef.current
    if (!cvs) return
    const rect = cvs.getBoundingClientRect()
    const scaleX = W / rect.width
    const scaleY = H / rect.height
    const x = (touch.clientX - rect.left) * scaleX
    const y = (touch.clientY - rect.top) * scaleY
    const r = 6 + Math.random() * 14
    const hue = Math.random() * 360
    balls.current.push({
      x, y, r,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 2,
      color: `hsl(${hue}, 55%, 50%)`,
    })
    setCount(balls.current.length)
  }, [])

  return (
    <div className="gravity-widget">
      <div className="gravity-board">
        <canvas
          ref={canvasRef}
          style={{ width: W, height: H }}
          onClick={addBall}
          onTouchStart={handleTouch}
        />
      </div>
      <div className="gravity-footer">
        <span>CLICK TO DROP · {count} BALL{count !== 1 ? 'S' : ''}</span>
        {count > 0 && (
          <>
            <span className="extras-sep">·</span>
            <button className="gravity-clear" onClick={clear}>CLEAR</button>
          </>
        )}
      </div>
    </div>
  )
}
