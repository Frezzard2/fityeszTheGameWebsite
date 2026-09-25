/**
 * Generates lib/story/content/*.json from the game's own Lang.java.
 *
 * The game repo is the single source of truth for its words: retyping the
 * Prologue and Chapter 1 here would guarantee the two drift apart. The beat
 * ORDER and the XP/exposure numbers are transcribed from fityesz1_0.java
 * (lines 51-150) — the Java control flow is not parsed.
 *
 * Run: npm run extract:story
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export type Bilingual = { hu: string; en: string }

const CALL = /p\(\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\)/gs

function unescapeJava(s: string): string {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

export function parseLangJava(src: string): Record<string, Bilingual> {
  // Lang.java splits long strings across lines with `" + "`; rejoin first.
  const joined = src.replace(/"\s*\+\s*"/g, '')
  const out: Record<string, Bilingual> = {}
  for (const m of joined.matchAll(CALL)) {
    const [, key, hu, en] = m
    if (out[key]) throw new Error(`duplicate key: ${key}`)
    out[key] = { hu: unescapeJava(hu), en: unescapeJava(en) }
  }
  return out
}

const RAW = 'https://raw.githubusercontent.com/djkzea/fityeszthegame/main/src'

async function main() {
  const res = await fetch(`${RAW}/Lang.java`)
  if (!res.ok) throw new Error(`fetching Lang.java: HTTP ${res.status}`)
  const lang = parseLangJava(await res.text())

  const t = (k: string): Bilingual => {
    const v = lang[k]
    if (!v) throw new Error(`missing key in Lang.java: ${k}`)
    return v
  }
  const narration = (k: string) => ({ kind: 'narration' as const, text: t(k) })
  const says = (speaker: string, k: string) => ({
    kind: 'dialogue' as const,
    speaker,
    text: t(k),
  })

  const prologue = {
    id: 'prologus',
    chapter: 0,
    beats: [
      {
        kind: 'chapterCard',
        number: 0,
        title: t('pro.title'),
        quote: t('pro.quote'),
        place: { hu: '', en: '' },
      },
      narration('pro.youAre'),
      narration('pro.teacher'),
      narration('pro.salary'),
      narration('pro.assets'),
      narration('pro.bank'),
      narration('pro.politician'),
      narration('pro.phone'),
      says('unknown', 'pro.call'),
    ],
  }

  // XP / exposure values below are lifted verbatim from fityesz1_0.java.
  const chapter1 = {
    id: 'fejezet-01',
    chapter: 1,
    beats: [
      {
        kind: 'chapterCard',
        number: 1,
        title: t('ch1.title'),
        quote: t('ch1.quote'),
        place: t('ch1.place'),
      },
      says('lipoti', 'ch1.lipoti1'),
      says('lipoti', 'ch1.lipoti2'),
      {
        kind: 'choice',
        id: 'ch1.q1',
        prompt: t('ch1.q1'),
        options: [
          { text: t('ch1.q1.opt1'), xp: 15, lebukas: 10, response: [says('lipoti', 'ch1.q1.ans1')] },
          { text: t('ch1.q1.opt2'), xp: 10, lebukas: 5, response: [says('lipoti', 'ch1.q1.ans2')] },
          { text: t('ch1.q1.opt3'), xp: 5, lebukas: 0, response: [says('lipoti', 'ch1.q1.ans3')] },
        ],
      },
      says('lipoti', 'ch1.lipoti3'),
      narration('ch1.envelope'),
      says('lipoti', 'ch1.lipoti4'),
      {
        kind: 'choice',
        id: 'ch1.q2',
        prompt: t('ch1.q2'),
        options: [
          {
            text: t('ch1.q2.opt1'),
            xp: 20,
            lebukas: 15,
            grantsItem: 'envelope1',
            response: [{ kind: 'item', item: 'envelope1' }, narration('ch1.q2.ans1')],
          },
          { text: t('ch1.q2.opt2'), xp: 10, lebukas: 5, response: [says('lipoti', 'ch1.q2.ans2')] },
          { text: t('ch1.q2.opt3'), xp: 0, lebukas: -10, response: [says('lipoti', 'ch1.q2.ans3')] },
        ],
      },
    ],
  }

  const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'story', 'content')
  mkdirSync(dir, { recursive: true })
  for (const scene of [prologue, chapter1]) {
    writeFileSync(join(dir, `${scene.id}.json`), JSON.stringify(scene, null, 2) + '\n', 'utf8')
    console.log(`wrote ${scene.id}.json (${scene.beats.length} beats)`)
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop()!)) {
  main().catch((e) => {
    console.error(e.message)
    process.exit(1)
  })
}
