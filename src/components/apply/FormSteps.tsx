import { useEffect, useRef, useState } from 'react'
import type { Draft, Experience } from './model.ts'
import { MOTIVATION_FRAGE, fachFrage, isEmail, sampleContact, sampleExtraction, sampleMotivation } from './model.ts'
import { Area, Button, Field, FormShell, Redact, Select } from './ui.tsx'

type StepProps = {
  draft: Draft
  update: (patch: Partial<Draft>) => void
  onBack: () => void
  onNext: () => void
}

function SampleLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-base font-medium text-accent underline underline-offset-4 hover:text-accent-dark">
      Beispieldaten einsetzen
    </button>
  )
}

/* ---------- Kontakt und demografische Daten ---------- */

export function Kontakt({ draft, update, onBack, onNext }: StepProps) {
  const set = (k: keyof Draft) => (e: { target: { value: string } }) => update({ [k]: e.target.value })
  const ok = draft.vorname.trim() && draft.nachname.trim() && isEmail(draft.email)
  return (
    <FormShell
      step="kontakt"
      title="Wie erreichen wir dich?"
      intro={
        <>
          <p>
            Diese Angaben bleiben bei uns. Recruiter sehen sie nicht, sie werden im nächsten Schritt geschwärzt.
          </p>
          <p className="mt-3">
            <SampleLink onClick={() => update(sampleContact)} />
          </p>
        </>
      }
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!ok}
    >
      <h2 className="text-xl font-semibold">Kontakt</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Vorname" autoComplete="given-name" value={draft.vorname} onChange={set('vorname')} />
        <Field label="Nachname" autoComplete="family-name" value={draft.nachname} onChange={set('nachname')} />
        <Field label="E-Mail" type="email" autoComplete="email" value={draft.email} onChange={set('email')} hint="Hierhin schicken wir den Link zu deinem Bewerberprofil." />
        <Field label="Telefon (optional)" type="tel" autoComplete="tel" value={draft.telefon} onChange={set('telefon')} />
      </div>

      <h2 className="mt-14 text-xl font-semibold">Demografische Angaben</h2>
      <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-muted">
        Freiwillig. Wir nutzen sie nur zusammengefasst, um zu prüfen, ob unsere Auswahl fair ist.
      </p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Geburtsjahr" inputMode="numeric" maxLength={4} value={draft.geburtsjahr} onChange={set('geburtsjahr')} />
        <Select label="Geschlecht" options={['weiblich', 'männlich', 'divers', 'keine Angabe']} value={draft.geschlecht} onChange={set('geschlecht')} />
        <Field label="Staatsangehörigkeit" value={draft.staatsangehoerigkeit} onChange={set('staatsangehoerigkeit')} />
        <Field label="Wohnort" autoComplete="address-level2" value={draft.wohnort} onChange={set('wohnort')} />
      </div>
    </FormShell>
  )
}

/* ---------- Anonymisieren und Lebenslauf hochladen ---------- */

function CvPreview({ draft, redacted }: { draft: Draft; redacted: boolean }) {
  const name = `${draft.vorname || 'Vorname'} ${draft.nachname || 'Nachname'}`
  return (
    <div className="aspect-[1/1.3] w-full bg-white p-5 text-[11px] leading-snug text-ink sm:p-7 sm:text-[13px]" aria-label="Vorschau deines Lebenslaufs">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[1.6em] font-semibold leading-tight">
            <Redact text={name} on={redacted} delay={0} />
          </p>
          <p className="mt-2">
            <Redact text={`${draft.wohnort || 'Wohnort'} · geb. ${draft.geburtsjahr || '2003'}`} on={redacted} delay={180} />
          </p>
          <p className="mt-1">
            <Redact text={draft.email || 'mail@beispiel.de'} on={redacted} delay={320} />
          </p>
        </div>
        <div className="relative aspect-[3/4] w-[22%] shrink-0 bg-surface-2">
          {redacted && <span aria-hidden className="absolute inset-0 origin-left animate-redact bg-ink" style={{ animationDelay: '440ms' }} />}
        </div>
      </div>
      <p className="mt-6 font-semibold">Ausbildung</p>
      <p className="mt-1">Universität Münster, Wirtschaftsinformatik, seit 2023</p>
      <p className="mt-1">
        Abitur, <Redact text="Gymnasium am Stadtpark" on={redacted} delay={560} />
      </p>
      <p className="mt-5 font-semibold">Erfahrung</p>
      <p className="mt-1">Werkstudent Datenanalyse, Stadtwerke, seit 2025</p>
      <p className="mt-1">Tutor Statistik I, 2024 bis 2025</p>
      <p className="mt-5 font-semibold">Skills</p>
      <p className="mt-1">Excel, Python, SQL, Power BI, Präsentieren</p>
      <p className="mt-5 font-semibold">Persönliches</p>
      <p className="mt-1">
        <Redact text="Familienstand ledig, Religion römisch-katholisch" on={redacted} delay={680} />
      </p>
    </div>
  )
}

