import type { ApplicationStatus } from '../../lib/types.ts'

const PILL: Record<ApplicationStatus, { label: string; className: string }> = {
  not_rated: { label: 'Nicht bewertet', className: 'bg-accent-soft text-[#0a4c55]' },
  rated: { label: 'Bewertet', className: 'bg-[#fff6dd] text-[#8a3f0b]' },
  interview: { label: 'Interview', className: 'bg-[#e6eef8] text-[#1d3c63]' },
  accepted: { label: 'Angenommen', className: 'bg-[#dcfae5] text-[#04250e]' },
  rejected: { label: 'Abgelehnt', className: 'bg-[#ffedea] text-[#831c1e]' },
}

export function StatusPill({ status }: { status: ApplicationStatus }) {
  const pill = PILL[status]
  return (
    <span className={`inline-flex h-5 flex-none items-center whitespace-nowrap rounded px-1.5 text-xs font-medium ${pill.className}`}>
      {pill.label}
    </span>
  )
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function studyLine(a: { degree: string | null; study_program: string | null }) {
  return [a.degree, a.study_program].filter(Boolean).join(' ') || 'Kein Studium angegeben'
}

export function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
