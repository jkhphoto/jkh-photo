import '../styles/globals.css'
import Script from 'next/script'
import Nav from '../components/Nav'
import Clock from '../components/Clock'

export const metadata = {
  metadataBase: new URL('https://josephkhale.com'),
  title: 'JKH Photo',
  description: 'Joe Hale — Photographer, Brooklyn NY',
  openGraph: {
    siteName: 'JKH Photo',
    type: 'website',
    images: [{ url: '/og/default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <Script id="rb2b" strategy="afterInteractive">{`
          !function(key){if(window.reb2b)return;window.reb2b={loaded:true};var s=document.createElement("script");s.async=true;s.src="https://b2bjsstore.s3.us-west-2.amazonaws.com/b/"+key+"/"+key+".js.gz";document.getElementsByTagName("script")[0].parentNode.insertBefore(s,document.getElementsByTagName("script")[0]);}("0GOYPYHRQPOX");
        `}</Script>
      </head>
      <body><Nav />{children}<Clock /></body>
    </html>
  )
}
