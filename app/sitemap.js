import { getSlugs } from '../lib/content'

const BASE = 'https://josephkhale.com'

export default function sitemap() {
  const staticPages = ['', '/idx', '/bts', '/generations', '/info', '/print'].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: 'monthly',
    priority: p === '' ? 1 : 0.7,
  }))
  const projects = getSlugs('project').map((slug) => ({
    url: `${BASE}/projects/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))
  return [...staticPages, ...projects]
}
