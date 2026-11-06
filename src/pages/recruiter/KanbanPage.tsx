import { useState } from 'react'
import ApplicationDetail from '../../components/recruiter/ApplicationDetail.tsx'
import { useRecruiting } from '../../components/recruiter/recruitingContext.ts'
import { formatDay, studyLine } from '../../components/recruiter/ui.tsx'
import { MAX_SCORE, STATUS_COLUMNS } from './config.ts'

export default function KanbanPage() {
  const { applications } = useRecruiting()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-[-0.01em]">Bewerbungen</h1>
      <p className="mt-1 text-sm text-muted">
        {applications.length} Bewerbungen, anonymisiert. Du siehst deine zugewiesenen und alle fertig bewerteten. Karte öffnen zum Bewerten.
      </p>

      <div className="mt-6 flex gap-3 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((col) => {
          const items = applications.filter((a) => a.status === col.id)
          return (
            <section key={col.id} className="flex w-72 flex-none flex-col rounded-lg bg-raised/70 p-2">
              <h2 className="flex items-center justify-between px-1.5 pb-2 pt-1 text-sm font-semibold">
                {col.label}
                <span className="text-xs font-normal text-muted tabular-nums">{items.length}</span>
              </h2>
              <div className="flex flex-col gap-2">
                {items.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a.id)}
                    className="rounded-md border border-line bg-surface p-3 text-left transition-colors hover:border-control focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold tabular-nums">{a.code}</span>
                      {a.created_at && <span className="text-xs text-muted tabular-nums">{formatDay(a.created_at)}</span>}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">{studyLine(a)}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-5">{a.skills?.join(' · ')}</p>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                      {a.score !== null ? (
                        <span className="tabular-nums">
                          <span className="font-semibold">{a.score?.toFixed(2)}</span>
                          <span className="text-muted"> / {MAX_SCORE}</span>
                        </span>
                      ) : (
                        <span className="text-muted tabular-nums">
                          {a.reviews_done} von {a.reviews_required} Bewertungen
                        </span>
                      )}
                      {a.is_assigned && !a.my_completed_at && <span className="font-medium text-accent">Deine Bewertung fehlt</span>}
                    </div>
                  </button>
                ))}
                {items.length === 0 && <p className="px-1.5 py-3 text-xs text-muted">Keine Bewerbungen</p>}
              </div>
            </section>
          )
        })}
      </div>

      {selected && <ApplicationDetail id={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
