import { Link } from 'react-router-dom'
import { useRecruiting } from '../../components/recruiter/recruitingContext.ts'
import { formatDateTime, formatDay, studyLine } from '../../components/recruiter/ui.tsx'
import { TIMELINE } from './config.ts'

const DAY = 24 * 60 * 60 * 1000
const t = (iso: string) => new Date(iso).getTime()
const TODAY = new Date().toISOString().slice(0, 10)

function Timeline() {
  const start = t(TIMELINE[0].from)
  const end = t(TIMELINE[TIMELINE.length - 1].to) + DAY
  const pct = (ms: number) => ((ms - start) / (end - start)) * 100
  const today = t(TODAY)

  return (
    <div className="relative">
      <div className="space-y-2.5">
        {TIMELINE.map((phase) => {
          const from = t(phase.from)
          const to = t(phase.to) + DAY
          const active = today >= from && today < to
          return (
            <div key={phase.label} className="grid grid-cols-[120px_1fr] items-center gap-3 sm:grid-cols-[150px_1fr]">
              <div className="text-sm">
                <span className={active ? 'font-medium' : ''}>{phase.label}</span>
                <span className="block text-xs text-muted">
                  {phase.from === phase.to ? formatDay(phase.from) : `${formatDay(phase.from)} – ${formatDay(phase.to)}`}
                </span>
              </div>
              <div className="relative h-6">
                <div
                  className={`absolute top-1 h-4 rounded ${active ? 'bg-accent' : 'bg-raised'}`}
                  style={{ left: `${pct(from)}%`, width: `max(${pct(to) - pct(from)}%, 6px)` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      {/* Heute-Markierung */}
      <div className="pointer-events-none absolute inset-y-0 left-[132px] right-0 sm:left-[162px]">
        <div className="absolute -top-5 bottom-0 w-px bg-ink" style={{ left: `${pct(today)}%` }}>
          <span className="absolute -top-0.5 left-1.5 whitespace-nowrap text-xs font-medium">Heute</span>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { me, applications, progress } = useRecruiting()
  const open = applications.filter((a) => a.is_assigned && !a.my_completed_at)
  const interviews = applications
    .filter((a) => a.interview_at)
    .sort((a, b) => t(a.interview_at!) - t(b.interview_at!))
  const dateLabel = new Date(TODAY).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const kpis = [
    { label: 'Offen für dich', value: progress?.my_open ?? 0, note: `${progress?.my_done ?? 0} schon bewertet` },
    {
      label: 'Fertig bewertet',
      value: progress?.applications_done ?? 0,
      note: `von ${progress?.applications_total ?? 0} Bewerbungen`,
    },
    { label: 'Interviews', value: progress?.interview ?? 0, note: 'eingeladen' },
    {
      label: 'Entschieden',
      value: (progress?.accepted ?? 0) + (progress?.rejected ?? 0),
      note: `${progress?.accepted ?? 0} angenommen, ${progress?.rejected ?? 0} abgelehnt`,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-[-0.01em]">Willkommen, {me?.display_name}</h1>
      <p className="mt-1 text-sm text-muted">
        {dateLabel} · {progress?.applications_total ?? 0} Bewerbungen in dieser Runde
      </p>

      {/* News */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-accent-soft px-5 py-4">
        <p className="text-[15px]">
          <span className="font-semibold">{open.length} Bewerbungen</span> warten auf deine Bewertung.
        </p>
        <Link
          to="/recruiter/bewerbungen"
          className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-white hover:bg-black"
        >
          Zum Kanban
        </Link>
      </div>

      {/* Kennzahlen in einem geteilten Panel */}
      <div className="mt-4 grid grid-cols-2 rounded-lg border border-line bg-surface lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className={`px-5 py-4 ${i % 2 === 1 ? 'border-l border-line' : ''} ${i >= 2 ? 'border-t border-line lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
          >
            <p className="text-xs text-muted">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{k.value}</p>
            <p className="mt-0.5 text-xs text-muted">{k.note}</p>
          </div>
        ))}
      </div>

      {/* Zeitstrahl */}
      <section className="mt-4 rounded-lg border border-line bg-surface px-5 pb-5 pt-4">
        <h2 className="text-base font-semibold">Recruiting-Timeline</h2>
        <div className="mt-8">
          <Timeline />
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[3fr_2fr]">
        <section className="rounded-lg border border-line bg-surface">
          <div className="flex items-baseline justify-between px-5 pt-4">
            <h2 className="text-base font-semibold">Warten auf dich</h2>
            <Link to="/recruiter/bewerbungen" className="text-sm text-muted hover:text-ink">
              Alle ansehen
            </Link>
          </div>
          <ul className="mt-2 pb-2">
            {open.map((a) => (
              <li key={a.id} className="grid grid-cols-[88px_1fr_auto] items-center gap-3 border-t border-rule px-5 py-3 first:border-t-0">
                <span className="text-sm font-medium tabular-nums">{a.code}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm">{studyLine(a)}</p>
                  <p className="truncate text-xs text-muted">{a.skills?.join(' · ')}</p>
                </div>
                {a.created_at && <span className="text-xs text-muted tabular-nums">{formatDay(a.created_at)}</span>}
              </li>
            ))}
            {open.length === 0 && <li className="px-5 py-3 text-sm text-muted">Gerade ist nichts offen.</li>}
          </ul>
        </section>

        <section className="rounded-lg border border-line bg-surface">
          <h2 className="px-5 pt-4 text-base font-semibold">Anstehende Interviews</h2>
          <ul className="mt-2 pb-2">
            {interviews.map((a) => (
              <li key={a.id} className="border-t border-rule px-5 py-3 first:border-t-0">
                <p className="text-sm tabular-nums">{formatDateTime(a.interview_at!)}</p>
                <p className="text-xs text-muted">
                  {a.code} · {studyLine(a)}
                </p>
              </li>
            ))}
            {interviews.length === 0 && <li className="px-5 py-3 text-sm text-muted">Noch keine Interviews geplant.</li>}
          </ul>
        </section>
      </div>
    </div>
  )
}
