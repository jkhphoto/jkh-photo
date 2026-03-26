import '../styles/home.css'
import HomeProjectList from '../components/HomeProjectList'
import HeroVideo from '../components/HeroVideo'
import { getOrderedProjects } from '../lib/content'

export default async function Home() {
  const allOrdered = getOrderedProjects()
  const projects = allOrdered.filter((p) => p.featured)

  return (
    <>
      <HeroVideo />
      <HomeProjectList projects={projects} />
    </>
  )
}
