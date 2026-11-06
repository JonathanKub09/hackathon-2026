// Gemeinsame Schnittstelle zwischen Backend und beiden Frontends.
// Nicht ohne Absprache ändern (siehe docs/rollen/1-backend.md).

export type NewApplication = {
  name: string
  email: string
  studiengang?: string
  semester?: number
  motivation: string
  cv_path?: string
  consent_privacy: boolean
  interests: string[]
}

export type RecruiterApplication = {
  id: string
  created_at: string
  motivation: string
  cv_path: string | null
}
