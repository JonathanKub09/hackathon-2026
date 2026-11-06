// Öffentlicher Eingang für Bewerbungen. Bewerber haben keine direkten Datenbankrechte.
//   POST /apply/check   Lebenslauf auslesen und Anonymität prüfen, speichert nichts
//   POST /apply/submit  Bewerbung prüfen und speichern, gibt das Kürzel zurück
import { createClient } from 'npm:@supabase/supabase-js@2'
import { getDocumentProxy, getMeta } from 'npm:unpdf@2.1.0'
import { findGroup, findLeaks, parseCv, type Identity } from './cv.ts'

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

async function readPdf(form: FormData): Promise<{ bytes: Uint8Array; text: string; meta: string }> {
  const file = form.get('file')
  if (!(file instanceof File)) throw new BadRequest('Es fehlt eine Datei im Feld "file"')
  if (file.size > MAX_BYTES) throw new BadRequest('Die Datei ist größer als 5 MB')

  const bytes = new Uint8Array(await file.arrayBuffer())
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') {
    throw new BadRequest('Die Datei ist kein PDF')
  }

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

  const { info } = await getMeta(pdf)
  const meta = [info?.Title, info?.Author, info?.Subject, info?.Keywords].filter(Boolean).join(' ')
  return { bytes, text: lines.join('\n'), meta }
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
  const person = identityFrom(Object.fromEntries(form))
  const { text, meta } = await readPdf(form)
  const cv = parseCv(text)

  const { data: groups, error } = await admin
    .from('question_groups')
    .select('slug, keywords, position')
  if (error) throw error

  const leaks = findLeaks(`${text}\n${meta}`, person)
  return json({
    anonymous: leaks.length === 0,
    leaks,
    has_text: text.trim().length > 0,
    format_recognized: cv.experiences.length > 0,
    group: findGroup(cv, groups),
    cv,
  })
}

async function handleSubmit(form: FormData): Promise<Response> {
  const raw = form.get('payload')
  if (typeof raw !== 'string') throw new BadRequest('Es fehlt das Feld "payload"')
  const payload = JSON.parse(raw)
  const person = identityFrom(payload)
  const { bytes, text, meta } = await readPdf(form)

  // Auch Antworten und Stationen sehen die Screener, also gilt die Prüfung auch für sie.
  const typed = JSON.stringify([payload.answers, payload.experiences, payload.educations])
  const leaks = findLeaks(`${text}\n${meta}\n${typed}`, person)
  if (leaks.length) return json({ error: 'Die Bewerbung ist nicht anonym', leaks }, 422)

  const cv_path = `${crypto.randomUUID()}.pdf`
  const upload = await admin.storage.from('cvs').upload(cv_path, bytes, {
    contentType: 'application/pdf',
  })
  if (upload.error) throw upload.error

  const { data: code, error } = await admin.rpc('create_application', {
    p: { ...payload, ...person, cv_path },
  })
  if (error) {
    await admin.storage.from('cvs').remove([cv_path])
    return json({ error: error.message }, 422)
  }
  return json({ code })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Nur POST ist erlaubt' }, 405)

  try {
    const form = await req.formData()
    const path = new URL(req.url).pathname
    if (path.endsWith('/check')) return await handleCheck(form)
    if (path.endsWith('/submit')) return await handleSubmit(form)
    return json({ error: 'Unbekannter Pfad' }, 404)
  } catch (error) {
    if (error instanceof BadRequest) return json({ error: error.message }, 400)
    console.error(error)
    return json({ error: 'Interner Fehler' }, 500)
  }
})
