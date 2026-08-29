import fs from 'fs'
import path from 'path'
import ProjectPage from './ProjectPage'
import { getSlugs, getEntry, getOrderedProjects } from '../../../lib/content'

export async function generateStaticParams() {
  return getSlugs('project').map(slug => ({ slug }))
}

export async function generateMetadata({ params }) {
  const p = getEntry('project', params.slug)
  if (!p) return { title: 'JKH Photo' }
  // og variants are pre-generated into public/og/<slug>.jpg for projects
  // with a featuredImage; the rest share the site default from layout.
  const og = fs.existsSync(path.join(process.cwd(), 'public', 'og', `${params.slug}.jpg`))
    ? `/og/${params.slug}.jpg`
    : '/og/default.jpg'
  const description = [p.client, p.category, p.location].filter(Boolean).join(' · ') || 'JKH Photo'
  return {
    title: `${p.title} — JKH Photo`,
    description,
    openGraph: {
      title: p.title,
      description,
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  }
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
