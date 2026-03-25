'use client'
import { useState } from 'react'
import '../../../styles/project.css'
import Gallery from '../../../components/Gallery'
import Credits from '../../../components/Credits'
import ProjectBanner from '../../../components/ProjectBanner'
import Lightbox from '../../../components/Lightbox'

export default function ProjectPage({ project }) {
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const num = project.displayNumber ? String(project.displayNumber).padStart(2, '0') : null

  return (
    <>
      <div className="proj-head">
        <h1 className="proj-title">{project.title}</h1>
        <div className="proj-meta">
          {project.category && <span>{project.category}</span>}
          {project.date && <span>{project.date}</span>}
          {project.location && <span>{project.location}</span>}
          {project.coordinates && <span>{project.coordinates}</span>}
          {num && <span>[{num}]</span>}
        </div>
      </div>

      <Gallery rows={project.gallery} onImageClick={(src) => setLightboxSrc(src)} />
      <Credits credits={project.credits} />
      <ProjectBanner title={project.title} category={project.category} date={project.date} number={project.displayNumber} location={project.location} />
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </>
  )
}