export function Anonym({ draft, update, onBack, onNext }: StepProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const hasCv = !!draft.cvName
  const takeFile = (f?: File | null) => f && update({ cvName: f.name })

  const fields: [string, string][] = [
    ['Name', `${draft.vorname} ${draft.nachname}`],
    ['E-Mail', draft.email],
    ['Telefon', draft.telefon],
    ['Geburtsjahr', draft.geburtsjahr],
    ['Geschlecht', draft.geschlecht],
    ['Staatsangehörigkeit', draft.staatsangehoerigkeit],
    ['Wohnort', draft.wohnort],
  ]

  return (
    <FormShell
      step="anonym"
      wide
      title="Wir schwärzen alles, was nichts zählt."
      intro="Deine Kontaktdaten und demografischen Angaben werden für Recruiter unkenntlich gemacht. Das gilt auch für deinen Lebenslauf."
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!hasCv}
      nextLabel="Lebenslauf auslesen"
    >
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Deine Angaben aus Schritt eins</h2>
          <dl className="mt-5 space-y-3 bg-surface p-6 text-lg">
            {fields.map(([k, v], i) => (
              <div key={k} className="grid grid-cols-[10rem_1fr] gap-3 max-sm:grid-cols-1 max-sm:gap-0.5">
                <dt className="text-muted">{k}</dt>
                <dd className="min-w-0">
                  <Redact text={v} delay={200 + i * 110} />
                </dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-12 text-xl font-semibold">Lebenslauf hochladen</h2>
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDrag(true)
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDrag(false)
              takeFile(e.dataTransfer.files[0])
            }}
            className={`mt-5 flex flex-col items-start gap-4 p-6 transition-colors ${drag ? 'bg-accent text-white' : 'bg-surface'}`}
          >
            {hasCv ? (
              <>
                <p className="text-lg">
                  <span className="font-semibold">{draft.cvName}</span> ist hochgeladen und geschwärzt.
                </p>
                <Button variant="secondary" onClick={() => update({ cvName: null })}>
                  Andere Datei wählen
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg">PDF hierher ziehen oder auswählen, höchstens 5 MB.</p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => fileRef.current?.click()}>Datei auswählen</Button>
                  <Button variant="secondary" onClick={() => update({ cvName: 'Lebenslauf.pdf' })}>
                    Beispiel-Lebenslauf
                  </Button>
                </div>
              </>
            )}
            <input ref={fileRef} type="file" accept="application/pdf" className="sr-only" onChange={(e) => takeFile(e.target.files?.[0])} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold">{hasCv ? 'So sieht der Recruiter deinen Lebenslauf' : 'Vorschau deines Lebenslaufs'}</h2>
          <div className="mt-5 bg-surface-2 p-4 sm:p-6">
            <CvPreview draft={draft} redacted={hasCv} key={String(hasCv)} />
          </div>
        </div>
      </div>
    </FormShell>
  )
}

/* ---------- KI-Extraktion prüfen und ergänzen ---------- */

const READ_STEPS = ['Lebenslauf wird gelesen', 'Ausbildung erkannt', 'Erfahrung erkannt', 'Skills erkannt']

