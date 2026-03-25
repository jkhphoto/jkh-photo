import ProjectPage from './ProjectPage'
import { getSlugs, getEntry, getOrderedProjects } from '../../../lib/content'

export async function generateStaticParams() {
  return getSlugs('project').map(slug => ({ slug }))
}

export async function generateMetadata({ params }) {
  const p = getEntry('project', params.slug)
  return { title: p ? `${p.title} — JKH Photo` : 'JKH Photo' }
}

export default async function Page({ params }) {
  const project = getEntry('project', params.slug)
  if (!project) {
    return <div style={{ padding: '120px 32px', fontFamily: 'var(--mono)', fontSize: '11px', color: '#999' }}>Project not found.</div>
  }
  // Get display number from ordered list
  const ordered = getOrderedProjects()
  const match = ordered.find(p => p._sys.filename === params.slug)
  if (match) {
    project.displayNumber = match.displayNumber
  }
  return <ProjectPage project={project} />
}
