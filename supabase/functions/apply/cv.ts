// Liest das Standardformat aus testdata/cvs/README.md und prüft die Anonymität.

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

export type Identity = {
  first_name: string
  last_name: string
  email: string
  phone: string
}

export type QuestionGroup = { slug: string; keywords: string[]; position: number }

const ENTRY = /^(\d{2}\/\d{4}) - (\d{2}\/\d{4}|heute) \| (.+?) \| (.+)$/
const HEADINGS = ['ERFAHRUNG', 'AUSBILDUNG', 'KENNTNISSE', 'SPRACHEN']
const ANY_EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/iu

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

// Ganze Wörter, auch mit Umlauten. \b kennt in JavaScript keine Umlaute.
function wholeWord(term: string): RegExp {
  const escaped = term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'giu')
}

// Stichworte zählen nur in Titeln und Kenntnissen, nicht beim Namen der Organisation.
export function findGroup(cv: ParsedCv, groups: QuestionGroup[]): string {
  const haystack = [...cv.experiences, ...cv.educations]
    .map((entry) => entry.title)
    .concat(cv.skills)
    .join(' | ')

  let best = { slug: '', hits: 0 }
  for (const group of [...groups].sort((a, b) => a.position - b.position)) {
    const hits = group.keywords.reduce(
      (sum, keyword) => sum + (haystack.match(wholeWord(keyword))?.length ?? 0),
      0,
    )
    if (hits > best.hits) best = { slug: group.slug, hits }
  }
  return best.slug || 'generisch'
}

export function findLeaks(text: string, person: Identity): string[] {
  const leaks: string[] = []
  if (person.first_name && wholeWord(person.first_name).test(text)) leaks.push('Vorname')
  if (person.last_name && wholeWord(person.last_name).test(text)) leaks.push('Nachname')
  if (ANY_EMAIL.test(text)) leaks.push('E-Mail-Adresse')

  const phone = person.phone.replace(/\D/g, '')
  if (phone.length >= 6 && text.replace(/\D/g, '').includes(phone)) leaks.push('Telefonnummer')
  return leaks
}
