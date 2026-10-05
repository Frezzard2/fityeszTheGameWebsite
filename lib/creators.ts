import type { Bilingual } from '@/lib/story/types'

/**
 * Hungarian puts the family name first, English does not, so the name is
 * bilingual like everything else. The header carried its own copy of this list
 * for that reason; the legal and support pages used a single-language one and
 * printed Hungarian name order on the English site.
 */
export type Creator = { name: Bilingual; handle: string; url: string }

/** Ported from the design prototype's `static CREATORS`. */
export const CREATORS: Creator[] = [
  { name: { hu: 'Kukucska Zsombor', en: 'Zsombor Kukucska' }, handle: 'Frezzard2', url: 'https://github.com/Frezzard2' },
  { name: { hu: 'Dajka Zea', en: 'Zea Dajka' }, handle: 'djkzea', url: 'https://github.com/djkzea' },
]

export const GAME_REPO_URL = 'https://github.com/djkzea/fityeszthegame'

/**
 * Read at call time, never destructured at module load: the support page
 * must flip from "coming soon" to a live link the moment the variable is set.
 */
export function kofiUrl(): string | null {
  return process.env.NEXT_PUBLIC_KOFI_URL || null
}