function ChipEditor({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [val, setVal] = useState('')
  const add = () => {
    const v = val.trim()
    if (v && !items.includes(v)) onChange([...items, v])
    setVal('')
  }
  return (
    <div>
      <p className="mb-3 text-[15px] font-medium">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {items.map((s) => (
          <li key={s} className="flex h-10 items-center gap-2 rounded-full bg-ink pr-1.5 pl-4 text-[15px] text-white">
            {s}
            <button
              type="button"
              aria-label={`${s} entfernen`}
              onClick={() => onChange(items.filter((x) => x !== s))}
              className="grid size-7 place-items-center rounded-full text-lg leading-none hover:bg-white/20"
            >
              ×
            </button>
          </li>
        ))}
        <li className="flex h-10 items-center rounded-full bg-surface pl-4">
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder={placeholder}
            aria-label={`${label} ergänzen`}
            className="w-36 bg-transparent text-[15px] outline-none"
          />
          <button type="button" onClick={add} className="h-10 rounded-full px-4 text-[15px] font-medium text-accent hover:bg-surface-2">
            Hinzufügen
          </button>
        </li>
      </ul>
    </div>
  )
}

export function Pruefen({ draft, update, onBack, onNext }: StepProps) {
  const [phase, setPhase] = useState(draft.hochschule ? READ_STEPS.length : 0)
  const loading = phase < READ_STEPS.length

  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => {
      if (phase === READ_STEPS.length - 1 && !draft.hochschule) update(sampleExtraction)
      setPhase((p) => p + 1)
    }, 650)
    return () => clearTimeout(t)
  }, [phase, loading, draft.hochschule, update])

  const set = (k: keyof Draft) => (e: { target: { value: string } }) => update({ [k]: e.target.value })
  const setExp = (i: number, patch: Partial<Experience>) =>
    update({ erfahrung: draft.erfahrung.map((x, j) => (j === i ? { ...x, ...patch } : x)) })

  if (loading)
    return (
      <FormShell step="pruefen" title="Einen Moment, wir lesen mit." onBack={onBack} onNext={onNext} nextDisabled>
        <div className="bg-surface p-8" role="status" aria-live="polite">
          <span className="block h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <span className="block h-full w-full origin-left animate-pulse-bar rounded-full bg-ink" />
          </span>
          <ul className="mt-8 space-y-3 text-lg">
            {READ_STEPS.map((s, i) => (
              <li key={s} className={`transition-opacity duration-300 ${i <= phase ? 'opacity-100' : 'opacity-30'}`}>
                {i < phase ? '✓ ' : ''}
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-base text-muted">Die KI sieht nur die geschwärzte Fassung deines Lebenslaufs.</p>
        </div>
      </FormShell>
    )

  return (
    <FormShell
      step="pruefen"
      title="Stimmt das so?"
      intro="Das haben wir aus deinem Lebenslauf gelesen. Korrigiere, was nicht passt, und ergänze, was fehlt. Genau diese Angaben sehen später die Recruiter."
      onBack={onBack}
      onNext={onNext}
    >
      <h2 className="text-xl font-semibold">Studium</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Hochschule" value={draft.hochschule} onChange={set('hochschule')} />
        <Field label="Studiengang" value={draft.studiengang} onChange={set('studiengang')} />
        <Field label="Fachsemester" inputMode="numeric" value={draft.semester} onChange={set('semester')} />
        <Field label="Angestrebter Abschluss" value={draft.abschluss} onChange={set('abschluss')} />
      </div>

      <h2 className="mt-14 text-xl font-semibold">Erfahrung</h2>
      <div className="mt-5 space-y-4">
        {draft.erfahrung.map((x, i) => (
          <div key={i} className="grid gap-4 bg-surface p-5 sm:grid-cols-[1.4fr_1fr_0.8fr_auto] sm:items-end">
            <Field label="Rolle" value={x.rolle} onChange={(e) => setExp(i, { rolle: e.target.value })} />
            <Field label="Bei" value={x.firma} onChange={(e) => setExp(i, { firma: e.target.value })} />
            <Field label="Zeitraum" value={x.zeitraum} onChange={(e) => setExp(i, { zeitraum: e.target.value })} />
            <Button variant="ghost" onClick={() => update({ erfahrung: draft.erfahrung.filter((_, j) => j !== i) })}>
              Entfernen
            </Button>
          </div>
        ))}
        <Button variant="secondary" onClick={() => update({ erfahrung: [...draft.erfahrung, { rolle: '', firma: '', zeitraum: '' }] })}>
          Erfahrung ergänzen
        </Button>
      </div>

      <h2 className="mt-14 text-xl font-semibold">Skills und Sprachen</h2>
      <div className="mt-5 space-y-8">
        <ChipEditor label="Skills" items={draft.skills} onChange={(skills) => update({ skills })} placeholder="z. B. Figma" />
        <ChipEditor label="Sprachen" items={draft.sprachen} onChange={(sprachen) => update({ sprachen })} placeholder="z. B. Spanisch (B1)" />
      </div>
    </FormShell>
  )
}

/* ---------- Offene Fragen zur Motivation ---------- */

export function Motivation({ draft, update, onBack, onNext }: StepProps) {
  const fach = fachFrage(draft.studiengang)
  const long = (v: string) => v.trim().length >= 20
  const ok = long(draft.warum) && long(draft.fach) && long(draft.zufall)
  return (
    <FormShell
      step="motivation"
      title="Drei Fragen an dich."
      intro={
        <>
          <p>
            Eine zu deiner Motivation, eine zu deinem Fach und eine zufällige, die nichts mit deinem Lebenslauf zu tun
            hat. Es gibt keine falschen Antworten, uns interessiert, wie du denkst.
          </p>
          <p className="mt-3">
            <SampleLink onClick={() => update(sampleMotivation(draft.zufallFrage))} />
          </p>
        </>
      }
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!ok}
    >
      <div className="space-y-12">
        <Area
          label={MOTIVATION_FRAGE}
          hint="Deine Motivation, in ein paar ehrlichen Sätzen."
          value={draft.warum}
          onChange={(e) => update({ warum: e.target.value })}
        />
        <Area
          label={fach.frage}
          hint={
            fach.fach
              ? `Passend zu deinem Studiengang ${draft.studiengang || ''} (${fach.fach}).`
              : 'Zu deinem Studium. Für deinen Studiengang haben wir noch keine eigene Frage.'
          }
          value={draft.fach}
          onChange={(e) => update({ fach: e.target.value })}
        />
        <Area
          label={draft.zufallFrage}
          hint="Zufällig ausgewählt, ohne Bezug zu deinem Lebenslauf. Jede Bewerbung bekommt eine andere."
          max={500}
          value={draft.zufall}
          onChange={(e) => update({ zufall: e.target.value })}
        />
      </div>
      <p className="mt-6 text-base text-muted">Alle drei Antworten brauchen mindestens 20 Zeichen.</p>
    </FormShell>
  )
}
