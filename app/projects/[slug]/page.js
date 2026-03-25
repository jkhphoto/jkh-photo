import ProjectPage from './ProjectPage'

export async function generateStaticParams() {
  try {
    const client = (await import('../../../tina/__generated__/client')).default
    const result = await client.queries.projectConnection()
    return result.data.projectConnection.edges.map((edge) => ({
      slug: edge.node._sys.filename,
    }))
  } catch (e) {
    return []
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
