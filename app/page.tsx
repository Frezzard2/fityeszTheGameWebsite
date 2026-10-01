import { DEFAULT_LOCALE, LOCALES } from '@/lib/constants'

/**
 * Static export cannot redirect at runtime, so `/` is a real page that bounces
 * to a locale. Apache does this first from the .htaccess; this is what answers
 * on a host that ignores it, and in dev, where .htaccess is not involved.
 *
 * The script picks the locale the same way the server does — the browser's
 * first language, falling back to Hungarian. The meta refresh behind it cannot
 * read a language, so it names the default; a browser with scripting will have
 * already left by the time it fires.
 */
export default function RootRedirect() {
  const fallback = `/${DEFAULT_LOCALE}/`
  const pick = `(function(){
    var want = (navigator.languages && navigator.languages[0] || navigator.language || '').slice(0, 2).toLowerCase();
    var to = ${JSON.stringify(LOCALES)}.indexOf(want) > -1 ? '/' + want + '/' : ${JSON.stringify(fallback)};
    location.replace(to + location.search + location.hash);
  })()`

  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${fallback}`} />
      <script dangerouslySetInnerHTML={{ __html: pick }} />
      <a href={fallback}>Fityesz Krónika</a>
    </>
  )
}
