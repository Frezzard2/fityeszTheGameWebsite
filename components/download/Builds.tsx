'use client'

import { useEffect, useState } from 'react'
import { Reveal } from '@/components/Reveal'

export type BuildLabels = Record<
  | 'dlKicker' | 'dlVersion' | 'dlBtn' | 'dlWin' | 'dlMacArm' | 'dlMacIntel' | 'dlLinux'
  | 'dlYours' | 'dlAll' | 'dlUnsignedT' | 'dlUnsigned',
  string
>

/** Asked at page load, so a new release needs no redeploy of this site. */
const LATEST = 'https://api.github.com/repos/djkzea/fityeszthegame/releases/latest'

/** Where every file lives, and what the buttons fall back to. */
export const RELEASE_PAGE = 'https://github.com/djkzea/fityeszthegame/releases/latest'

type Asset = { name: string; size: number }

/**
 * The four builds.
 *
 * The links are fixed on purpose. GitHub serves the newest release's file at
 * /releases/latest/download/<name>, so as long as the name does not change the
 * link never goes stale - and a click downloads rather than asking a browser
 * to go and look something up. That matters more than it sounds: this site's
 * own content policy does not let the page talk to api.github.com, so a page
 * built on that call handed every visitor a trip to GitHub instead of a file.
 * The size is the only thing worth asking for, and nothing breaks without it.
 */
const BUILDS = [
  { id: 'win', os: 'Windows', note: 'dlWin', file: 'Fityesz-Kronika-Windows.msi' },
  { id: 'mac-arm', os: 'macOS', note: 'dlMacArm', file: 'Fityesz-Kronika-macOS-AppleSilicon.dmg' },
  { id: 'mac-intel', os: 'macOS', note: 'dlMacIntel', file: 'Fityesz-Kronika-macOS-Intel.dmg' },
  { id: 'linux', os: 'Linux', note: 'dlLinux', file: 'fityesz-kronika-linux-amd64.deb' },
] as const

export const downloadOf = (file: string) =>
  `https://github.com/djkzea/fityeszthegame/releases/latest/download/${file}`

/** Which card to mark as the visitor's. A Mac cannot be asked which chip it has. */
export function guessOs(agent: string): 'Windows' | 'macOS' | 'Linux' | null {
  if (/windows/i.test(agent)) return 'Windows'
  if (/mac os x|macintosh/i.test(agent)) return 'macOS'
  if (/linux|x11/i.test(agent) && !/android/i.test(agent)) return 'Linux'
  return null
}

export function assetFor(id: string, assets: Asset[]): Asset | undefined {
  const build = BUILDS.find((b) => b.id === id)
  return build && assets.find((a) => a.name === build.file)
}

const megabytes = (bytes: number) => `${Math.round(bytes / 1048576)} MB`

export function Builds({ labels: t }: { labels: BuildLabels }) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [version, setVersion] = useState('')
  const [mine, setMine] = useState<string | null>(null)

  useEffect(() => {
    setMine(guessOs(navigator.userAgent))

    let live = true

    fetch(LATEST, { headers: { Accept: 'application/vnd.github+json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((release: { tag_name?: string; assets?: Asset[] }) => {
        if (!live) return
        setAssets(release.assets ?? [])
        setVersion((release.tag_name ?? '').replace(/^v/, ''))
      })
      // No release, no network, a rate limit: the page still works, it just
      // sends people to the page that holds every file.
      .catch(() => undefined)

    return () => {
      live = false
    }
  }, [])

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))',
          gap: 24,
          marginTop: 32,
        }}
      >
        {BUILDS.map((build, n) => {
          const asset = assets.find((a) => a.name === build.file)
          const yours = mine === build.os

          return (
            <Reveal
              key={build.id}
              kind="lift"
              delay={n * 90}
              style={{
                background: 'var(--sheet)',
                border: `var(--bw) solid ${yours ? 'var(--accent)' : 'var(--ink)'}`,
                boxShadow: 'var(--shS)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                minHeight: 240,
              }}
            >
              <div
                style={{
                  font: '700 12px/1 var(--fL)',
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  color: yours ? 'var(--accentText)' : 'var(--inkSoft)',
                }}
              >
                {yours ? t.dlYours : version ? `${t.dlVersion} ${version}` : t.dlKicker}
              </div>

              <div
                style={{
                  fontFamily: 'var(--fD)',
                  fontWeight: 'var(--dW)' as unknown as number,
                  textTransform: 'uppercase',
                  fontSize: 'clamp(30px,3.4cqw,48px)',
                  lineHeight: 1.14,
                }}
              >
                {build.os}
              </div>

              <div style={{ fontSize: 15, color: 'var(--inkSoft)' }}>
                {t[build.note]}
                {asset ? ` · ${megabytes(asset.size)}` : ''}
              </div>

              <a
                href={downloadOf(build.file)}
                style={{
                  marginTop: 'auto',
                  padding: '14px 18px 13px',
                  background: yours ? 'var(--ink)' : 'transparent',
                  color: yours ? 'var(--onInk)' : 'var(--ink)',
                  border: 'var(--bw) solid var(--ink)',
                  fontFamily: 'var(--fD)',
                  fontWeight: 'var(--dW)' as unknown as number,
                  fontSize: 20,
                  lineHeight: 1.14,
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                {t.dlBtn}
              </a>
            </Reveal>
          )
        })}
      </div>

      <p style={{ margin: '18px 0 0', fontSize: 14, color: 'var(--inkSoft)' }}>
        <a href={RELEASE_PAGE} style={{ color: 'var(--accentText)' }}>
          {t.dlAll}
        </a>
      </p>

      <div
        style={{
          marginTop: 26,
          background: 'var(--ink)',
          color: 'var(--onInk)',
          border: 'var(--bw) solid var(--ink)',
          padding: 'clamp(18px,2.4cqw,26px)',
          maxWidth: '46em',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--fD)',
            fontWeight: 'var(--dW)' as unknown as number,
            textTransform: 'uppercase',
            fontSize: 26,
            lineHeight: 1.14,
          }}
        >
          {t.dlUnsignedT}
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.5, opacity: 0.88 }}>{t.dlUnsigned}</p>
      </div>
    </>
  )
}
