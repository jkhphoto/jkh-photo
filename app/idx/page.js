import { Suspense } from 'react'
import '../../styles/index-page.css'
import IndexList from '../../components/IndexList'
import { getOrderedProjects } from '../../lib/content'
import { imageRatio } from '../../lib/imageRatio'

/** First still image in a project's gallery blocks, whatever the block type —
 *  a local /images file or an archive /i/<id>/<variant> URL. */
function firstGalleryImage(p) {
  const m = JSON.stringify(p.gallery || []).match(
    /"((?:\/|https?:\/\/)[^"]+?\.(?:jpe?g|png|webp)|https?:\/\/[^"]+\/i\/[^"/]+\/(?:web|display))"/i,
  )
  return m ? m[1] : null
}

/** The tile's photo: indexImage when set (chosen in Decap — may be a
 *  transparent cut-out). Otherwise featuredImage, unless that's a PNG: those
 *  are usually full-size homepage hover art, so a real frame is lighter. */
function tileImage(p) {
  if (p.indexImage) return p.indexImage
  const f = p.featuredImage
  if (f && !/\.png$/i.test(f)) return f
  return firstGalleryImage(p) || f || null
}

export default function IdxPage() {
  const projects = getOrderedProjects().map((p) => {
    const cover = tileImage(p)
    // Archive-published projects carry their cover's shape (coverRatio);
    // local files are measured from their headers.
    const ratio =
      imageRatio(cover) ??
      (cover === p.featuredImage && Number(p.coverRatio) > 0 ? Number(p.coverRatio) : null)
    return {
      slug: p._sys.filename,
      num: String(p.displayNumber || 0).padStart(2, '0'),
      title: p.title,
      category: p.category || '',
      client: p.client || '',
      date: p.date || '',
      tags: Array.isArray(p.tags) ? p.tags : [],
      cover,
      ratio,
    }
  })
  return (
    <Suspense>
      <IndexList projects={projects} />
    </Suspense>
  )
}
