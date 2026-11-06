import { Route, Routes } from 'react-router-dom'
import Shell from '../../components/recruiter/Shell.tsx'
import { ScoresProvider } from '../../components/recruiter/scores.tsx'
import AdminPage from './AdminPage.tsx'
import DashboardPage from './DashboardPage.tsx'
import HowToPage from './HowToPage.tsx'
import KanbanPage from './KanbanPage.tsx'
import LoginPage from './LoginPage.tsx'

// Rolle 3: Screener-Ansicht. Siehe docs/rollen/3-frontend-recruiter.md
// Erste Version nur mit Mock-Daten (mockData.ts), noch ohne Supabase.
export default function RecruiterPage() {
  return (
    <ScoresProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<Shell />}>
          <Route index element={<DashboardPage />} />
          <Route path="bewerbungen" element={<KanbanPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="howto" element={<HowToPage />} />
        </Route>
      </Routes>
    </ScoresProvider>
  )
}
