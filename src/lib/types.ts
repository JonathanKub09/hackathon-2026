// Gemeinsame Schnittstelle zwischen Backend und beiden Frontends.
// Ablauf und Regeln stehen in docs/schnittstelle.md.
import type { Database, Json } from './database.types'

type Tables = Database['public']['Tables']
type Views = Database['public']['Views']

export type StaffRole = Database['public']['Enums']['staff_role']

export type Identity = {
  first_name: string
  last_name: string
  email: string
  phone: string
}

export type CvEntry = {
  start_date: string
  end_date: string
  title: string
  organization: string
}

export type CvExperience = CvEntry & { details: string[] }

export type ParsedCv = {
  experiences: CvExperience[]
  educations: CvEntry[]
  skills: string[]
  languages: string[]
}

export type CvCheckResult = {
  anonymous: boolean
  leaks: string[]
  has_text: boolean
  format_recognized: boolean
  group: string
  cv: ParsedCv
}

export type NewApplication = Identity & {
  consent_privacy: boolean
  group_slug: string
  demographics?: Json
  skills: string[]
  languages: string[]
  educations: CvEntry[]
  experiences: (CvExperience & { is_relevant: boolean })[]
  answers: { question_id: string; answer: string }[]
}

export type Question = Tables['questions']['Row']
export type RatingCriterion = Tables['rating_criteria']['Row']
export type RecruiterApplication = Views['recruiter_view']['Row']
export type RankingEntry = Views['ranking']['Row']
export type RankingAdminEntry = Views['ranking_admin']['Row']
export type ScreeningReview = Views['screening_reviews']['Row']

// Punkte von 1 bis 5 je Kriterium, zum Beispiel { motivation: 4 }
export type Scores = Record<string, number>

export type ScreeningProgress = {
  applications_total: number
  applications_done: number
  reviews_done: number
  reviews_total: number
  my_open: number
  my_done: number
  screeners?: { name: string; done: number; open: number }[]
}

export type ApplicationDetails = {
  application: Tables['applications']['Row']
  experiences: Tables['experiences']['Row'][]
  educations: Tables['educations']['Row'][]
  answers: { answer: string; questions: { text: string; position: number } | null }[]
}
