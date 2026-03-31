'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const CELL = 20
const COLS = 28
const ROWS = 28
const W = COLS * CELL
const H = ROWS * CELL
const TICK_START = 120
const TICK_MIN = 60

const DIR = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' }

function rand(snake) {
  let pos
  do {
    pos = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)]
  } while (snake.some(s => s[0] === pos[0] && s[1] === pos[1]))
  return pos
}

export default function SnakeGame() {
  const canvasRef = useRef(null)
  const state = useRef({
    snake: [[14, 14], [13, 14], [12, 14]],
    dir: 'right',
    nextDir: 'right',
    food: [20, 14],
    score: 0,
    best: 0,
    phase: 'idle', // idle | play | dead
    tick: TICK_START,
  })
  const raf = useRef(null)
  const lastTick = useRef(0)
  const [, forceRender] = useState(0)
  const touchStart = useRef(null)

  const reset = useCallback(() => {
    const s = state.current
    s.snake = [[14, 14], [13, 14], [12, 14]]
    s.dir = 'right'
    s.nextDir = 'right'
    s.food = rand(s.snake)
    s.score = 0
    s.phase = 'play'
    s.tick = TICK_START
    lastTick.current = performance.now()
    forceRender(n => n + 1)
  }, [])

  // draw
  const draw = useCallback(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    cvs.width = W * dpr
    cvs.height = H * dpr
    ctx.scale(dpr, dpr)

    const s = state.current

    // background
    ctx.fillStyle = '#f5f4f0'
    ctx.fillRect(0, 0, W, H)

    // grid dots
    ctx.fillStyle = 'rgba(0,0,0,0.04)'
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        ctx.beginPath()
        ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // food — pulsing dot
    const pulse = 0.8 + Math.sin(performance.now() / 200) * 0.2
    ctx.fillStyle = '#6B4C3B'
    ctx.beginPath()
    ctx.arc(
      s.food[0] * CELL + CELL / 2,
      s.food[1] * CELL + CELL / 2,
      (CELL / 2 - 2) * pulse,
      0, Math.PI * 2
    )
    ctx.fill()

    // snake body
    s.snake.forEach((seg, i) => {
      if (i === 0) return // head drawn separately
      const alpha = 1 - (i / s.snake.length) * 0.6
      ctx.fillStyle = `rgba(10,10,10,${alpha})`
      const inset = 1
      ctx.fillRect(
        seg[0] * CELL + inset,
        seg[1] * CELL + inset,
        CELL - inset * 2,
        CELL - inset * 2
      )
    })

    // snake head — "JKH" text
    const head = s.snake[0]
    const hx = head[0] * CELL + CELL / 2
    const hy = head[1] * CELL + CELL / 2

    ctx.fillStyle = s.phase === 'dead' ? '#c44' : '#0a0a0a'
    ctx.fillRect(head[0] * CELL, head[1] * CELL, CELL, CELL)

    ctx.fillStyle = '#f5f4f0'
    ctx.font = `bold 8px 'Azeret Mono', monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('JKH', hx, hy + 0.5)
  }, [])

  // game loop
  const loop = useCallback((now) => {
    const s = state.current
    raf.current = requestAnimationFrame(loop)

    if (s.phase !== 'play') {
      draw()
      return
    }

    if (now - lastTick.current < s.tick) {
      draw()
      return
    }
    lastTick.current = now

    // commit direction
    s.dir = s.nextDir
    const d = DIR[s.dir]
    const head = [s.snake[0][0] + d[0], s.snake[0][1] + d[1]]

    // wall collision — wrap
    if (head[0] < 0) head[0] = COLS - 1
    if (head[0] >= COLS) head[0] = 0
    if (head[1] < 0) head[1] = ROWS - 1
    if (head[1] >= ROWS) head[1] = 0

    // self collision
    if (s.snake.some(seg => seg[0] === head[0] && seg[1] === head[1])) {
      s.phase = 'dead'
      if (s.score > s.best) s.best = s.score
      forceRender(n => n + 1)
      draw()
      return
    }

    s.snake.unshift(head)

    // eat food
    if (head[0] === s.food[0] && head[1] === s.food[1]) {
      s.score++
      s.food = rand(s.snake)
      s.tick = Math.max(TICK_MIN, s.tick - 2)
    } else {
      s.snake.pop()
    }

    draw()
  }, [draw])

  // start loop
  useEffect(() => {
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [loop])

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      const s = state.current

      if (s.phase === 'idle' || s.phase === 'dead') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          reset()
          return
        }
      }

      if (s.phase !== 'play') return

      const map = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
        W: 'up', S: 'down', A: 'left', D: 'right',
      }
      const newDir = map[e.key]
      if (newDir && OPP[newDir] !== s.dir) {
        e.preventDefault()
        s.nextDir = newDir
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reset])

  // touch / swipe
  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return

    const onStart = (e) => {
      const t = e.touches[0]
      touchStart.current = { x: t.clientX, y: t.clientY }
    }
    const onEnd = (e) => {
      if (!touchStart.current) return
      const s = state.current
      const t = e.changedTouches[0]
      const dx = t.clientX - touchStart.current.x
      const dy = t.clientY - touchStart.current.y
      touchStart.current = null

      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      // tap (not a swipe) — start/restart
      if (absDx < 15 && absDy < 15) {
        if (s.phase === 'idle' || s.phase === 'dead') reset()
        return
      }

      if (s.phase !== 'play') return

      let newDir
      if (absDx > absDy) newDir = dx > 0 ? 'right' : 'left'
      else newDir = dy > 0 ? 'down' : 'up'

      if (OPP[newDir] !== s.dir) s.nextDir = newDir
    }

    cvs.addEventListener('touchstart', onStart, { passive: true })
    cvs.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      cvs.removeEventListener('touchstart', onStart)
      cvs.removeEventListener('touchend', onEnd)
    }
  }, [reset])

  const s = state.current

  return (
    <div className="snake-wrap">
      <div className="snake-hud">
        <span className="snake-label">SNAKE</span>
        <span className="snake-sep">·</span>
        <span className="snake-score">{String(s.score).padStart(3, '0')}</span>
        {s.best > 0 && (
          <>
            <span className="snake-sep">·</span>
            <span className="snake-best">BEST {String(s.best).padStart(3, '0')}</span>
          </>
        )}
      </div>

      <div className="snake-board">
        <canvas
          ref={canvasRef}
          style={{ width: W, height: H }}
        />
        {s.phase === 'idle' && (
          <div className="snake-overlay">
            <div className="snake-title">JKH</div>
            <div className="snake-subtitle">SNAKE</div>
            <div className="snake-start">PRESS SPACE OR TAP TO START</div>
          </div>
        )}
        {s.phase === 'dead' && (
          <div className="snake-overlay">
            <div className="snake-dead-score">{String(s.score).padStart(3, '0')}</div>
            <div className="snake-start">PRESS SPACE OR TAP TO RETRY</div>
          </div>
        )}
      </div>

      <div className="snake-footer">
        <span>ARROWS / WASD / SWIPE</span>
        <span className="snake-sep">·</span>
        <span>JKH PHOTO</span>
      </div>
    </div>
  )
}
