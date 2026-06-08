#!/usr/bin/env node
/*
  gen-covers.js
  ─────────────────────────────────────────────────────────────
  1. Reads every image in your source folder (default:
     ~/Desktop/untitled folder 3 — pass another path as an argument
     to override:  node scripts/gen-covers.js "~/Desktop/whatever")
  2. Compresses + resizes each to a web-friendly size and writes
     them to public/images/ as gen-cover-01.jpg, gen-cover-02.jpg, …
  3. Re-compresses the existing book cover in place.
  4. Rewrites content/print/generations.mdx with the full frontmatter
     AND the covers: list, so the slideshow + checkout just work.
  ─────────────────────────────────────────────────────────────
*/
const fs = require('fs')
const path = require('path')
const os = require('os')

let sharp
try {
  sharp = require('sharp')
} catch (e) {
  console.error('\n  sharp is not installed. Run:  npm install  (then re-run this script)\n')
  process.exit(1)
}

const ROOT = path.resolve(__dirname, '..')
const IMG_DIR = path.join(ROOT, 'public', 'images')
const MDX_PATH = path.join(ROOT, 'content', 'print', 'generations.mdx')
const COVER_FILE = 'generations-cover.jpeg' // existing book cover (stays slide 1)

const MAX_WIDTH = 1600
const QUALITY = 80

// Source folder — override by passing a path as the first argument.
let SRC = process.argv[2] || path.join(os.homedir(), 'Desktop', 'untitled folder 3')
SRC = SRC.replace(/^~(?=$|\/)/, os.homedir())

const IMG_RE = /\.(jpe?g|png)$/i

async function compress(inputPath, outFullPath) {
  // read into a buffer first so we never read+write the same file at once
  const buf = await sharp(inputPath)
    .rotate() // respect EXIF orientation
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer()
  fs.writeFileSync(outFullPath, buf)
  return buf.length
}

async function run() {
  if (!fs.existsSync(SRC)) {
    console.error(`\n  Source folder not found:\n    ${SRC}\n  Pass the correct path, e.g.:\n    node scripts/gen-covers.js "~/Desktop/your folder"\n`)
    process.exit(1)
  }
  fs.mkdirSync(IMG_DIR, { recursive: true })

  const files = fs.readdirSync(SRC)
    .filter(f => IMG_RE.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

  if (!files.length) {
    console.error(`\n  No images found in:\n    ${SRC}\n`)
    process.exit(1)
  }

  console.log(`\n  Source: ${SRC}`)
  console.log(`  Found ${files.length} image(s). Compressing to max ${MAX_WIDTH}px / q${QUALITY}…\n`)

  const covers = []

  // Lead slide: re-compress the existing book cover in place (if present)
  const coverPath = path.join(IMG_DIR, COVER_FILE)
  if (fs.existsSync(coverPath)) {
    const bytes = await compress(coverPath, coverPath)
    console.log(`  cover   ${COVER_FILE.padEnd(28)} ${(bytes / 1024).toFixed(0)} KB`)
    covers.push(`/images/${COVER_FILE}`)
  }

  // The gallery shots
  let n = 1
  for (const f of files) {
    const out = `gen-cover-${String(n).padStart(2, '0')}.jpg`
    const bytes = await compress(path.join(SRC, f), path.join(IMG_DIR, out))
    console.log(`  ${String(n).padStart(2, '0')}      ${f.padEnd(28)} -> ${out}  ${(bytes / 1024).toFixed(0)} KB`)
    covers.push(`/images/${out}`)
    n++
  }

  const coverList = covers.map(c => `  - ${c}`).join('\n')
  const mdx = `---
title: Generations
year: "2026"
cover: /images/${COVER_FILE}
covers:
${coverList}
description: 7 years of capturing Tinman Elite. 300 pages, hardcover.
format: Hardcover
pages: "300"
edition: ""
price: "$60 pickup · $73 shipped"
link: "https://www.paypal.com/ncp/payment/PKFF2PCM8PSN8"
processor: "PayPal"
---
`
  fs.mkdirSync(path.dirname(MDX_PATH), { recursive: true })
  fs.writeFileSync(MDX_PATH, mdx)

  console.log(`\n  Wrote ${covers.length} slide(s) into the slideshow.`)
  console.log(`  Updated ${path.relative(ROOT, MDX_PATH)}\n`)
}

run().catch(err => { console.error(err); process.exit(1) })
