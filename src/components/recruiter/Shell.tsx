import { Link, NavLink, Outlet } from 'react-router-dom'
import { SCREENER } from '../../pages/recruiter/mockData.ts'

const NAV = [
  { to: '/recruiter', label: 'Übersicht', end: true },
  { to: '/recruiter/bewerbungen', label: 'Bewerbungen', end: false },
  { to: '/recruiter/admin', label: 'Auswertung (Admin)', end: false },
]

function navClass({ isActive }: { isActive: boolean }) {
  return `flex h-[34px] items-center rounded-md px-2.5 text-sm transition-colors ${
    isActive ? 'bg-raised font-medium text-ink' : 'text-muted hover:bg-raised/60 hover:text-ink'
  }`
}

export default function Shell() {
  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar ab Tablet */}
      <aside className="hidden w-60 flex-none flex-col border-r border-line px-3 py-5 md:flex">
        <div className="px-2.5">
          <p className="text-[15px] font-semibold">Recruiting</p>
          <p className="text-xs text-muted">Wintersemester 2026/27</p>
        </div>
        <nav className="mt-6 flex flex-col gap-0.5">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 px-2.5">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-raised text-xs font-semibold">
            {SCREENER.code}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium">{SCREENER.firstName} K.</p>
            <Link to="/recruiter/login" className="text-xs text-muted hover:text-ink">
              Abmelden
            </Link>
          </div>
        </div>
      </aside>

      {/* Leiste auf dem Handy */}
      <header className="flex items-center gap-1 overflow-x-auto border-b border-line px-4 py-2 md:hidden">
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
            {item.label}
          </NavLink>
        ))}
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-6">
        <div className="mb-4 flex justify-end">
          <Link
            to="/recruiter/howto"
            className="inline-flex h-8 items-center rounded-md border border-control bg-surface px-3 text-sm hover:bg-raised"
          >
            How-to
          </Link>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
