'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const CELL = 18
const MAX_W = 900
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
  try { return JSON.parse(localStorage.getItem('jkh-snake-board') || '[]') } catch { return [] }
}
function saveBoard(board) {
  try { localStorage.setItem('jkh-snake-board', JSON.stringify(board.slice(0, 10))) } catch {}
}

export default function SnakeGame() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const cursorImg = useRef(null)
  const [dims, setDims] = useState(null)
  const state = useRef(null)
  const raf = useRef(null)
  const lastTick = useRef(0)
  const [, forceRender] = useState(0)
  const touchStart = useRef(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [initials, setInitials] = useState(['', '', ''])
  const [activeInput, setActiveInput] = useState(0)

  useEffect(() => {
    const img = new Image()
    img.src = '/images/cursor.png'
    img.onload = () => { cursorImg.current = img }
  }, [])

  useEffect(() => { setLeaderboard(loadBoard()) }, [])

  useEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current
      if (!wrap) return
      const available = Math.min(wrap.getBoundingClientRect().width, MAX_W)
      const maxH = Math.min(Math.floor(window.innerHeight * 0.55), 500)
      const cols = Math.floor(available / CELL)
      const rows = Math.floor(maxH / CELL)
      setDims({ cols, rows, w: cols * CELL, h: rows * CELL })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    if (!dims) return
    const cx = Math.floor(dims.cols / 2)
    const cy = Math.floor(dims.rows / 2)
    state.current = {
      snake: [[cx, cy], [cx - 1, cy], [cx - 2, cy]],
      dir: 'right', nextDir: 'right',
      food: rand(dims.cols, dims.rows, [[cx, cy], [cx - 1, cy], [cx - 2, cy]]),
      score: 0, phase: 'idle', tick: TICK_START,
    }
    forceRender(n => n + 1)
  }, [dims])

  const reset = useCallback(() => {
    if (!dims) return
    const s = state.current
    const cx = Math.floor(dims.cols / 2)
    const cy = Math.floor(dims.rows / 2)
    s.snake = [[cx, cy], [cx - 1, cy], [cx - 2, cy]]
    s.dir = 'right'; s.nextDir = 'right'
    s.food = rand(dims.cols, dims.rows, s.snake)
    s.score = 0; s.phase = 'play'; s.tick = TICK_START
    setInitials(['', '', '']); setActiveInput(0)
    lastTick.current = performance.now()
    forceRender(n => n + 1)
  }, [dims])

  const submitScore = useCallback((inits) => {
    const s = state.current
    const tag = inits.join('')
    if (tag.length < 3) return
    const entry = { initials: tag.toUpperCase(), score: s.score, date: Date.now() }
    const board = [...loadBoard(), entry].sort((a, b) => b.score - a.score).slice(0, 10)
    saveBoard(board)
    setLeaderboard(board)
    s.phase = 'board'
    forceRender(n => n + 1)
  }, [])

  const draw = useCallback(() => {
    const cvs = canvasRef.current
    if (!cvs || !dims) return
    const ctx = cvs.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    cvs.width = dims.w * dpr; cvs.height = dims.h * dpr
    ctx.scale(dpr, dpr)
    const s = state.current
    if (!s) return

    ctx.fillStyle = '#f5f4f0'
    ctx.fillRect(0, 0, dims.w, dims.h)

    ctx.fillStyle = 'rgba(0,0,0,0.04)'
    for (let x = 0; x < dims.cols; x++)
      for (let y = 0; y < dims.rows; y++) {
        ctx.beginPath()
        ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 0.8, 0, Math.PI * 2)
        ctx.fill()
      }

    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 2
    ctx.strokeRect(0, 0, dims.w, dims.h)

    const pulse = 0.8 + Math.sin(performance.now() / 200) * 0.2
    ctx.fillStyle = '#6B4C3B'
    ctx.beginPath()
    ctx.arc(s.food[0] * CELL + CELL / 2, s.food[1] * CELL + CELL / 2, (CELL / 2 - 2) * pulse, 0, Math.PI * 2)
    ctx.fill()

    s.snake.forEach((seg, i) => {
      if (i === 0) return
      ctx.fillStyle = `rgba(10,10,10,${1 - (i / s.snake.length) * 0.6})`
      ctx.fillRect(seg[0] * CELL + 1, seg[1] * CELL + 1, CELL - 2, CELL - 2)
    })

    const head = s.snake[0]
    const isDead = s.phase === 'dead' || s.phase === 'enter'
    if (cursorImg.current) {
      if (isDead) ctx.globalAlpha = 0.4
      ctx.drawImage(cursorImg.current, head[0] * CELL, head[1] * CELL, CELL, CELL)
      if (isDead) ctx.globalAlpha = 1
    } else {
      ctx.fillStyle = isDead ? 'rgba(10,10,10,0.4)' : '#0a0a0a'
      ctx.fillRect(head[0] * CELL, head[1] * CELL, CELL, CELL)
    }

    if (s.phase === 'play') {
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.font = `500 11px 'Azeret Mono', monospace`
      ctx.textAlign = 'right'; ctx.textBaseline = 'top'
      ctx.fillText(String(s.score).padStart(3, '0'), dims.w - 12, 10)
    }
  }, [dims])

  const loop = useCallback((now) => {
    raf.current = requestAnimationFrame(loop)
    if (!dims || !state.current) return
    const s = state.current
    if (s.phase !== 'play') { draw(); return }
    if (now - lastTick.current < s.tick) { draw(); return }
    lastTick.current = now

    s.dir = s.nextDir
    const d = DIR[s.dir]
    const head = [s.snake[0][0] + d[0], s.snake[0][1] + d[1]]

    if (head[0] < 0 || head[0] >= dims.cols || head[1] < 0 || head[1] >= dims.rows ||
        s.snake.some(seg => seg[0] === head[0] && seg[1] === head[1])) {
      s.phase = 'dead'; forceRender(n => n + 1)
      setTimeout(() => { if (state.current.phase === 'dead') { state.current.phase = 'enter'; forceRender(n => n + 1) } }, 600)
      draw(); return
    }

    s.snake.unshift(head)
    if (head[0] === s.food[0] && head[1] === s.food[1]) {
      s.score++; s.food = rand(dims.cols, dims.rows, s.snake)
      s.tick = Math.max(TICK_MIN, s.tick - 2)
    } else s.snake.pop()
    draw()
  }, [draw, dims])

  useEffect(() => { raf.current = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf.current) }, [loop])

  useEffect(() => {
    const onKey = (e) => {
      const s = state.current; if (!s) return
      if (s.phase === 'idle' || s.phase === 'board') {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); reset(); return }
      }
      if (s.phase !== 'play') return
      const map = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', w:'up', s:'down', a:'left', d:'right', W:'up', S:'down', A:'left', D:'right' }
      const nd = map[e.key]
      if (nd && OPP[nd] !== s.dir) { e.preventDefault(); s.nextDir = nd }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reset])

  useEffect(() => {
    const cvs = canvasRef.current; if (!cvs) return
    const onStart = (e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    const onEnd = (e) => {
      if (!touchStart.current) return
      const s = state.current; if (!s) return
      const t = e.changedTouches[0]
      const dx = t.clientX - touchStart.current.x, dy = t.clientY - touchStart.current.y
      touchStart.current = null
      if (Math.abs(dx) < 15 && Math.abs(dy) < 15) { if (s.phase === 'idle' || s.phase === 'board') reset(); return }
      if (s.phase !== 'play') return
      const nd = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')
      if (OPP[nd] !== s.dir) s.nextDir = nd
    }
    cvs.addEventListener('touchstart', onStart, { passive: true })
    cvs.addEventListener('touchend', onEnd, { passive: true })
    return () => { cvs.removeEventListener('touchstart', onStart); cvs.removeEventListener('touchend', onEnd) }
  }, [reset])

  // Arcade-style initials handler
  const handleInitialKey = useCallback((e) => {
    const s = state.current
    if (!s || s.phase !== 'enter') return

    if (e.key === 'Enter' && initials.every(c => c)) {
      submitScore(initials)
      return
    }

    if (e.key === 'Backspace') {
      setInitials(prev => {
        const next = [...prev]
        if (next[activeInput]) {
          next[activeInput] = ''
        } else if (activeInput > 0) {
          next[activeInput - 1] = ''
          setActiveInput(activeInput - 1)
        }
        return next
      })
      return
    }

    const char = e.key.toUpperCase()
    if (/^[A-Z]$/.test(char)) {
      setInitials(prev => {
        const next = [...prev]
        next[activeInput] = char
        if (activeInput < 2) setActiveInput(activeInput + 1)
        return next
      })
    }
  }, [activeInput, initials, submitScore])

  useEffect(() => {
    window.addEventListener('keydown', handleInitialKey)
    return () => window.removeEventListener('keydown', handleInitialKey)
  }, [handleInitialKey])

  const s2 = state.current
  const phase = s2?.phase || 'idle'
  const score = s2?.score || 0
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="snake-wrap" ref={wrapRef}>
      <div className="snake-board">
        {dims && <canvas ref={canvasRef} style={{ width: dims.w, height: dims.h }} />}

        {phase === 'idle' && (
          <div className="snake-overlay">
            <div className="snake-cursor-icon">
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

            <div className="snake-arcade-initials">
              <div className="snake-initials-display">
                {initials.map((ch, i) => (
                  <span key={i} className={`snake-initial-char ${i === activeInput ? 'active' : ''} ${ch ? 'filled' : ''}`}
                    onClick={() => setActiveInput(i)}>{ch || '_'}</span>
                ))}
              </div>
              <div className="snake-alpha-grid">
                {ABC.map(ch => (
                  <button key={ch} className="snake-alpha-btn" onClick={() => {
                    setInitials(prev => { const n = [...prev]; n[activeInput] = ch; if (activeInput < 2) setActiveInput(activeInput + 1); return n })
                  }}>{ch}</button>
                ))}
                <button className="snake-alpha-btn snake-alpha-del" onClick={() => {
                  setInitials(prev => { const n = [...prev]; if (n[activeInput]) n[activeInput] = ''; else if (activeInput > 0) { n[activeInput-1] = ''; setActiveInput(activeInput-1) }; return n })
                }}>←</button>
              </div>
              {initials.every(c => c) && (
                <button className="snake-submit" onClick={() => submitScore(initials)}>SUBMIT</button>
              )}
              <button className="snake-skip" onClick={reset}>SKIP</button>
            </div>
          </div>
        )}

        {phase === 'board' && (
          <div className="snake-overlay">
            <div className="snake-subtitle" style={{ marginBottom: 16 }}>LEADERBOARD</div>
            <div className="snake-leaderboard">
              {leaderboard.length === 0 && <div className="snake-lb-empty">NO SCORES YET</div>}
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
