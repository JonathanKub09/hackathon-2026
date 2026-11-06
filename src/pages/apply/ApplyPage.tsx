// Rolle 2: Bewerber-Strecke. Abläufe und Aufrufe stehen in docs/schnittstelle.md
import { useCallback, useEffect, useState } from 'react'
import { Lebenslauf, Kontakt, Motivation, Pruefen } from '../../components/apply/FormSteps.tsx'
import { Absenden, Profil, Termin } from '../../components/apply/Finish.tsx'
import { Start, Touchpoint } from '../../components/apply/Entry.tsx'
import type { Draft, Step } from '../../components/apply/model.ts'
import { STEPS, newDraft } from '../../components/apply/model.ts'
import { getQuestions } from '../../lib/api.ts'
import type { Question } from '../../lib/types.ts'

function readToken() {
  return new URLSearchParams(window.location.search).get('token')
}

function readStep(): Step {
  if (readToken()) return 'profil'
  const s = window.location.hash.slice(1) as Step
  return STEPS.includes(s) && s !== 'profil' ? s : 'start'
}

export default function ApplyPage() {
  const [step, setStep] = useState<Step>(readStep)
  const [draft, setDraft] = useState<Draft>(newDraft)
  const [token, setToken] = useState<string | null>(readToken)
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    getQuestions().then(setQuestions).catch(console.error)
  }, [])

  const update = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), [])

  const go = useCallback((s: Step) => {
    window.location.hash = s
    setStep(s)
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const onHash = () => setStep(readStep())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const nav = (back: Step, next: Step) => ({ draft, update, onBack: () => go(back), onNext: () => go(next) })

  // Der Link mit dem Zugang führt später direkt wieder zum Bewerberprofil.
  const finish = (newToken: string) => {
    window.history.replaceState(null, '', `?token=${newToken}`)
    setToken(newToken)
    setDraft(newDraft())
    setStep('profil')
    window.scrollTo(0, 0)
  }

  const restart = () => {
    window.history.replaceState(null, '', window.location.pathname)
    setToken(null)
    setDraft(newDraft())
    setStep('start')
  }

  return (
    <div key={step}>
      {step === 'touchpoint' && <Touchpoint onOpen={() => go('start')} />}
      {step === 'start' && <Start onStart={() => go('lebenslauf')} />}
      {step === 'lebenslauf' && <Lebenslauf {...nav('start', 'kontakt')} />}
      {step === 'kontakt' && <Kontakt {...nav('lebenslauf', 'pruefen')} />}
      {step === 'pruefen' && <Pruefen {...nav('kontakt', 'motivation')} />}
      {step === 'motivation' && <Motivation {...nav('pruefen', 'termin')} questions={questions} />}
      {step === 'termin' && <Termin {...nav('motivation', 'absenden')} />}
      {step === 'absenden' && <Absenden {...nav('termin', 'absenden')} onDone={finish} />}
      {step === 'profil' && token && <Profil token={token} onRestart={restart} />}
    </div>
  )
}
