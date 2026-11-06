import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useRecruiting } from '../../components/recruiter/recruitingContext.ts'
import { ApiError, registerStaff, signIn, signOut } from '../../lib/api.ts'
import { supabase } from '../../lib/supabase.ts'

export default function LoginPage() {
  const { me, loading, refresh } = useRecruiting()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registering = mode === 'register'
  const field = 'mt-1 h-9 w-full rounded-md border border-control bg-surface px-3 text-sm outline-none focus:border-accent'

  const login = async () => {
    try {
      await signIn(email, password)
    } catch {
      setError('E-Mail oder Passwort stimmen nicht.')
      return
    }
    const { data } = await supabase.from('staff').select('role').maybeSingle()
    if (data) {
      await refresh()
    } else {
      await signOut()
      setError('Dieses Konto gehört nicht zum Recruiting-Team.')
    }
  }

  const register = async () => {
    try {
      await registerStaff({ email, password, display_name: name, code })
      await refresh()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Das Konto konnte nicht angelegt werden.')
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    await (registering ? register() : login())
    setSending(false)
  }

  if (!loading && me) return <Navigate to="/recruiter" replace />

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-6">
        <p className="text-sm font-semibold">Recruiting</p>
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
          {error && (
            <p role="alert" className="mt-3 text-sm text-[#831c1e]">
              {error}
            </p>
          )}
          <button disabled={sending} className="mt-5 h-9 w-full rounded-md bg-primary text-sm font-medium text-white hover:bg-black disabled:opacity-50">
            {sending ? 'Einen Moment …' : registering ? 'Konto erstellen' : 'Anmelden'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(registering ? 'login' : 'register')
              setError(null)
            }}
            className="mt-2 h-9 w-full text-sm text-muted hover:text-ink"
          >
            {registering ? 'Ich habe schon ein Konto' : 'Neu hier? Konto erstellen'}
          </button>
        </form>
      </div>
    </main>
  )
}
