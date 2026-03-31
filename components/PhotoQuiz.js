'use client'
import { useState, useCallback } from 'react'

const QUESTIONS = [
  { q: 'What does ISO stand for?', opts: ['International Standards Organization', 'In Shadow Only', 'I\'m Slightly Overexposed', 'It\'s Sorta Okay'], correct: 0 },
  { q: 'What is the exposure triangle?', opts: ['Aperture, Shutter, ISO', 'A Bermuda Triangle for memory cards', 'Lighting, Vibes, Luck', 'Three flashes aimed at your subject'], correct: 0 },
  { q: 'What does "shooting wide open" mean?', opts: ['Largest aperture', 'No lens cap', 'Outdoors', 'Arms spread while holding camera'], correct: 0 },
  { q: 'What is golden hour?', opts: ['Hour after sunrise / before sunset', 'When you finally get paid', 'The hour the client picks their favorites', 'Midnight', ], correct: 0 },
  { q: 'What is bokeh?', opts: ['Out-of-focus blur', 'A type of ramen', 'A camera brand', 'What you say when someone sneezes'], correct: 0 },
  { q: 'How many photos should you deliver?', opts: ['Depends on the contract', 'All of them', 'Just the bangers', 'One. Make it count.'], correct: 0 },
]

export default function PhotoQuiz() {
  const [step, setStep] = useState(0) // 0 = start, 1-6 = questions, 7 = result
  const [answers, setAnswers] = useState([])
  const [showCorrect, setShowCorrect] = useState(false)

  const startQuiz = useCallback(() => {
    setStep(1)
    setAnswers([])
  }, [])

  const answer = useCallback((idx) => {
    setShowCorrect(true)
    setTimeout(() => {
      setAnswers(prev => [...prev, idx])
      setShowCorrect(false)
      setStep(prev => prev + 1)
    }, 800)
  }, [])

  if (step === 0) {
    return (
      <div className="quiz-widget">
        <div className="quiz-title-big">ARE YOU A<br />PHOTOGRAPHER?</div>
        <button className="quiz-start" onClick={startQuiz}>FIND OUT</button>
      </div>
    )
  }

  if (step > QUESTIONS.length) {
    return (
      <div className="quiz-widget">
        <div className="quiz-result-pct">100%</div>
        <div className="quiz-result-text">PHOTOGRAPHER</div>
        <div className="quiz-result-sub">Was there ever any doubt?</div>
        <button className="quiz-start" onClick={() => setStep(0)}>RETAKE</button>
      </div>
    )
  }

  const q = QUESTIONS[step - 1]

  return (
    <div className="quiz-widget">
      <div className="quiz-progress">{step} / {QUESTIONS.length}</div>
      <div className="quiz-question">{q.q}</div>
      <div className="quiz-opts">
        {q.opts.map((opt, i) => (
          <button
            key={i}
            className={`quiz-opt ${showCorrect && i === q.correct ? 'correct' : ''} ${showCorrect && i !== q.correct ? 'dim' : ''}`}
            onClick={() => !showCorrect && answer(i)}
            disabled={showCorrect}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
