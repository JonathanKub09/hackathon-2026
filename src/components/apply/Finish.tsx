import { useEffect, useState } from 'react'
import { ApiError, getApplicantStatus, submitApplication } from '../../lib/api.ts'
import type { ApplicantStatus } from '../../lib/types.ts'
import type { Draft } from './model.ts'
import { ORG, SLOTS, toApplication } from './model.ts'
import { ActionBar, Button, Header, Progress, Rise } from './ui.tsx'

type StepProps = {
  draft: Draft
  update: (patch: Partial<Draft>) => void
  onBack: () => void
  onNext: () => void
}

const erwartet = [
  ['Kennenlernen, 30 Minuten', 'Zwei Mitglieder aus dem Team, online oder bei uns im Büro. Du erzählst, wir erzählen.'],
  ['Ein kleiner Case', 'Eine echte Frage aus einem früheren Projekt. Keine Vorbereitung nötig, es geht ums Denken, nicht um die Lösung.'],
  ['Deine Fragen', 'Zeit, um alles zu fragen: Projekte, Aufwand neben dem Studium, wie es nach der Aufnahme weitergeht.'],
]

/* ---------- Terminabfrage, gestaltet wie die Startseite ---------- */

export function Termin({ draft, update, onBack, onNext }: StepProps) {
  const [none, setNone] = useState(draft.termin === 'Kein Termin passt')
  return (
    <div className="pb-28">
      <Header />
      <Progress current="termin" />

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pt-14 pb-20 sm:px-8 md:grid-cols-[1.1fr_1fr] md:items-end md:pt-20 md:pb-28">
        <Rise>
          <h1 className="text-[clamp(2.6rem,7.4vw,6rem)] font-semibold leading-[0.92] tracking-[-0.045em]">
            Lass uns reden.
          </h1>
        </Rise>
        <Rise i={1}>
          <p className="max-w-[40ch] text-xl leading-relaxed">
            Wenn deine Bewerbung passt, laden wir dich zum Kennenlernen ein. Sag uns jetzt schon, wann du kannst. Dann
            geht es danach schneller.
          </p>
        </Rise>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:py-28">
          <h2 className="text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
            Was erwartet dich?
          </h2>
          <dl className="space-y-7 text-lg leading-relaxed">
            {erwartet.map(([t, d]) => (
              <div key={t}>
                <dt className="text-xl font-semibold">{t}</dt>
                <dd className="mt-1 text-white/85">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <h2 className="text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.04em]">Wann passt es dir?</h2>
        <p className="mt-4 text-lg">Alle Termine sind 30 Minuten lang.</p>
        <div className="mt-10 grid gap-8 md:grid-cols-3" role="radiogroup" aria-label="Termin wählen">
          {SLOTS.map((s) => (
            <div key={s.id} className="bg-surface p-6">
              <p className="text-2xl font-semibold tracking-[-0.02em]">{s.day}</p>
              <p className="text-lg text-muted">{s.date}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {s.times.map((t) => {
                  const id = `${s.day}, ${s.date}, ${t} Uhr`
                  const active = draft.termin === id
                  return (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        setNone(false)
                        update({ termin: id })
                      }}
                      className={`h-11 rounded-full px-5 text-base font-medium tabular-nums transition-[transform,background-color,color] active:scale-95 ${
                        active ? 'bg-accent text-white' : 'bg-white text-ink hover:bg-surface-2'
                      }`}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <label className="mt-8 flex items-center gap-3 text-lg">
          <input
            type="checkbox"
            checked={none}
            onChange={(e) => {
              setNone(e.target.checked)
              update({ termin: e.target.checked ? 'Kein Termin passt' : null })
            }}
            className="size-5 accent-accent"
          />
          Keiner passt, schlagt mir einen anderen vor.
        </label>
      </section>

      <ActionBar wide onBack={onBack} onNext={onNext} nextDisabled={!draft.termin} />
    </div>
  )
}

/* ---------- Datenschutz und Absenden ---------- */

export function Absenden({ draft, update, onBack, onDone }: StepProps & { onDone: (token: string) => void }) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async () => {
    if (!draft.cvFile) return
    setSending(true)
    setError(null)
    try {
      const { token } = await submitApplication(toApplication(draft), draft.cvFile)
      onDone(token)
    } catch (e) {
      if (e instanceof ApiError && e.leaks.length) {
        setError(`In deinen Angaben für Recruiter steht noch: ${e.leaks.join(', ')}. Bitte entferne das in den Schritten davor.`)
      } else {
        setError(e instanceof Error ? e.message : 'Die Bewerbung konnte nicht gesendet werden.')
      }
      setSending(false)
    }
  }

  return (
    <div className="pb-28">
      <Header />
      <Progress current="absenden" />
      <main className="mx-auto max-w-5xl px-5 pt-14 sm:px-8">
        <Rise>
          <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.035em]">Alles bereit?</h1>
        </Rise>
        <Rise i={1}>
          <p className="mt-4 max-w-[60ch] text-lg leading-relaxed">Prüf ein letztes Mal, was wer zu sehen bekommt.</p>
        </Rise>

        <Rise i={2} className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <section className="bg-surface p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Das sehen die Recruiter</h2>
            <dl className="mt-5 space-y-4 text-lg">
              <div>
                <dt className="text-muted">Studium</dt>
                <dd>{[draft.studiengang, draft.hochschule, draft.semester && `${draft.semester}. Semester`].filter(Boolean).join(', ') || 'noch leer'}</dd>
              </div>
              <div>
                <dt className="text-muted">Erfahrung</dt>
                <dd>{draft.erfahrung.map((e) => e.rolle).filter(Boolean).join(', ') || 'noch leer'}</dd>
              </div>
              <div>
                <dt className="text-muted">Skills</dt>
                <dd>{draft.skills.join(', ') || 'noch leer'}</dd>
              </div>
              <div>
                <dt className="text-muted">Antworten</dt>
                <dd>{Object.values(draft.antworten).filter((a) => a.trim()).length} Fragen beantwortet</dd>
              </div>
            </dl>
          </section>
          <section className="bg-ink p-6 text-white sm:p-8">
            <h2 className="text-xl font-semibold">Das sehen nur wir</h2>
            <dl className="mt-5 space-y-4 text-lg">
              {[
                ['Name', `${draft.vorname} ${draft.nachname}`],
                ['E-Mail', draft.email],
                ['Telefon', draft.telefon],
                ['Geburtsjahr', draft.geburtsjahr],
                ['Wohnort', draft.wohnort],
                ['Lebenslauf', draft.cvFile?.name ?? 'nicht hochgeladen'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-white/70">{k}</dt>
                  <dd>{v.trim() || 'keine Angabe'}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-base text-white/80">Für Kontakt, Terminvergabe und eine anonyme Statistik zur Fairness.</p>
          </section>
        </Rise>

        <Rise i={3} className="mt-12 max-w-3xl space-y-5">
          <h2 className="text-xl font-semibold">Einwilligung</h2>
          <label className="flex gap-4 text-lg leading-relaxed">
            <input type="checkbox" checked={draft.consent} onChange={(e) => update({ consent: e.target.checked })} className="mt-1.5 size-5 shrink-0 accent-accent" />
            <span>
              Ich willige ein, dass {ORG} meine Angaben zur Durchführung des Bewerbungsverfahrens verarbeitet. Die{' '}
              <a href="#datenschutz" className="text-accent underline underline-offset-4">Datenschutzerklärung</a> habe ich gelesen.
              Pflicht.
            </span>
          </label>
          <label className="flex gap-4 text-lg leading-relaxed">
            <input type="checkbox" checked={draft.keepData} onChange={(e) => update({ keepData: e.target.checked })} className="mt-1.5 size-5 shrink-0 accent-accent" />
            <span>Meine Bewerbung darf zwölf Monate für spätere Bewerbungsrunden gespeichert bleiben. Freiwillig.</span>
          </label>
          {!draft.cvFile && <p className="text-base font-medium text-[#831c1e]">Es fehlt dein Lebenslauf, bitte geh zurück zum Anfang.</p>}
          {error && (
            <p role="alert" className="text-base font-medium text-[#831c1e]">
              {error}
            </p>
          )}
        </Rise>
      </main>
      <ActionBar
        wide
        onBack={onBack}
        onNext={send}
        nextDisabled={!draft.consent || !draft.cvFile || sending}
        nextLabel={sending ? 'Wird gesendet …' : 'Bewerbung absenden'}
      />
    </div>
  )
}

/* ---------- Bewerberprofil mit Status ---------- */

type Phase = 'done' | 'now' | 'next'

function timeline(a: ApplicantStatus): { t: string; d: string; state: Phase }[] {
  const received = new Date(a.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
  const screened = a.status !== 'not_rated'
  const decided = a.status === 'accepted' || a.status === 'rejected'
  const interview = a.interview_at
    ? new Date(a.interview_at).toLocaleString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
    : 'Termin folgt'

  return [
    { t: 'Bewerbung eingegangen', d: received, state: 'done' },
    { t: 'Screening durch das Recruiting-Team', d: screened ? 'Abgeschlossen' : 'Läuft', state: screened ? 'done' : 'now' },
    {
      t: 'Kennenlerngespräch',
      d: a.status === 'interview' ? interview : 'Wenn deine Bewerbung passt, laden wir dich ein',
      state: a.status === 'interview' ? 'now' : decided ? 'done' : 'next',
    },
    {
      t: 'Entscheidung',
      d: a.status === 'accepted' ? 'Zusage, herzlichen Glückwunsch' : a.status === 'rejected' ? 'Diesmal hat es leider nicht gepasst' : 'Wir melden uns bei dir',
      state: decided ? 'done' : 'next',
    },
  ]
}

export function Profil({ token, onRestart }: { token: string; onRestart: () => void }) {
  const [status, setStatus] = useState<ApplicantStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getApplicantStatus(token)
      .then(setStatus)
      .catch((e) => setError(e instanceof Error ? e.message : 'Dein Profil konnte nicht geladen werden.'))
  }, [token])

  if (error)
    return (
      <div>
        <Header />
        <main className="mx-auto max-w-3xl px-5 pt-14 sm:px-8">
          <h1 className="text-3xl font-semibold">{error}</h1>
          <Button className="mt-8" onClick={onRestart}>
            Zur Startseite
          </Button>
        </main>
      </div>
    )

  if (!status)
    return (
      <div>
        <Header />
        <p role="status" className="mx-auto max-w-3xl px-5 pt-14 text-lg sm:px-8">
          Dein Profil wird geladen …
        </p>
      </div>
    )

  const steps = timeline(status)
  return (
    <div>
      <Header right={<Button variant="ghost" onClick={onRestart}>Schließen</Button>} />
      <main className="mx-auto max-w-6xl px-5 pt-12 pb-24 sm:px-8 md:pt-20">
        <Rise>
          <h1 className="text-[clamp(2.4rem,6.4vw,5rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
            Hallo {status.first_name}, deine Bewerbung ist da.
          </h1>
        </Rise>
        <Rise i={1}>
          <p className="mt-6 max-w-[48ch] text-xl leading-relaxed">
            Die Recruiter kennen dich nur als <span className="font-semibold tabular-nums">{status.code}</span>. Speichere dir diese Seite als
            Lesezeichen, dann siehst du jederzeit, wo deine Bewerbung steht.
          </p>
        </Rise>

        <div className="mt-16 grid gap-12 md:grid-cols-[1.3fr_1fr]">
          <Rise i={2}>
            <section>
              <h2 className="text-2xl font-semibold tracking-[-0.02em]">Status deiner Bewerbung</h2>
              <ol className="mt-8">
                {steps.map((s, i) => (
                  <li key={s.t} className="relative grid grid-cols-[2rem_1fr] gap-4 pb-8 last:pb-0">
                    {i < steps.length - 1 && (
                      <span aria-hidden className={`absolute top-8 bottom-0 left-[0.95rem] w-1 ${s.state === 'done' ? 'bg-ink' : 'bg-surface-2'}`} />
                    )}
                    <span
                      aria-hidden
                      className={`relative z-[1] mt-0.5 grid size-8 place-items-center rounded-full text-sm font-semibold ${
                        s.state === 'done' ? 'bg-ink text-white' : s.state === 'now' ? 'bg-accent text-white' : 'bg-surface-2 text-muted'
                      }`}
                    >
                      {s.state === 'done' ? '✓' : ''}
                    </span>
                    <div>
                      <p className={`text-xl ${s.state === 'next' ? 'text-muted' : 'font-semibold'}`}>
                        {s.t}
                        {s.state === 'now' && <span className="sr-only"> (aktueller Schritt)</span>}
                      </p>
                      <p className="mt-0.5 text-base text-muted">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </Rise>

          <Rise i={3}>
            <section className="bg-ink p-6 text-white sm:p-8">
              <h2 className="text-xl font-semibold">Dein Wunschtermin</h2>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.02em]">{status.preferred_slot || 'Noch kein Termin gewählt'}</p>
              <p className="mt-2 text-base text-white/80">Wird bestätigt, sobald das Screening abgeschlossen ist.</p>
            </section>
          </Rise>
        </div>
      </main>
    </div>
  )
}
