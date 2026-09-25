import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const css = readFileSync('lib/design/motion.css', 'utf8')

/** Names ported from the design prototype; the site's motion vocabulary. */
const KEYFRAMES = [
  'fzIn', 'fzFade', 'fzSlam', 'fzStampIn', 'fzTab',
  'fzCaret', 'fzMarquee', 'fzDrift', 'fzWord', 'fzPulse',
]

describe('motion', () => {
  it.each(KEYFRAMES)('defines the %s keyframes from the prototype', (name) => {
    expect(css).toContain(`@keyframes ${name}`)
  })

  it('switches every animation off under prefers-reduced-motion', () => {
    const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(block, 'no reduced-motion block found').not.toBe('')

    // Every class that animates or transitions must appear in the block.
    const animated = [...css.matchAll(/^\.(fz-[a-z0-9]+)\s*\{/gm)]
      .map((m) => m[1])
      .filter((c) => !/^fz-d\d$/.test(c)) // delay-only utilities carry no motion

    for (const cls of animated) {
      expect(block, `.${cls} is not disabled under reduced motion`).toContain(`.${cls}`)
    }
  })

  it('keeps the halftone drift slow enough to read as texture, not a glitch', () => {
    const m = css.match(/\.fz-drift\s*\{\s*animation:\s*fzDrift\s+(\d+)s/)
    expect(m, 'fz-drift duration not found').not.toBeNull()
    expect(Number(m![1])).toBeGreaterThanOrEqual(20)
  })
})
