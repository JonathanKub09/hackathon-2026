// Liest das Standardformat aus testdata/cvs/README.md und prüft die Angaben für Screener.

export type CvEntry = {
  start_date: string
  end_date: string
  title: string
  organization: string
}

export type CvExperience = CvEntry & { details: string[] }

export type ParsedCv = {
  experiences: CvExperience[]
  educations: CvEntry[]
  skills: string[]
  languages: string[]
}

export type Profile = {
  study_program: string
  degree: string
  university: string
  expected_graduation: string
}

export type Identity = {
  first_name: string
  last_name: string
  email: string
  phone: string
}

export type Contact = Identity & { city: string }

const ENTRY = /^(\d{2}\/\d{4}) - (\d{2}\/\d{4}|heute) \| (.+?) \| (.+)$/
const HEADINGS = ['ERFAHRUNG', 'AUSBILDUNG', 'KENNTNISSE', 'SPRACHEN']
const DEGREE =
  /^(B\.?\s?(?:Sc|A|Eng|Ed)\.?|M\.?\s?(?:Sc|A|Eng|Ed)\.?|Bachelor(?: of \p{L}+)?|Master(?: of \p{L}+)?|Diplom|Staatsexamen)\s+(.+)$/iu
const NAME_LINE = /^\p{L}[\p{L}'.-]*(?: \p{L}[\p{L}'.-]*){1,3}$/u
const ANY_EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/iu
const LABELLED_PHONE =
  /(?<![\p{L}\p{N}])(?:Telefon|Tel\.?|Mobil|Handy|Phone)\s*:?\s*([+\d][\d\s()/-]{4,}\d)/iu
const INTERNATIONAL_PHONE = /\+\d{1,3}[\s/-]?\d[\d\s/-]{5,}\d/
const LABELLED_CITY = /^(?:Ort|Wohnort|Stadt)\s*:\s*(.+)$/im

export function parseCv(text: string): ParsedCv {
  const cv: ParsedCv = { experiences: [], educations: [], skills: [], languages: [] }
  const lists: Record<string, string[]> = { KENNTNISSE: [], SPRACHEN: [] }
  let section = ''

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    if (HEADINGS.includes(line)) {
      section = line
      continue
    }

    if (section === 'ERFAHRUNG' || section === 'AUSBILDUNG') {
      const match = line.match(ENTRY)
      if (match) {
        const [, start_date, end_date, title, organization] = match
        const entry = { start_date, end_date, title, organization }
        if (section === 'ERFAHRUNG') cv.experiences.push({ ...entry, details: [] })
        else cv.educations.push(entry)
        continue
      }
      const last = cv.experiences.at(-1)
      if (section !== 'ERFAHRUNG' || !last) continue
      if (line.startsWith('- ')) last.details.push(line.slice(2))
      else if (last.details.length) last.details[last.details.length - 1] += ` ${line}`
    } else if (section) {
      lists[section].push(line)
    }
  }

  const split = (lines: string[]) =>
    lines.length ? lines.join(' ').split(', ').map((item) => item.trim()) : []
  cv.skills = split(lists.KENNTNISSE)
  cv.languages = split(lists.SPRACHEN)
  return cv
}

// Felder ohne Treffer bleiben leer, dann füllt die Person sie selbst aus.
export function findContact(text: string): Contact {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const firstHeading = lines.findIndex((line) => HEADINGS.includes(line))
  const header = lines.slice(0, firstHeading === -1 ? 8 : firstHeading)
  const name = header.find((line) => NAME_LINE.test(line) && !/^curriculum vitae$/i.test(line))
  const parts = name?.split(' ') ?? []

  return {
    first_name: parts.slice(0, -1).join(' '),
    last_name: parts.at(-1) ?? '',
    email: text.match(ANY_EMAIL)?.[0] ?? '',
    phone: (text.match(LABELLED_PHONE)?.[1] ?? text.match(INTERNATIONAL_PHONE)?.[0] ?? '').trim(),
    city: text.match(LABELLED_CITY)?.[1].trim() ?? '',
  }
}

// Das Studium ist der erste Ausbildungseintrag mit akademischem Abschluss.
export function findProfile(cv: ParsedCv): Profile {
  const study = cv.educations.find((entry) => DEGREE.test(entry.title))
  if (!study) return { study_program: '', degree: '', university: '', expected_graduation: '' }

  const [, degree, study_program] = study.title.match(DEGREE)!
  return {
    study_program,
    degree,
    university: study.organization,
    expected_graduation: study.end_date === 'heute' ? '' : study.end_date,
  }
}

// Ganze Wörter und Groß-/Kleinschreibung, sonst träfe der Nachname Klein auch das Wort klein.
function nameIn(text: string, name: string): boolean {
  const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'u').test(text)
}

// Prüft alles, was Screener zu sehen bekommen. Der Lebenslauf selbst gehört nicht dazu.
export function findLeaks(text: string, person: Identity): string[] {
  const leaks: string[] = []
  if (person.first_name && nameIn(text, person.first_name)) leaks.push('Vorname')
  if (person.last_name && nameIn(text, person.last_name)) leaks.push('Nachname')
  if (ANY_EMAIL.test(text)) leaks.push('E-Mail-Adresse')

  const phone = person.phone.replace(/\D/g, '')
  const ownPhone = phone.length >= 6 && text.replace(/\D/g, '').includes(phone)
  if (ownPhone || LABELLED_PHONE.test(text) || INTERNATIONAL_PHONE.test(text)) {
    leaks.push('Telefonnummer')
  }
  return leaks
}
