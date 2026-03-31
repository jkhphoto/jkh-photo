'use client'
import { useState, useCallback } from 'react'

const ROWS = 10
const COLS = 14

export default function BubbleWrap() {
  const [popped, setPopped] = useState(new Set())
  const total = ROWS * COLS
  const count = popped.size

  const pop = useCallback((i) => {
    setPopped(prev => {
      const next = new Set(prev)
      next.add(i)
      return next
    })
  }, [])

  const reset = useCallback(() => setPopped(new Set()), [])

  return (
    <div className="bubble-wrap-widget">
      <div className="bubble-grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {Array.from({ length: total }, (_, i) => {
          const isPopped = popped.has(i)
          return (
            <button
              key={i}
              className={`bubble ${isPopped ? 'popped' : ''}`}
              onClick={() => !isPopped && pop(i)}
              aria-label={`Bubble ${i + 1}`}
            />
          )
        })}
      </div>
      <div className="bubble-footer">
        <span className="bubble-count">{count} / {total}</span>
        {count === total && (
          <button className="bubble-reset" onClick={reset}>NEW SHEET</button>
        )}
        {count > 0 && count < total && (
          <button className="bubble-reset" onClick={reset}>RESET</button>
        )}
      </div>
    </div>
  )
}
