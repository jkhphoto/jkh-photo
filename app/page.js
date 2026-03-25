import '../styles/home.css'
import HomeProjectList from '../components/HomeProjectList'
import { getCollection } from '../lib/content'

export default async function Home() {
  const projects = getCollection('project').filter((p) => p.featured)

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
