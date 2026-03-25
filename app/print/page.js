import '../../styles/print.css'
import PrintGrid from '../../components/PrintGrid'

export const metadata = { title: 'Print — JKH Photo' }

export default async function PrintPage() {
  let items = []
  try {
    const client = (await import('../../tina/__generated__/client')).default
    const result = await client.queries.printConnection()
    items = result.data.printConnection.edges.map((e) => e.node)
  } catch (e) {}

  return <PrintGrid items={items} />
}
