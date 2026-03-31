'use client'
import { useState, useRef, useCallback } from 'react'

export default function ReactionTest() {
  const [phase, setPhase] = useState('idle') // idle | waiting | go | result | early
  const [time, setTime] = useState(null)
  const [best, setBest] = useState(null)
  const [times, setTimes] = useState([])
  const startRef = useRef(0)
  const timerRef = useRef(null)

  const begin = useCallback(() => {
    setPhase('waiting')
    const delay = 1500 + Math.random() * 3500
    timerRef.current = setTimeout(() => {
      startRef.current = performance.now()
      setPhase('go')
    }, delay)
  }, [])

  const click = useCallback(() => {
    if (phase === 'idle' || phase === 'result' || phase === 'early') {
      begin()
    } else if (phase === 'waiting') {
      clearTimeout(timerRef.current)
      setPhase('early')
    } else if (phase === 'go') {
      const ms = Math.round(performance.now() - startRef.current)
      setTime(ms)
      setTimes(prev => [...prev.slice(-4), ms])
      if (!best || ms < best) setBest(ms)
      setPhase('result')
    }
  }, [phase, best, begin])

  const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b) / times.length) : null

  return (
    <div className="reaction-widget" onClick={click}>
      <div className={`reaction-zone ${phase}`}>
        {phase === 'idle' && (
          <>
            <div className="reaction-big">CLICK TO START</div>
            <div className="reaction-hint">Test your reaction time</div>
          </>
        )}
        {phase === 'waiting' && (
          <>
            <div className="reaction-big">WAIT...</div>
            <div className="reaction-hint">Click when the color changes</div>
          </>
        )}
        {phase === 'go' && (
          <div className="reaction-big">CLICK!</div>
        )}
        {phase === 'early' && (
          <>
            <div className="reaction-big">TOO EARLY</div>
            <div className="reaction-hint">Click to try again</div>
          </>
        )}
        {phase === 'result' && (
          <>
            <div className="reaction-ms">{time}<span className="reaction-unit">ms</span></div>
            <div className="reaction-stats">
              {best && <span>BEST {best}ms</span>}
              {avg && <><span className="extras-sep">·</span><span>AVG {avg}ms</span></>}
            </div>
            <div className="reaction-hint">Click to go again</div>
          </>
        )}
      </div>
    </div>
  )
}
