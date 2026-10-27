import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Builds, assetFor, downloadOf, guessOs, type BuildLabels } from '@/components/download/Builds'

const labels = {
  dlKicker: 'Verzió 1.0', dlVersion: 'Verzió', dlBtn: 'Letöltés', dlWin: 'Telepítő (.msi)',
  dlMacArm: 'Apple Silicon', dlMacIntel: 'Intel', dlLinux: 'Csomag (.deb)',
  dlYours: 'Ez kell neked', dlAll: 'Minden fájl',
  dlUnsignedT: 'Rákérdez', dlUnsigned: 'Nincs aláírva.',
} satisfies BuildLabels

const release = {
  tag_name: 'v1.1.0',
  assets: [
    { name: 'fityesz-kronika-linux-amd64.deb', size: 105 * 1048576 },
    { name: 'Fityesz-Kronika-macOS-AppleSilicon.dmg', size: 113 * 1048576 },
    { name: 'Fityesz-Kronika-macOS-Intel.dmg', size: 116 * 1048576 },
    { name: 'Fityesz-Kronika-Windows.msi', size: 112 * 1048576 },
  ],
}

/** What a click has to go to, whatever the page managed to look up. */
const LINKS = [
  'https://github.com/djkzea/fityeszthegame/releases/latest/download/Fityesz-Kronika-Windows.msi',
  'https://github.com/djkzea/fityeszthegame/releases/latest/download/Fityesz-Kronika-macOS-AppleSilicon.dmg',
  'https://github.com/djkzea/fityeszthegame/releases/latest/download/Fityesz-Kronika-macOS-Intel.dmg',
  'https://github.com/djkzea/fityeszthegame/releases/latest/download/fityesz-kronika-linux-amd64.deb',
]

afterEach(() => vi.unstubAllGlobals())

describe('which file is which', () => {
  it('finds each build\'s size by the name it is uploaded under', () => {
    expect(assetFor('mac-arm', release.assets)?.size).toBe(113 * 1048576)
    expect(assetFor('mac-intel', release.assets)?.size).toBe(116 * 1048576)
    expect(assetFor('win', release.assets)?.size).toBe(112 * 1048576)
    expect(assetFor('linux', release.assets)?.size).toBe(105 * 1048576)
  })

  /**
   * The whole point of the fixed names: this URL is what GitHub serves the
   * newest release from, and it only keeps working while the name does not
   * carry a version.
   */
  it('builds the link that always points at the newest release', () => {
    expect(downloadOf('Fityesz-Kronika-Windows.msi')).toBe(LINKS[0])
    expect(downloadOf('Fityesz-Kronika-Windows.msi')).not.toContain('1.0.0')
  })
})

describe('whose machine is this', () => {
  it('reads the usual agents', () => {
    expect(guessOs('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('Windows')
    expect(guessOs('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('macOS')
    expect(guessOs('Mozilla/5.0 (X11; Linux x86_64)')).toBe('Linux')
  })

  /** A phone is none of the three, and must not be told it is Linux. */
  it('says nothing about a phone', () => {
    expect(guessOs('Mozilla/5.0 (Linux; Android 14; Pixel 8)')).toBeNull()
    expect(guessOs('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('macOS')
  })
})

describe('the page', () => {
  it('hands out the four files', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => release }))

    render(<Builds labels={labels} />)

    await waitFor(() => {
      expect(screen.getByText(/112 MB/)).toBeTruthy()
    })

    expect(screen.getAllByText('Letöltés').map((n) => n.getAttribute('href'))).toEqual(LINKS)
  })

  /**
   * The one that was actually broken in the wild: this site's content policy
   * blocked the lookup, and every button became a trip to GitHub. The links
   * are fixed now, so a blocked or rate-limited lookup costs a file size and
   * nothing else.
   */
  it('still downloads when it cannot look anything up', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('blocked by CSP')))

    render(<Builds labels={labels} />)

    await waitFor(() => {
      expect(screen.getAllByText('Letöltés')).toHaveLength(4)
    })

    expect(screen.getAllByText('Letöltés').map((n) => n.getAttribute('href'))).toEqual(LINKS)
  })
})
