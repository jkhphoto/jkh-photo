'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import '../../../styles/project.css'
import Gallery, { extractImages } from '../../../components/Gallery'
import Credits from '../../../components/Credits'
import ProjectBanner from '../../../components/ProjectBanner'
import Lightbox from '../../../components/Lightbox'

export default function ProjectPage({ project }) {
  const [lbIndex, setLbIndex] = useState(null)
  const allImages = useMemo(() => extractImages(project.gallery), [project.gallery])
  const num = project.displayNumber ? String(project.displayNumber).padStart(2, '0') : null
  const tags = project.tags || []

  const handleImageClick = (src) => {
    const idx = allImages.indexOf(src)
    setLbIndex(idx !== -1 ? idx : 0)
  }

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

      <Gallery rows={project.gallery} onImageClick={handleImageClick} />
      <Credits credits={project.credits} />

      {tags.length > 0 && (
        <div className="proj-tags">
          {tags.map((tag) => (
            <Link key={tag} href={`/idx?tag=${encodeURIComponent(tag)}`} className="proj-tag">
              {tag}
            </Link>
          ))}
        </div>
      )}

      <ProjectBanner title={project.title} category={project.category} date={project.date} number={project.displayNumber} location={project.location} />
      {lbIndex !== null && (
        <Lightbox images={allImages} startIndex={lbIndex} onClose={() => setLbIndex(null)} />
      )}
    </>
  )
}
