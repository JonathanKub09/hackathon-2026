import { useScores } from '../../components/recruiter/scoresContext.ts'
import { APPLICATIONS, CRITERIA, MAX_TOTAL, PRIVATE, STATUS_COLUMNS, totalOf, type Status } from './mockData.ts'

// Nur für Admins: zeigt Klarnamen. Später nur mit Admin-Rolle erreichbar.
export default function AdminPage() {
  const { scores, statuses, setStatus } = useScores()

  const rows = APPLICATIONS.map((a) => ({ ...a, person: PRIVATE[a.code], s: scores[a.code] ?? {}, total: totalOf(scores[a.code]) }))
    .sort((x, y) => (y.total ?? -1) - (x.total ?? -1))

  const rated = rows.filter((r) => r.total !== null).length

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-[-0.01em]">Auswertung</h1>
      <p className="mt-1 text-sm text-muted">
        {rated} von {rows.length} Bewerbungen bewertet · sortiert nach Gesamtpunkten
      </p>

      <p className="mt-5 rounded-md border border-[#fde68a] bg-[#fffbeb] px-4 py-2.5 text-sm text-[#92400e]">
        Admin-Ansicht: Hier sind Klarnamen und Kontaktdaten sichtbar. Screener sehen nur die anonymisierten Bewerbungen.
      </p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">Rang</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Kürzel</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {CRITERIA.map((c) => (
                <th key={c.id} className="px-3 py-3 text-right font-medium">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium">Summe</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.code} className="border-t border-rule">
                <td className="px-4 py-3 tabular-nums text-muted">{r.total === null ? '–' : `${i + 1}.`}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{r.person.name}</p>
                  <p className="text-xs text-muted">{r.person.email}</p>
                </td>
                <td className="px-4 py-3 tabular-nums">{r.code}</td>
                <td className="px-4 py-3">
                  <select
                    value={statuses[r.code]}
                    onChange={(e) => setStatus(r.code, e.target.value as Status)}
                    aria-label={`Status von ${r.code}`}
                    className="h-8 rounded-md border border-control bg-surface px-2 text-sm"
                  >
                    {STATUS_COLUMNS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                {CRITERIA.map((c) => (
                  <td key={c.id} className="px-3 py-3 text-right tabular-nums">
                    {r.s[c.id] ?? <span className="text-muted">–</span>}
                  </td>
                ))}
                <td className="px-4 py-3 text-right tabular-nums">
                  {r.total === null ? (
                    <span className="text-muted">–</span>
                  ) : (
                    <>
                      <span className="font-semibold">{r.total}</span>
                      <span className="text-muted"> / {MAX_TOTAL}</span>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
