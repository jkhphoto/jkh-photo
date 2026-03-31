'use client'
import { useState, useCallback, useEffect } from 'react'

const RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  CNY: 7.24,
  KRW: 1328.50,
  MXN: 17.15,
  BRL: 4.97,
  INR: 83.12,
  SEK: 10.42,
  NOK: 10.58,
  DKK: 6.87,
}

const NAMES = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan', KRW: 'South Korean Won', MXN: 'Mexican Peso',
  BRL: 'Brazilian Real', INR: 'Indian Rupee', SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone', DKK: 'Danish Krone',
}

const FLAGS = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CAD: '🇨🇦',
  AUD: '🇦🇺', CHF: '🇨🇭', CNY: '🇨🇳', KRW: '🇰🇷', MXN: '🇲🇽',
  BRL: '🇧🇷', INR: '🇮🇳', SEK: '🇸🇪', NOK: '🇳🇴', DKK: '🇩🇰',
}

const CURRENCIES = Object.keys(RATES)

function convert(amount, from, to) {
  const inUsd = amount / RATES[from]
  return inUsd * RATES[to]
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [showFrom, setShowFrom] = useState(false)
  const [showTo, setShowTo] = useState(false)

  const swap = useCallback(() => {
    setFrom(to)
    setTo(from)
  }, [from, to])

  const parsed = parseFloat(amount) || 0
  const result = convert(parsed, from, to)
  const rate = convert(1, from, to)

  return (
    <div className="currency-widget">
      <div className="currency-pair">
        <div className="currency-input-group">
          <div className="currency-select-wrap">
            <button className="currency-select" onClick={() => { setShowFrom(!showFrom); setShowTo(false) }}>
              <span className="currency-flag">{FLAGS[from]}</span>
              <span className="currency-code">{from}</span>
              <span className="currency-chevron">▾</span>
            </button>
            {showFrom && (
              <div className="currency-dropdown">
                {CURRENCIES.filter(c => c !== to).map(c => (
                  <button key={c} className={`currency-option ${c === from ? 'active' : ''}`} onClick={() => { setFrom(c); setShowFrom(false) }}>
                    <span className="currency-flag">{FLAGS[c]}</span>
                    <span className="currency-code">{c}</span>
                    <span className="currency-option-name">{NAMES[c]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            className="currency-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0"
          />
        </div>

        <button className="currency-swap" onClick={swap}>⇄</button>

        <div className="currency-input-group">
          <div className="currency-select-wrap">
            <button className="currency-select" onClick={() => { setShowTo(!showTo); setShowFrom(false) }}>
              <span className="currency-flag">{FLAGS[to]}</span>
              <span className="currency-code">{to}</span>
              <span className="currency-chevron">▾</span>
            </button>
            {showTo && (
              <div className="currency-dropdown">
                {CURRENCIES.filter(c => c !== from).map(c => (
                  <button key={c} className={`currency-option ${c === to ? 'active' : ''}`} onClick={() => { setTo(c); setShowTo(false) }}>
                    <span className="currency-flag">{FLAGS[c]}</span>
                    <span className="currency-code">{c}</span>
                    <span className="currency-option-name">{NAMES[c]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="currency-result">{result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="currency-rate">
        1 {from} = {rate.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {to}
      </div>
      <div className="currency-disclaimer">Rates are approximate and not live.</div>
    </div>
  )
}
