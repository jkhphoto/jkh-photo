import '../../styles/index-page.css'
import IndexList from '../../components/IndexList'

export const metadata = { title: 'Index — JKH Photo' }

export default async function IndexPage() {
  let projects = []
  try {
    const client = (await import('../../tina/__generated__/client')).default
    const result = await client.queries.projectConnection()
    projects = result.data.projectConnection.edges.map((e) => e.node)
  } catch (e) {}

  return <IndexList projects={projects} />
}
