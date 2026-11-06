import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Shell from '../../components/recruiter/Shell.tsx'
import { RecruitingProvider } from '../../components/recruiter/recruiting.tsx'
import { useRecruiting } from '../../components/recruiter/recruitingContext.ts'
import AdminPage from './AdminPage.tsx'
import DashboardPage from './DashboardPage.tsx'
import HowToPage from './HowToPage.tsx'
import KanbanPage from './KanbanPage.tsx'
import LoginPage from './LoginPage.tsx'
import RankingPage from './RankingPage.tsx'

function RequireStaff() {
  const { loading, me } = useRecruiting()
  if (loading) return <p className="p-8 text-sm text-muted">Wird geladen …</p>
  return me ? <Outlet /> : <Navigate to="/recruiter/login" replace />
}

// Rolle 3: Screener-Ansicht. Abläufe und Aufrufe stehen in docs/schnittstelle.md
export default function RecruiterPage() {
  return (
    <RecruitingProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<RequireStaff />}>
          <Route element={<Shell />}>
            <Route index element={<DashboardPage />} />
            <Route path="bewerbungen" element={<KanbanPage />} />
            <Route path="ranking" element={<RankingPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="howto" element={<HowToPage />} />
          </Route>
        </Route>
      </Routes>
    </RecruitingProvider>
  )
}
