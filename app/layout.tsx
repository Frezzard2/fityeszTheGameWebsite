import type { ReactNode } from 'react'

// Next requires a root layout to exist, but it must not render <html>/<body>:
// app/[locale]/layout.tsx is the only layout that does that (see decision 1,
// Task 3 dispatch). This is a pure pass-through.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
