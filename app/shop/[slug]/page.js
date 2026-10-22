import '../../../styles/shop.css'
import Link from 'next/link'
import { getSlugs, getEntry } from '../../../lib/content'
import { readCatalog } from '../../../lib/shopCatalog'
import VariantRows from '../../../components/shop/VariantRows'
import BookReader from '../../../components/shop/BookReader'

export async function generateStaticParams() {
  return getSlugs('shop').map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const item = getEntry('shop', params.slug)
  if (!item) return { title: 'Shop — JKH Photo' }
  const description = [item.details, item.description].filter(Boolean).join(' — ')
  return {
    title: `${item.title} — JKH Photo`,
    description: description || 'Prints and books by Joe Hale.',
    openGraph: {
      title: item.title,
      description,
      images: item.cover ? [{ url: item.cover }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default function ProductPage({ params }) {
  const item = getEntry('shop', params.slug)
  const product = readCatalog().products[params.slug]
  if (!item || item.active === false || !product) {
    return (
      <div className="product-page">
        <p className="product-missing">This item isn&apos;t in the shop right now.</p>
      </div>
    )
  }

  const images = (item.images || []).map((i) => i.image).filter(Boolean)
  // A matching entry in content/print carries the book's page images —
  // if it has any, the product page gets the flip-through. The content
  // predates the CMS schema: `covers` is the flat list actually in use,
  // `spreads` the shape the config once promised.
  const printEntry = getEntry('print', params.slug)
  const spreads = [
    ...(printEntry?.covers || []),
    ...(printEntry?.spreads || []).map((s) => s?.image),
  ].filter((src) => src && src !== item.cover)

  return (
    <div className="product-page">
      <div className="product-images">
        <img src={item.cover} alt={`${item.title} — JKH Photo`} />
        {images.map((src) => (
          <img key={src} src={src} alt={`${item.title} — JKH Photo`} loading="lazy" />
        ))}
      </div>

      <div className="product-meta">
        <Link href="/shop" className="product-back">Shop</Link>
        <h1 className="product-title">{item.title}</h1>
        {item.details && <p className="product-details">{item.details}</p>}
        {item.description && <p className="product-desc">{item.description}</p>}

        <VariantRows slug={params.slug} product={product} />

        <p className="product-note">Ships in the US, or Brooklyn pickup.</p>
        {spreads.length > 0 ? (
          <BookReader
            title={item.title}
            cover={item.cover}
            spreads={spreads}
            description={item.description}
          />
        ) : (
          item.link && (
            <Link href={item.link} className="product-related">
              See it in context →
            </Link>
          )
        )}
      </div>
    </div>
  )
}
