import fs from 'fs'
import path from 'path'

/**
 * Parse YAML frontmatter from an MDX file.
 * Handles the subset of YAML used by Decap/Tina content files:
 * strings, numbers, booleans, lists of objects, nested objects, multi-line strings.
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  return parseYaml(match[1])
}

function parseYaml(text) {
  const lines = text.split('\n')
  return parseObject(lines, 0, 0).value
}

function parseObject(lines, start, minIndent) {
  const obj = {}
  let i = start
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '' || line.trim().startsWith('#')) { i++; continue }
    const indent = line.search(/\S/)
    if (indent < minIndent) break

    // List item at this level
    if (line.trimStart().startsWith('- ')) {
      break
    }

    const keyMatch = line.match(/^(\s*)([^:]+):\s*(.*)$/)
    if (!keyMatch) { i++; continue }

    const key = keyMatch[2].trim()
    let val = keyMatch[3].trim()
    const keyIndent = keyMatch[1].length

    if (keyIndent < minIndent) break
    if (keyIndent > minIndent && i > start) break

    // Multi-line scalar (> or |)
    if (val === '>' || val === '>-' || val === '|' || val === '|-') {
      const parts = []
      i++
      while (i < lines.length) {
        const nextLine = lines[i]
        if (nextLine.trim() === '') { parts.push(''); i++; continue }
        const ni = nextLine.search(/\S/)
        if (ni <= keyIndent) break
        parts.push(nextLine.trim())
        i++
      }
      // For > and >-, join with spaces; for | and |-, join with newlines
      obj[key] = (val.startsWith('>')) ? parts.filter(Boolean).join(' ') : parts.join('\n')
      continue
    }

    // List
    if (val === '') {
      // Check if next line is a list item or nested object
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1]
        const nextTrimmed = nextLine.trimStart()
        const nextIndent = nextLine.search(/\S/)
        if (nextTrimmed.startsWith('- ')) {
          const list = parseList(lines, i + 1, nextIndent)
          obj[key] = list.value
          i = list.end
          continue
        } else if (nextIndent > keyIndent) {
          const nested = parseObject(lines, i + 1, nextIndent)
          obj[key] = nested.value
          i = nested.end
          continue
        }
      }
      obj[key] = ''
      i++
      continue
    }

    // Inline list: [a, b, c] or []
    if (val.startsWith('[')) {
      if (val === '[]') {
        obj[key] = []
      } else {
        obj[key] = val.slice(1, -1).split(',').map(s => castValue(s.trim()))
      }
      i++
      continue
    }

    obj[key] = castValue(val)
    i++
  }
  return { value: obj, end: i }
}

function parseList(lines, start, minIndent) {
  const arr = []
  let i = start
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') { i++; continue }
    const indent = line.search(/\S/)
    if (indent < minIndent) break
    if (!line.trimStart().startsWith('- ')) break

    // Extract content after "- "
    const after = line.replace(/^\s*-\s*/, '')
    const dashIndent = indent

    // "- key: val" (object item)
    if (after.match(/^[^:]+:\s*.*/)) {
      // Reconstruct as if the key is at indent+2
      const objLines = [' '.repeat(dashIndent + 2) + after]
      let j = i + 1
      while (j < lines.length) {
        const nl = lines[j]
        if (nl.trim() === '') { j++; continue }
        const ni = nl.search(/\S/)
        if (ni <= dashIndent) break
        if (nl.trimStart().startsWith('- ') && ni === dashIndent) break
        objLines.push(nl)
        j++
      }
      const parsed = parseObject(objLines, 0, dashIndent + 2)
      arr.push(parsed.value)
      i = j
    } else {
      // Simple scalar list item
      arr.push(castValue(after))
      i++
    }
  }
  return { value: arr, end: i }
}

function castValue(val) {
  if (val === 'true') return true
  if (val === 'false') return false
  if (val === 'null' || val === '~') return null
  // Remove quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1)
  }
  // Number
  if (/^-?\d+$/.test(val)) return parseInt(val, 10)
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val)
  return val
}

// ── Public API ──

const CONTENT_DIR = path.join(process.cwd(), 'content')

export function getCollection(collection) {
  const dir = path.join(CONTENT_DIR, collection === 'project' ? 'projects' : collection)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8')
      const data = parseFrontmatter(raw)
      data._sys = { filename: f.replace(/\.mdx?$/, '') }
      // Normalize gallery template discriminator: Decap uses `type`, Tina used `_template`
      if (data.gallery && Array.isArray(data.gallery)) {
        data.gallery = data.gallery.map(row => {
          const type = row.type || row._template
          return { ...row, _template: type, type }
        })
      }
      return data
    })
}

export function getEntry(collection, slug) {
  const dir = path.join(CONTENT_DIR, collection === 'project' ? 'projects' : collection)
  const tryExts = ['.mdx', '.md']
  for (const ext of tryExts) {
    const fp = path.join(dir, slug + ext)
    if (fs.existsSync(fp)) {
      const raw = fs.readFileSync(fp, 'utf-8')
      const data = parseFrontmatter(raw)
      data._sys = { filename: slug }
      if (data.gallery && Array.isArray(data.gallery)) {
        data.gallery = data.gallery.map(row => {
          const type = row.type || row._template
          return { ...row, _template: type, type }
        })
      }
      return data
    }
  }
  return null
}

export function getSlugs(collection) {
  const dir = path.join(CONTENT_DIR, collection === 'project' ? 'projects' : collection)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
    .map(f => f.replace(/\.mdx?$/, ''))
}
