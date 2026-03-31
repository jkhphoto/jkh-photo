'use client'
import { useState, useCallback } from 'react'

const ANSWERS = [
  'ABSOLUTELY',
  'ASK AGAIN LATER',
  'BETTER NOT TELL YOU NOW',
  'CANNOT PREDICT NOW',
  'CONCENTRATE AND ASK AGAIN',
  'DON\'T COUNT ON IT',
  'IT IS CERTAIN',
  'IT IS DECIDEDLY SO',
  'MOST LIKELY',
  'MY REPLY IS NO',
  'MY SOURCES SAY NO',
  'OUTLOOK GOOD',
  'OUTLOOK NOT SO GOOD',
  'REPLY HAZY TRY AGAIN',
  'SIGNS POINT TO YES',
  'VERY DOUBTFUL',
  'WITHOUT A DOUBT',
  'YES',
  'YES DEFINITELY',
  'YOU MAY RELY ON IT',
]

export default function Magic8Ball() {
  const [answer, setAnswer] = useState(null)
  const [shaking, setShaking] = useState(false)
  const [question, setQuestion] = useState('')

  const shake = useCallback(() => {
    if (shaking) return
    setShaking(true)
    setAnswer(null)
    setTimeout(() => {
      setAnswer(ANSWERS[Math.floor(Math.random() * ANSWERS.length)])
      setShaking(false)
    }, 800)
  }, [shaking])

  return (
    <div className="eight-ball-widget">
      <input
        className="eight-ball-input"
        type="text"
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && question.trim() && shake()}
      />
      <button
        className={`eight-ball ${shaking ? 'shaking' : ''}`}
        onClick={shake}
      >
        <div className="eight-ball-inner">
          <div className="eight-ball-window">
            {answer ? (
              <span className="eight-ball-answer">{answer}</span>
            ) : (
              <span className="eight-ball-8">8</span>
            )}
          </div>
        </div>
      </button>
      <div className="eight-ball-hint">
        {answer ? 'CLICK OR ASK AGAIN' : 'TYPE A QUESTION · PRESS ENTER'}
      </div>
    </div>
  )
}
