'use client'
import { useState, useMemo, useEffect } from 'react'

function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000)
}

const TERMS = [
  { label: 'NET 15', days: 15 },
  { label: 'NET 30', days: 30 },
  { label: 'NET 45', days: 45 },
  { label: 'NET 60', days: 60 },
  { label: 'NET 90', days: 90 },
]

const VIBES = [
  'Time to start the countdown.',
  'Mark your calendar. Set an alarm. Pray.',
  'That\'s a lot of days to refresh your bank app.',
  'Might as well forget about it. Kidding.',
  'The money is on its way. Theoretically.',
  'Invoice sent. Now we wait.',
]

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DAYS_SHORT = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

function MiniCal({ invoiceDate, dueDate }) {
  const month = dueDate.getMonth(), year = dueDate.getFullYear()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const invDay = invoiceDate.getMonth() === month && invoiceDate.getFullYear() === year ? invoiceDate.getDate() : null
  const dueDay = dueDate.getDate()
  const today = new Date()
  const todayDay = today.getMonth() === month && today.getFullYear() === year ? today.getDate() : null

  return (
    <div className="net30-cal">
      <div className="net30-cal-header">{MONTHS[month]} {year}</div>
      <div className="net30-cal-days">
        {DAYS_SHORT.map(d => <div key={d} className="net30-cal-day-label">{d}</div>)}
      </div>
      <div className="net30-cal-grid">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="net30-cal-cell empty" />
          let cls = 'net30-cal-cell'
          if (d === dueDay) cls += ' due'
          if (d === invDay) cls += ' invoice'
          if (d === todayDay) cls += ' today'
          return <div key={i} className={cls}>{d}</div>
        })}
      </div>
    </div>
  )
}

export default function Net30() {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const [termIdx, setTermIdx] = useState(1)
  const [vibe] = useState(() => VIBES[Math.floor(Math.random() * VIBES.length)])

  const term = TERMS[termIdx]
  const invoiceDate = useMemo(() => new Date(todayStr + 'T12:00:00'), [todayStr])
  const dueDate = useMemo(() => addDays(invoiceDate, term.days), [invoiceDate, term.days])
  const daysLeft = daysBetween(today, dueDate)

  // countdown animation
  const [countVisible, setCountVisible] = useState(false)
  useEffect(() => {
    setCountVisible(false)
    const t = setTimeout(() => setCountVisible(true), 50)
    return () => clearTimeout(t)
  }, [termIdx])

  const dueDateStr = dueDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="net30-widget">
      <div className="net30-today-label">
        IF YOU WORKED TODAY
        <span className="net30-today-date">{today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>

      <div className="net30-terms">
        {TERMS.map((t, i) => (
          <button key={t.label} className={`net30-term ${i === termIdx ? 'active' : ''}`}
            onClick={() => setTermIdx(i)}>{t.label}</button>
        ))}
      </div>

      <div className="net30-result">
        <div className="net30-due-label">YOU GET PAID</div>
        <div className={`net30-due-date ${countVisible ? 'visible' : ''}`}>{dueDateStr}</div>
        <div className={`net30-countdown ${countVisible ? 'visible' : ''}`}>
          {daysLeft} day{daysLeft !== 1 ? 's' : ''} from now
        </div>
      </div>

      <MiniCal invoiceDate={invoiceDate} dueDate={dueDate} />

      <div className="net30-vibe">{vibe}</div>
    </div>
  )
}
