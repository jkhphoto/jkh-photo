import '../../styles/shop.css'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { getCollection } from '../../lib/content'
import { readCatalog } from '../../lib/shopCatalog'
import ShopClient from '../../components/shop/ShopClient'

export const metadata = {
  title: 'Shop — JKH Photo',
  description: 'Prints and books by Joe Hale. US shipping or Brooklyn pickup.',
}

export default function ShopPage() {
  const items = getCollection('shop')
    .filter((i) => i.active !== false)
    .sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99))
  const settingsRaw = fs.readFileSync(
    path.join(process.cwd(), 'content/shop-settings.yml'),
    'utf-8',
  )
  const intro = (settingsRaw.match(/^intro:\s*(.*)$/m) || [])[1] || ''
  const catalog = readCatalog()

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1 className="shop-title">Shop</h1>
        {intro && <p className="shop-intro">{intro}</p>}
        {/* The cart itself is global (mounted in the layout); ShopClient
            hosts this page's buy points — the header button and the
            variant rows portaled into each card's slot below. */}
        <ShopClient products={catalog.products} />
      </div>

      <div className="shop-grid">
        {items.map((item) => {
          const slug = item._sys.filename
          const soldOut = item.soldOut === true
          return (
            <div key={slug} className={`shop-item${soldOut ? ' shop-item--soldout' : ''}`}>
              {item.link ? (
                <Link href={item.link} className="shop-item-cover">
                  <img src={item.cover} alt={`${item.title} — JKH Photo`} loading="lazy" />
                </Link>
              ) : (
                <div className="shop-item-cover">
                  <img src={item.cover} alt={`${item.title} — JKH Photo`} loading="lazy" />
                </div>
              )}
              <div className="shop-item-info">
                <h2 className="shop-item-title">
                  {item.link ? <Link href={item.link}>{item.title}</Link> : item.title}
                </h2>
                {item.details && <p className="shop-item-details">{item.details}</p>}
                {item.description && <p className="shop-item-desc">{item.description}</p>}
                <div id={`shop-variants-${slug}`} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
