// Sign in with a username.
//
// Supabase authenticates on e-mail, so a username has to be resolved first.
// Doing that in the browser would mean a public lookup from username to
// address — which is what the first version of this feature did, and why it
// was withdrawn. Here the lookup happens with the service role key, which
// never leaves the server, and only a session comes back.
//
// Every failure answers the same way. A caller who does not know the password
// cannot tell an unknown username from a wrong password, so usernames stay
// unenumerable.
//
// Deploy with:  supabase functions deploy sign-in
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

/** One wording for every failure, so nothing can be learned from the error. */
const REFUSED = { error: 'invalid_credentials' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json(REFUSED, 405)

  let identifier = ''
  let password = ''
  try {
    const body = await req.json()
    identifier = String(body?.identifier ?? '').trim()
    password = String(body?.password ?? '')
  } catch {
    return json(REFUSED, 400)
  }
  if (!identifier || !password) return json(REFUSED, 400)

  const url = Deno.env.get('SUPABASE_URL')!
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // An address signs in as itself; anything else is looked up as a username.
  let email = identifier
  if (!identifier.includes('@')) {
    const { data, error } = await admin
      .from('profiles')
      .select('user_id')
      .eq('username', identifier)
      .maybeSingle()
    if (error || !data) return json(REFUSED, 400)

    const { data: found, error: lookupError } = await admin.auth.admin.getUserById(data.user_id)
    if (lookupError || !found.user?.email) return json(REFUSED, 400)
    email = found.user.email
  }

  // Sign in through the anon key, so Supabase applies its own auth rules
  // rather than trusting the service role to vouch for the password.
  const asVisitor = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: signed, error: signInError } = await asVisitor.auth.signInWithPassword({
    email,
    password,
  })
  if (signInError || !signed.session) return json(REFUSED, 400)

  // Only the tokens. The address that was looked up is not among them.
  return json(
    {
      access_token: signed.session.access_token,
      refresh_token: signed.session.refresh_token,
    },
    200,
  )
})
