import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import hu from '@/messages/hu.json'
import type { DashLabels } from '@/components/dash/DashboardClient'

/**
 * The dashboard reading a run saved by the desktop game.
 *
 * Three things went wrong here in turn, and all three are checked below: the
 * progress bar stopped at chapter two, only slot 1 was ever read, and the
 * choices came out blank because this site's story data ends with chapter one.
 */

const row = {
  slot: 2,
  player_name: 'Zsomi',
  xp: 240,
  lebukas: 30,
  szint: 2,
  items: ['envelope1'],
  history: [
    { choicePointId: 'ch1.q1', optionIndex: 0 },
    { choicePointId: 'ch4.q', optionIndex: 1 },
  ],
  updated_at: '2026-10-19T06:36:28.332294+00:00',
  chapter: 7,
  scene: 'boss3Defeated',
  log: [
    { kind: 'line', speaker: 'LIPÓTI DEZSŐ', text: 'Jó napot.', xp: null, lebukas: null, chapter: 1 },
    { kind: 'choice', speaker: 'Mit válaszolsz?', text: 'Engem csak a pénz érdekel', xp: 15, lebukas: 10, chapter: 1 },
    { kind: 'choice', speaker: 'Hogyan reagálsz?', text: 'Hol az én borítékom?', xp: 25, lebukas: 5, chapter: 4 },
  ],
}

const session = { user: { id: 'u-1', user_metadata: { display_name: 'Zsomi' } } }

vi.mock('@/lib/supabase', () => ({
  isAuthConfigured: () => true,
  supabase: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve(),
    },
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: [row] }),
        }),
      }),
    }),
  }),
}))

const { DashboardClient } = await import('@/components/dash/DashboardClient')

const labels = hu as unknown as DashLabels

function dashboard() {
  return render(
    <DashboardClient
      labels={labels}
      locale="hu"
      playHref="/hu/jatek"
      authHref="/hu/belepes"
      downloadHref="/hu/letoltes"
      scenes={[]}
    />,
  )
}

describe('a dashboard a desktopról mentett futást mutatja', () => {
  beforeEach(() => vi.clearAllMocks())

  it('a haladás a valódi fejezetet mutatja, nem áll meg kettőnél', async () => {
    dashboard()
    expect(await screen.findByText('7/8')).toBeTruthy()
  })

  it('a legutóbb játszott mentést veszi, nem fixen az elsőt', async () => {
    dashboard()
    expect(await screen.findByText(/2\. mentés/)).toBeTruthy()
  })

  it('a fejezetet névvel nevezi meg', async () => {
    dashboard()
    expect(await screen.findByText(/7\. fejezet: Az Elnökség Trónján/)).toBeTruthy()
  })

  it('a döntések szövege a mentés naplójából jön, a hetedik fejezetig', async () => {
    dashboard()
    expect(await screen.findByText('Engem csak a pénz érdekel')).toBeTruthy()
    expect(await screen.findByText('Hol az én borítékom?')).toBeTruthy()
    expect(await screen.findByText('4. fejezet')).toBeTruthy()
  })
})
