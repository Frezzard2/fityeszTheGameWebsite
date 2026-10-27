import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Builds, assetFor, guessOs, RELEASE_PAGE, type BuildLabels } from '@/components/download/Builds'

const labels = {
  dlKicker: 'Verzió 1.0', dlVersion: 'Verzió', dlBtn: 'Letöltés', dlWin: 'Telepítő (.msi)',
  dlMacArm: 'Apple Silicon', dlMacIntel: 'Intel', dlLinux: 'Csomag (.deb)',
  dlYours: 'Ez kell neked', dlAll: 'Minden fájl', dlFallback: 'A kiadási oldalra visznek.',
  dlUnsignedT: 'Rákérdez', dlUnsigned: 'Nincs aláírva.',
} satisfies BuildLabels

const release = {
  tag_name: 'v1.1.0',
  assets: [
    { name: 'fityesz-kronika_1.1.0_amd64.deb', browser_download_url: 'https://x/deb', size: 105 * 1048576 },
    { name: 'Fityesz.Kronika-1.1.0-arm64.dmg', browser_download_url: 'https://x/arm', size: 113 * 1048576 },
    { name: 'Fityesz.Kronika-1.1.0-x86_64.dmg', browser_download_url: 'https://x/intel', size: 116 * 1048576 },
    { name: 'Fityesz.Kronika-1.1.0.msi', browser_download_url: 'https://x/msi', size: 112 * 1048576 },
  ],
}

afterEach(() => vi.unstubAllGlobals())

describe('which file is which', () => {
  it('tells the two Macs apart', () => {
    expect(assetFor('mac-arm', release.assets)?.browser_download_url).toBe('https://x/arm')
    expect(assetFor('mac-intel', release.assets)?.browser_download_url).toBe('https://x/intel')
  })

  it('finds Windows and Linux', () => {
    expect(assetFor('win', release.assets)?.browser_download_url).toBe('https://x/msi')
    expect(assetFor('linux', release.assets)?.browser_download_url).toBe('https://x/deb')
  })

  /** The version is in every filename, so nothing may be matched by one. */
  it('matches by shape, not by version', () => {
    const next = release.assets.map((a) => ({ ...a, name: a.name.replace('1.1.0', '2.4.7') }))
    expect(assetFor('win', next)?.browser_download_url).toBe('https://x/msi')
    expect(assetFor('mac-arm', next)?.browser_download_url).toBe('https://x/arm')
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
  it('hands out the four files the release holds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => release }))

    render(<Builds labels={labels} />)

    await waitFor(() => {
      const links = screen.getAllByText('Letöltés').map((n) => n.getAttribute('href'))
      expect(links).toEqual(['https://x/msi', 'https://x/arm', 'https://x/intel', 'https://x/deb'])
    })
  })

  /**
   * The quiet half: a rate limit or no network must still leave a way to the
   * game, rather than four buttons that go nowhere.
   */
  it('falls back to the release page when it cannot ask', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    render(<Builds labels={labels} />)

    await waitFor(() => {
      const links = screen.getAllByText('Letöltés').map((n) => n.getAttribute('href'))
      expect(links).toEqual([RELEASE_PAGE, RELEASE_PAGE, RELEASE_PAGE, RELEASE_PAGE])
    })

    expect(screen.getByText(/kiadási oldalra visznek/)).toBeTruthy()
  })
})
