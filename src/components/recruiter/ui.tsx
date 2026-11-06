import type { Status } from '../../pages/recruiter/mockData.ts'

const PILL: Record<Status, { label: string; className: string }> = {
  eingegangen: { label: 'Eingegangen', className: 'bg-accent-soft text-[#0a4c55]' },
  in_pruefung: { label: 'In Prüfung', className: 'bg-[#fff6dd] text-[#8a3f0b]' },
  interview: { label: 'Interview', className: 'bg-[#e6eef8] text-[#1d3c63]' },
  zusage: { label: 'Zusage', className: 'bg-[#dcfae5] text-[#04250e]' },
  absage: { label: 'Absage', className: 'bg-[#ffedea] text-[#831c1e]' },
}

export function StatusPill({ status }: { status: Status }) {
  const pill = PILL[status]
  return (
    <span className={`inline-flex h-5 flex-none items-center whitespace-nowrap rounded px-1.5 text-xs font-medium ${pill.className}`}>
      {pill.label}
    </span>
  )
}

export function Initials({ code }: { code: string | null }) {
  if (!code) return <span className="text-xs text-muted">nicht zugewiesen</span>
  return (
    <span
      title={`Screener ${code}`}
      className="inline-flex size-6 flex-none items-center justify-center rounded-full bg-raised text-[11px] font-semibold text-ink"
    >
      {code}
    </span>
  )
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
