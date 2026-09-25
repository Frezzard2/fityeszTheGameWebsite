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

/**
 * Redirect http:// to https:// in the generated .htaccess.
 *
 * Leave this false until the host has actually issued a certificate — turning
 * it on first sends every visitor to an https:// URL that cannot be served,
 * which looks exactly like the site going down.
 */
const FORCE_HTTPS = false

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

const httpsBlock = FORCE_HTTPS
  ? `# Force https. Requires a certificate to already be installed.
RewriteCond %{HTTPS} !=on
RewriteCond %{HTTP:X-Forwarded-Proto} !=https
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Tell browsers to remember it. Start at 300s; raise to 31536000 once you are
# certain https works everywhere, because this is hard to undo in a browser
# that has already cached it.
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=300"
</IfModule>

`
  : `# https redirect is off. Install a certificate at your host, confirm the
# site loads over https, then set FORCE_HTTPS = true in
# scripts/postexport.mjs and rebuild.

`

const htaccess = `${httpsBlock}# Serve the Hungarian site at the domain root.
#
# The target is relative on purpose, so this works whether the site sits at
# the document root or inside a subdirectory.
RewriteEngine On
RewriteRule ^$ ${DEFAULT_LOCALE}/ [R=302,L]

# Apache's mod_dir (DirectorySlash) already redirects /hu -> /hu/ on its own.
# Do NOT add a trailing-slash rule here: one that ignores whether the URI
# already ends in "/" appends another on every pass and loops forever.

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
