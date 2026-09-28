import type { ReactNode } from 'react'
import { DEFAULT_LOCALE } from '@/lib/constants'
import './globals.css'

// Every route renders through this layout, including the 404 for paths with no
// locale prefix, so the document tags have to live here. app/[locale]/layout.tsx
// sets the real lang on a wrapper element.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body>{children}</body>
    </html>
  )
}
