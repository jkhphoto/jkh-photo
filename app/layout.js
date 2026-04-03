import '../styles/globals.css'
import '../styles/landing.css'

export const metadata = { title: 'JKH Photo', description: 'Joe Hale — Photographer, Brooklyn NY' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <nav>
          <span className="logo">JKH Photo</span>
        </nav>
        {children}
      </body>
    </html>
  )
}
