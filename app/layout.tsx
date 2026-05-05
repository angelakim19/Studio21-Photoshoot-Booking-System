import type { Metadata } from 'next'
import { Poppins, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins" 
})

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair" 
})

export const metadata: Metadata = {
  title: 'Studio 21 | Professional Photoshoot Booking',
  description: 'Book professional photoshoots, makeup services, and studio rentals at Studio 21. Easy online scheduling with instant confirmation.',
  icons: {
    icon: { url: '/favicon.png', width: 32, height: 32 },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable} bg-background`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T19HKL1ZQ0"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T19HKL1ZQ0');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased min-h-screen overflow-x-hidden">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}