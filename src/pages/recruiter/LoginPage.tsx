import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Demo: keine echte Anmeldung. Beide Schritte leiten nur weiter.
export default function LoginPage() {
  const [step, setStep] = useState<'password' | 'code'>('password')
  const navigate = useNavigate()

  const field = 'mt-1 h-9 w-full rounded-md border border-control bg-surface px-3 text-sm outline-none focus:border-accent'

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-6">
        <p className="text-sm font-semibold">Recruiting</p>
        {step === 'password' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setStep('code')
            }}
          >
            <h1 className="mt-4 text-xl font-semibold">Anmelden</h1>
            <p className="mt-1 text-sm text-muted">Nur für Screener.</p>
            <label className="mt-5 block text-sm">
              E-Mail
              <input type="email" className={field} defaultValue="lena@beratung.example" />
            </label>
            <label className="mt-3 block text-sm">
              Passwort
              <input type="password" className={field} defaultValue="demo-passwort" />
            </label>
            <button className="mt-5 h-9 w-full rounded-md bg-primary text-sm font-medium text-white hover:bg-black">
              Weiter
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              navigate('/recruiter')
            }}
          >
            <h1 className="mt-4 text-xl font-semibold">Bestätigungscode</h1>
            <p className="mt-1 text-sm text-muted">Gib den 6-stelligen Code aus deiner Authenticator-App ein.</p>
            <input
              inputMode="numeric"
              maxLength={6}
              autoFocus
              placeholder="123456"
              className={`${field} mt-5 text-center text-lg tracking-[0.4em] tabular-nums`}
            />
            <button className="mt-5 h-9 w-full rounded-md bg-primary text-sm font-medium text-white hover:bg-black">
              Bestätigen
            </button>
            <button type="button" onClick={() => setStep('password')} className="mt-2 h-9 w-full text-sm text-muted hover:text-ink">
              Zurück
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
