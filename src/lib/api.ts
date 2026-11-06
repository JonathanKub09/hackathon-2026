// Alle Aufrufe ans Backend. Das Frontend nutzt nur diese Funktionen.
// Ablauf und Regeln stehen in docs/schnittstelle.md.
import { FunctionsHttpError } from '@supabase/supabase-js'
import { CV_BUCKET, supabase } from './supabase'
import type {
  ApplicationDetails,
  ApplicationStatus,
  CvCheckResult,
  NewApplication,
  Scores,
  ScreeningProgress,
  StaffRole,
} from './types'

export class ApiError extends Error {
  leaks: string[]

  constructor(message: string, leaks: string[] = []) {
    super(message)
    this.leaks = leaks
  }
}

async function callApply<T>(path: 'check' | 'submit', body: FormData): Promise<T> {
  const { data, error } = await supabase.functions.invoke(`apply/${path}`, { body })
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const details = await error.context.json().catch(() => null)
      throw new ApiError(details?.error ?? error.message, details?.leaks ?? [])
    }
    throw new ApiError(error.message)
  }
  return data as T
}

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new ApiError(result.error.message)
  return result.data as T
}

// Bewerber -------------------------------------------------------------------

// Liest den Lebenslauf aus und liefert die Werte zum Vorausfüllen, speichert nichts
export function checkCv(file: File) {
  const form = new FormData()
  form.append('file', file)
  return callApply<CvCheckResult>('check', form)
}

export function submitApplication(application: NewApplication, file: File) {
  const form = new FormData()
  form.append('payload', JSON.stringify(application))
  form.append('file', file)
  return callApply<{ code: string }>('submit', form)
}

export async function getQuestions() {
  return unwrap(await supabase.from('questions').select('*').order('position'))
}

// Screener und Admins --------------------------------------------------------

export async function getMyRole(): Promise<StaffRole | null> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  const { data: staff, error } = await supabase
    .from('staff')
    .select('role')
    .eq('user_id', data.user.id)
    .maybeSingle()
  if (error) throw new ApiError(error.message)
  return staff?.role ?? null
}

export async function getProgress() {
  return unwrap(await supabase.rpc('get_screening_progress')) as unknown as ScreeningProgress
}

// Eigene Warteschlange, offene Bewerbungen zuerst
export async function getMyQueue() {
  return unwrap(
    await supabase
      .from('recruiter_view')
      .select('*')
      .order('completed_at', { ascending: true, nullsFirst: true })
      .order('assigned_at'),
  )
}

export async function getCriteria() {
  return unwrap(
    await supabase.from('rating_criteria').select('*').eq('is_active', true).order('position'),
  )
}

export async function getApplicationDetails(id: string): Promise<ApplicationDetails> {
  const [application, experiences, educations, answers] = await Promise.all([
    supabase.from('applications').select('*').eq('id', id).single(),
    supabase.from('experiences').select('*').eq('application_id', id).order('position'),
    supabase.from('educations').select('*').eq('application_id', id).order('position'),
    supabase.from('answers').select('answer, questions(text, position)').eq('application_id', id),
  ])
  return {
    application: unwrap(application),
    experiences: unwrap(experiences),
    educations: unwrap(educations),
    answers: unwrap(answers),
  }
}

// Nur für Admins, den Pfad liefert getRankingWithContacts()
export async function getCvUrl(cvPath: string) {
  const { signedUrl } = unwrap(await supabase.storage.from(CV_BUCKET).createSignedUrl(cvPath, 60))
  return signedUrl
}

export async function submitRating(applicationId: string, scores: Scores, comment?: string) {
  unwrap(
    await supabase.rpc('submit_rating', {
      p_application_id: applicationId,
      p_scores: scores,
      p_comment: comment,
    }),
  )
}

export async function getRanking() {
  return unwrap(await supabase.from('ranking').select('*').order('rank'))
}

// Nur für Admins, für Screener bleibt die Liste leer
export async function getRankingWithContacts() {
  return unwrap(await supabase.from('ranking_admin').select('*').order('rank'))
}

// Nur für Admins und nur bei fertig bewerteten Bewerbungen
export async function setApplicationStatus(applicationId: string, status: ApplicationStatus) {
  unwrap(
    await supabase.rpc('set_application_status', {
      p_application_id: applicationId,
      p_status: status,
    }),
  )
}

// Einschätzungen der 4 Screener, sichtbar sobald alle fertig sind
export async function getReviews(applicationId: string) {
  return unwrap(
    await supabase.from('screening_reviews').select('*').eq('application_id', applicationId),
  )
}
