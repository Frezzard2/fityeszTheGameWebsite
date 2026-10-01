import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/constants'
import { pageMetadata } from '@/lib/seo'
import { LoreTabs, type TabPanel } from '@/components/lore/LoreTabs'
import { Reveal } from '@/components/Reveal'
import { CHARACTERS } from '@/lib/design/characters'
import codex from '@/lib/story/content/codex.json'

const SHEET_CARD = {
  background: 'var(--sheet)',
  border: 'var(--bw) solid var(--ink)',
  boxShadow: 'var(--shS)',
} as const

const LABEL = {
  font: '700 12px/1 var(--fL)',
  letterSpacing: '.14em',
  textTransform: 'uppercase',
} as const

const HEAD = {
  fontFamily: 'var(--fD)',
  fontWeight: 'var(--dW)' as never,
  textTransform: 'uppercase' as const,
  lineHeight: 1.14,
}

/** repeat(N,1fr)-style prototype grids, without the container-width JS that
 * picked N — auto-fit collapses the same way and never forces overflow. */
const GRID_3 = 'repeat(auto-fit,minmax(220px,1fr))'

/** Bossfight XP awards, transcribed from the game's own fityesz1_0.java:
 * xp += 50 / 80 / 120. Not chapter content, so not gated by the spoiler
 * rule below. */
const BOSS_XP: Record<string, number> = { lakatos: 50, peteri: 80, kapzs: 120 }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return pageMetadata({
    locale: locale as Locale,
    path: '/lexikon',
    title: t('navLore'),
    description: t('seoLoreD'),
  })
}

