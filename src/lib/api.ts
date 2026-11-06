// Alle Aufrufe ans Backend. Das Frontend nutzt nur diese Funktionen.
// Ablauf und Regeln stehen in docs/schnittstelle.md.
import { FunctionsHttpError } from '@supabase/supabase-js'
import { CV_BUCKET, supabase } from './supabase'
import type {
  ApplicantStatus,
  ApplicationDetails,
  ApplicationStatus,
  CvCheckResult,
  NewApplication,
  Scores,
  ScreeningProgress,
  StaffMember,
  SubmitResult,
} from './types'

export class ApiError extends Error {
  leaks: string[]

  constructor(message: string, leaks: string[] = []) {
    super(message)
    this.leaks = leaks
  }
}

async function callApply<T>(path: 'check' | 'submit' | 'status', body: FormData): Promise<T> {
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
  return callApply<SubmitResult>('submit', form)
}

// Bewerberprofil: Stand der eigenen Bewerbung über den Zugang aus submitApplication
export function getApplicantStatus(token: string) {
  const form = new FormData()
  form.append('token', token)
  return callApply<ApplicantStatus>('status', form)
}

export async function getQuestions() {
  return unwrap(await supabase.from('questions').select('*').order('position'))
}

// Screener und Admins --------------------------------------------------------

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new ApiError(error.message)
}

export async function signOut() {
  await supabase.auth.signOut()
}

// Rolle und Anzeigename der angemeldeten Person, null ohne Anmeldung oder ohne Team-Zugang
export async function getMe(): Promise<StaffMember | null> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  const { data: staff, error } = await supabase
    .from('staff')
    .select('role, display_name')
    .eq('user_id', data.user.id)
    .maybeSingle()
  if (error) throw new ApiError(error.message)
  return staff
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

// Alles für Kanban und Dashboard: eigene Zuweisungen und fertig bewertete Bewerbungen
export async function getOverview() {
  return unwrap(
    await supabase.from('application_overview').select('*').order('created_at', { ascending: false }),
  )
}

// Wie getOverview mit Personendaten, nur für Admins
export async function getAdminOverview() {
  return unwrap(
    await supabase
      .from('admin_overview')
      .select('*')
      .order('rank', { ascending: true, nullsFirst: false }),
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

// Eigene Bewertung einer Bewerbung, leer solange nichts abgegeben ist
export async function getMyRating(applicationId: string) {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return []
  return unwrap(
    await supabase
      .from('ratings')
      .select('criterion_id, score')
      .eq('application_id', applicationId)
      .eq('screener_id', data.user.id),
  )
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

// Nur für Admins und nur bei fertig bewerteten Bewerbungen, beim Interview optional mit Termin
export async function setApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  interviewAt?: string,
) {
  unwrap(
    await supabase.rpc('set_application_status', {
      p_application_id: applicationId,
      p_status: status,
      p_interview_at: interviewAt,
    }),
  )
}

// Einschätzungen der 4 Screener, sichtbar sobald alle fertig sind
export async function getReviews(applicationId: string) {
  return unwrap(
    await supabase.from('screening_reviews').select('*').eq('application_id', applicationId),
  )
}
