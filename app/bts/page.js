import '../../styles/bts.css'
import BTSGrid from '../../components/BTSGrid'
import { getEntry } from '../../lib/content'

export const metadata = { title: 'BTS — JKH Photo' }

export default async function BTSPage() {
  const data = getEntry('bts', 'bts')
  const images = data?.images || []

  return <BTSGrid images={images} />
}
