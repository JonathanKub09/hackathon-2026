// Mockup-Daten für die Bewerber-Strecke. Nichts davon geht an Supabase.

export const ORG = 'Muster Consulting e. V.' // Platzhalter, echten Namen eintragen

export type Step =
  | 'touchpoint'
  | 'start'
  | 'kontakt'
  | 'anonym'
  | 'pruefen'
  | 'motivation'
  | 'termin'
  | 'absenden'
  | 'postfach'
  | 'profil'

export const STEP_LABELS: Record<Step, string> = {
  touchpoint: 'Touchpoint: QR-Code oder Link',
  start: 'Startseite',
  kontakt: 'Kontakt und demografische Daten',
  anonym: 'Anonymisieren und Lebenslauf',
  pruefen: 'KI-Extraktion prüfen',
  motivation: 'Fragen zur Motivation',
  termin: 'Terminabfrage',
  absenden: 'Datenschutz und Absenden',
  postfach: 'Link im Postfach',
  profil: 'Bewerberprofil',
}

export const STEPS = Object.keys(STEP_LABELS) as Step[]

/** Schritte, die im Fortschrittsbalken des Formulars auftauchen. */
export const FORM_STEPS: { id: Step; label: string }[] = [
  { id: 'kontakt', label: 'Kontakt' },
  { id: 'anonym', label: 'Lebenslauf' },
  { id: 'pruefen', label: 'Deine Daten' },
  { id: 'motivation', label: 'Motivation' },
  { id: 'termin', label: 'Termin' },
  { id: 'absenden', label: 'Absenden' },
]

export type Experience = { rolle: string; firma: string; zeitraum: string }

export type Draft = {
  vorname: string
  nachname: string
  email: string
  telefon: string
  geburtsjahr: string
  geschlecht: string
  staatsangehoerigkeit: string
  wohnort: string
  cvName: string | null
  hochschule: string
  studiengang: string
  semester: string
  abschluss: string
  erfahrung: Experience[]
  skills: string[]
  sprachen: string[]
  /** Frage 1: Motivation, für alle gleich. */
  warum: string
  /** Frage 2: passt zum Studiengang, siehe fachFrage(). */
  fach: string
  /** Frage 3: zufällig aus ZUFALL_FRAGEN, ohne Bezug zum Lebenslauf. Wird beim Start einmal gezogen. */
  zufallFrage: string
  zufall: string
  termin: string | null
  consent: boolean
  keepData: boolean
}

const emptyDraftBase: Omit<Draft, 'zufallFrage'> = {
  vorname: '',
  nachname: '',
  email: '',
  telefon: '',
  geburtsjahr: '',
  geschlecht: '',
  staatsangehoerigkeit: '',
  wohnort: '',
  cvName: null,
  hochschule: '',
  studiengang: '',
  semester: '',
  abschluss: '',
  erfahrung: [],
  skills: [],
  sprachen: [],
  warum: '',
  fach: '',
  zufall: '',
  termin: null,
  consent: false,
  keepData: false,
}

/** Neuer leerer Entwurf mit frisch gezogener Zufallsfrage. */
export function newDraft(): Draft {
  return { ...emptyDraftBase, zufallFrage: ZUFALL_FRAGEN[Math.floor(Math.random() * ZUFALL_FRAGEN.length)].frage }
}

export const MOTIVATION_FRAGE = 'Warum möchtest du bei uns mitmachen?'

/** Fachspezifische Fragen, ausgewählt über Stichworte im Studiengang. Reihenfolge zählt: der erste Treffer gewinnt. */
const FACH_FRAGEN: { match: RegExp; fach: string; frage: string }[] = [
  {
    match: /informatik|data|daten|software|computer/i,
    fach: 'Informatik',
    frage: 'Ein Mittelständler will „etwas mit KI“ machen, weiß aber nicht was. Wie findest du heraus, wo es sich lohnt?',
  },
  {
    match: /bwl|wirtschaft|vwl|management|finance|ökonom|controlling|marketing/i,
    fach: 'Wirtschaft',
    frage: 'Ein Café macht jedes Jahr mehr Umsatz, aber weniger Gewinn. Woran kann das liegen, und wie prüfst du es?',
  },
  {
    match: /jura|recht|law/i,
    fach: 'Recht',
    frage: 'Ein Start-up will Kundendaten für Werbung nutzen. Worauf weist du es als Erstes hin, und warum?',
  },
  {
    match: /ingenieur|maschinenbau|elektro|technik|bau|physik/i,
    fach: 'Ingenieurwesen',
    frage: 'In einer Produktion steigt der Ausschuss seit drei Monaten. Wie gehst du in der ersten Woche vor?',
  },
  {
    match: /psycho|sozial|pädagog|soziolog/i,
    fach: 'Sozialwissenschaften',
    frage: 'Ein Team arbeitet seit dem Umzug ins Großraumbüro schlechter zusammen. Wie findest du die Ursache?',
  },
]

