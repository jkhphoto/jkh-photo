import fs from 'fs'
import path from 'path'

/**
 * Build-time reads of the generated price authority
 * (public/shop-catalog.json) — the same numbers checkout charges.
 */
export function readCatalog() {
  const raw = fs.readFileSync(path.join(process.cwd(), 'public/shop-catalog.json'), 'utf-8')
  return JSON.parse(raw)
}
