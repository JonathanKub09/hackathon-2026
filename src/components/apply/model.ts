// Datenmodell der Bewerber-Strecke und Übersetzung von und zum Backend (src/lib/api.ts).
import type { CvCheckResult, CvEntry, NewApplication } from '../../lib/types.ts'

export const ORG = 'Muster Consulting e. V.' // Platzhalter, echten Namen eintragen

export type Step =
  | 'touchpoint'
  | 'start'
  | 'lebenslauf'
  | 'kontakt'
  | 'pruefen'
  | 'motivation'
  | 'termin'
  | 'absenden'
  | 'profil'

export const STEPS: Step[] = [
  'touchpoint',
  'start',
  'lebenslauf',
  'kontakt',
  'pruefen',
  'motivation',
  'termin',
  'absenden',
  'profil',
]

/** Schritte, die im Fortschrittsbalken des Formulars auftauchen. */
export const FORM_STEPS: { id: Step; label: string }[] = [
  { id: 'lebenslauf', label: 'Lebenslauf' },
  { id: 'kontakt', label: 'Kontakt' },
  { id: 'pruefen', label: 'Deine Daten' },
  { id: 'motivation', label: 'Motivation' },
  { id: 'termin', label: 'Termin' },
  { id: 'absenden', label: 'Absenden' },
]

export type Experience = {
  rolle: string
  firma: string
  zeitraum: string
  details: string[]
  relevant: boolean
}

export type Draft = {
  vorname: string
  nachname: string
  email: string
  telefon: string
  geburtsjahr: string
  geschlecht: string
  staatsangehoerigkeit: string
  wohnort: string
  cvFile: File | null
  /** Hinweis, wenn der Lebenslauf nicht vollständig gelesen werden konnte. */
  cvHinweis: string | null
  hochschule: string
  studiengang: string
  semester: string
  abschluss: string
  abschlussDatum: string
  erfahrung: Experience[]
  ausbildung: CvEntry[]
  skills: string[]
  sprachen: string[]
  /** Antworten auf die festen Fragen, Schlüssel ist die Fragen-ID. */
  antworten: Record<string, string>
  termin: string | null
  consent: boolean
  keepData: boolean
}

export function newDraft(): Draft {
  return {
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    geburtsjahr: '',
    geschlecht: '',
    staatsangehoerigkeit: '',
    wohnort: '',
    cvFile: null,
    cvHinweis: null,
    hochschule: '',
    studiengang: '',
    semester: '',
    abschluss: '',
    abschlussDatum: '',
    erfahrung: [],
    ausbildung: [],
    skills: [],
    sprachen: [],
    antworten: {},
    termin: null,
    consent: false,
    keepData: false,
  }
}

/** Füllt den Entwurf mit dem, was das Backend aus dem Lebenslauf gelesen hat. */
export function fromCheck(result: CvCheckResult): Partial<Draft> {
  const { contact, profile, cv } = result
  let cvHinweis: string | null = null
  if (!result.has_text) {
    cvHinweis = 'Dein PDF enthält keinen lesbaren Text, vermutlich ist es ein Scan. Bitte fülle die Felder von Hand aus.'
  } else if (!result.format_recognized) {
    cvHinweis = 'Wir konnten deinen Lebenslauf nicht vollständig lesen. Bitte ergänze die fehlenden Felder von Hand.'
  }

  return {
    cvHinweis,
    vorname: contact.first_name,
    nachname: contact.last_name,
    email: contact.email,
    telefon: contact.phone,
    wohnort: contact.city,
    hochschule: profile.university,
    studiengang: profile.study_program,
    abschluss: profile.degree,
    abschlussDatum: profile.expected_graduation,
    erfahrung: cv.experiences.map((e) => ({
      rolle: e.title,
      firma: e.organization,
      zeitraum: `${e.start_date} - ${e.end_date}`,
      details: e.details,
      relevant: false,
    })),
    ausbildung: cv.educations,
    skills: cv.skills,
    sprachen: cv.languages,
  }
}

/** Baut aus dem Entwurf die Bewerbung fürs Backend. */
export function toApplication(d: Draft): NewApplication {
  return {
    first_name: d.vorname.trim(),
    last_name: d.nachname.trim(),
    email: d.email.trim(),
    phone: d.telefon.trim(),
    consent_privacy: d.consent,
    keep_data: d.keepData,
    demographics: {
      geburtsjahr: d.geburtsjahr,
      geschlecht: d.geschlecht,
      staatsangehoerigkeit: d.staatsangehoerigkeit,
      wohnort: d.wohnort,
    },
    study_program: d.studiengang,
    degree: d.abschluss,
    university: d.hochschule,
    expected_graduation: d.abschlussDatum,
    semester: d.semester,
    preferred_slot: d.termin,
    skills: d.skills,
    languages: d.sprachen,
    educations: d.ausbildung,
    experiences: d.erfahrung.map((e) => {
      const [start_date = '', end_date = ''] = e.zeitraum.split(' - ')
      return {
        start_date,
        end_date,
        title: e.rolle,
        organization: e.firma,
        details: e.details,
        is_relevant: e.relevant,
      }
    }),
    answers: Object.entries(d.antworten).map(([question_id, answer]) => ({ question_id, answer })),
  }
}

export type Slot = { id: string; day: string; date: string; times: string[] }

export const SLOTS: Slot[] = [
  { id: 'di', day: 'Dienstag', date: '17. November', times: ['10:00', '14:30', '17:00'] },
  { id: 'mi', day: 'Mittwoch', date: '18. November', times: ['09:30', '13:00'] },
  { id: 'do', day: 'Donnerstag', date: '19. November', times: ['11:00', '15:30', '18:00'] },
]

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

/** Für das Kürzel braucht das Backend mindestens vier Ziffern. */
export const isPhone = (v: string) => v.replace(/\D/g, '').length >= 4
