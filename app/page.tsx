import { DEFAULT_LOCALE } from '@/lib/constants'

// Static export can't do a runtime redirect, so / is a real page that bounces
// to the default locale. Works in dev too, where .htaccess isn't involved.
export default function RootRedirect() {
  const to = `/${DEFAULT_LOCALE}/`
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${to}`} />
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(to)}+location.search+location.hash)` }} />
      <a href={to}>Fityesz Krónika</a>
    </>
  )
}
