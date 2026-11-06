import type { ApplicationStatus } from '../../lib/types.ts'

export const STATUS_COLUMNS: { id: ApplicationStatus; label: string }[] = [
  { id: 'not_rated', label: 'Nicht bewertet' },
  { id: 'rated', label: 'Bewertet' },
  { id: 'interview', label: 'Interview' },
  { id: 'accepted', label: 'Angenommen' },
  { id: 'rejected', label: 'Abgelehnt' },
]

export const MAX_SCORE = 4

export const TIMELINE = [
  { label: 'Bewerbungsphase', from: '2026-10-20', to: '2026-11-15' },
  { label: 'Screening', from: '2026-11-07', to: '2026-11-20' },
  { label: 'Interviews', from: '2026-11-18', to: '2026-11-28' },
  { label: 'Assessment Day', from: '2026-12-05', to: '2026-12-05' },
  { label: 'Zusagen', from: '2026-12-07', to: '2026-12-12' },
]
