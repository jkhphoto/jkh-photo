'use client'
import { useState, useEffect, useCallback } from 'react'

export default function AliveCounter() {
  const [birthdate, setBirthdate] = useState(null)
  const [seconds, setSeconds] = useState(null)
  const [inputVal, setInputVal] = useState('')
  const [phase, setPhase] = useState('ask') // ask | counting

  const start = useCallback(() => {
    const d = new Date(inputVal + 'T00:00:00')
    if (isNaN(d.getTime())) return
    setBirthdate(d)
    setPhase('counting')
  }, [inputVal])

  useEffect(() => {
    if (phase !== 'counting' || !birthdate) return
    const tick = () => {
      const now = Date.now()
      setSeconds(Math.floor((now - birthdate.getTime()) / 1000))
    }
    tick()
    const i = setInterval(tick, 100)
    return () => clearInterval(i)
  }, [phase, birthdate])

  const fmt = (n) => {
    if (!n) return '0'
    return n.toLocaleString('en-US')
  }

  const heartbeats = seconds ? Math.floor(seconds * 1.2) : 0 // ~72 bpm avg
  const blinks = seconds ? Math.floor(seconds * 0.28) : 0 // ~17 per min
  const breaths = seconds ? Math.floor(seconds / 4) : 0 // ~15 per min

  return (
    <div className="alive-widget">
      {phase === 'ask' && (
        <div className="alive-ask">
          <div className="alive-prompt">WHEN WERE YOU BORN?</div>
          <input
            className="alive-input"
            type="date"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && start()}
          />
          {inputVal && (
            <button className="alive-go" onClick={start}>GO</button>
          )}
        </div>
      )}
      {phase === 'counting' && (
        <div className="alive-counting">
          <div className="alive-big">{fmt(seconds)}</div>
          <div className="alive-unit">SECONDS ALIVE</div>
          <div className="alive-stats">
            <div className="alive-stat">
              <span className="alive-stat-val">{fmt(heartbeats)}</span>
              <span className="alive-stat-label">HEARTBEATS</span>
            </div>
            <div className="alive-stat">
              <span className="alive-stat-val">{fmt(blinks)}</span>
              <span className="alive-stat-label">BLINKS</span>
            </div>
            <div className="alive-stat">
              <span className="alive-stat-val">{fmt(breaths)}</span>
              <span className="alive-stat-label">BREATHS</span>
            </div>
          </div>
          <button className="alive-reset" onClick={() => { setPhase('ask'); setInputVal(''); setBirthdate(null); setSeconds(null) }}>RESET</button>
        </div>
      )}
    </div>
  )
}
