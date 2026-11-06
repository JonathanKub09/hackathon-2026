import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useRecruiting } from '../../components/recruiter/recruitingContext.ts'
import { signIn, signOut } from '../../lib/api.ts'
import { supabase } from '../../lib/supabase.ts'

export default function LoginPage() {
  const { me, loading, refresh } = useRecruiting()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const field = 'mt-1 h-9 w-full rounded-md border border-control bg-surface px-3 text-sm outline-none focus:border-accent'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      await signIn(email, password)
      const { data } = await supabase.from('staff').select('role').maybeSingle()
      if (!data) {
        await signOut()
        setError('Dieses Konto gehört nicht zum Recruiting-Team.')
      } else {
        await refresh()
      }
    } catch {
      setError('E-Mail oder Passwort stimmen nicht.')
    } finally {
      setSending(false)
    }
  }

  if (!loading && me) return <Navigate to="/recruiter" replace />

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-6">
        <p className="text-sm font-semibold">Recruiting</p>
        <form onSubmit={submit}>
          <h1 className="mt-4 text-xl font-semibold">Anmelden</h1>
          <p className="mt-1 text-sm text-muted">Nur für Screener und Admins.</p>
          <label className="mt-5 block text-sm">
            E-Mail
            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </label>
          <label className="mt-3 block text-sm">
            Passwort
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </label>
          {error && (
            <p role="alert" className="mt-3 text-sm text-[#831c1e]">
              {error}
            </p>
          )}
          <button disabled={sending} className="mt-5 h-9 w-full rounded-md bg-primary text-sm font-medium text-white hover:bg-black disabled:opacity-50">
            {sending ? 'Wird angemeldet …' : 'Anmelden'}
          </button>
        </form>
      </div>
    </main>
  )
}
