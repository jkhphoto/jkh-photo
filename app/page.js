import '../styles/home.css'
import HomeProjectList from '../components/HomeProjectList'

export default async function Home() {
  let projects = []
  try {
    const client = (await import('../tina/__generated__/client')).default
    const result = await client.queries.projectConnection()
    projects = result.data.projectConnection.edges.map((e) => e.node).filter((p) => p.featured)
  } catch (e) {}

  return (
    <>
      <div className="hero-video">
        <video autoPlay muted loop playsInline><source src="/video/reel.mp4" type="video/mp4" /></video>
        <div className="hero-video-fallback">[ drop reel.mp4 into public/video/ ]</div>
      </div>
      <HomeProjectList projects={projects} />
    </>
  )
}
