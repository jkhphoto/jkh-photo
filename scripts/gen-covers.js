#!/usr/bin/env node
/*
  gen-covers.js — book page images for the flip-through
  ─────────────────────────────────────────────────────────────
  Usage:  node scripts/gen-covers.js <book-slug> "<source folder>"
  e.g.:   node scripts/gen-covers.js generations "~/Desktop/book scans"

  1. Compresses + resizes every image in the source folder and
     writes them to public/images/ as <slug>-spread-01.jpg, …
  2. Updates content/print/<slug>.mdx: replaces its covers: list
     (keeping the rest of the frontmatter), or creates a minimal
     file if the book is new. The shop item in content/shop/ stays
     the one place prices live — this script never touches money.
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

const MAX_WIDTH = 1600
const QUALITY = 80
const IMG_RE = /\.(jpe?g|png)$/i

const slug = process.argv[2]
let SRC = process.argv[3]
if (!slug || !SRC) {
  console.error('\n  Usage:  node scripts/gen-covers.js <book-slug> "<source folder>"\n')
  process.exit(1)
}
SRC = SRC.replace(/^~(?=$|\/)/, os.homedir())
const MDX_PATH = path.join(ROOT, 'content', 'print', `${slug}.mdx`)

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
    console.error(`\n  Source folder not found:\n    ${SRC}\n`)
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

  console.log(`\n  Book:   ${slug}`)
  console.log(`  Source: ${SRC}`)
  console.log(`  Found ${files.length} image(s). Compressing to max ${MAX_WIDTH}px / q${QUALITY}…\n`)

  const covers = []
  let n = 1
  for (const f of files) {
    const out = `${slug}-spread-${String(n).padStart(2, '0')}.jpg`
    const bytes = await compress(path.join(SRC, f), path.join(IMG_DIR, out))
    console.log(`  ${String(n).padStart(2, '0')}  ${f.padEnd(28)} -> ${out}  ${(bytes / 1024).toFixed(0)} KB`)
    covers.push(`/images/${out}`)
    n++
  }

  const coverList = covers.map(c => `  - ${c}`).join('\n')

  if (fs.existsSync(MDX_PATH)) {
    // Replace only the covers: block; everything else in the file stays.
    const raw = fs.readFileSync(MDX_PATH, 'utf-8')
    const block = `covers:\n${coverList}`
    const replaced = /^covers:\n(?:\s+-\s.*\n?)*/m.test(raw)
      ? raw.replace(/^covers:\n(?:\s+-\s.*\n?)*/m, block + '\n')
      : raw.replace(/^---\n/, `---\n${block}\n`)
    fs.writeFileSync(MDX_PATH, replaced)
    console.log(`\n  Updated covers list in ${path.relative(ROOT, MDX_PATH)} (rest untouched).`)
  } else {
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const mdx = `---
title: ${title}
cover: ${covers[0]}
covers:
${coverList}
---
`
    fs.mkdirSync(path.dirname(MDX_PATH), { recursive: true })
    fs.writeFileSync(MDX_PATH, mdx)
    console.log(`\n  Created ${path.relative(ROOT, MDX_PATH)} — set its title/cover in the CMS,`)
    console.log(`  and add the matching shop item (same slug) for price + buying.`)
  }
  console.log(`  ${covers.length} page(s) in the flip-through.\n`)
}

run().catch(err => { console.error(err); process.exit(1) })
