import { useState, type ReactNode } from 'react'
import { APPLICATIONS, INITIAL_SCORES, type Scores, type Status } from '../../pages/recruiter/mockData.ts'
import { ScoresContext, type ScoresCtx } from './scoresContext.ts'

// Demo: Bewertungen und Status leben nur im Browser-State, bis Supabase angebunden ist.
export function ScoresProvider({ children }: { children: ReactNode }) {
  const [scores, setScores] = useState<Record<string, Scores>>(INITIAL_SCORES)
  const [statuses, setStatuses] = useState<Record<string, Status>>(() =>
    Object.fromEntries(APPLICATIONS.map((a) => [a.code, a.status])),
  )
  const setScore: ScoresCtx['setScore'] = (code, criterion, value) =>
    setScores((prev) => ({ ...prev, [code]: { ...prev[code], [criterion]: value } }))
  const setStatus: ScoresCtx['setStatus'] = (code, status) => setStatuses((prev) => ({ ...prev, [code]: status }))
  return <ScoresContext.Provider value={{ scores, setScore, statuses, setStatus }}>{children}</ScoresContext.Provider>
}
