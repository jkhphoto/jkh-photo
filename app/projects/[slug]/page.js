import Redirect from '../../../components/Redirect'
import { getSlugs } from '../../../lib/content'

export function generateStaticParams() {
  return getSlugs('projects').map((slug) => ({ slug }))
}

export default function Page() { return <Redirect /> }
