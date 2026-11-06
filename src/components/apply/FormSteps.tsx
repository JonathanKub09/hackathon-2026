import { useRef, useState } from 'react'
import { ApiError, checkCv } from '../../lib/api.ts'
import type { Question } from '../../lib/types.ts'
import type { Draft, Experience } from './model.ts'
import { fromCheck, isEmail, isPhone } from './model.ts'
import { Area, Button, Field, FormShell, Select } from './ui.tsx'

type StepProps = {
  draft: Draft
  update: (patch: Partial<Draft>) => void
  onBack: () => void
  onNext: () => void
}

/* ---------- Lebenslauf hochladen und auslesen ---------- */

export function Lebenslauf({ draft, update, onBack, onNext }: StepProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const takeFile = (f?: File | null) => {
    if (!f) return
    setError(null)
    update({ cvFile: f })
  }

  const read = async () => {
    if (!draft.cvFile) return
    setReading(true)
    setError(null)
    try {
      update(fromCheck(await checkCv(draft.cvFile)))
      onNext()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Der Lebenslauf konnte nicht gelesen werden.')
    } finally {
      setReading(false)
    }
  }

  return (
    <FormShell
      step="lebenslauf"
      title="Fang mit deinem Lebenslauf an."
      intro="Wir füllen damit die nächsten Schritte für dich aus, du musst nur noch die Lücken ergänzen. Recruiter sehen deinen Lebenslauf nie, sondern nur die Angaben, die du gleich selbst prüfst."
      onBack={onBack}
      onNext={read}
      nextDisabled={!draft.cvFile || reading}
      nextLabel={reading ? 'Wird gelesen …' : 'Lebenslauf auslesen'}
    >
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
        className={`flex flex-col items-start gap-4 p-6 transition-colors ${drag ? 'bg-accent text-white' : 'bg-surface'}`}
      >
        {draft.cvFile ? (
          <>
            <p className="text-lg">
              <span className="font-semibold">{draft.cvFile.name}</span> ist ausgewählt.
            </p>
            <Button variant="secondary" onClick={() => update({ cvFile: null })}>
              Andere Datei wählen
            </Button>
          </>
        ) : (
          <>
            <p className="text-lg">PDF hierher ziehen oder auswählen, höchstens 5 MB.</p>
            <Button onClick={() => fileRef.current?.click()}>Datei auswählen</Button>
          </>
        )}
        <input ref={fileRef} type="file" accept="application/pdf" className="sr-only" onChange={(e) => takeFile(e.target.files?.[0])} />
      </div>
      {error && (
        <p role="alert" className="mt-4 text-base font-medium text-[#831c1e]">
          {error}
        </p>
      )}
    </FormShell>
  )
}

/* ---------- Kontakt und demografische Daten ---------- */

