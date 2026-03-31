'use client'
import { useState, useCallback } from 'react'

function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function generatePalette() {
  const baseHue = Math.random() * 360
  const mode = Math.floor(Math.random() * 4)
  const colors = []

  for (let i = 0; i < 5; i++) {
    let h, s, l
    switch (mode) {
      case 0: // analogous
        h = (baseHue + i * 25 - 50) % 360
        s = 45 + Math.random() * 35
        l = 30 + i * 10 + Math.random() * 10
        break
      case 1: // complementary split
        h = (baseHue + (i < 3 ? i * 15 : 150 + i * 15)) % 360
        s = 50 + Math.random() * 30
        l = 35 + Math.random() * 35
        break
      case 2: // monochrome
        h = baseHue + Math.random() * 10 - 5
        s = 20 + Math.random() * 50
        l = 15 + i * 15 + Math.random() * 8
        break
      case 3: // triadic
        h = (baseHue + i * 72 + Math.random() * 20 - 10) % 360
        s = 40 + Math.random() * 40
        l = 35 + Math.random() * 30
        break
    }
    colors.push({
      hex: hslToHex(Math.round(h), Math.round(s), Math.round(l)),
      h: Math.round(h), s: Math.round(s), l: Math.round(l),
    })
  }
  return colors
}

export default function PaletteGen() {
  const [palette, setPalette] = useState(() => generatePalette())
  const [copied, setCopied] = useState(null)

  const regen = useCallback(() => setPalette(generatePalette()), [])

  const copy = useCallback((hex, i) => {
    navigator.clipboard.writeText(hex).catch(() => {})
    setCopied(i)
    setTimeout(() => setCopied(null), 1200)
  }, [])

  return (
    <div className="palette-widget">
      <div className="palette-colors">
        {palette.map((c, i) => (
          <button
            key={i}
            className={`palette-swatch ${copied === i ? 'copied' : ''}`}
            style={{ backgroundColor: c.hex }}
            onClick={() => copy(c.hex, i)}
          >
            <span className="palette-hex">{copied === i ? 'COPIED' : c.hex.toUpperCase()}</span>
          </button>
        ))}
      </div>
      <button className="palette-regen" onClick={regen}>GENERATE</button>
    </div>
  )
}
