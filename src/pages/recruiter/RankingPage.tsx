import { useState } from 'react'
import ApplicationDetail from '../../components/recruiter/ApplicationDetail.tsx'
import { useRecruiting } from '../../components/recruiter/recruitingContext.ts'
import { StatusPill, studyLine } from '../../components/recruiter/ui.tsx'
import { MAX_SCORE } from './config.ts'

// Übersicht für alle Screener, ohne Kontaktdaten
export default function RankingPage() {
  const { applications, progress } = useRecruiting()
  const [selected, setSelected] = useState<string | null>(null)
  const rows = applications.filter((a) => a.rank !== null).sort((x, y) => (x.rank ?? 0) - (y.rank ?? 0))

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-[-0.01em]">Ranking</h1>
      <p className="mt-1 text-sm text-muted">
        {rows.length} von {progress?.applications_total ?? rows.length} Bewerbungen fertig bewertet. Es zählt der Schnitt aller 4 Screener.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">Rang</th>
              <th className="px-4 py-3 font-medium">Kürzel</th>
              <th className="px-4 py-3 font-medium">Studium</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Schnitt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={() => r.id && setSelected(r.id)} className="cursor-pointer border-t border-rule hover:bg-ground">
                <td className="px-4 py-3 tabular-nums text-muted">{r.rank}.</td>
                <td className="px-4 py-3 font-medium tabular-nums">{r.code}</td>
                <td className="px-4 py-3">{studyLine(r)}</td>
                <td className="px-4 py-3">{r.status && <StatusPill status={r.status} />}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className="font-semibold">{r.score?.toFixed(2)}</span>
                  <span className="text-muted"> / {MAX_SCORE}</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  Noch keine Bewerbung ist von allen 4 Screenern bewertet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <ApplicationDetail id={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
