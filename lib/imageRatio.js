import fs from 'fs'
import path from 'path'

/**
 * Width ÷ height of an image in public/, read from the file header at
 * build time — JPEG, PNG or WebP, no image library needed. The Index uses
 * it to give every tile its frame's true shape before anything loads.
 *
 * Returns null for anything it can't read (a remote URL, an unknown
 * format); the Index then corrects the tile from the loaded image.
 * EXIF rotation isn't read here — the client correction covers that too.
 */
export function imageRatio(src) {
  if (!src || !src.startsWith('/')) return null
  let buf
  try {
    buf = fs.readFileSync(path.join(process.cwd(), 'public', decodeURI(src)))
  } catch {
    return null
  }
  const dims = pngSize(buf) || jpegSize(buf) || webpSize(buf)
  return dims && dims.h ? dims.w / dims.h : null
}

function pngSize(b) {
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }
}

function jpegSize(b) {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null
  let i = 2
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue }
    const marker = b[i + 1]
    // SOF0–SOF15 carry the frame size, except DHT (C4), JPG (C8), DAC (CC).
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue }
    i += 2 + b.readUInt16BE(i + 2)
  }
  return null
}

function webpSize(b) {
  if (b.length < 30 || b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null
  const chunk = b.toString('ascii', 12, 16)
  if (chunk === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff }
  if (chunk === 'VP8L') {
    const bits = b.readUInt32LE(21)
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 }
  }
  if (chunk === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) }
  return null
}
