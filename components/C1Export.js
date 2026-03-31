'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

const STAGES = [
  'Preparing export...',
  'Reading adjustments...',
  'Processing layers...',
  'Applying color profile...',
  'Rendering output...',
  'Sharpening for output...',
  'Writing metadata...',
  'Optimizing file size...',
  'Almost there...',
  'Finalizing...',
  'Just a moment...',
  'Any second now...',
  'Still working...',
  'Definitely almost done...',
  'Processing... probably...',
  'Hang tight...',
  'This is normal...',
  'Your files are important to us...',
  'Please hold...',
  'Have you tried restarting?',
  'Recalculating everything...',
  'Finding your images...',
  'They were here a second ago...',
  'OK this is taking a while...',
  'Maybe go get coffee...',
  'Or lunch...',
  'We\'ll be here when you get back...',
  'Still exporting...',
  'The wheel spins on...',
]

export default function C1Export() {
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stageIdx, setStageIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [fileCount] = useState(() => Math.floor(Math.random() * 400) + 50)
  const [currentFile, setCurrentFile] = useState(0)
  const intervalRef = useRef(null)
  const startRef = useRef(0)
  const angleRef = useRef(0)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  const startExport = useCallback(() => {
    setExporting(true)
    setProgress(0)
    setStageIdx(0)
    setElapsed(0)
    setCurrentFile(0)
    startRef.current = Date.now()
  }, [])

  const cancel = useCallback(() => {
    setExporting(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  // progress that asymptotically approaches but never reaches 100
  useEffect(() => {
    if (!exporting) return
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        // asymptotic: gets slower and slower, never hits 100
        const remaining = 99 - prev
        const increment = remaining * 0.008 + Math.random() * 0.15
        return Math.min(99, prev + increment)
      })
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
      setCurrentFile(prev => {
        const next = prev + (Math.random() > 0.7 ? 1 : 0)
        return Math.min(next, fileCount - 1)
      })
      setStageIdx(prev => {
        if (Math.random() > 0.92) return (prev + 1) % STAGES.length
        return prev
      })
    }, 300)
    return () => clearInterval(intervalRef.current)
  }, [exporting, fileCount])

  // draw the doom wheel
  useEffect(() => {
    if (!exporting) return
    const cvs = canvasRef.current
    if (!cvs) return

    const draw = () => {
      const ctx = cvs.getContext('2d')
      const dpr = window.devicePixelRatio || 1
      const size = 120
      cvs.width = size * dpr
      cvs.height = size * dpr
      ctx.scale(dpr, dpr)

      const cx = size / 2
      const cy = size / 2
      const r = 40

      ctx.clearRect(0, 0, size, size)

      // background circle
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(200,50,50,0.12)'
      ctx.lineWidth = 4
      ctx.stroke()

      // spinning arc
      angleRef.current += 0.06
      const startA = angleRef.current
      const sweep = 1.2 + Math.sin(angleRef.current * 0.5) * 0.5

      ctx.beginPath()
      ctx.arc(cx, cy, r, startA, startA + sweep)
      ctx.strokeStyle = '#cc3333'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.stroke()

      // inner percentage
      ctx.fillStyle = '#cc3333'
      ctx.font = `500 16px 'Azeret Mono', monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${Math.floor(progress)}%`, cx, cy)

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [exporting, progress])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  if (!exporting) {
    return (
      <div className="c1-widget">
        <div className="c1-idle">
          <div className="c1-icon">⬤</div>
          <div className="c1-app-name">Capture One</div>
          <div className="c1-file-info">{fileCount} variants selected</div>
          <button className="c1-export-btn" onClick={startExport}>
            EXPORT
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="c1-widget">
      <div className="c1-exporting">
        <canvas
          ref={canvasRef}
          style={{ width: 120, height: 120 }}
        />
        <div className="c1-status">{STAGES[stageIdx]}</div>
        <div className="c1-meta">
          <span>{currentFile + 1} / {fileCount}</span>
          <span className="c1-meta-sep">·</span>
          <span>{formatTime(elapsed)}</span>
        </div>
        <div className="c1-progress-bar">
          <div className="c1-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <button className="c1-cancel" onClick={cancel}>CANCEL</button>
      </div>
    </div>
  )
}
