// Registrierung für das Recruiting-Team. Ohne gültigen Einladungscode entsteht kein Konto,
// und der Code bestimmt die Rolle. Das Konto ist sofort aktiv, es geht keine Mail raus.
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Nur POST ist erlaubt' }, 405)

  try {
    const body = await req.json().catch(() => ({}))
    const value = (key: string) => String(body[key] ?? '').trim()
    const email = value('email')
    const name = value('display_name')
    const code = value('code')
    const password = String(body.password ?? '')

    if (!name) return json({ error: 'Der Name fehlt' }, 400)
    if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Die E-Mail-Adresse ist ungültig' }, 400)
    if (password.length < 8) return json({ error: 'Das Passwort braucht mindestens 8 Zeichen' }, 400)

    const { data: role, error: roleError } = await admin.rpc('invite_role', { p_code: code })
    if (roleError) throw roleError
    if (!role) return json({ error: 'Der Einladungscode stimmt nicht' }, 403)

    const { data, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createError) {
      const exists = createError.code === 'email_exists'
      return json({ error: exists ? 'Für diese E-Mail gibt es schon ein Konto' : createError.message }, 422)
    }

    const { error: staffError } = await admin
      .from('staff')
      .insert({ user_id: data.user.id, role, display_name: name })
    if (staffError) {
      await admin.auth.admin.deleteUser(data.user.id)
      throw staffError
    }
    return json({ role })
  } catch (error) {
    console.error(error)
    return json({ error: 'Interner Fehler' }, 500)
  }
})
