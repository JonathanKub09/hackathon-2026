// Mock-Daten für die Screener-Ansicht. Wird später durch Supabase ersetzt.
// Enthält bewusst keine Namen, Kontaktdaten oder demografischen Daten.

export type Status = 'eingegangen' | 'in_pruefung' | 'interview' | 'zusage' | 'absage'

export type MockApplication = {
  code: string
  receivedAt: string // ISO-Datum
  status: Status
  screener: string | null // Kürzel des zuständigen Screeners
  interviewAt?: string
  education: { degree: string; institution: string; semester?: number }[]
  experience: { role: string; organization: string; period: string }[]
  skills: string[]
  languages: string[]
  motivation: { question: string; answer: string }[]
}

export const STATUS_COLUMNS: { id: Status; label: string }[] = [
  { id: 'eingegangen', label: 'Eingegangen' },
  { id: 'in_pruefung', label: 'In Prüfung' },
  { id: 'interview', label: 'Interview' },
  { id: 'zusage', label: 'Zusage' },
  { id: 'absage', label: 'Absage' },
]

export const SCREENER = { firstName: 'Lena', code: 'LK' }

export const TODAY = '2026-11-06'

const Q1 = 'Motivation: Warum möchtest du bei uns als Trainee starten?'
const Q2 = 'Fachfrage: Beschreibe ein Problem, das du strukturiert gelöst hast. Wie bist du vorgegangen, und was kam heraus?'

export const TIMELINE = [
  { label: 'Bewerbungsphase', from: '2026-10-20', to: '2026-11-15' },
  { label: 'Screening', from: '2026-11-07', to: '2026-11-20' },
  { label: 'Interviews', from: '2026-11-18', to: '2026-11-28' },
  { label: 'Assessment Day', from: '2026-12-05', to: '2026-12-05' },
  { label: 'Zusagen', from: '2026-12-07', to: '2026-12-12' },
]

