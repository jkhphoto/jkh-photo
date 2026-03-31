'use client'
import { useState, useMemo } from 'react'

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
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

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const DAYS_SHORT = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

function MiniCal({ invoiceDate, dueDate }) {
  const month = dueDate.getMonth()
  const year = dueDate.getFullYear()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const invoiceDay = invoiceDate.getMonth() === month && invoiceDate.getFullYear() === year ? invoiceDate.getDate() : null
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
          if (d === invoiceDay) cls += ' invoice'
          if (d === todayDay) cls += ' today'
          return <div key={i} className={cls}>{d}</div>
        })}
      </div>
    </div>
  )
}

export default function Net30() {
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })
  const [termIdx, setTermIdx] = useState(1) // default NET 30

  const term = TERMS[termIdx]
  const invoiceDate = useMemo(() => new Date(dateStr + 'T12:00:00'), [dateStr])
  const dueDate = useMemo(() => addDays(invoiceDate, term.days), [invoiceDate, term.days])
  const today = new Date()
  const daysLeft = daysBetween(today, dueDate)

  return (
    <div className="net30-widget">
      <div className="net30-inputs">
        <div className="net30-field">
          <label className="net30-label">INVOICE DATE</label>
          <input
            className="net30-date"
            type="date"
            value={dateStr}
            onChange={e => setDateStr(e.target.value)}
          />
        </div>

        <div className="net30-field">
          <label className="net30-label">TERMS</label>
          <div className="net30-terms">
            {TERMS.map((t, i) => (
              <button
                key={t.label}
                className={`net30-term ${i === termIdx ? 'active' : ''}`}
                onClick={() => setTermIdx(i)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="net30-result">
        <div className="net30-due-label">PAYMENT DUE</div>
        <div className="net30-due-date">
          {dueDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <div className={`net30-countdown ${daysLeft < 0 ? 'overdue' : daysLeft <= 7 ? 'soon' : ''}`}>
          {daysLeft > 0
            ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} from today`
            : daysLeft === 0
              ? 'Due today'
              : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} overdue`
          }
        </div>
      </div>

      <MiniCal invoiceDate={invoiceDate} dueDate={dueDate} />
    </div>
  )
}
