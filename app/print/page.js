import '../../styles/print.css'
import PrintGrid from '../../components/PrintGrid'
import { getCollection } from '../../lib/content'

export const metadata = { title: 'Print — JKH Photo' }

export default async function PrintPage() {
  const items = getCollection('print')

  return <PrintGrid items={items} />
}