export const APPLICATIONS: MockApplication[] = [
  {
    code: 'B-014',
    receivedAt: '2026-11-06',
    status: 'eingegangen',
    screener: null,
    education: [{ degree: 'B.Sc. Wirtschaftsingenieurwesen', institution: 'Technische Universität', semester: 5 }],
    experience: [{ role: 'Werkstudent Controlling', organization: 'Mittelständischer Maschinenbauer', period: '2025 – heute' }],
    skills: ['Excel-Modellierung', 'SQL', 'Präsentieren'],
    languages: ['Deutsch (C2)', 'Englisch (C1)'],
    motivation: [
      { question: Q1, answer: 'Im Controlling sehe ich jeden Tag Zahlen, aber selten, was daraus entschieden wird. Ich will an der Stelle mitarbeiten, wo aus der Analyse eine Empfehlung wird.' },
      { question: Q2, answer: 'Ein Kostenmodell für eine neue Fertigungslinie, das ich in drei Wochen neben dem Semester gebaut habe.' },
    ],
  },
  {
    code: 'B-013',
    receivedAt: '2026-11-06',
    status: 'eingegangen',
    screener: null,
    education: [{ degree: 'B.Sc. Informatik', institution: 'Universität', semester: 3 }],
    experience: [{ role: 'Tutor Programmieren 1', organization: 'Fachbereich Informatik', period: '2026' }],
    skills: ['TypeScript', 'React', 'Datenbanken'],
    languages: ['Deutsch (C1)', 'Englisch (C1)', 'Türkisch (Muttersprache)'],
    motivation: [
      { question: Q1, answer: 'Ich möchte Software bauen, die wirklich jemand benutzt, und nicht nur Übungsblätter abgeben.' },
      { question: Q2, answer: 'Eine App für unsere WG, die Einkäufe und Putzplan verwaltet. Sie läuft seit einem Jahr.' },
    ],
  },
  {
    code: 'B-012',
    receivedAt: '2026-11-05',
    status: 'eingegangen',
    screener: null,
    education: [{ degree: 'B.A. Politikwissenschaft', institution: 'Universität', semester: 4 }],
    experience: [{ role: 'Vorstand Fachschaft', organization: 'Fachschaft Sozialwissenschaften', period: '2025 – heute' }],
    skills: ['Moderation', 'Recherche', 'Projektorganisation'],
    languages: ['Deutsch (C2)', 'Englisch (B2)', 'Französisch (B1)'],
    motivation: [
      { question: Q1, answer: 'Ich habe in der Fachschaft gemerkt, dass ich gern Gruppen zu einer Entscheidung bringe. Das möchte ich mit echten Kunden üben.' },
      { question: Q2, answer: 'Die Organisation einer Podiumsdiskussion mit 300 Gästen und vier Parteien.' },
    ],
  },
  {
    code: 'B-011',
    receivedAt: '2026-11-05',
    status: 'eingegangen',
    screener: null,
    education: [{ degree: 'B.A. Medienwissenschaft', institution: 'Universität', semester: 2 }],
    experience: [{ role: 'Social-Media-Betreuung', organization: 'Sportverein', period: '2024 – heute' }],
    skills: ['Content-Planung', 'Fotografie', 'Canva'],
    languages: ['Deutsch (C2)', 'Englisch (C1)'],
    motivation: [
      { question: Q1, answer: 'Ich habe den Instagram-Kanal meines Vereins von 200 auf 2.000 Follower gebracht und will das jetzt für etwas Größeres machen.' },
      { question: Q2, answer: 'Eine Kampagne für unser Vereinsjubiläum mit Video, Plakaten und einem Fest.' },
    ],
  },
  {
    code: 'B-010',
    receivedAt: '2026-11-05',
    status: 'eingegangen',
    screener: null,
    education: [{ degree: 'M.Sc. Betriebswirtschaftslehre', institution: 'Universität', semester: 1 }],
    experience: [{ role: 'Praktikum Strategie', organization: 'Energieversorger', period: '2026, 6 Monate' }],
    skills: ['Marktanalyse', 'PowerPoint', 'Python-Grundlagen'],
    languages: ['Deutsch (C2)', 'Englisch (C1)', 'Spanisch (B2)'],
    motivation: [
      { question: Q1, answer: 'Im Praktikum habe ich nur einen Teil eines Projekts gesehen. Hier möchte ich ein Projekt von Anfang bis Ende begleiten.' },
      { question: Q2, answer: 'Eine Marktanalyse für Wärmepumpen in Süddeutschland, die der Vorstand übernommen hat.' },
    ],
  },
  {
    code: 'B-009',
    receivedAt: '2026-11-03',
    status: 'in_pruefung',
    screener: 'LK',
    education: [{ degree: 'B.Sc. Volkswirtschaftslehre', institution: 'Universität', semester: 5 }],
    experience: [{ role: 'Hilfskraft am Lehrstuhl', organization: 'Lehrstuhl für Empirische Ökonomie', period: '2025 – heute' }],
    skills: ['Statistik', 'R', 'Wissenschaftliches Schreiben'],
    languages: ['Deutsch (C2)', 'Englisch (C1)'],
    motivation: [
      { question: Q1, answer: 'Ich will herausfinden, ob mir Beratung mehr liegt als Forschung, bevor ich mich für einen Master entscheide.' },
      { question: Q2, answer: 'Meine Bachelorarbeit zu Mietpreisen, für die ich einen eigenen Datensatz aufgebaut habe.' },
    ],
  },
  {
    code: 'B-008',
    receivedAt: '2026-11-02',
    status: 'in_pruefung',
    screener: 'MS',
    education: [{ degree: 'B.Sc. Wirtschaftsinformatik', institution: 'Hochschule', semester: 4 }],
    experience: [{ role: 'Werkstudent IT-Support', organization: 'Versicherung', period: '2025 – heute' }],
    skills: ['Python', 'Automatisierung', 'Notion'],
    languages: ['Deutsch (C2)', 'Englisch (B2)'],
    motivation: [
      { question: Q1, answer: 'Euer Recruiting läuft über drei Tools. Ich hätte Lust, das in eins zu bringen.' },
      { question: Q2, answer: 'Ein Skript, das bei meinem Arbeitgeber 200 Support-Tickets pro Woche vorsortiert.' },
    ],
  },
  {
    code: 'B-007',
    receivedAt: '2026-10-31',
    status: 'in_pruefung',
    screener: 'LK',
    education: [{ degree: 'B.Sc. Maschinenbau', institution: 'Technische Universität', semester: 6 }],
    experience: [{ role: 'Teamleitung Antrieb', organization: 'Formula-Student-Team', period: '2024 – heute' }],
    skills: ['Projektleitung', 'CAD', 'Budgetplanung'],
    languages: ['Deutsch (C2)', 'Englisch (C1)'],
    motivation: [
      { question: Q1, answer: 'Im Rennteam leite ich zwölf Leute und ein Budget. Ich will lernen, wie man das in Unternehmen ohne Rennstrecke macht.' },
      { question: Q2, answer: 'Den Antriebsstrang unseres Wagens in einer Saison von Verbrenner auf Elektro umzustellen.' },
    ],
  },
  {
    code: 'B-006',
    receivedAt: '2026-10-30',
    status: 'in_pruefung',
    screener: 'JR',
    education: [{ degree: 'B.A. BWL mit Schwerpunkt Marketing', institution: 'Hochschule', semester: 3 }],
    experience: [{ role: 'Aushilfe Eventagentur', organization: 'Eventagentur', period: '2025' }],
    skills: ['Eventplanung', 'Texten', 'Adobe Premiere'],
    languages: ['Deutsch (C2)', 'Englisch (C1)', 'Italienisch (B1)'],
    motivation: [
      { question: Q1, answer: 'Ich mag es, wenn eine Idee am Ende als Veranstaltung im Raum steht und Leute kommen.' },
      { question: Q2, answer: 'Ein Firmenjubiläum mit 500 Gästen, bei dem ich den Ablauf am Abend verantwortet habe.' },
    ],
  },
  {
    code: 'B-005',
    receivedAt: '2026-10-28',
    status: 'interview',
    screener: 'LK',
    interviewAt: '2026-11-18T10:00',
    education: [{ degree: 'B.Sc. Wirtschaftsmathematik', institution: 'Universität', semester: 5 }],
    experience: [{ role: 'Praktikum Data Analytics', organization: 'Handelskonzern', period: '2026, 3 Monate' }],
    skills: ['Datenanalyse', 'Python', 'Tableau'],
    languages: ['Deutsch (C2)', 'Englisch (C1)'],
    motivation: [
      { question: Q1, answer: 'Mich interessiert, welche Frage hinter einer Analyse steckt, nicht nur das Dashboard.' },
      { question: Q2, answer: 'Eine Absatzprognose für 40 Filialen, die die Fehlmengen um ein Fünftel gesenkt hat.' },
    ],
  },
  {
    code: 'B-004',
    receivedAt: '2026-10-26',
    status: 'interview',
    screener: 'MS',
    interviewAt: '2026-11-19T14:00',
    education: [{ degree: 'B.A. International Business', institution: 'Hochschule', semester: 5 }],
    experience: [{ role: 'Auslandssemester', organization: 'Partneruniversität in Spanien', period: '2025' }],
    skills: ['Interkulturelle Teams', 'Präsentieren', 'Excel'],
    languages: ['Deutsch (C2)', 'Englisch (C1)', 'Spanisch (C1)'],
    motivation: [
      { question: Q1, answer: 'Ich habe im Ausland in gemischten Teams gearbeitet und will das in echten Projekten weitermachen.' },
      { question: Q2, answer: 'Eine Fallstudie mit einem spanischen Start-up, die wir vor dessen Gründern präsentiert haben.' },
    ],
  },
  {
    code: 'B-003',
    receivedAt: '2026-10-24',
    status: 'interview',
    screener: 'JR',
    interviewAt: '2026-11-20T11:30',
    education: [{ degree: 'B.Sc. Medieninformatik', institution: 'Hochschule', semester: 5 }],
    experience: [{ role: 'Freelancer Webentwicklung', organization: 'Selbstständig', period: '2023 – heute' }],
    skills: ['Webentwicklung', 'UX-Design', 'Supabase'],
    languages: ['Deutsch (C2)', 'Englisch (C1)'],
    motivation: [
      { question: Q1, answer: 'Ich baue seit drei Jahren Websites für kleine Firmen und will jetzt in einem festen Team arbeiten.' },
      { question: Q2, answer: 'Ein Buchungssystem für eine Physiotherapie-Praxis, das die Telefonzeiten halbiert hat.' },
    ],
  },
  {
    code: 'B-002',
    receivedAt: '2026-10-22',
    status: 'zusage',
    screener: 'LK',
    education: [{ degree: 'B.Sc. Wirtschaftsingenieurwesen', institution: 'Technische Universität', semester: 7 }],
    experience: [{ role: 'Praktikum Operations', organization: 'Logistikdienstleister', period: '2025, 6 Monate' }],
    skills: ['Prozessanalyse', 'Lean', 'Workshop-Leitung'],
    languages: ['Deutsch (C2)', 'Englisch (C1)'],
    motivation: [
      { question: Q1, answer: 'Ich will Prozesse nicht nur auf Papier verbessern, sondern mit den Leuten, die sie jeden Tag machen.' },
      { question: Q2, answer: 'Ein Umbau der Kommissionierung im Lager, bei dem ich die Workshops mit dem Schichtteam geleitet habe.' },
    ],
  },
  {
    code: 'B-001',
    receivedAt: '2026-10-21',
    status: 'absage',
    screener: 'MS',
    education: [{ degree: 'B.Sc. Biologie', institution: 'Universität', semester: 3 }],
    experience: [{ role: 'Nebenjob Gastronomie', organization: 'Café', period: '2024 – heute' }],
    skills: ['Laborarbeit', 'Teamarbeit'],
    languages: ['Deutsch (C2)', 'Englisch (B2)'],
    motivation: [
      { question: Q1, answer: 'Ich möchte einmal ausprobieren, wie Beratung von innen aussieht.' },
      { question: Q2, answer: 'Ein Laborprojekt zu Bodenproben, bei dem wir die Methode zweimal umstellen mussten.' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Bewertung: vier Kriterien, je 1–4 Punkte, maximal 16

export type CriterionId = 'motivation' | 'fachfrage' | 'erfahrung' | 'skills'
export type Score = 1 | 2 | 3 | 4
export type Scores = Partial<Record<CriterionId, Score>>

export const CRITERIA: { id: CriterionId; label: string; basis: string; levels: [string, string, string, string] }[] = [
  {
    id: 'motivation',
    label: 'Motivation',
    basis: 'Antwort auf Frage 1',
    levels: [
      'Allgemein, kein Bezug zu uns oder zur Trainee-Zeit.',
      'Nachvollziehbar, aber austauschbar.',
      'Konkret, mit eigenem Beispiel.',
      'Konkret, mit eigenem Beispiel und klarer Vorstellung von der Trainee-Zeit.',
    ],
  },
  {
    id: 'fachfrage',
    label: 'Fachfrage',
    basis: 'Antwort auf Frage 2',
    levels: [
      'Kein strukturiertes Vorgehen erkennbar.',
      'Vorgehen erkennbar, Ergebnis bleibt unklar.',
      'Strukturiertes Vorgehen mit nachvollziehbarem Ergebnis.',
      'Strukturiert, Ergebnis belegt, eigene Rolle klar benannt.',
    ],
  },
  {
    id: 'erfahrung',
    label: 'Berufserfahrung',
    basis: 'Stationen aus dem Lebenslauf',
    levels: [
      'Keine relevante Erfahrung.',
      'Nebenjob, Ehrenamt oder Hochschulgruppe.',
      'Praktikum oder Werkstudium mit Bezug zu Beratung.',
      'Mehrere relevante Stationen oder echte Verantwortung (Team, Budget).',
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    basis: 'Aufgelistete Skills und Sprachen',
    levels: [
      'Kaum Skills, die in Projekten helfen.',
      'Einzelne passende Skills.',
      'Mehrere passende Skills, teils durch Erfahrung belegt.',
      'Breites Profil, durch Erfahrung belegt.',
    ],
  },
]

export const MAX_TOTAL = CRITERIA.length * 4

export function totalOf(scores: Scores | undefined) {
  if (!scores) return null
  const values = Object.values(scores)
  if (values.length === 0) return null
  return values.reduce((sum, v) => sum + v, 0)
}

export const INITIAL_SCORES: Record<string, Scores> = {
  'B-009': { motivation: 3, fachfrage: 4, erfahrung: 2 },
  'B-008': { motivation: 3, fachfrage: 3, erfahrung: 3, skills: 3 },
  'B-007': { motivation: 4, fachfrage: 4, erfahrung: 3, skills: 3 },
  'B-006': { motivation: 3 },
  'B-005': { motivation: 3, fachfrage: 4, erfahrung: 3, skills: 4 },
  'B-004': { motivation: 3, fachfrage: 3, erfahrung: 2, skills: 3 },
  'B-003': { motivation: 3, fachfrage: 4, erfahrung: 4, skills: 4 },
  'B-002': { motivation: 4, fachfrage: 4, erfahrung: 3, skills: 4 },
  'B-001': { motivation: 1, fachfrage: 2, erfahrung: 1, skills: 1 },
}

// ---------------------------------------------------------------------------
// Personenbezogene Daten: nur in der Admin-Ansicht (später Tabelle applicant_private)

export const PRIVATE: Record<string, { name: string; email: string }> = {
  'B-014': { name: 'Jonas Becker', email: 'jonas.becker@uni.example' },
  'B-013': { name: 'Elif Yıldız', email: 'elif.yildiz@uni.example' },
  'B-012': { name: 'Clara Neumann', email: 'clara.neumann@uni.example' },
  'B-011': { name: 'Mia Hoffmann', email: 'mia.hoffmann@uni.example' },
  'B-010': { name: 'David Schulz', email: 'david.schulz@uni.example' },
  'B-009': { name: 'Paul Wagner', email: 'paul.wagner@uni.example' },
  'B-008': { name: 'Nina Krüger', email: 'nina.krueger@uni.example' },
  'B-007': { name: 'Tim Richter', email: 'tim.richter@uni.example' },
  'B-006': { name: 'Sofia Romano', email: 'sofia.romano@uni.example' },
  'B-005': { name: 'Lukas Braun', email: 'lukas.braun@uni.example' },
  'B-004': { name: 'Laura Fischer', email: 'laura.fischer@uni.example' },
  'B-003': { name: 'Felix Wolf', email: 'felix.wolf@uni.example' },
  'B-002': { name: 'Hannah Schmitt', email: 'hannah.schmitt@uni.example' },
  'B-001': { name: 'Max Weber', email: 'max.weber@uni.example' },
}
