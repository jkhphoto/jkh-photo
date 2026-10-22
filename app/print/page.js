import '../../styles/print.css'
import PrintGrid from '../../components/PrintGrid'
import { getCollection } from '../../lib/content'
import { productsLinkedTo } from '../../lib/shopCatalog'

export const metadata = { title: 'Print — JKH Photo' }

export default async function PrintPage() {
  const items = getCollection('print')
  // Shop products whose page is /print get buy rows in their section —
  // same cart as everywhere else. Keyed by slug; print items match on
  // their own filename.
  const buy = {}
  for (const { slug, product } of productsLinkedTo('/print')) buy[slug] = product

  return <PrintGrid items={items} buy={buy} />
}
