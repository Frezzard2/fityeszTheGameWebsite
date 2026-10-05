// Delete the signed-in player's account, and everything attached to it.
//
// A browser cannot do this: removing a user needs the service role key, which
// must never ship to one. The caller proves who they are with their own access
// token and nothing else — the user id is read from that token, never from the
// request body, so one account cannot ask for another to be deleted.
//
// Deploy with:  supabase functions deploy delete-account
import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const token = req.headers.get('Authorization')?.replace(/^Bearer /i, '')
  if (!token) return json({ error: 'not_signed_in' }, 401)

  const url = Deno.env.get('SUPABASE_URL')!
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Whose token is this? The answer decides what gets deleted, and the caller
  // has no say in it.
  const { data: who, error: whoError } = await admin.auth.getUser(token)
  if (whoError || !who.user) return json({ error: 'not_signed_in' }, 401)
  const id = who.user.id

  // Saves and profile first. Both cascade from auth.users anyway, but deleting
  // them explicitly means a failure part-way leaves no orphan rows behind.
  await admin.from('saves').delete().eq('user_id', id)
  await admin.from('profiles').delete().eq('user_id', id)

  const { error: deleteError } = await admin.auth.admin.deleteUser(id)
  if (deleteError) return json({ error: 'delete_failed' }, 500)

  return json({ deleted: true }, 200)
})
