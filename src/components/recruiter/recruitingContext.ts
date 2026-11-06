import { createContext, useContext } from 'react'
import type { ApplicationOverview, RatingCriterion, ScreeningProgress, StaffMember } from '../../lib/types.ts'

export type RecruitingCtx = {
  loading: boolean
  /** Es gibt eine Anmeldung, sie kann aber noch ohne Team-Zugang sein. */
  signedIn: boolean
  me: StaffMember | null
  applications: ApplicationOverview[]
  criteria: RatingCriterion[]
  progress: ScreeningProgress | null
  refresh: () => Promise<void>
}

export const RecruitingContext = createContext<RecruitingCtx | null>(null)

export function useRecruiting() {
  const ctx = useContext(RecruitingContext)
  if (!ctx) throw new Error('useRecruiting braucht den RecruitingProvider')
  return ctx
}
