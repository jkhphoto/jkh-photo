import fs from 'fs'
import path from 'path'

/**
 * Parse YAML frontmatter from an MDX file.
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
    if (line.trimStart().startsWith('- ')) { break }

    const keyMatch = line.match(/^(\s*)([^:]+):\s*(.*)$/)
    if (!keyMatch) { i++; continue }

    const key = keyMatch[2].trim()
    let val = keyMatch[3].trim()
    const keyIndent = keyMatch[1].length

    if (keyIndent < minIndent) break
    if (keyIndent > minIndent && i > start) break

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
      obj[key] = (val.startsWith('>')) ? parts.filter(Boolean).join(' ') : parts.join('\n')
      continue
    }

    if (val === '') {
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

    const after = line.replace(/^\s*-\s*/, '')
    const dashIndent = indent

    if (after.match(/^[^:]+:\s*.*/)) {
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
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1)
  }
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
      if (data.gallery && Array.isArray(data.gallery)) {
        data.gallery = data.gallery.map(row => {
          const type = row.type || row._template
          return { ...row, _template: type, type }
        })
      }
      return data
    })
}

/**
 * Get projects sorted by the drag-reorder list in content/settings/order.mdx.
 * Projects not in the order list are appended at the end.
 * Each project gets an auto-generated `displayNumber` based on position.
 */
export function getOrderedProjects() {
  const allProjects = getCollection('project')
  const orderFile = path.join(CONTENT_DIR, 'settings', 'order.mdx')

  let slugOrder = []
  if (fs.existsSync(orderFile)) {
    const raw = fs.readFileSync(orderFile, 'utf-8')
    const data = parseFrontmatter(raw)
export function getOrderedProjects() {
  const allProjects = getCollection('project')
  const sorted = [...allProjects].sort((a, b) => (a.number || 9999) - (b.number || 9999))
  return sorted.map((p, i) => ({
    ...p,
    displayNumber: i + 1,
  }))
}    if (data.order && Array.isArray(data.order)) {
      slugOrder = data.order.map(item => item.slug || item).filter(Boolean)
    }
  }

  // Build a map for quick lookup
  const projectMap = new Map()
  for (const p of allProjects) {
    projectMap.set(p._sys.filename, p)
  }

  // Ordered projects first
  const ordered = []
  for (const slug of slugOrder) {
    if (projectMap.has(slug)) {
      ordered.push(projectMap.get(slug))
      projectMap.delete(slug)
    }
  }

  // Append any projects not in the order list
  for (const p of projectMap.values()) {
    ordered.push(p)
  }

  // Assign display numbers based on position
  return ordered.map((p, i) => ({
    ...p,
    displayNumber: i + 1,
  }))
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
