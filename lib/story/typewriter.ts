/** What the typewriter has revealed so far, and of which line. */
export type Revealed = { src: string; count: number }

/**
 * How much of `text` may be shown.
 *
 * A count is only ever valid for the line it was counted against. Applying the
 * previous line's count to a new one is what used to flash a whole sentence on
 * screen for a frame before it collapsed to nothing and typed itself out: state
 * lags a render behind the text, so for that one frame the component sliced the
 * new line with the old line's count.
 *
 * A new line has therefore revealed nothing — or, with typing switched off,
 * everything.
 */
export function revealedCount(revealed: Revealed, text: string, typing: boolean): number {
  if (revealed.src !== text) return typing ? 0 : text.length
  return Math.min(revealed.count, text.length)
}
