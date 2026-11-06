import { createContext, useContext } from 'react'
import type { CriterionId, Score, Scores, Status } from '../../pages/recruiter/mockData.ts'

export type ScoresCtx = {
  scores: Record<string, Scores>
  setScore: (code: string, criterion: CriterionId, value: Score) => void
  statuses: Record<string, Status>
  setStatus: (code: string, status: Status) => void
}

export const ScoresContext = createContext<ScoresCtx | null>(null)

export function useScores() {
  const ctx = useContext(ScoresContext)
  if (!ctx) throw new Error('useScores braucht den ScoresProvider')
  return ctx
}
