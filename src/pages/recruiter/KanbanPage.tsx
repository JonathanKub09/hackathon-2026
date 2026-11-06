import { useState } from 'react'
import ApplicationDetail from '../../components/recruiter/ApplicationDetail.tsx'
import { useScores } from '../../components/recruiter/scoresContext.ts'
import { formatDay, Initials } from '../../components/recruiter/ui.tsx'
import { APPLICATIONS, MAX_TOTAL, STATUS_COLUMNS, totalOf, type MockApplication } from './mockData.ts'

export default function KanbanPage() {
  const { scores, statuses } = useScores()
  const [selected, setSelected] = useState<MockApplication | null>(null)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-[-0.01em]">Bewerbungen</h1>
      <p className="mt-1 text-sm text-muted">
        {APPLICATIONS.length} Bewerbungen für das Trainee-Programm, anonymisiert. Karte öffnen zum Bewerten.
      </p>

      <div className="mt-6 flex gap-3 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((col) => {
          const items = APPLICATIONS.filter((a) => statuses[a.code] === col.id)
          return (
            <section key={col.id} className="flex w-72 flex-none flex-col rounded-lg bg-raised/70 p-2">
              <h2 className="flex items-center justify-between px-1.5 pb-2 pt-1 text-sm font-semibold">
                {col.label}
                <span className="text-xs font-normal text-muted tabular-nums">{items.length}</span>
              </h2>
              <div className="flex flex-col gap-2">
                {items.map((a) => {
                  const total = totalOf(scores[a.code])
                  const rated = Object.keys(scores[a.code] ?? {}).length
                  return (
                    <button
                      key={a.code}
                      onClick={() => setSelected(a)}
                      className="rounded-md border border-line bg-surface p-3 text-left transition-colors hover:border-control focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold tabular-nums">{a.code}</span>
                        <span className="text-xs text-muted tabular-nums">{formatDay(a.receivedAt)}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted">{a.education[0].degree}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-5">{a.motivation[0].answer}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        {total === null ? (
                          <span className="text-xs text-muted">Nicht bewertet</span>
                        ) : (
                          <span className="text-xs tabular-nums">
                            <span className="font-semibold">{total}</span>
                            <span className="text-muted">
                              {' '}
                              / {MAX_TOTAL}
                              {rated < 4 ? ` · ${rated} von 4 Kriterien` : ''}
                            </span>
                          </span>
                        )}
                        <Initials code={a.screener} />
                      </div>
                    </button>
                  )
                })}
                {items.length === 0 && <p className="px-1.5 py-3 text-xs text-muted">Keine Bewerbungen</p>}
              </div>
            </section>
          )
        })}
      </div>

      {selected && <ApplicationDetail application={{ ...selected, status: statuses[selected.code] }} onClose={() => setSelected(null)} />}
    </div>
  )
}
