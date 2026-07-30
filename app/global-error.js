'use client'
import { useEffect, useState } from 'react'

/*
  Same stale-build recovery as app/error.js, but for failures that take out
  the root layout itself. This file has to render its own <html>/<body>,
  and it can't rely on the global stylesheet having loaded, so the few
  styles it needs are inline.
*/
const RELOAD_KEY = 'jkh-reloaded-after-error'

function isStaleBuildError(error) {
  const msg = `${error?.name || ''} ${error?.message || ''}`
  return /ChunkLoadError|Loading chunk|Loading CSS chunk|Importing a module script failed|error loading dynamically imported module|Failed to fetch dynamically imported module/i.test(msg)
}

export default function GlobalError({ error, reset }) {
  const [gaveUp, setGaveUp] = useState(false)

  useEffect(() => {
    if (isStaleBuildError(error) && !sessionStorage.getItem(RELOAD_KEY)) {
      sessionStorage.setItem(RELOAD_KEY, '1')
      window.location.reload()
      return
    }
    setGaveUp(true)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#f5f4f0', color: '#0a0a0a' }}>
        {gaveUp && (
          <main style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 20,
            fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            <p style={{ margin: 0, color: '#777' }}>Something went wrong</p>
            <button
              onClick={() => { sessionStorage.removeItem(RELOAD_KEY); reset() }}
              style={{
                font: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit',
                background: 'none', border: 'none', color: '#0a0a0a',
                borderBottom: '2px solid #0a0a0a', padding: '0 0 6px', cursor: 'pointer',
              }}
            >Reload</button>
          </main>
        )}
      </body>
    </html>
  )
}
