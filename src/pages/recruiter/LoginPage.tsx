import { useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useRecruiting } from '../../components/recruiter/recruitingContext.ts'
import { ApiError, claimInvite, getOAuthProviders, registerStaff, signIn, signInWithProvider, signOut } from '../../lib/api.ts'
import type { OAuthProvider } from '../../lib/types.ts'

const field = 'mt-1 h-9 w-full rounded-md border border-control bg-surface px-3 text-sm outline-none focus:border-accent'
const primary = 'mt-5 h-9 w-full rounded-md bg-primary text-sm font-medium text-white hover:bg-black disabled:opacity-50'
const secondary = 'mt-2 h-9 w-full text-sm text-muted hover:text-ink'

function ErrorText({ text }: { text: string | null }) {
  if (!text) return null
  return (
    <p role="alert" className="mt-3 text-sm text-[#831c1e]">
      {text}
    </p>
  )
}

/** Angemeldet, aber noch nicht im Team: zum Beispiel direkt nach dem ersten Google-Login. */
function ClaimForm() {
  const { refresh } = useRecruiting()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      await claimInvite(code, name)
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Der Code konnte nicht eingelöst werden.')
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <h1 className="mt-4 text-xl font-semibold">Fast geschafft</h1>
      <p className="mt-1 text-sm text-muted">Dein Konto gehört noch nicht zum Team. Den Einladungscode bekommst du vom Recruiting-Team.</p>
      <label className="mt-5 block text-sm">
        Name
        <input autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} className={field} />
      </label>
      <label className="mt-3 block text-sm">
        Einladungscode
        <input autoComplete="off" required value={code} onChange={(e) => setCode(e.target.value)} className={field} />
      </label>
      <ErrorText text={error} />
      <button disabled={sending} className={primary}>
        {sending ? 'Einen Moment …' : 'Code einlösen'}
      </button>
      <button type="button" onClick={() => signOut()} className={secondary}>
        Abmelden
      </button>
    </form>
  )
}

export default function LoginPage() {
  const { me, signedIn, loading, refresh } = useRecruiting()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [providers, setProviders] = useState<OAuthProvider[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getOAuthProviders().then(setProviders).catch(console.error)
  }, [])

  const registering = mode === 'register'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      if (registering) await registerStaff({ email, password, display_name: name, code })
      else await signIn(email, password)
      await refresh()
    } catch (err) {
      if (registering) setError(err instanceof ApiError ? err.message : 'Das Konto konnte nicht angelegt werden.')
      else setError('E-Mail oder Passwort stimmen nicht.')
    }
    setSending(false)
  }

  const oauth = async (provider: OAuthProvider) => {
    setError(null)
    try {
      await signInWithProvider(provider.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Anmeldung ist fehlgeschlagen.')
    }
  }

  if (!loading && me) return <Navigate to="/recruiter" replace />

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-6">
        <p className="text-sm font-semibold">Recruiting</p>
        {signedIn ? (
          <ClaimForm />
        ) : (
          <>
            <form onSubmit={submit}>
              <h1 className="mt-4 text-xl font-semibold">{registering ? 'Konto erstellen' : 'Anmelden'}</h1>
              <p className="mt-1 text-sm text-muted">
                {registering ? 'Den Einladungscode bekommst du vom Recruiting-Team.' : 'Nur für Screener und Admins.'}
              </p>
              {registering && (
                <label className="mt-5 block text-sm">
                  Name
                  <input autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} className={field} />
                </label>
              )}
              <label className={`${registering ? 'mt-3' : 'mt-5'} block text-sm`}>
                E-Mail
                <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
              </label>
              <label className="mt-3 block text-sm">
                Passwort
                <input
                  type="password"
                  autoComplete={registering ? 'new-password' : 'current-password'}
                  required
                  minLength={registering ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={field}
                />
              </label>
              {registering && (
                <label className="mt-3 block text-sm">
                  Einladungscode
                  <input autoComplete="off" required value={code} onChange={(e) => setCode(e.target.value)} className={field} />
                </label>
              )}
              <ErrorText text={error} />
              <button disabled={sending} className={primary}>
                {sending ? 'Einen Moment …' : registering ? 'Konto erstellen' : 'Anmelden'}
              </button>
            </form>
            {providers.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => oauth(provider)}
                className="mt-2 h-9 w-full rounded-md border border-control bg-surface text-sm font-medium hover:bg-raised"
              >
                Weiter mit {provider.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMode(registering ? 'login' : 'register')
                setError(null)
              }}
              className={secondary}
            >
              {registering ? 'Ich habe schon ein Konto' : 'Neu hier? Konto erstellen'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