const FACH_FALLBACK =
  'Welche Methode oder welches Wissen aus deinem Studium würdest du in ein Beratungsprojekt mitbringen, und wofür?'

export function fachFrage(studiengang: string): { frage: string; fach: string | null } {
  const hit = FACH_FRAGEN.find((f) => f.match.test(studiengang))
  return hit ? { frage: hit.frage, fach: hit.fach } : { frage: FACH_FALLBACK, fach: null }
}

/** Allgemeine Fragen ohne Bezug zum Lebenslauf. Zeigen, wie jemand denkt. Das Beispiel ist nur fürs Mockup. */
export const ZUFALL_FRAGEN: { frage: string; beispiel: string }[] = [
  {
    frage: 'Wie viele Fahrräder gibt es in deiner Stadt? Beschreib, wie du zu einer Schätzung kommst.',
    beispiel: 'Ich fange bei den Einwohnern an, schätze die Haushalte und setze pro Haushalt etwa zwei Räder an. Dazu kommen Leihräder.',
  },
  {
    frage: 'Was hast du zuletzt gelernt, nur weil es dich interessiert hat?',
    beispiel: 'Wie Fahrpläne im Nahverkehr erstellt werden. Ich habe mir die offenen Daten unserer Stadtwerke angesehen und mich gewundert, wie viel Handarbeit drinsteckt.',
  },
  {
    frage: 'Wenn du eine Regel an deiner Hochschule ändern dürftest: Welche, und warum?',
    beispiel: 'Prüfungen dürften auch als Projekt im Team abgelegt werden. So lernt man, was man später wirklich braucht.',
  },
  {
    frage: 'Erklär einem zehnjährigen Kind, was eine Unternehmensberatung macht.',
    beispiel: 'Wenn eine Firma ein Problem hat und nicht weiterweiß, kommen wir, hören zu, rechnen nach und schlagen vor, was sie anders machen kann.',
  },
  {
    frage: 'Welche Entscheidung würdest du heute anders treffen, und was hast du daraus gelernt?',
    beispiel: 'Ich habe ein Gruppenprojekt allein fertig gemacht, statt früh um Hilfe zu bitten. Heute spreche ich Probleme in der ersten Woche an.',
  },
  {
    frage: 'Du hast eine Woche Zeit und 500 Euro für ein eigenes Projekt. Was machst du?',
    beispiel: 'Ich baue mit zwei Freunden eine Tauschbörse für Lehrbücher an unserer Uni und teste sie eine Woche in der Mensa.',
  },
]

export const sampleContact: Partial<Draft> = {
  vorname: 'Alex',
  nachname: 'Beispiel',
  email: 'alex.beispiel@uni-mail.de',
  telefon: '0151 2345678',
  geburtsjahr: '2003',
  geschlecht: 'keine Angabe',
  staatsangehoerigkeit: 'deutsch',
  wohnort: 'Münster',
}

/** Was die "KI" aus dem Lebenslauf liest. Im echten Produkt kommt das vom Backend. */
export const sampleExtraction: Partial<Draft> = {
  hochschule: 'Universität Münster',
  studiengang: 'Wirtschaftsinformatik (B. Sc.)',
  semester: '5',
  abschluss: 'Bachelor, voraussichtlich 2027',
  erfahrung: [
    { rolle: 'Werkstudent Datenanalyse', firma: 'Stadtwerke', zeitraum: '2025 – heute' },
    { rolle: 'Tutor Statistik I', firma: 'Universität', zeitraum: '2024 – 2025' },
  ],
  skills: ['Excel', 'Python', 'SQL', 'Präsentieren', 'Power BI'],
  sprachen: ['Deutsch (Muttersprache)', 'Englisch (C1)'],
}

/** Beispielantworten. Die zur Zufallsfrage hängt davon ab, welche Frage gezogen wurde. */
export function sampleMotivation(zufallFrage: string): Partial<Draft> {
  return {
    warum:
      'Ich will sehen, wie das, was ich im Studium lerne, in echten Unternehmen funktioniert, und dabei im Team Verantwortung übernehmen.',
    fach:
      'Ich würde mit Interviews in zwei, drei Abteilungen anfangen und nach Aufgaben suchen, die oft wiederholt werden und klare Daten haben. Dort lohnt sich KI am ehesten.',
    zufall: ZUFALL_FRAGEN.find((z) => z.frage === zufallFrage)?.beispiel ?? '',
  }
}

export type Slot = { id: string; day: string; date: string; times: string[] }

export const SLOTS: Slot[] = [
  { id: 'di', day: 'Dienstag', date: '17. November', times: ['10:00', '14:30', '17:00'] },
  { id: 'mi', day: 'Mittwoch', date: '18. November', times: ['09:30', '13:00'] },
  { id: 'do', day: 'Donnerstag', date: '19. November', times: ['11:00', '15:30', '18:00'] },
]

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
