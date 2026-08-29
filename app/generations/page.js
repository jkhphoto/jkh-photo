import '../../styles/generations.css'
import GenerationsPage from '../../components/GenerationsPage'
import { getEntry } from '../../lib/content'

export const metadata = {
  title: 'Generations — A Photo Book by Joe Hale',
  description: '7 years of capturing Tinman Elite. 300 pages, hardcover. A photo book by Joe Hale.',
  openGraph: {
    title: 'Generations — A Photo Book by Joe Hale',
    description: '7 years of capturing Tinman Elite. 300 pages, hardcover.',
    images: [{ url: '/og/generations.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
}

export default function Generations() {
  const item = getEntry('print', 'generations') || {}
  return <GenerationsPage item={item} />
}
