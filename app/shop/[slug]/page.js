import '../../../styles/shop.css'
import Link from 'next/link'
import { getSlugs, getEntry } from '../../../lib/content'
import { readCatalog } from '../../../lib/shopCatalog'
import VariantRows from '../../../components/shop/VariantRows'

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
        {item.link && (
          <Link href={item.link} className="product-related">
            {item.kind === 'book' ? 'Flip through the book →' : 'See it in context →'}
          </Link>
        )}
      </div>
    </div>
  )
}
