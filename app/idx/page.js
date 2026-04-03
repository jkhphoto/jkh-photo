import { Suspense } from 'react'
import '../../styles/index-page.css'
import IndexList from '../../components/IndexList'
import { getOrderedProjects } from '../../lib/content'

export default function IdxPage() {
  const projects = getOrderedProjects()
  return (
    <Suspense>
      <IndexList projects={projects} />
    </Suspense>
  )
}
