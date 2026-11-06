import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import ApplicationDetail from '../../components/recruiter/ApplicationDetail.tsx'
import { useRecruiting } from '../../components/recruiter/recruitingContext.ts'
import { StatusPill } from '../../components/recruiter/ui.tsx'
import { getAdminOverview, getCvUrl, setApplicationStatus } from '../../lib/api.ts'
import type { AdminOverview, ApplicationStatus } from '../../lib/types.ts'
import { MAX_SCORE, STATUS_COLUMNS } from './config.ts'

const MOVABLE = STATUS_COLUMNS.filter((s) => s.id !== 'not_rated')

// Nur für Admins: zeigt Klarnamen. Die Datenbank liefert anderen Rollen hier nichts.
export default function AdminPage() {
  const { me, applications, criteria, refresh } = useRecruiting()
  const [rows, setRows] = useState<AdminOverview[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => setRows(await getAdminOverview()), [])

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : 'Die Auswertung konnte nicht geladen werden.'))
  }, [load, applications])

  const move = async (id: string, status: ApplicationStatus, interviewAt?: string) => {
    setError(null)
    try {
      await setApplicationStatus(id, status, interviewAt)
      await Promise.all([load(), refresh()])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Der Status konnte nicht geändert werden.')
    }
  }

  const openCv = async (path: string) => {
    try {
      window.open(await getCvUrl(path), '_blank', 'noopener')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Der Lebenslauf konnte nicht geöffnet werden.')
    }
  }

  if (me?.role !== 'admin') return <Navigate to="/recruiter" replace />

  const rated = rows.filter((r) => r.rank !== null).length

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-[-0.01em]">Auswertung</h1>
      <p className="mt-1 text-sm text-muted">
        {rated} von {rows.length} Bewerbungen fertig bewertet · sortiert nach Schnitt
      </p>

      <p className="mt-5 rounded-md border border-[#fde68a] bg-[#fffbeb] px-4 py-2.5 text-sm text-[#92400e]">
        Admin-Ansicht: Hier sind Klarnamen, Kontaktdaten und Lebensläufe sichtbar. Screener sehen nur die anonymisierten Angaben.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-sm text-[#831c1e]">
          {error}
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">Rang</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Kürzel</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {criteria.map((c) => (
                <th key={c.id} className="px-3 py-3 text-right font-medium">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium">Schnitt</th>
              <th className="px-4 py-3 font-medium">Lebenslauf</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const done = r.rank !== null
              const scores = (r.criterion_scores ?? {}) as Record<string, number>
              return (
                <tr key={r.id} className="border-t border-rule">
                  <td className="px-4 py-3 tabular-nums text-muted">{done ? `${r.rank}.` : '–'}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => r.id && setSelected(r.id)} className="text-left hover:underline">
                      <span className="block font-medium">
                        {r.first_name} {r.last_name}
                      </span>
                      <span className="block text-xs text-muted">{r.email}</span>
                      <span className="block text-xs text-muted">{r.phone}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.code}</td>
                  <td className="px-4 py-3">
                    {done && r.id ? (
                      <>
                        <select
                          value={r.status ?? 'rated'}
                          onChange={(e) => move(r.id!, e.target.value as ApplicationStatus)}
                          aria-label={`Status von ${r.code}`}
                          className="h-8 rounded-md border border-control bg-surface px-2 text-sm"
                        >
                          {MOVABLE.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        {r.status === 'interview' && (
                          <input
                            type="datetime-local"
                            aria-label={`Interview-Termin von ${r.code}`}
                            defaultValue={r.interview_at ? r.interview_at.slice(0, 16) : ''}
                            onBlur={(e) => e.target.value && move(r.id!, 'interview', new Date(e.target.value).toISOString())}
                            className="mt-1 block h-8 rounded-md border border-control bg-surface px-2 text-xs"
                          />
                        )}
                        {r.status === 'interview' && r.preferred_slot && <p className="mt-1 text-xs text-muted">Wunsch: {r.preferred_slot}</p>}
                      </>
                    ) : (
                      r.status && <StatusPill status={r.status} />
                    )}
                  </td>
                  {criteria.map((c) => (
                    <td key={c.id} className="px-3 py-3 text-right tabular-nums">
                      {scores[c.id]?.toFixed(2) ?? <span className="text-muted">–</span>}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right tabular-nums">
                    {done ? (
                      <>
                        <span className="font-semibold">{r.score?.toFixed(2)}</span>
                        <span className="text-muted"> / {MAX_SCORE}</span>
                      </>
                    ) : (
                      <span className="text-muted">
                        {r.reviews_done} von {r.reviews_required}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.cv_path && (
                      <button type="button" onClick={() => openCv(r.cv_path!)} className="text-sm text-accent hover:underline">
                        Öffnen
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && <ApplicationDetail id={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
