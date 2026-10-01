/**
 * Turns the source art into what the site ships.
 *
 * `fityesz_art/` holds 34MB of PNG masters, which no FTP-hosted static site
 * should serve. This writes the only three shapes the site actually renders:
 * a roster portrait, a stage sprite and a chapter background. Run it again
 * after adding art — it overwrites, and nothing else reads the masters.
 *
 * Only the masters this script reads are kept locally. The full set, including
 * the backgrounds for chapters two to seven, is committed in the game repo
 * (djkzea/fityeszthegame, fityesz_art/) — copy one back before adding it below.
 *
 *   node scripts/art.mjs
 */
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const SRC = 'fityesz_art'
const OUT = 'public/art'

/** Story id → the master's basename. `you` and `unknown` have no art. */
const CAST = {
  lipoti: 'lipoti',
  lakatos: 'lakatoservin',
  kapzs: 'kapzsimre',
  peteri: 'drpeterikatalin',
  molnar: 'molnar',
}

/** Chapter number → background master. Only chapter 1 is playable on the web. */
const BACKDROPS = { 1: 'ch1_cafe' }

/**
 * Story id → full-body master, for the landing page line-up.
 *
 * These masters are drawn on white rather than transparency, so the white has
 * to come off before they can stand on the page.
 */
const LINEUP = {
  molnar: 'molnar_fullbody',
  lakatos: 'lakatoservin_fullbody',
  kapzs: 'kapzsimre_fullbody',
  lipoti: 'lipoti_fullbody',
  peteri: 'drpeterikatalin_fullbody',
}

/** Anything brighter than this in every channel counts as the backdrop. */
const WHITE = 228

/**
 * The link preview card. Social sites and search engines want 1200x630; the
 * cover is drawn 1200x400, so it is padded to height with its own background —
 * which is the --paper token exactly, so the seam does not show.
 */
const OG = { width: 1200, height: 630, paper: { r: 244, g: 239, b: 230, alpha: 1 } }

/**
 * Clears the white *around* the figure.
 *
 * A plain colour key would punch holes in shirts and pocket squares, which are
 * just as white. Flooding inward from the border only reaches white the figure
 * does not enclose.
 */
async function cutout(from) {
  const { data, info } = await sharp(from).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const seen = new Uint8Array(width * height)
  const stack = []

  const isBackdrop = (n) => {
    const at = n * channels
    return data[at] >= WHITE && data[at + 1] >= WHITE && data[at + 2] >= WHITE
  }
  const push = (n) => {
    if (!seen[n] && isBackdrop(n)) {
      seen[n] = 1
      stack.push(n)
    }
  }

  for (let x = 0; x < width; x++) {
    push(x)
    push((height - 1) * width + x)
  }
  for (let y = 0; y < height; y++) {
    push(y * width)
    push(y * width + width - 1)
  }

  while (stack.length > 0) {
    const n = stack.pop()
    data[n * channels + 3] = 0
    const x = n % width
    if (x > 0) push(n - 1)
    if (x < width - 1) push(n + 1)
    if (n >= width) push(n - width)
    if (n < width * (height - 1)) push(n + width)
  }

  return sharp(data, { raw: { width, height, channels } })
}

async function main() {
  await mkdir(join(OUT, 'cast'), { recursive: true })
  await mkdir(join(OUT, 'stage'), { recursive: true })
  await mkdir(join(OUT, 'bg'), { recursive: true })
  await mkdir(join(OUT, 'line'), { recursive: true })

  for (const [id, file] of Object.entries(CAST)) {
    // The calm pose introduces the character on the roster card.
    await sharp(join(SRC, 'characters', `${file}.png`))
      .resize({ width: 560, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(join(OUT, 'cast', `${id}.webp`))

    // The play screen gets BOTH poses at stage size and cross-fades between
    // them as the character speaks, so a talking figure is not a still image.
    for (const [n, master] of [`${file}.png`, `${file}2.png`].entries()) {
      await sharp(join(SRC, 'characters', master))
        .resize({ height: 1000, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(join(OUT, 'stage', `${id}-${n + 1}.webp`))
    }
  }

  for (const [id, file] of Object.entries(LINEUP)) {
    const figure = await cutout(join(SRC, 'characters', `${file}.png`))
    await figure
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 0 })
      .webp({ quality: 82, alphaQuality: 90 })
      .toFile(join(OUT, 'line', `${id}.webp`))
  }

  const cover = join(SRC, 'CoverImageFityesz.png')
  if (existsSync(cover)) {
    const art = await sharp(cover).resize({ width: OG.width, withoutEnlargement: true }).toBuffer()
    const { height } = await sharp(art).metadata()
    const pad = Math.max(0, Math.round((OG.height - (height ?? 0)) / 2))
    await sharp(art)
      .extend({ top: pad, bottom: OG.height - (height ?? 0) - pad, background: OG.paper })
      .png()
      .toFile(join('public', 'og.png'))
  } else {
    console.warn('art: no cover image, skipping public/og.png')
  }

  for (const [chapter, file] of Object.entries(BACKDROPS)) {
    await sharp(join(SRC, 'bg', `${file}.png`))
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(join(OUT, 'bg', `ch${chapter}.webp`))
  }
}

await main()