export function Kontakt({ draft, update, onBack, onNext }: StepProps) {
  const set = (k: keyof Draft) => (e: { target: { value: string } }) => update({ [k]: e.target.value })
  const ok = draft.vorname.trim() && draft.nachname.trim() && isEmail(draft.email) && isPhone(draft.telefon)
  return (
    <FormShell
      step="kontakt"
      title="Wie erreichen wir dich?"
      intro="Diese Angaben bleiben bei uns. Recruiter sehen sie nicht, sie kennen dich nur unter einem Kürzel."
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!ok}
    >
      {draft.cvHinweis && <p className="mb-8 bg-surface p-5 text-lg">{draft.cvHinweis}</p>}
      <h2 className="text-xl font-semibold">Kontakt</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Vorname" autoComplete="given-name" value={draft.vorname} onChange={set('vorname')} />
        <Field label="Nachname" autoComplete="family-name" value={draft.nachname} onChange={set('nachname')} />
        <Field label="E-Mail" type="email" autoComplete="email" value={draft.email} onChange={set('email')} />
        <Field
          label="Telefon"
          type="tel"
          autoComplete="tel"
          value={draft.telefon}
          onChange={set('telefon')}
          hint="Aus deinem Namen und den letzten vier Ziffern entsteht dein Kürzel."
        />
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

/* ---------- Ausgelesene Angaben prüfen und ergänzen ---------- */

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
  const set = (k: keyof Draft) => (e: { target: { value: string } }) => update({ [k]: e.target.value })
  const setExp = (i: number, patch: Partial<Experience>) =>
    update({ erfahrung: draft.erfahrung.map((x, j) => (j === i ? { ...x, ...patch } : x)) })

  return (
    <FormShell
      step="pruefen"
      title="Stimmt das so?"
      intro="Das haben wir aus deinem Lebenslauf gelesen. Korrigiere, was nicht passt, und ergänze, was fehlt. Genau diese Angaben sehen später die Recruiter, schreib hier also weder deinen Namen noch Kontaktdaten hinein."
      onBack={onBack}
      onNext={onNext}
    >
      <h2 className="text-xl font-semibold">Studium</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Hochschule" value={draft.hochschule} onChange={set('hochschule')} />
        <Field label="Studiengang" value={draft.studiengang} onChange={set('studiengang')} />
        <Field label="Fachsemester" inputMode="numeric" maxLength={2} value={draft.semester} onChange={set('semester')} />
        <Field label="Angestrebter Abschluss" value={draft.abschluss} onChange={set('abschluss')} />
        <Field label="Voraussichtlicher Abschluss" placeholder="MM/JJJJ" value={draft.abschlussDatum} onChange={set('abschlussDatum')} />
      </div>

      <h2 className="mt-14 text-xl font-semibold">Erfahrung</h2>
      <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-muted">Markiere die Stationen, die für uns am wichtigsten sind.</p>
      <div className="mt-5 space-y-4">
        {draft.erfahrung.map((x, i) => (
          <div key={i} className="bg-surface p-5">
            <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr_0.8fr_auto] sm:items-end">
              <Field label="Rolle" value={x.rolle} onChange={(e) => setExp(i, { rolle: e.target.value })} />
              <Field label="Bei" value={x.firma} onChange={(e) => setExp(i, { firma: e.target.value })} />
              <Field label="Zeitraum" placeholder="MM/JJJJ - MM/JJJJ" value={x.zeitraum} onChange={(e) => setExp(i, { zeitraum: e.target.value })} />
              <Button variant="ghost" onClick={() => update({ erfahrung: draft.erfahrung.filter((_, j) => j !== i) })}>
                Entfernen
              </Button>
            </div>
            <label className="mt-4 flex items-center gap-3 text-base">
              <input type="checkbox" checked={x.relevant} onChange={(e) => setExp(i, { relevant: e.target.checked })} className="size-5 accent-accent" />
              Besonders relevant
            </label>
          </div>
        ))}
        <Button
          variant="secondary"
          onClick={() => update({ erfahrung: [...draft.erfahrung, { rolle: '', firma: '', zeitraum: '', details: [], relevant: false }] })}
        >
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

/* ---------- Die drei festen Fragen ---------- */

export function Motivation({ draft, update, onBack, onNext, questions }: StepProps & { questions: Question[] }) {
  const long = (v?: string) => (v ?? '').trim().length >= 20
  const ok = questions.length > 0 && questions.every((q) => long(draft.antworten[q.id]))
  return (
    <FormShell
      step="motivation"
      title={questions.length === 3 ? 'Drei Fragen an dich.' : 'Ein paar Fragen an dich.'}
      intro="Es gibt keine falschen Antworten, uns interessiert, wie du denkst. Schreib deinen Namen bitte nicht in die Antworten, die Recruiter lesen sie anonym."
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!ok}
    >
      <div className="space-y-12">
        {questions.map((q) => (
          <Area
            key={q.id}
            label={q.text}
            max={q.max_length}
            value={draft.antworten[q.id] ?? ''}
            onChange={(e) => update({ antworten: { ...draft.antworten, [q.id]: e.target.value } })}
          />
        ))}
      </div>
      <p className="mt-6 text-base text-muted">Jede Antwort braucht mindestens 20 Zeichen.</p>
    </FormShell>
  )
}
