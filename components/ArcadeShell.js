'use client'
import { useState, useCallback, useEffect } from 'react'
import SnakeGame from './SnakeGame'
import BubbleWrap from './BubbleWrap'
import ReactionTest from './ReactionTest'
import PaletteGen from './PaletteGen'
import Magic8Ball from './Magic8Ball'
import GravitySandbox from './GravitySandbox'
import CurrencyConverter from './CurrencyConverter'
import T7Ticker from './T7Ticker'
import Net30 from './Net30'

const GAMES = [
  { id: 'snake', num: '01', name: 'Snake', desc: 'The classic. JKH edition.', icon: '🐍', Component: SnakeGame },
  { id: 'bubbles', num: '02', name: 'Bubble Wrap', desc: 'Pop them all.', icon: '◯', Component: BubbleWrap },
  { id: 'reaction', num: '03', name: 'Reaction', desc: 'Test your reflexes.', icon: '⚡', Component: ReactionTest },
  { id: 'palette', num: '04', name: 'Palette', desc: 'Generate color combos.', icon: '◐', Component: PaletteGen },
  { id: '8ball', num: '05', name: '8-Ball', desc: 'Ask anything.', icon: '8', Component: Magic8Ball },
  { id: 'gravity', num: '06', name: 'Gravity', desc: 'Drop balls. Watch physics.', icon: '●', Component: GravitySandbox },
  { id: 'currency', num: '07', name: 'Currency', desc: 'Convert between currencies.', icon: '¤', Component: CurrencyConverter },
  { id: 't7', num: '08', name: 'T7-1TB', desc: 'Track the Samsung T7 price.', icon: '▲', Component: T7Ticker },
  { id: 'net30', num: '09', name: 'Net 30', desc: 'When do you get paid?', icon: '◷', Component: Net30 },
]

export default function ArcadeShell() {
  const [active, setActive] = useState(null)

  const open = useCallback((id) => {
    setActive(id)
    document.body.style.overflow = 'hidden'
  }, [])

  const close = useCallback(() => {
    setActive(null)
    document.body.style.overflow = ''
  }, [])

  // ESC to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && active) close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, close])

  const activeGame = GAMES.find(g => g.id === active)

  return (
    <div className="arcade-wrap">
      <div className="arcade-header">
        <h1 className="arcade-title">Extras</h1>
        <p className="arcade-sub">Things that have nothing to do with photography.</p>
      </div>

      <div className="arcade-track">
        <div className="arcade-row">
          {GAMES.map((game) => (
            <button
              key={game.id}
              className="arcade-cabinet"
              onClick={() => open(game.id)}
            >
              <div className="cabinet-screen">
                <span className="cabinet-icon">{game.icon}</span>
              </div>
              <div className="cabinet-info">
                <span className="cabinet-num">{game.num}</span>
                <span className="cabinet-sep">·</span>
                <span className="cabinet-name">{game.name}</span>
              </div>
              <div className="cabinet-desc">{game.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="arcade-hint">
        <span>SCROLL</span>
        <span className="arcade-arrow">→</span>
      </div>

      {/* Fullscreen overlay */}
      {activeGame && (
        <div className="arcade-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}>
          <div className="arcade-modal">
            <div className="arcade-modal-head">
              <div className="arcade-modal-title">
                <span className="cabinet-num">{activeGame.num}</span>
                <span className="cabinet-sep">·</span>
                <span className="cabinet-name">{activeGame.name}</span>
              </div>
              <button className="arcade-close" onClick={close}>ESC</button>
            </div>
            <div className="arcade-modal-body">
              <activeGame.Component />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
