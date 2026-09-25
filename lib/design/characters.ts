import type { Bilingual, CharacterId } from '@/lib/story/types'

export type Character = {
  id: CharacterId
  initials: string
  name: Bilingual
  title: Bilingual
  quote: Bilingual
  /** Chapter the character first appears in. */
  chapter: number
  boss: boolean
}

/** Ported from the design prototype's `static CHARS`. */
export const CHARACTERS: Character[] = [
  {
    id: 'you',
    initials: '?',
    name: { hu: 'Te', en: 'You' },
    title: { hu: 'Volt középiskolai tanár', en: 'Former secondary school teacher' },
    quote: { hu: 'Ezért politikusnak állsz.', en: 'So you go into politics.' },
    chapter: 0,
    boss: false,
  },
  {
    id: 'lipoti',
    initials: 'LD',
    name: { hu: 'Lipóti Dezső', en: 'Lipóti Dezső' },
    title: { hu: 'A toborzó', en: 'The recruiter' },
    quote: { hu: 'Kávét? Pálinkát? Mindkettőt?', en: 'Coffee? Pálinka? Both?' },
    chapter: 1,
    boss: false,
  },
  {
    id: 'lakatos',
    initials: 'LE',
    name: { hu: 'Lakatos Ervin', en: 'Lakatos Ervin' },
    title: { hu: 'Kerületi pártember', en: 'District party man' },
    quote: {
      hu: 'Lebukás? Haha! Mi vagyunk a hatalom, kisfiam!',
      en: 'Caught? Haha! We are the power, my boy!',
    },
    chapter: 2,
    boss: true,
  },
  {
    id: 'kapzs',
    initials: 'KI',
    name: { hu: 'Kapzs Imre', en: 'Kapzs Imre' },
    title: {
      hu: 'Miniszterelnök, a Nemzet Megmentője',
      en: 'Prime Minister, Saviour of the Nation',
    },
    quote: {
      hu: 'A mászó bármikor leeshet. A csillag... a csillag örökké ragyog.',
      en: 'A climber can fall at any time. A star... a star shines forever.',
    },
    chapter: 3,
    boss: true,
  },
  {
    id: 'peteri',
    initials: 'PK',
    name: { hu: 'Dr. Péteri Katalin', en: 'Dr. Péteri Katalin' },
    title: { hu: 'Az Országos Választmány tagja', en: 'Member of the National Committee' },
    quote: { hu: 'Az idő pénz – szó szerint.', en: 'Time is money – literally.' },
    chapter: 4,
    boss: true,
  },
  {
    id: 'molnar',
    initials: 'MG',
    name: { hu: 'Molnár Gábor', en: 'Molnár Gábor' },
    title: { hu: 'A frakció embere', en: 'The party whip' },
    quote: { hu: 'Vélemény? VÉLEMÉNY?!', en: 'Opinion? OPINION?!' },
    chapter: 5,
    boss: false,
  },
]

const BY_ID = new Map(CHARACTERS.map((c) => [c.id, c]))

/** The caller on the phone in the Prologue has no character card. */
const UNKNOWN: Bilingual = { hu: 'Ismeretlen hang', en: 'Unknown voice' }

export function speakerName(id: CharacterId, playerName: string): Bilingual {
  if (id === 'unknown') return UNKNOWN
  if (id === 'you') return { hu: playerName, en: playerName }
  const c = BY_ID.get(id)
  return c ? c.name : { hu: id, en: id }
}
