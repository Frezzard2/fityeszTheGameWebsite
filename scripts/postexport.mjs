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
 * On until further notice: the sign-in page takes an email and a password, and
 * over plain http those cross the network in the clear. The certificate is
 * installed and https serves the whole site, so the redirect has somewhere to
 * land. Turn it off only if the certificate lapses.
 */
const FORCE_HTTPS = true

if (!existsSync(OUT)) {
  console.error('postexport: out/ not found — did `next build` run?')
  process.exit(1)
}

const httpsBlock = FORCE_HTTPS
  ? `# Force https. Requires a certificate to already be installed.
RewriteCond %{HTTPS} !=on
RewriteCond %{HTTP:X-Forwarded-Proto} !=https
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Tell browsers to remember it. Deliberately short: a browser that has cached
# this cannot be talked out of https, so raise it to 31536000 only once you are
# sure every host and subdomain you use serves https.
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=86400"
</IfModule>

`
  : `# https redirect is off. Install a certificate at your host, confirm the
# site loads over https, then set FORCE_HTTPS = true in
# scripts/postexport.mjs and rebuild.

`

/**
 * Response headers.
 *
 * The site has no server of its own, so these ride along in the .htaccess.
 * The content policy allows what the site actually loads: its own files, the
 * Supabase project that holds accounts and saves, and inline styles, which the
 * pages are built from. `frame-ancestors 'none'` is what stops the site being
 * framed; X-Frame-Options repeats it for anything too old to read CSP.
 */
const headerBlock = `# --- security headers ---------------------------------------------------
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  Header always set Content-Security-Policy "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co wss://*.supabase.co"
</IfModule>

`

const htaccess = `${httpsBlock}${headerBlock}# Serve the Hungarian site at the domain root.
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

console.log('postexport: wrote out/.htaccess')
