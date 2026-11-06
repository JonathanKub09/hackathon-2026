import { useCallback, useEffect, useState } from 'react'
import { getApplicationDetails, getMyRating, getReviews, submitRating } from '../../lib/api.ts'
import type { ApplicationDetails, Scores, ScreeningReview } from '../../lib/types.ts'
import { MAX_SCORE } from '../../pages/recruiter/config.ts'
import { useRecruiting } from './recruitingContext.ts'
import { formatDateTime, formatDay, StatusPill, studyLine } from './ui.tsx'

type Props = { id: string; onClose: () => void }

function Scoring({ id, submitted, onSubmitted }: { id: string; submitted: Scores | null; onSubmitted: () => void }) {
  const { criteria } = useRecruiting()
  const [scores, setScores] = useState<Scores>(submitted ?? {})
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const locked = submitted !== null
  const complete = criteria.every((c) => scores[c.id])

  const send = async () => {
    setSending(true)
    setError(null)
    try {
      await submitRating(id, scores, comment.trim() || undefined)
      onSubmitted()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Die Bewertung konnte nicht gespeichert werden.')
      setSending(false)
    }
  }

  return (
    <section className="mt-6 rounded-lg bg-ground p-4">
      <h3 className="text-sm font-semibold">{locked ? 'Deine Bewertung' : 'Bewertung'}</h3>

      <div className="mt-3 space-y-4">
        {criteria.map((c) => {
          const value = scores[c.id]
          return (
            <fieldset key={c.id} disabled={locked}>
              <div className="flex items-baseline justify-between gap-3">
                <legend className="text-sm font-medium">{c.label}</legend>
                <span className="text-xs text-muted">{c.basis}</span>
              </div>
              <div className="mt-1.5 grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    title={c.levels[n - 1]}
                    aria-pressed={value === n}
                    onClick={() => setScores((prev) => ({ ...prev, [c.id]: n }))}
                    className={`h-8 rounded-md text-sm font-medium tabular-nums transition-colors ${
                      value === n
                        ? 'bg-accent text-white'
                        : 'border border-control bg-surface text-ink hover:border-accent disabled:hover:border-control'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 min-h-5 text-xs text-muted">{value ? c.levels[value - 1] : 'Noch nicht bewertet.'}</p>
            </fieldset>
          )
        })}
      </div>

      {!locked && (
        <>
          <label className="mt-4 block text-sm">
            Kommentar (optional)
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 min-h-16 w-full rounded-md border border-control bg-surface p-2 text-sm outline-none focus:border-accent"
            />
          </label>
          {error && (
            <p role="alert" className="mt-2 text-sm text-[#831c1e]">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={send}
            disabled={!complete || sending}
            className="mt-3 h-9 w-full rounded-md bg-primary text-sm font-medium text-white hover:bg-black disabled:opacity-40"
          >
            {sending ? 'Wird gespeichert …' : 'Bewertung abgeben'}
          </button>
          <p className="mt-2 text-xs text-muted">Nach dem Abgeben lässt sich die Bewertung nicht mehr ändern.</p>
        </>
      )}
    </section>
  )
}

function Reviews({ reviews }: { reviews: ScreeningReview[] }) {
  const { criteria } = useRecruiting()
  return (
    <section className="mt-6">
      <h3 className="text-sm font-semibold">Einschätzungen</h3>
      <ul className="mt-2 space-y-3">
        {reviews.map((r) => {
          const scores = (r.scores ?? {}) as Scores
          return (
            <li key={r.screener_name} className="rounded-md bg-ground px-3 py-2 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{r.screener_name}</span>
                <span className="tabular-nums">
                  {r.weighted_score?.toFixed(2)} <span className="text-muted">/ {MAX_SCORE}</span>
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">{criteria.map((c) => `${c.label} ${scores[c.id] ?? '–'}`).join(' · ')}</p>
              {r.comment && <p className="mt-1">{r.comment}</p>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default function ApplicationDetail({ id, onClose }: Props) {
  const { applications, refresh } = useRecruiting()
  const [details, setDetails] = useState<ApplicationDetails | null>(null)
  const [mine, setMine] = useState<Scores | null>(null)
  const [reviews, setReviews] = useState<ScreeningReview[]>([])
  const [error, setError] = useState<string | null>(null)

  const a = applications.find((item) => item.id === id)

  const load = useCallback(async () => {
    const [application, myRating, allReviews] = await Promise.all([getApplicationDetails(id), getMyRating(id), getReviews(id)])
    setDetails(application)
    setMine(myRating.length ? Object.fromEntries(myRating.map((r) => [r.criterion_id, r.score])) : null)
    setReviews(allReviews)
  }, [id])

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : 'Die Bewerbung konnte nicht geladen werden.'))
  }, [load])

  const afterRating = () => {
    load().catch(console.error)
    refresh().catch(console.error)
  }

  const answers = [...(details?.answers ?? [])].sort((x, y) => (x.questions?.position ?? 0) - (y.questions?.position ?? 0))

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-black/20" onClick={onClose}>
      <aside
        className="h-full w-full max-w-lg overflow-y-auto bg-surface px-6 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
        aria-label={`Bewerbung ${a?.code ?? ''}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tabular-nums">{a?.code}</h2>
            {a?.created_at && <p className="mt-0.5 text-sm text-muted">Eingegangen am {formatDay(a.created_at)}</p>}
          </div>
          <button onClick={onClose} className="h-8 rounded-md border border-control px-3 text-sm hover:bg-raised">
            Schließen
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-[#831c1e]">
            {error}
          </p>
        )}

        {a && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
            {a.status && <StatusPill status={a.status} />}
            <span className="tabular-nums">
              {a.reviews_done} von {a.reviews_required} Bewertungen
            </span>
            {a.score !== null && (
              <span className="tabular-nums">
                Schnitt <span className="font-semibold text-ink">{a.score?.toFixed(2)}</span> / {MAX_SCORE}
              </span>
            )}
            {a.interview_at && <span>Interview {formatDateTime(a.interview_at)}</span>}
            {!a.interview_at && a.preferred_slot && <span>Wunschtermin: {a.preferred_slot}</span>}
          </div>
        )}

        <p className="mt-5 rounded-md bg-ground px-3 py-2 text-xs text-muted">
          Name, Kontaktdaten, demografische Angaben und der Lebenslauf sind für Screener ausgeblendet.
        </p>

        {details && (
          <>
            <section className="mt-6">
              <h3 className="text-sm font-semibold">Antworten</h3>
              <dl className="mt-2 space-y-4">
                {answers.map((m, i) => (
                  <div key={m.questions?.text ?? i}>
                    <dt className="text-xs text-muted">
                      Frage {i + 1} · {m.questions?.text}
                    </dt>
                    <dd className="mt-1 text-sm leading-6">{m.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-6">
              <h3 className="text-sm font-semibold">Studium und Ausbildung</h3>
              <p className="mt-2 text-sm">
                {studyLine(details.application)}
                <span className="text-muted">
                  {[
                    details.application.university,
                    details.application.semester && `${details.application.semester}. Semester`,
                    details.application.expected_graduation && `Abschluss ${details.application.expected_graduation}`,
                  ]
                    .filter(Boolean)
                    .map((part) => ` · ${part}`)
                    .join('')}
                </span>
              </p>
              <ul className="mt-1 space-y-1 text-sm">
                {details.educations.map((e) => (
                  <li key={e.id}>
                    {e.title}
                    <span className="text-muted">
                      {' '}
                      · {e.organization}, {e.start_date} – {e.end_date}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-6">
              <h3 className="text-sm font-semibold">Berufserfahrung</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {details.experiences.map((e) => (
                  <li key={e.id}>
                    <span className={e.is_relevant ? 'font-semibold' : ''}>{e.title}</span>
                    {e.is_relevant && <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-xs text-[#0a4c55]">Besonders relevant</span>}
                    <span className="text-muted">
                      {' '}
                      · {e.organization}, {e.start_date} – {e.end_date}
                    </span>
                    {e.details.length > 0 && <p className="text-xs text-muted">{e.details.join(' ')}</p>}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-6">
              <h3 className="text-sm font-semibold">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {details.application.skills.map((s) => (
                  <span key={s} className="rounded bg-raised px-2 py-0.5 text-xs">
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted">{details.application.languages.join(', ')}</p>
            </section>

            {a?.is_assigned && <Scoring key={String(mine !== null)} id={id} submitted={mine} onSubmitted={afterRating} />}
            {reviews.length > 0 && <Reviews reviews={reviews} />}
          </>
        )}
      </aside>
    </div>
  )
}
