import { useState } from 'react'
import type { Draft } from './model.ts'
import { ORG, SLOTS } from './model.ts'
import { ActionBar, Button, Header, Progress, Redact, Rise } from './ui.tsx'

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
      <Header right={<span className="text-sm text-muted">Gespeichert als Entwurf</span>} />
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
        <p className="mt-4 text-lg">Alle Termine sind 30 Minuten lang. Du kannst ihn später im Bewerberprofil ändern.</p>
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

export function Absenden({ draft, update, onBack, onNext }: StepProps) {
  const [sending, setSending] = useState(false)
  const send = () => {
    setSending(true)
    setTimeout(onNext, 1100)
  }
  return (
    <div className="pb-28">
      <Header right={<span className="text-sm text-muted">Gespeichert als Entwurf</span>} />
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
                <dd>
                  {[draft.warum, draft.fach, draft.zufall].filter((a) => a.trim()).length} von 3 Fragen beantwortet:
                  Motivation, Fachfrage, Zufallsfrage
                </dd>
              </div>
              <div>
                <dt className="text-muted">Lebenslauf</dt>
                <dd>{draft.cvName ? `${draft.cvName}, geschwärzt` : 'nicht hochgeladen'}</dd>
              </div>
            </dl>
          </section>
          <section className="bg-ink p-6 text-white sm:p-8">
            <h2 className="text-xl font-semibold">Das sehen nur wir</h2>
            <dl className="mt-5 space-y-4 text-lg">
              {[
                ['Name', `${draft.vorname} ${draft.nachname}`],
                ['E-Mail', draft.email],
                ['Geburtsjahr', draft.geburtsjahr],
                ['Wohnort', draft.wohnort],
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
        </Rise>
      </main>
      <ActionBar
        wide
        onBack={onBack}
        onNext={send}
        nextDisabled={!draft.consent || sending}
        nextLabel={sending ? 'Wird gesendet …' : 'Bewerbung absenden'}
      />
    </div>
  )
}

/* ---------- Link im Postfach ---------- */

export function Postfach({ draft, onNext }: { draft: Draft; onNext: () => void }) {
  const [resent, setResent] = useState(false)
  return (
    <div>
      <Header />
      <main className="mx-auto grid max-w-6xl gap-12 px-5 pt-14 pb-24 sm:px-8 md:grid-cols-[1fr_1.1fr] md:pt-24">
        <div>
          <Rise>
            <h1 className="text-[clamp(2.6rem,7vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.045em]">Schau in dein Postfach.</h1>
          </Rise>
          <Rise i={1}>
            <p className="mt-8 max-w-[40ch] text-xl leading-relaxed">
              Deine Bewerbung ist da. Wir haben dir an <span className="font-semibold">{draft.email || 'deine E-Mail-Adresse'}</span> einen Link
              geschickt. Damit schaltest du dein Bewerberprofil frei.
            </p>
          </Rise>
          <Rise i={2} className="mt-8">
            <Button variant="secondary" onClick={() => setResent(true)} disabled={resent}>
              {resent ? 'Neu gesendet' : 'Keine Mail? Erneut senden'}
            </Button>
          </Rise>
        </div>

        <Rise i={3}>
          <article className="bg-surface p-3 sm:p-4" aria-label="Beispiel der E-Mail">
            <div className="bg-white p-6 sm:p-8">
              <p className="text-base text-muted">Von {ORG}, gerade eben</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">Bestätige deine Bewerbung</h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed">
                <p>Hallo {draft.vorname || 'du'},</p>
                <p>danke für deine Bewerbung. Bestätige deine E-Mail-Adresse, dann siehst du in deinem Profil jederzeit, wo deine Bewerbung gerade steht.</p>
              </div>
              <Button onClick={onNext} className="mt-8">
                Profil freischalten
              </Button>
              <p className="mt-6 text-sm text-muted">Der Link ist 48 Stunden gültig.</p>
            </div>
          </article>
        </Rise>
      </main>
    </div>
  )
}

/* ---------- Bewerberprofil mit Status ---------- */

const STATUS = [
  { t: 'Bewerbung eingegangen', d: '6. November 2026', state: 'done' },
  { t: 'Anonymisiert und geprüft', d: '6. November 2026', state: 'done' },
  { t: 'Screening durch das Recruiting-Team', d: 'Läuft, meist innerhalb einer Woche', state: 'now' },
  { t: 'Kennenlerngespräch', d: 'Dein Wunschtermin ist vorgemerkt', state: 'next' },
  { t: 'Entscheidung', d: 'Wir melden uns per Mail und hier', state: 'next' },
] as const

export function Profil({ draft, onRestart }: { draft: Draft; onRestart: () => void }) {
  return (
    <div>
      <Header right={<Button variant="ghost" onClick={onRestart}>Abmelden</Button>} />
      <main className="mx-auto max-w-6xl px-5 pt-12 pb-24 sm:px-8 md:pt-20">
        <Rise>
          <h1 className="text-[clamp(2.4rem,6.4vw,5rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
            Hallo {draft.vorname || 'du'}, wir lesen gerade.
          </h1>
        </Rise>
        <Rise i={1}>
          <p className="mt-6 max-w-[48ch] text-xl leading-relaxed">
            Deine Bewerbung ist im Screening. Die Recruiter kennen dich bisher nur als <span className="font-semibold tabular-nums">BW-2611-0427</span>.
          </p>
        </Rise>

        <div className="mt-16 grid gap-12 md:grid-cols-[1.3fr_1fr]">
          <Rise i={2}>
            <section>
              <h2 className="text-2xl font-semibold tracking-[-0.02em]">Status deiner Bewerbung</h2>
              <ol className="mt-8">
                {STATUS.map((s, i) => (
                  <li key={s.t} className="relative grid grid-cols-[2rem_1fr] gap-4 pb-8 last:pb-0">
                    {i < STATUS.length - 1 && (
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

          <Rise i={3} className="space-y-6">
            <section className="bg-ink p-6 text-white sm:p-8">
              <h2 className="text-xl font-semibold">Dein Wunschtermin</h2>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.02em]">{draft.termin || 'Noch kein Termin gewählt'}</p>
              <p className="mt-2 text-base text-white/80">Wird bestätigt, sobald das Screening abgeschlossen ist.</p>
              <Button variant="invert" className="mt-6">
                Termin ändern
              </Button>
            </section>
            <section className="bg-surface p-6 sm:p-8">
              <h2 className="text-xl font-semibold">So sehen dich die Recruiter</h2>
              <dl className="mt-4 space-y-2 text-lg">
                <div className="flex flex-wrap gap-x-3">
                  <dt className="text-muted">Name</dt>
                  <dd>
                    <Redact text={`${draft.vorname} ${draft.nachname}`} delay={400} />
                  </dd>
                </div>
                <div className="flex flex-wrap gap-x-3">
                  <dt className="text-muted">Skills</dt>
                  <dd>{draft.skills.slice(0, 4).join(', ') || 'keine'}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                <Button variant="ghost" className="px-0!">
                  Angaben ansehen
                </Button>
                <Button variant="ghost" className="px-0! text-muted">
                  Bewerbung zurückziehen
                </Button>
              </div>
            </section>
          </Rise>
        </div>
      </main>
    </div>
  )
}
