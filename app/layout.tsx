import type { ReactNode } from 'react'
import { Antonio, Public_Sans } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { DEFAULT_LOCALE } from '@/lib/constants'
import { SITE_URL } from '@/lib/site'
import './globals.css'

// The font variables must land on <html>, because lib/design/tokens.css
// defines --fD/--fB/--fL on :root in terms of them. Put them on an inner
// element and every one of those declarations resolves against an undefined
// variable, so the whole site silently falls back to the system font.
const antonio = Antonio({
  subsets: ['latin', 'latin-ext'],
  weight: '700',
  display: 'swap',
  variable: '--font-antonio',
})

const publicSans = Public_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-public-sans',
})

const fontVariables = [antonio.variable, publicSans.variable].join(' ')

// Every route renders through this layout, including the 404 for paths with
// no locale prefix, so the document tags live here too.
/** Absolute URLs in page metadata resolve against this. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

/** The browser chrome colour on a phone: ink, like the header. */
export const viewport: Viewport = { themeColor: '#161616' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}
