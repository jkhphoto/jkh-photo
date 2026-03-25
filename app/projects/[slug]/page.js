import ProjectPage from './ProjectPage'
import fs from 'fs'
import path from 'path'

export async function generateStaticParams() {
  // Try TinaCMS API first
  try {
    const client = (await import('../../../tina/__generated__/client')).default
    const result = await client.queries.projectConnection()
    const params = result.data.projectConnection.edges.map((edge) => ({
      slug: edge.node._sys.filename,
    }))
    if (params.length > 0) return params
  } catch (e) {}

  // Fallback: read content directory directly
  const contentDir = path.join(process.cwd(), 'content/projects')
  try {
    const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.mdx'))
    return files.map((f) => ({ slug: f.replace('.mdx', '') }))
  } catch (e) {
    return [{ slug: '_placeholder' }]
  }
}

export async function generateMetadata({ params }) {
  try {
    const client = (await import('../../../tina/__generated__/client')).default
    const { data } = await client.queries.project({ relativePath: `${params.slug}.mdx` })
    return { title: `${data.project.title} — JKH Photo` }
  } catch (e) {
    return { title: 'JKH Photo' }
  }
}

export default async function Page({ params }) {
  try {
    const client = (await import('../../../tina/__generated__/client')).default
    const { data } = await client.queries.project({ relativePath: `${params.slug}.mdx` })
    return <ProjectPage project={data.project} />
  } catch (e) {
    return <div style={{ padding: '120px 32px', fontFamily: 'var(--mono)', fontSize: '11px', color: '#999' }}>Project not found. Run `npm run dev` to start Tina.</div>
  }
}
