'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const CELL = 18
const TICK_START = 110
const TICK_MIN = 55

const DIR = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' }

function rand(cols, rows, snake) {
  let pos
  do {
    pos = [Math.floor(Math.random() * cols), Math.floor(Math.random() * rows)]
  } while (snake.some(s => s[0] === pos[0] && s[1] === pos[1]))
  return pos
}

function loadBoard() {
  try { return JSON.parse(localStorage.getItem('jkh-snake-board') || '[]') }
  catch { return [] }
}
function saveBoard(board) {
  try { localStorage.setItem('jkh-snake-board', JSON.stringify(board.slice(0, 10))) }
  catch {}
}

export default function SnakeGame() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const cursorImg = useRef(null)
  const [dims, setDims] = useState(null)
  const state = useRef(null)
  const raf = useRef(null)
  const lastTick = useRef(0)
  const [render, forceRender] = useState(0)
  const touchStart = useRef(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [initials, setInitials] = useState('')
  const inputRefs = useRef([])

  // load cursor image
  useEffect(() => {
    const img = new Image()
    img.src = '/images/cursor.png'
    img.onload = () => { cursorImg.current = img }
  }, [])

  // load leaderboard
  useEffect(() => {
    setLeaderboard(loadBoard())
  }, [])

  // measure container and compute grid
  useEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current
      if (!wrap) return
      const rect = wrap.getBoundingClientRect()
      const maxW = Math.floor(rect.width)
      const maxH = Math.min(Math.floor(window.innerHeight * 0.7), 600)
      const cols = Math.floor(maxW / CELL)
      const rows = Math.floor(maxH / CELL)
      const w = cols * CELL
      const h = rows * CELL
      setDims({ cols, rows, w, h })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // init state when dims change
  useEffect(() => {
    if (!dims) return
    const cx = Math.floor(dims.cols / 2)
    const cy = Math.floor(dims.rows / 2)
    state.current = {
      snake: [[cx, cy], [cx - 1, cy], [cx - 2, cy]],
      dir: 'right',
      nextDir: 'right',
      food: rand(dims.cols, dims.rows, [[cx, cy], [cx - 1, cy], [cx - 2, cy]]),
      score: 0,
      phase: 'idle',
      tick: TICK_START,
    }
    forceRender(n => n + 1)
  }, [dims])

  const reset = useCallback(() => {
    if (!dims) return
    const s = state.current
    const cx = Math.floor(dims.cols / 2)
    const cy = Math.floor(dims.rows / 2)
    s.snake = [[cx, cy], [cx - 1, cy], [cx - 2, cy]]
    s.dir = 'right'
    s.nextDir = 'right'
    s.food = rand(dims.cols, dims.rows, s.snake)
    s.score = 0
    s.phase = 'play'
    s.tick = TICK_START
    setInitials('')
    lastTick.current = performance.now()
    forceRender(n => n + 1)
  }, [dims])

  const submitScore = useCallback((inits) => {
    const s = state.current
    const entry = { initials: inits.toUpperCase(), score: s.score, date: Date.now() }
    const board = [...loadBoard(), entry].sort((a, b) => b.score - a.score).slice(0, 10)
    saveBoard(board)
    setLeaderboard(board)
    s.phase = 'board'
    forceRender(n => n + 1)
  }, [])

  // draw
  const draw = useCallback(() => {
    const cvs = canvasRef.current
    if (!cvs || !dims) return
    const ctx = cvs.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    cvs.width = dims.w * dpr
    cvs.height = dims.h * dpr
    ctx.scale(dpr, dpr)

    const s = state.current
    if (!s) return

    ctx.fillStyle = '#f5f4f0'
    ctx.fillRect(0, 0, dims.w, dims.h)

    // grid dots
    ctx.fillStyle = 'rgba(0,0,0,0.04)'
    for (let x = 0; x < dims.cols; x++) {
      for (let y = 0; y < dims.rows; y++) {
        ctx.beginPath()
        ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 0.8, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // border
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, dims.w, dims.h)

    // food
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
      if (i === 0) return
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

    // head — cursor image
    const head = s.snake[0]
    const hx = head[0] * CELL
    const hy = head[1] * CELL

    if (cursorImg.current) {
      const isDead = s.phase === 'dead' || s.phase === 'enter'
      if (isDead) ctx.globalAlpha = 0.4
      ctx.drawImage(cursorImg.current, hx, hy, CELL, CELL)
      if (isDead) ctx.globalAlpha = 1
    } else {
      const isDead = s.phase === 'dead' || s.phase === 'enter'
      ctx.fillStyle = isDead ? 'rgba(10,10,10,0.4)' : '#0a0a0a'
      ctx.fillRect(hx, hy, CELL, CELL)
    }

    // live score
    if (s.phase === 'play') {
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.font = `500 11px 'Azeret Mono', monospace`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'top'
      ctx.fillText(String(s.score).padStart(3, '0'), dims.w - 12, 10)
    }
  }, [dims])

  // game loop
  const loop = useCallback((now) => {
    raf.current = requestAnimationFrame(loop)
    if (!dims || !state.current) return

    const s = state.current

    if (s.phase !== 'play') {
      draw()
      return
    }

    if (now - lastTick.current < s.tick) {
      draw()
      return
    }
    lastTick.current = now

    s.dir = s.nextDir
    const d = DIR[s.dir]
    const head = [s.snake[0][0] + d[0], s.snake[0][1] + d[1]]

    // wall death
    if (head[0] < 0 || head[0] >= dims.cols || head[1] < 0 || head[1] >= dims.rows) {
      s.phase = 'dead'
      forceRender(n => n + 1)
      setTimeout(() => {
        if (state.current.phase === 'dead') {
          state.current.phase = 'enter'
          forceRender(n => n + 1)
        }
      }, 600)
      draw()
      return
    }

    // self collision
    if (s.snake.some(seg => seg[0] === head[0] && seg[1] === head[1])) {
      s.phase = 'dead'
      forceRender(n => n + 1)
      setTimeout(() => {
        if (state.current.phase === 'dead') {
          state.current.phase = 'enter'
          forceRender(n => n + 1)
        }
      }, 600)
      draw()
      return
    }

    s.snake.unshift(head)

    if (head[0] === s.food[0] && head[1] === s.food[1]) {
      s.score++
      s.food = rand(dims.cols, dims.rows, s.snake)
      s.tick = Math.max(TICK_MIN, s.tick - 2)
    } else {
      s.snake.pop()
    }

    draw()
  }, [draw, dims])

  useEffect(() => {
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [loop])

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      const s = state.current
      if (!s) return

      if (s.phase === 'idle' || s.phase === 'board') {
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
      if (!s) return
      const t = e.changedTouches[0]
      const dx = t.clientX - touchStart.current.x
      const dy = t.clientY - touchStart.current.y
      touchStart.current = null

      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      if (absDx < 15 && absDy < 15) {
        if (s.phase === 'idle' || s.phase === 'board') reset()
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

  // handle initials input
  const handleInitialChange = useCallback((idx, val) => {
    const char = val.slice(-1).toUpperCase().replace(/[^A-Z]/g, '')
    setInitials(prev => {
      const arr = prev.split('')
      while (arr.length < 3) arr.push('')
      arr[idx] = char
      if (char && idx < 2) {
        setTimeout(() => inputRefs.current[idx + 1]?.focus(), 0)
      }
      return arr.join('')
    })
  }, [])

  const handleInitialKey = useCallback((idx, e) => {
    if (e.key === 'Backspace') {
      setInitials(prev => {
        const arr = prev.split('')
        while (arr.length < 3) arr.push('')
        if (!arr[idx] && idx > 0) {
          arr[idx - 1] = ''
          setTimeout(() => inputRefs.current[idx - 1]?.focus(), 0)
        } else {
          arr[idx] = ''
        }
        return arr.join('')
      })
      e.preventDefault()
    } else if (e.key === 'Enter' && initials.replace(/ /g, '').length === 3) {
      submitScore(initials)
    }
  }, [initials, submitScore])

  const s2 = state.current
  const phase = s2?.phase || 'idle'
  const score = s2?.score || 0

  return (
    <div className="snake-wrap" ref={wrapRef}>
      <div className="snake-board">
        {dims && (
          <canvas
            ref={canvasRef}
            style={{ width: dims.w, height: dims.h }}
          />
        )}

        {phase === 'idle' && (
          <div className="snake-overlay">
            <div className="snake-cursor-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/cursor.png" alt="" width={38} height={38} style={{ imageRendering: 'pixelated' }} />
            </div>
            <div className="snake-subtitle">SNAKE</div>
            <div className="snake-start">PRESS SPACE OR TAP TO START</div>
          </div>
        )}

        {phase === 'enter' && (
          <div className="snake-overlay">
            <div className="snake-dead-score">{String(score).padStart(3, '0')}</div>
            <div className="snake-subtitle">GAME OVER</div>
            <div className="snake-initials-label">ENTER YOUR INITIALS</div>
            <div className="snake-initials-row">
              {[0, 1, 2].map(i => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  className="snake-initial-input"
                  type="text"
                  maxLength={1}
                  value={(initials[i] || '').toUpperCase()}
                  onChange={e => handleInitialChange(i, e.target.value)}
                  onKeyDown={e => handleInitialKey(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {initials.replace(/ /g, '').length === 3 && (
              <button className="snake-submit" onClick={() => submitScore(initials)}>
                SUBMIT
              </button>
            )}
            <button className="snake-skip" onClick={reset}>SKIP</button>
          </div>
        )}

        {phase === 'board' && (
          <div className="snake-overlay">
            <div className="snake-subtitle" style={{ marginBottom: 16 }}>LEADERBOARD</div>
            <div className="snake-leaderboard">
              {leaderboard.length === 0 && (
                <div className="snake-lb-empty">NO SCORES YET</div>
              )}
              {leaderboard.map((entry, i) => (
                <div className="snake-lb-row" key={i}>
                  <span className="snake-lb-rank">{String(i + 1).padStart(2, '0')}</span>
                  <span className="snake-lb-sep">·</span>
                  <span className="snake-lb-initials">{entry.initials}</span>
                  <span className="snake-lb-dots" />
                  <span className="snake-lb-score">{String(entry.score).padStart(3, '0')}</span>
                </div>
              ))}
            </div>
            <div className="snake-start" style={{ marginTop: 24 }}>PRESS SPACE OR TAP TO PLAY AGAIN</div>
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
