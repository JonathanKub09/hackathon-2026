import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { getCriteria, getMe, getOverview, getProgress } from '../../lib/api.ts'
import { supabase } from '../../lib/supabase.ts'
import type { ApplicationOverview, RatingCriterion, ScreeningProgress, StaffMember } from '../../lib/types.ts'
import { RecruitingContext } from './recruitingContext.ts'

const REFRESH_MS = 15_000

// Hält Anmeldung und Daten der Screener-Seite. Die Rechte prüft die Datenbank.
export function RecruitingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [signedIn, setSignedIn] = useState(false)
  const [me, setMe] = useState<StaffMember | null>(null)
  const [applications, setApplications] = useState<ApplicationOverview[]>([])
  const [criteria, setCriteria] = useState<RatingCriterion[]>([])
  const [progress, setProgress] = useState<ScreeningProgress | null>(null)

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    setSignedIn(data.session !== null)
    const member = data.session ? await getMe().catch(() => null) : null
    setMe(member)
    if (member) {
      const [overview, ratingCriteria, screeningProgress] = await Promise.all([getOverview(), getCriteria(), getProgress()])
      setApplications(overview)
      setCriteria(ratingCriteria)
      setProgress(screeningProgress)
    } else {
      setApplications([])
      setProgress(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh().catch(console.error)
    // Supabase-Aufrufe direkt im Callback können blockieren, deshalb erst danach laden.
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') setTimeout(() => refresh().catch(console.error), 0)
    })
    return () => data.subscription.unsubscribe()
  }, [refresh])

  // Neue Bewerbungen und Bewertungen erscheinen ohne Neuladen.
  const isMember = me !== null
  useEffect(() => {
    if (!isMember) return
    const update = () => refresh().catch(console.error)
    const timer = setInterval(update, REFRESH_MS)
    window.addEventListener('focus', update)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', update)
    }
  }, [isMember, refresh])

  return (
    <RecruitingContext.Provider value={{ loading, signedIn, me, applications, criteria, progress, refresh }}>
      {children}
    </RecruitingContext.Provider>
  )
}
