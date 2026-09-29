/**
 * Turns the source art into what the site ships.
 *
 * `fityesz_art/` holds 34MB of PNG masters, which no FTP-hosted static site
 * should serve. This writes the only three shapes the site actually renders:
 * a roster portrait, a stage sprite and a chapter background. Run it again
 * after adding art — it overwrites, and nothing else reads the masters.
 *
 *   node scripts/art.mjs
 */
import { mkdir } from 'node:fs/promises'
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

async function main() {
  await mkdir(join(OUT, 'cast'), { recursive: true })
  await mkdir(join(OUT, 'stage'), { recursive: true })
  await mkdir(join(OUT, 'bg'), { recursive: true })

  for (const [id, file] of Object.entries(CAST)) {
    // The calm pose introduces the character; the second, talking pose is the
    // one that belongs on stage mid-sentence.
    await sharp(join(SRC, 'characters', `${file}.png`))
      .resize({ width: 560, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(join(OUT, 'cast', `${id}.webp`))

    await sharp(join(SRC, 'characters', `${file}2.png`))
      .resize({ height: 1000, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(join(OUT, 'stage', `${id}.webp`))
  }

  for (const [chapter, file] of Object.entries(BACKDROPS)) {
    await sharp(join(SRC, 'bg', `${file}.png`))
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(join(OUT, 'bg', `ch${chapter}.webp`))
  }
}

await main()
