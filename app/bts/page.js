import '../../styles/bts.css'
import BTSGrid from '../../components/BTSGrid'

export const metadata = { title: 'BTS — JKH Photo' }

export default async function BTSPage() {
  let images = []
  try {
    const client = (await import('../../tina/__generated__/client')).default
    const result = await client.queries.bts({ relativePath: 'bts.mdx' })
    images = result.data.bts.images || []
  } catch (e) {}

  return <BTSGrid images={images} />
}
