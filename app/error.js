'use client'
import { useEffect, useState } from 'react'

/*
  A deploy replaces the content-hashed JS/CSS filenames. A tab that was
  already open then asks for chunks that no longer exist, hydration fails,
  and without a boundary the page just goes blank.

  Reloading picks up the new build, so do that automatically — but only
  once per session, guarded by sessionStorage, so a genuine repeatable
  error can't put us in a reload loop.
*/
const RELOAD_KEY = 'jkh-reloaded-after-error'

function isStaleBuildError(error) {
  const msg = `${error?.name || ''} ${error?.message || ''}`
  return /ChunkLoadError|Loading chunk|Loading CSS chunk|Importing a module script failed|error loading dynamically imported module|Failed to fetch dynamically imported module/i.test(msg)
}

export default function Error({ error, reset }) {
  const [gaveUp, setGaveUp] = useState(false)

  useEffect(() => {
    if (isStaleBuildError(error) && !sessionStorage.getItem(RELOAD_KEY)) {
      sessionStorage.setItem(RELOAD_KEY, '1')
      window.location.reload()
      return
    }
    setGaveUp(true)
  }, [error])

  if (!gaveUp) return null

  return (
    <main className="err">
      <p className="err-label">Something went wrong</p>
      <div className="err-actions">
        <button onClick={() => { sessionStorage.removeItem(RELOAD_KEY); reset() }}>Try again</button>
        <a href="/">Home</a>
      </div>
    </main>
  )
}
