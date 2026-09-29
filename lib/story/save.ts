import { supabase } from '@/lib/supabase'
import { loadLocalSave, saveLocalSave } from './localSave'
import { EXPOSURE_LIMIT } from './engine'
import type { Decision, ItemId, PlayerState, RunStatus } from './types'

/**
 * A run lives in two places: localStorage for a guest, and the account row for
 * a signed-in player. Signing in moves the browser save into the account and
 * clears localStorage, so a play screen that reads only localStorage — which is
 * what it used to do — starts a signed-in player's chapter over from beat one.
 *
 * The row has no status column. `chapter` carries how far the run got: 1 while
 * chapter one is being played, 2 once its end screen has been reached.
 */

const COLS = 'player_name,xp,lebukas,szint,items,history,chapter'

export type SaveRow = {
  player_name: string | null
  xp: number
  lebukas: number
  szint: number
  items: ItemId[]
  history: Decision[]
  chapter: number
}

export function chapterOf(status: RunStatus): number {
  return status === 'demoComplete' ? 2 : 1
}

function statusOf(row: SaveRow): RunStatus {
  if (row.chapter >= 2) return 'demoComplete'
  return row.lebukas >= EXPOSURE_LIMIT ? 'exposed' : 'playing'
}

export function rowToState(row: SaveRow): PlayerState {
  return {
    name: row.player_name ?? '',
    xp: row.xp,
    lebukas: row.lebukas,
    szint: row.szint,
    items: row.items ?? [],
    history: row.history ?? [],
    status: statusOf(row),
  }
}

/** The account's run when signed in, otherwise this browser's. */
export async function loadSave(): Promise<PlayerState | null> {
  const local = loadLocalSave()
  const sb = supabase()
  if (!sb) return local

  const { data: auth } = await sb.auth.getSession()
  if (!auth.session) return local

  const { data } = await sb.from('saves').select(COLS).eq('slot', 1).maybeSingle()
  if (!data) return local

  return rowToState(data as SaveRow)
}

/**
 * Writes the run everywhere it belongs.
 *
 * localStorage is written first and synchronously, so the run survives a reload
 * even if the network call never lands; the account write is fire-and-forget.
 */
export function persist(state: PlayerState): void {
  saveLocalSave(state)

  const sb = supabase()
  if (!sb) return
  void sb.auth.getSession().then(({ data }) => {
    const user = data.session?.user
    if (!user) return
    return sb.from('saves').upsert(
      {
        user_id: user.id,
        slot: 1,
        display_name: (user.user_metadata?.display_name as string) ?? null,
        player_name: state.name,
        chapter: chapterOf(state.status),
        xp: state.xp,
        lebukas: state.lebukas,
        szint: state.szint,
        items: state.items,
        history: state.history,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,slot' },
    )
  })
}
