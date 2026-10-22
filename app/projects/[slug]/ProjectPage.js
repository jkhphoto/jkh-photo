'use client'
import { useState, useMemo } from 'react'
import '../../../styles/project.css'
import Gallery, { extractImages } from '../../../components/Gallery'
import Credits from '../../../components/Credits'
import ProjectBanner from '../../../components/ProjectBanner'
import Lightbox from '../../../components/Lightbox'
import { BuyBlock } from '../../../components/shop/VariantRows'

export default function ProjectPage({ project, buy = [] }) {
  const [lbIndex, setLbIndex] = useState(null)
  const allImages = useMemo(() => extractImages(project.gallery), [project.gallery])
  const num = project.displayNumber ? String(project.displayNumber).padStart(2, '0') : null

  const altText = [project.title, project.client, 'photographed by Joe Hale'].filter(Boolean).join(' — ')

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

      <Gallery rows={project.gallery} onImageClick={handleImageClick} alt={altText} />
      <Credits credits={project.credits} tags={project.tags} />
      {buy.length > 0 && (
        <div className="proj-buy">
          {buy.map(({ slug, product }) => (
            <BuyBlock key={slug} slug={slug} product={product} label={product.title} />
          ))}
        </div>
      )}
      <ProjectBanner title={project.title} category={project.category} date={project.date} number={project.displayNumber} location={project.location} client={project.client} />
      {lbIndex !== null && (
        <Lightbox images={allImages} startIndex={lbIndex} onClose={() => setLbIndex(null)} alt={altText} />
      )}
    </>
  )
}
