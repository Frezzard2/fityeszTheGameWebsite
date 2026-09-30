import type { CharacterId } from '@/lib/story/types'

/**
 * Where the drawn art lives once `scripts/art.mjs` has run.
 *
 * The lists mirror that script: whoever is missing here has no master in
 * `fityesz_art/`, and the pages fall back to the initials they used before.
 */
const DRAWN: CharacterId[] = ['lipoti', 'lakatos', 'kapzs', 'peteri', 'molnar']

/** The calm portrait, for the roster. */
export function castArt(id: CharacterId): string | null {
  return DRAWN.includes(id) ? `/art/cast/${id}.webp` : null
}

/**
 * The two poses for the play screen, calm first and talking second.
 *
 * Both ship so the stage can cross-fade between them rather than hold one
 * still frame through a whole conversation.
 */
export function stageArt(id: CharacterId): readonly [string, string] | null {
  return DRAWN.includes(id) ? [`/art/stage/${id}-1.webp`, `/art/stage/${id}-2.webp`] : null
}

/** The full-body cutout, for the landing page line-up. */
export function lineupArt(id: CharacterId): string | null {
  return DRAWN.includes(id) ? `/art/line/${id}.webp` : null
}

/** The room a chapter plays out in. Only chapter one is playable on the web. */
export function chapterBackdrop(chapter: number): string | null {
  return chapter === 1 ? '/art/bg/ch1.webp' : null
}
