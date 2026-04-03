import '../styles/globals.css'
import Nav from '../components/Nav'
import Clock from '../components/Clock'

export const metadata = { title: 'JKH Photo', description: 'Joe Hale — Photographer, Brooklyn NY' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><link rel="icon" href="/favicon.png" type="image/png" /></head>
      <body><Nav />{children}<Clock /></body>
    </html>
  )
}
