#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const ROOT = path.resolve(__dirname, '..')
const MDX_PATH = path.join(ROOT, 'content', 'bts', 'bts.mdx')
const THUMB_DIR = path.join(ROOT, 'public', 'images', 'bts-thumbs')
const MAX_WIDTH = 600
const QUALITY = 75

async function run() {
  const mdx = fs.readFileSync(MDX_PATH, 'utf8')
  const lines = mdx.match(/image:\s*(.+)/g) || []
  const images = lines.map(m => m.replace('image:', '').trim())

  if (!images.length) { console.log('No BTS images found'); return }

  console.log(`Found ${images.length} BTS images. Resizing to max ${MAX_WIDTH}px...\n`)
  fs.mkdirSync(THUMB_DIR, { recursive: true })

  let resized = 0, skipped = 0
  let updatedMdx = mdx

  for (const imgPath of images) {
    const fullPath = path.join(ROOT, 'public', imgPath.replace(/^\//, ''))
    if (!fs.existsSync(fullPath)) {
      console.warn(`  SKIP (not found): ${imgPath}`)
      skipped++
      continue
    }

    const basename = path.basename(imgPath)
    const thumbPath = path.join(THUMB_DIR, basename)
    const newMdxPath = `/images/bts-thumbs/${basename}`

    if (fs.existsSync(thumbPath)) {
      const srcStat = fs.statSync(fullPath)
      const thumbStat = fs.statSync(thumbPath)
      if (thumbStat.mtimeMs > srcStat.mtimeMs) {
        updatedMdx = updatedMdx.replace(imgPath, newMdxPath)
        skipped++
        continue
      }
    }

    try {
      const meta = await sharp(fullPath).metadata()
      const oldSize = fs.statSync(fullPath).size
      await sharp(fullPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: QUALITY })
        .toFile(thumbPath)
      const newSize = fs.statSync(thumbPath).size
      console.log(`  OK: ${basename} (${meta.width}px > ${MAX_WIDTH}px, ${Math.round(oldSize/1024)}KB > ${Math.round(newSize/1024)}KB)`)
      updatedMdx = updatedMdx.replace(imgPath, newMdxPath)
      resized++
    } catch (e) {
      console.warn(`  FAIL: ${basename} - ${e.message}`)
      skipped++
    }
  }

  fs.writeFileSync(MDX_PATH, updatedMdx)
  console.log(`\nDone: ${resized} resized, ${skipped} skipped`)
  console.log('bts.mdx updated with new paths.')
}

run().catch(console.error)
