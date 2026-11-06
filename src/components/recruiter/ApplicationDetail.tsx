import { CRITERIA, MAX_TOTAL, totalOf, type MockApplication, type Score } from '../../pages/recruiter/mockData.ts'
import { useScores } from './scoresContext.ts'
import { formatDateTime, formatDay, Initials, StatusPill } from './ui.tsx'

type Props = { application: MockApplication; onClose: () => void }

function Scoring({ code }: { code: string }) {
  const { scores, setScore } = useScores()
  const mine = scores[code] ?? {}
  const total = totalOf(mine)

  return (
    <section className="mt-6 rounded-lg bg-ground p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">Bewertung</h3>
        <p className="text-sm tabular-nums">
          <span className="text-lg font-semibold">{total ?? '–'}</span>
          <span className="text-muted"> / {MAX_TOTAL} Punkte</span>
        </p>
      </div>

      <div className="mt-3 space-y-4">
        {CRITERIA.map((c) => {
          const value = mine[c.id]
          return (
            <fieldset key={c.id}>
              <div className="flex items-baseline justify-between gap-3">
                <legend className="text-sm font-medium">{c.label}</legend>
                <span className="text-xs text-muted">{c.basis}</span>
              </div>
              <div className="mt-1.5 grid grid-cols-4 gap-1">
                {([1, 2, 3, 4] as Score[]).map((n) => (
                  <button
                    key={n}
                    type="button"
                    title={c.levels[n - 1]}
                    aria-pressed={value === n}
                    onClick={() => setScore(code, c.id, n)}
                    className={`h-8 rounded-md text-sm font-medium tabular-nums transition-colors ${
                      value === n
                        ? 'bg-accent text-white'
                        : 'border border-control bg-surface text-ink hover:border-accent'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 min-h-5 text-xs text-muted">
                {value ? c.levels[value - 1] : 'Noch nicht bewertet.'}
              </p>
            </fieldset>
          )
        })}
      </div>

      <details className="mt-4 text-xs">
        <summary className="cursor-pointer text-muted hover:text-ink">Alle Kriterien anzeigen</summary>
        <dl className="mt-3 space-y-3">
          {CRITERIA.map((c) => (
            <div key={c.id}>
              <dt className="font-medium">
                {c.label} <span className="font-normal text-muted">({c.basis})</span>
              </dt>
              <dd>
                <ol className="mt-1 space-y-0.5">
                  {c.levels.map((l, i) => (
                    <li key={l} className="grid grid-cols-[16px_1fr] gap-1">
                      <span className="font-medium tabular-nums">{i + 1}</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ol>
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  )
}

export default function ApplicationDetail({ application: a, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-black/20" onClick={onClose}>
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-surface px-6 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
        aria-label={`Bewerbung ${a.code}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tabular-nums">{a.code}</h2>
            <p className="mt-0.5 text-sm text-muted">Trainee · eingegangen am {formatDay(a.receivedAt)}</p>
          </div>
          <button onClick={onClose} className="h-8 rounded-md border border-control px-3 text-sm hover:bg-raised">
            Schließen
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <StatusPill status={a.status} />
          <Initials code={a.screener} />
          {a.interviewAt && <span className="text-sm text-muted">Interview {formatDateTime(a.interviewAt)}</span>}
        </div>

        <p className="mt-5 rounded-md bg-ground px-3 py-2 text-xs text-muted">
          Name, Kontaktdaten und demografische Angaben sind für Screener ausgeblendet.
        </p>

        <section className="mt-6">
          <h3 className="text-sm font-semibold">Antworten</h3>
          <dl className="mt-2 space-y-4">
            {a.motivation.map((m, i) => (
              <div key={m.question}>
                <dt className="text-xs text-muted">
                  Frage {i + 1} · {m.question}
                </dt>
                <dd className="mt-1 text-sm leading-6">{m.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-semibold">Ausbildung</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {a.education.map((e) => (
              <li key={e.degree}>
                {e.degree}
                <span className="text-muted">
                  {' '}
                  · {e.institution}
                  {e.semester ? `, ${e.semester}. Semester` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-semibold">Berufserfahrung</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {a.experience.map((e) => (
              <li key={e.role}>
                {e.role}
                <span className="text-muted">
                  {' '}
                  · {e.organization}, {e.period}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-semibold">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {a.skills.map((s) => (
              <span key={s} className="rounded bg-raised px-2 py-0.5 text-xs">
                {s}
              </span>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted">{a.languages.join(', ')}</p>
        </section>

        <Scoring code={a.code} />
      </aside>
    </div>
  )
}
