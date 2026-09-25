/**
 * Static export leaves no page at `/` because every locale is prefixed.
 * Plain-file hosting has no middleware to redirect, so we emit the redirect
 * as files: an .htaccess rule for Apache, and a meta-refresh index.html as
 * the fallback for anything else (nginx, S3, a bare CDN).
 *
 * Runs automatically after `npm run build`.
 */
import { writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join(process.cwd(), 'out')
const DEFAULT_LOCALE = 'hu'

if (!existsSync(OUT)) {
  console.error('postexport: out/ not found — did `next build` run?')
  process.exit(1)
}

const html = `<!DOCTYPE html>
<html lang="${DEFAULT_LOCALE}">
<head>
<meta charset="utf-8">
<title>Fityesz Krónika</title>
<meta http-equiv="refresh" content="0; url=/${DEFAULT_LOCALE}/">
<link rel="canonical" href="/${DEFAULT_LOCALE}/">
<script>location.replace('/${DEFAULT_LOCALE}/' + location.search + location.hash)</script>
</head>
<body>
<p><a href="/${DEFAULT_LOCALE}/">Fityesz Krónika</a></p>
</body>
</html>
`

writeFileSync(join(OUT, 'index.html'), html, 'utf8')

const htaccess = `# Serve the Hungarian site at the domain root.
RewriteEngine On
RewriteRule ^$ /${DEFAULT_LOCALE}/ [R=302,L]

# Directory-style URLs already resolve to index.html; this only covers
# a request that lost its trailing slash.
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME}/index.html -f
RewriteRule ^(.*)$ /$1/ [R=301,L]

ErrorDocument 404 /${DEFAULT_LOCALE}/404.html

# The font is immutable; everything else revalidates.
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType font/ttf "access plus 1 year"
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
</IfModule>
`

writeFileSync(join(OUT, '.htaccess'), htaccess, 'utf8')

console.log('postexport: wrote out/index.html and out/.htaccess')
