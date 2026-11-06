// Öffentlicher Eingang für Bewerbungen. Bewerber haben keine direkten Datenbankrechte.
//   POST /apply/check   Lebenslauf auslesen und Maske vorausfüllen, speichert nichts
//   POST /apply/submit  Bewerbung prüfen und speichern, gibt Kürzel und Profil-Zugang zurück
//   POST /apply/status  Stand der eigenen Bewerbung über den Profil-Zugang
import { createClient } from 'npm:@supabase/supabase-js@2'
import { getDocumentProxy } from 'npm:unpdf@2.1.0'
import { findContact, findLeaks, findProfile, parseCv, type Identity } from './cv.ts'

const MAX_BYTES = 5 * 1024 * 1024
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

class BadRequest extends Error {}

async function readFile(form: FormData): Promise<Uint8Array> {
  const file = form.get('file')
  if (!(file instanceof File)) throw new BadRequest('Es fehlt eine Datei im Feld "file"')
  if (file.size > MAX_BYTES) throw new BadRequest('Die Datei ist größer als 5 MB')

  const bytes = new Uint8Array(await file.arrayBuffer())
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') {
    throw new BadRequest('Die Datei ist kein PDF')
  }
  return bytes
}

// Baut die Zeilen über die y-Position auf, weil PDFs nur einzelne Textstücke enthalten.
async function extractText(bytes: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(bytes.slice())
  const lines: string[] = []
  for (let number = 1; number <= pdf.numPages; number++) {
    const page = await pdf.getPage(number)
    const { items } = await page.getTextContent()
    const rows = new Map<number, { x: number; text: string }[]>()
    for (const item of items) {
      if (!('str' in item) || !item.str) continue
      const y = Math.round(item.transform[5])
      rows.set(y, [...(rows.get(y) ?? []), { x: item.transform[4], text: item.str }])
    }
    for (const y of [...rows.keys()].sort((a, b) => b - a)) {
      lines.push(rows.get(y)!.sort((a, b) => a.x - b.x).map((part) => part.text).join(''))
    }
  }
  return lines.join('\n')
}

function identityFrom(source: Record<string, unknown>): Identity {
  const value = (key: string) => String(source[key] ?? '').trim()
  const person = {
    first_name: value('first_name'),
    last_name: value('last_name'),
    email: value('email'),
    phone: value('phone'),
  }
  if (!person.first_name || !person.last_name) throw new BadRequest('Vor- und Nachname fehlen')
  if (!/^\S+@\S+\.\S+$/.test(person.email)) throw new BadRequest('Die E-Mail-Adresse ist ungültig')
  if (person.phone.replace(/\D/g, '').length < 4) throw new BadRequest('Die Telefonnummer ist zu kurz')
  return person
}

async function handleCheck(form: FormData): Promise<Response> {
  const text = await extractText(await readFile(form))
  const cv = parseCv(text)
  return json({
    has_text: text.trim().length > 0,
    format_recognized: cv.experiences.length > 0,
    contact: findContact(text),
    profile: findProfile(cv),
    cv,
  })
}

async function handleSubmit(form: FormData): Promise<Response> {
  const raw = form.get('payload')
  if (typeof raw !== 'string') throw new BadRequest('Es fehlt das Feld "payload"')
  const payload = JSON.parse(raw)
  const person = identityFrom(payload)
  const bytes = await readFile(form)

  // Diese Angaben sehen die Screener, also darf darin niemand erkennbar sein.
  const visible = JSON.stringify([
    (payload.answers ?? []).map((item: { answer: string }) => item.answer),
    payload.experiences,
    payload.educations,
    payload.skills,
    payload.languages,
    payload.study_program,
    payload.degree,
    payload.university,
  ])
  const leaks = findLeaks(visible, person)
  if (leaks.length) return json({ error: 'Die Angaben für Screener sind nicht anonym', leaks }, 422)

  const cv_path = `${crypto.randomUUID()}.pdf`
  const upload = await admin.storage.from('cvs').upload(cv_path, bytes, {
    contentType: 'application/pdf',
  })
  if (upload.error) throw upload.error

  const { data, error } = await admin.rpc('create_application', {
    p: { ...payload, ...person, cv_path },
  })
  if (error) {
    await admin.storage.from('cvs').remove([cv_path])
    return json({ error: error.message }, 422)
  }
  return json(data)
}

async function handleStatus(form: FormData): Promise<Response> {
  const token = String(form.get('token') ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(token)) throw new BadRequest('Der Zugang ist ungültig')

  const { data, error } = await admin.rpc('get_application_status', { p_token: token })
  if (error) throw error
  if (!data) return json({ error: 'Diese Bewerbung gibt es nicht' }, 404)
  return json(data)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Nur POST ist erlaubt' }, 405)

  try {
    const form = await req.formData()
    const path = new URL(req.url).pathname
    if (path.endsWith('/check')) return await handleCheck(form)
    if (path.endsWith('/submit')) return await handleSubmit(form)
    if (path.endsWith('/status')) return await handleStatus(form)
    return json({ error: 'Unbekannter Pfad' }, 404)
  } catch (error) {
    if (error instanceof BadRequest) return json({ error: error.message }, 400)
    console.error(error)
    return json({ error: 'Interner Fehler' }, 500)
  }
})
