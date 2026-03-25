import '../styles/globals.css'
import Nav from '../components/Nav'
import Clock from '../components/Clock'

export const metadata = { title: 'JKH Photo', description: 'Joe Hale — Photographer, Brooklyn NY' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="https://cdn.jsdelivr.net/gh/nicholasgasior/gfonts@master/fonts/BebasNeue/BebasNeue-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <style>{`@font-face { font-family: 'Bebas Neue'; src: url('https://cdn.jsdelivr.net/gh/nicholasgasior/gfonts@master/fonts/BebasNeue/BebasNeue-Regular.woff2') format('woff2'); font-weight: 400; font-display: swap; }`}</style>
      </head>
      <body><Nav />{children}<Clock /></body>
    </html>
  )
}
