import '../../styles/index-page.css'
import IndexList from '../../components/IndexList'
import { getOrderedProjects } from '../../lib/content'

export const metadata = { title: 'Index — JKH Photo' }

export default async function IndexPage() {
  const projects = getOrderedProjects()
  return <IndexList projects={projects} />
}