export default async function LorePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as Locale)
  const t = await getTranslations()
  const l = locale as Locale

  const chLabel = (n: number) => t('chapterN').replace('%n', String(n))
  const bosses = CHARACTERS.filter((c) => c.boss)

  const panels: TabPanel[] = [
    {
      id: 'party',
      label: t('tabParty'),
      content: (
        <div style={{ display: 'grid', gap: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 22, alignItems: 'start' }}>
            {/* The poster on the wall */}
            <Reveal
              kind="up"
              style={{
                background: 'var(--accent)',
                color: 'var(--onAccent)',
                border: 'var(--bw) solid var(--ink)',
                boxShadow: 'var(--sh)',
                padding: 'clamp(24px,3cqw,40px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 28,
                minHeight: 440,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'radial-gradient(circle, var(--onAccent) 1.2px, transparent 1.8px)',
                  backgroundSize: '9px 9px',
                  opacity: 0.22,
                  WebkitMaskImage: 'linear-gradient(to top,#000,transparent 70%)',
                  maskImage: 'linear-gradient(to top,#000,transparent 70%)',
                }}
              />
              <div style={{ position: 'relative', ...LABEL }}>Fityesz</div>
              <div style={{ position: 'relative', ...HEAD, fontSize: 'clamp(34px,7cqw,112px)', lineHeight: 1.04, overflowWrap: 'anywhere' }}>
                {t('slogan1')}
                <br />
                {t('slogan2')}
              </div>
              <p style={{ position: 'relative', margin: 0, fontSize: 15, lineHeight: 1.5, maxWidth: '28em' }}>
                {t('partyCaption')}
              </p>
            </Reveal>

            {/* Who runs it, and the motto */}
            <div style={{ display: 'grid', gap: 18 }}>
              <Reveal kind="up" delay={120} style={{ border: 'var(--bw) solid var(--ink)', background: 'var(--sheet)', boxShadow: 'var(--shS)', padding: 'clamp(18px,2.4cqw,28px)' }}>
                <p style={{ ...LABEL, color: 'var(--accentText)', margin: 0 }}>{t('leaderLabel')}</p>
                <p style={{ margin: '10px 0 0', ...HEAD, fontSize: 'clamp(28px,4.4cqw,52px)' }}>Kapzs Imre</p>
                <p style={{ margin: '8px 0 0', fontStyle: 'italic', color: 'var(--inkSoft)' }}>{t('leaderTitle')}</p>
              </Reveal>

              <Reveal kind="up" delay={200} style={{ border: 'var(--bw) solid var(--ink)', background: 'var(--sheet)', boxShadow: 'var(--shS)', padding: 'clamp(18px,2.4cqw,28px)' }}>
                <p style={{ ...LABEL, color: 'var(--accentText)', margin: 0 }}>{t('mottoLabel')}</p>
                <p style={{ margin: '10px 0 0', ...HEAD, fontSize: 'clamp(22px,3.2cqw,38px)' }}>{t('q2')}</p>
              </Reveal>

              <Reveal kind="fade" delay={280} as="blockquote" style={{ margin: 0 }}>
                <p style={{ margin: 0, fontStyle: 'italic', fontSize: 'clamp(15px,1.6cqw,19px)', lineHeight: 1.5 }}>
                  {t('familyQuote')}
                </p>
                <footer style={{ ...LABEL, marginTop: 8 }}>{t('familyBy')}</footer>
              </Reveal>
            </div>
          </div>

          {/* The four rules, as a full-width band */}
          <Reveal kind="up" delay={200} style={{ background: 'var(--ink)', color: 'var(--onInk)', border: 'var(--bw) solid var(--ink)', padding: 'clamp(20px,3cqw,36px)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px 20px' }}>
              <h3 style={{ margin: 0, ...HEAD, fontSize: 'clamp(26px,4cqw,46px)' }}>{t('rulesLabel')}</h3>
              <span style={{ ...LABEL, opacity: 0.75 }}>{t('rulesBy')}</span>
            </div>
            <ol style={{ listStyle: 'none', margin: '22px 0 0', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 }}>
              {[t('rule1'), t('rule2'), t('rule3'), t('rule4')].map((rule, n) => (
                <li key={rule} style={{ borderTop: '2px solid var(--accent)', paddingTop: 12 }}>
                  <span style={{ display: 'block', ...HEAD, fontSize: 38, color: 'var(--accent)' }}>{n + 1}</span>
                  <span style={{ display: 'block', marginTop: 6, ...HEAD, fontSize: 'clamp(15px,1.7cqw,20px)' }}>{rule}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      ),
    },
    {
      id: 'chapters',
      label: t('tabChapters'),
      content: (
        <div>
          {/* No rule of its own: the tab strip already closes with one, and a
              second heavy line 36px below it read as a mistake. */}
          {codex.chapters.map((c, i) => (
            <Reveal
              key={c.number}
              kind="up"
              delay={i * 60}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px 32px',
                padding: '24px 0',
                borderBottom: '1px solid var(--line)',
                // Not baseline: against a 48px title the 13px number and the
                // badge hang off its foot with a hand's width of air above.
                alignItems: 'center',
              }}
            >
              <div style={{ ...LABEL, flex: '0 0 150px', fontSize: 13, lineHeight: 1.2, color: 'var(--accentText)' }}>
                {chLabel(c.number)}
              </div>
              <div style={{ flex: '1 1 420px', minWidth: 0 }}>
                <div style={{ ...HEAD, fontSize: 'clamp(30px,3.6cqw,48px)' }}>{c.free ? c.title[l] : t('censored')}</div>
                {c.free && (
                  <div style={{ marginTop: 8, fontSize: 16, fontStyle: 'italic', color: 'var(--inkSoft)' }}>
                    &bdquo;{c.quote[l]}&rdquo;
                  </div>
                )}
              </div>
              <div
                style={{
                  flex: '0 0 auto',
                  font: '700 11px/1 var(--fL)',
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  padding: '6px 8px',
                  border: '1px solid var(--ink)',
                  background: c.free ? 'var(--accent)' : 'transparent',
                  color: c.free ? 'var(--onAccent)' : 'var(--ink)',
                }}
              >
                {c.free ? t('inBrowser') : t('inGame')}
              </div>
            </Reveal>
          ))}
        </div>
      ),
    },
    {
      id: 'places',
      label: t('tabPlaces'),
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap: 24 }}>
          {codex.chapters.map((c, i) => (
            <Reveal
              key={c.number}
              kind="up"
              delay={i * 70}
              style={{ ...SHEET_CARD, padding: 22, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 210 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, ...LABEL, fontSize: 12, color: 'var(--inkSoft)' }}>
                <span>{c.free ? chLabel(c.number) : '??'}</span>
                <span>{t('placeWord')}</span>
              </div>
              {c.free ? (
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{c.place[l]}</p>
              ) : (
                <>
                  <div style={{ height: 30, width: '80%', background: 'var(--ink)' }} />
                  <Reveal kind="bar" delay={150} style={{ height: 14, width: '95%', background: 'var(--ink)' }}>
                    {null}
                  </Reveal>
                  <Reveal kind="bar" delay={300} style={{ height: 14, width: '62%', background: 'var(--ink)' }}>
                    {null}
                  </Reveal>
                  <Reveal
                    kind="stamp"
                    delay={450}
                    style={{
                      marginTop: 'auto',
                      alignSelf: 'flex-start',
                      transform: 'rotate(-4deg)',
                      border: '2px solid var(--accentText)',
                      color: 'var(--accentText)',
                      padding: '5px 8px 3px',
                      fontFamily: 'var(--fD)',
                      fontSize: 18,
                      textTransform: 'uppercase',
                      lineHeight: 1.14,
                    }}
                  >
                    {t('censored')}
                  </Reveal>
                </>
              )}
            </Reveal>
          ))}
        </div>
      ),
    },
    {
      id: 'items',
      label: t('tabItems'),
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap: 24 }}>
          {codex.items.map((it, i) => (
            <Reveal
              key={it.id}
              kind="up"
              delay={i * 70}
              style={{ ...SHEET_CARD, padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', ...LABEL, fontSize: 12, color: 'var(--inkSoft)' }}>
                <span>{t('notFound')}</span>
              </div>
              <div style={{ ...HEAD, fontSize: 30 }}>{it.name[l]}</div>
            </Reveal>
          ))}
        </div>
      ),
    },
    {
      id: 'rules',
      label: t('tabRules'),
      content: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: GRID_3, gap: 24 }}>
            {[
              { title: 'XP', d: t('xpD') },
              { title: t('exposure'), d: t('expD') },
              { title: t('rankT'), d: t('rankD') },
            ].map((r, i) => (
              <Reveal key={r.title} kind="up" delay={i * 110} style={{ ...SHEET_CARD, padding: 24 }}>
                <div style={{ ...HEAD, fontSize: 34 }}>{r.title}</div>
                <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.55 }}>{r.d}</p>
              </Reveal>
            ))}
          </div>

          <Reveal kind="rise" as="h3" style={{ ...HEAD, margin: '52px 0 12px', fontSize: 'clamp(36px,4.4cqw,60px)' }}>
            {t('bossT')}
          </Reveal>
          <p style={{ margin: '0 0 24px', fontSize: 16, maxWidth: '40em' }}>{t('bossD')}</p>

          <div style={{ borderTop: 'var(--bw) solid var(--ink)' }}>
            {/* Character identities are public marketing material — the same
                facts already shown on /szereplok — so unlike the Chapters
                and Places tabs, nothing here is gated on chapter.free. Only
                chapter *content* (titles, quotes, locations) is spoiler-shy. */}
            {bosses.map((b, i) => (
              <Reveal
                key={b.id}
                kind="up"
                delay={i * 100}
                style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 32px', padding: '22px 0', borderBottom: '1px solid var(--line)' }}
              >
                <div style={{ flex: '0 0 230px' }}>
                  <div style={{ ...LABEL, fontSize: 12, color: 'var(--accentText)' }}>{chLabel(b.chapter)}</div>
                  <div style={{ ...HEAD, marginTop: 8, fontSize: 32 }}>{b.name[l]}</div>
                  <div style={{ marginTop: 6, fontSize: 14, fontStyle: 'italic', color: 'var(--inkSoft)' }}>{b.title[l]}</div>
                </div>
                <div style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 16, lineHeight: 1.5, fontStyle: 'italic' }}>&bdquo;{b.quote[l]}&rdquo;</div>
                  {BOSS_XP[b.id] !== undefined && (
                    <div style={{ ...LABEL, fontSize: 12, color: 'var(--accent)' }}>{BOSS_XP[b.id]} XP</div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      ),
    },
  ]

  return (
    <section style={{ borderBottom: 'var(--bw) solid var(--ink)' }}>
      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: 'clamp(40px,6cqw,88px) clamp(16px,3cqw,40px) clamp(56px,7cqw,104px)',
        }}
      >
        <div style={{ font: '700 13px/1.3 var(--fL)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accentText)' }}>
          {t('loreKicker')}
        </div>
        <Reveal kind="rise" as="h1" style={{ ...HEAD, margin: '12px 0 0', fontSize: 'clamp(56px,9cqw,140px)', lineHeight: 0.98 }}>
          {t('navLore')}
        </Reveal>
        <p style={{ margin: '18px 0 0', maxWidth: '34em', fontSize: 'clamp(17px,1.5cqw,20px)', lineHeight: 1.5 }}>
          {t('loreSub')}
        </p>

        <LoreTabs panels={panels} ariaLabel={t('navLore')} />
      </div>
    </section>
  )
}
