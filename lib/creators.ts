export type Creator = { name: string; handle: string; url: string }

/** Ported from the design prototype's `static CREATORS`. */
export const CREATORS: Creator[] = [
  { name: 'Kukucska Zsombor', handle: 'Frezzard2', url: 'https://github.com/Frezzard2' },
  { name: 'Dajka Zea', handle: 'djkzea', url: 'https://github.com/djkzea' },
]

export const GAME_REPO_URL = 'https://github.com/djkzea/fityeszthegame'

/**
 * Read at call time, never destructured at module load: the support page
 * must flip from "coming soon" to a live link the moment the variable is set.
 */
export function kofiUrl(): string | null {
  return process.env.NEXT_PUBLIC_KOFI_URL || null
}
