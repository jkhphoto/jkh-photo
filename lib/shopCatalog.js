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

/**
 * Products whose `link` points at the given page, so that page can host
 * buy rows for them. Returns [{slug, product}].
 */
export function productsLinkedTo(href) {
  const { products } = readCatalog()
  return Object.entries(products)
    .filter(([, p]) => p.link === href)
    .map(([slug, product]) => ({ slug, product }))
}
