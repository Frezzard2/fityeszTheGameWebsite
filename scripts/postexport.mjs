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
# The target must be a full URL. A relative one — plain \`${DEFAULT_LOCALE}/\` — looks tidier and
# was used here at first, but an external redirect has to turn it into an
# absolute URL, and with no RewriteBase set Apache builds that from the
# FILESYSTEM path. On the live host that produced
#   https://fityeszthegame.com/ -> http://fityeszthegame.com/web/serwerNNNNN/.../hu/
# which is a 404, and leaks the server's directory layout on the way.
#
# Naming the scheme explicitly also keeps the hop on https: the host hands
# Apache something that makes it write http:// into Location headers of its
# own accord.
RewriteEngine On

# One host, not two. www and the bare domain both answer, so without this the
# same page exists at two addresses: search engines split their signals between
# them, and a Search Console property registered for one host rejects a sitemap
# listing the other. %1 is the captured domain, so this lands on the apex in a
# single hop, over https.
RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

# A browser asking for English first gets the English site; everyone else gets
# Hungarian, which is the site's own language. \`\\b\` so this matches en, en-GB
# and "en;q=0.9" but not a tag that merely starts with those letters. Only the
# FIRST language counts: someone whose browser prefers Hungarian and lists
# English second is a Hungarian speaker.
RewriteCond %{HTTP:Accept-Language} ^en\\b [NC]
RewriteRule ^$ https://%{HTTP_HOST}/en/ [R=302,L]

RewriteRule ^$ https://%{HTTP_HOST}/${DEFAULT_LOCALE}/ [R=302,L]

# Add the trailing slash ourselves. mod_dir does it unprompted, but it writes
# http:// into the Location, so an https visitor asking for /hu is sent out to
# plain http and only then bounced back — two extra hops, one of them in the
# clear, on a site with a login form.
#
# The guards are what make this safe. An earlier version of this file carried a
# rule with none, which appended a slash on every pass and looped until the
# browser gave up. -d fires only for a real directory, and !/$ only when the
# slash is not already there, so the redirected URL cannot match again.
RewriteCond %{REQUEST_FILENAME} -d
RewriteCond %{REQUEST_URI} !/$
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1/ [R=301,L]

ErrorDocument 404 /${DEFAULT_LOCALE}/404.html

# --- caching -------------------------------------------------------------
#
# HTML must revalidate on every visit. Without a Cache-Control header Apache
# leaves it to the browser's heuristic — roughly a tenth of the file's age —
# so a page could be served from cache for hours after an upload. The page
# names the hashed bundle it loads, so a stale page means stale code, and a
# fix that is live on the server still does not reach anyone looking at it.
<FilesMatch "\\.(html)$">
  <IfModule mod_headers.c>
    Header always set Cache-Control "no-cache"
  </IfModule>
</FilesMatch>

# The root redirect reads Accept-Language, so a cache in front of the site must
# key on it too, or the first visitor's language decides everyone else's.
<IfModule mod_headers.c>
  Header always set Vary "Accept-Language" "expr=%{REQUEST_URI} =~ m#^/$#"
</IfModule>

# Everything under _next/static carries a content hash in its filename, so a
# changed file is a different URL and this can be cached hard and forever.
<FilesMatch "\\.(js|css|woff2)$">
  <IfModule mod_headers.c>
    Header always set Cache-Control "public, max-age=31536000, immutable"
  </IfModule>
</FilesMatch>

# Artwork keeps stable names, so it revalidates after a day rather than being
# pinned for a year — replacing a sprite should not need a new filename.
<FilesMatch "\\.(webp|png|jpg|svg|ico)$">
  <IfModule mod_headers.c>
    Header always set Cache-Control "public, max-age=86400"
  </IfModule>
</FilesMatch>
`

writeFileSync(join(OUT, '.htaccess'), htaccess, 'utf8')

console.log('postexport: wrote out/.htaccess')
