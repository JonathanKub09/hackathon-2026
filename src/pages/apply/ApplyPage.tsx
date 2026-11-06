// Rolle 2: Bewerber-Strecke als klickbares Mockup. Siehe docs/rollen/2-frontend-bewerber.md
// Alle Daten sind lokal und werden nicht an Supabase gesendet.
import { useCallback, useEffect, useState } from 'react'
import { Anonym, Kontakt, Motivation, Pruefen } from '../../components/apply/FormSteps.tsx'
import { Absenden, Postfach, Profil, Termin } from '../../components/apply/Finish.tsx'
import { Start, Touchpoint } from '../../components/apply/Entry.tsx'
import type { Draft, Step } from '../../components/apply/model.ts'
import { STEP_LABELS, STEPS, newDraft, sampleContact, sampleExtraction, sampleMotivation } from '../../components/apply/model.ts'

function readStep(): Step {
  const s = window.location.hash.slice(1) as Step
  return STEPS.includes(s) ? s : 'touchpoint'
}

/** Wer per Mockup-Leiste mitten hineinspringt, bekommt Beispieldaten, damit kein Bildschirm leer ist. */
function withSamples(s: Step, d: Draft): Draft {
  const later = STEPS.indexOf(s) > STEPS.indexOf('anonym')
  if (!later || d.vorname) return d
  return { ...d, ...sampleContact, cvName: 'Lebenslauf.pdf', ...sampleExtraction, ...sampleMotivation(d.zufallFrage) }
}

/** Leiste nur fürs Mockup: springt direkt zu jedem Bildschirm. */
function MockupBar({ step, go }: { step: Step; go: (s: Step) => void }) {
  return (
    <div className="bg-ink text-white">
      <label className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-2 text-sm sm:px-8">
        <span className="font-medium">Mockup</span>
        <select value={step} onChange={(e) => go(e.target.value as Step)} className="min-w-0 flex-1 bg-transparent py-1 text-white outline-none sm:flex-none">
          {STEPS.map((s, i) => (
            <option key={s} value={s} className="text-ink">
              {i + 1}. {STEP_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default function ApplyPage() {
  const [step, setStep] = useState<Step>(readStep)
  const [draft, setDraft] = useState<Draft>(() => withSamples(readStep(), newDraft()))

  const update = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), [])

  const go = useCallback((s: Step) => {
    window.location.hash = s
    setStep(s)
    setDraft((d) => withSamples(s, d))
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const onHash = () => {
      const s = readStep()
      setStep(s)
      setDraft((d) => withSamples(s, d))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const nav = (back: Step, next: Step) => ({ draft, update, onBack: () => go(back), onNext: () => go(next) })

  return (
    <>
      <MockupBar step={step} go={go} />
      <div key={step}>
        {step === 'touchpoint' && <Touchpoint onOpen={() => go('start')} />}
        {step === 'start' && <Start onStart={() => go('kontakt')} />}
        {step === 'kontakt' && <Kontakt {...nav('start', 'anonym')} />}
        {step === 'anonym' && <Anonym {...nav('kontakt', 'pruefen')} />}
        {step === 'pruefen' && <Pruefen {...nav('anonym', 'motivation')} />}
        {step === 'motivation' && <Motivation {...nav('pruefen', 'termin')} />}
        {step === 'termin' && <Termin {...nav('motivation', 'absenden')} />}
        {step === 'absenden' && <Absenden {...nav('termin', 'postfach')} />}
        {step === 'postfach' && <Postfach draft={draft} onNext={() => go('profil')} />}
        {step === 'profil' && (
          <Profil
            draft={draft}
            onRestart={() => {
              setDraft(newDraft())
              go('touchpoint')
            }}
          />
        )}
      </div>
    </>
  )
}
