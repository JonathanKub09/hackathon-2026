import { useState } from 'react'

// Demo-Inhalte. Die echten Leitfäden ergänzt das Recruiting-Team.
const GUIDES = [
  {
    id: 'screening',
    label: 'Screening',
    steps: [
      'Neue Bewerbungen im Kanban unter „Eingegangen“ öffnen.',
      'Antworten, Berufserfahrung und Skills lesen. Namen und demografische Daten sind bewusst ausgeblendet.',
      'Alle vier Kriterien mit 1–4 Punkten bewerten. Im Zweifel die Beschreibung der Stufe lesen.',
      'Ab 11 von 16 Punkten für ein Interview vorschlagen, darunter mit kurzer Begründung absagen.',
      'Jede Bewerbung innerhalb von 5 Tagen screenen.',
    ],
  },
  {
    id: 'interview',
    label: 'Interview',
    steps: [
      'Interviews führen immer zwei Personen, eine davon aus dem Vorstand.',
      'Ablauf (30 Minuten): Vorstellung, Fragen zur Motivation, eine kurze Fallfrage, Fragen der Bewerberin oder des Bewerbers.',
      'Direkt danach gemeinsam bewerten, solange der Eindruck frisch ist.',
      'Ergebnis an den Admin melden, der den Status setzt.',
    ],
  },
  {
    id: 'assessment',
    label: 'Assessment Day',
    steps: [
      'Findet einmal pro Semester statt, alle Kandidatinnen und Kandidaten am selben Tag.',
      'Gruppenaufgabe mit Präsentation vor einer Jury aus aktiven Mitgliedern.',
      'Jede Jury-Person bewertet einzeln, danach gemeinsame Abstimmung.',
    ],
  },
  {
    id: 'entscheidung',
    label: 'Zusage und Absage',
    steps: [
      'Der Admin setzt den finalen Status in der Auswertung.',
      'Zusagen telefonisch und per E-Mail, Absagen per E-Mail mit kurzem Feedback.',
      'Neue Trainees bekommen eine Patin oder einen Paten und starten mit dem Onboarding-Wochenende.',
    ],
  },
]

export default function HowToPage() {
  const [active, setActive] = useState(GUIDES[0].id)
  const guide = GUIDES.find((g) => g.id === active)!

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-[-0.01em]">How-to</h1>
      <p className="mt-1 text-sm text-muted">So laufen unsere Recruiting-Prozesse ab.</p>

      <div role="tablist" className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {GUIDES.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={g.id === active}
            onClick={() => setActive(g.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm ${
              g.id === active ? 'border-ink font-medium text-ink' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <section role="tabpanel" className="mt-5 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-base font-semibold">How to {guide.label}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
          {guide.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>
    </div>
  )
}
