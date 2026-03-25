import '../styles/home.css'
import HomeProjectList from '../components/HomeProjectList'
import { getOrderedProjects } from '../lib/content'

export default async function Home() {
  const allOrdered = getOrderedProjects()
  const projects = allOrdered.filter((p) => p.featured)

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
