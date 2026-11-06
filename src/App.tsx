import { Navigate, Route, Routes } from 'react-router-dom'
import ApplyPage from './pages/apply/ApplyPage.tsx'
import RecruiterPage from './pages/recruiter/RecruiterPage.tsx'

// Routen nur mit Absprache im Team ändern.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/apply" replace />} />
      <Route path="/apply" element={<ApplyPage />} />
      <Route path="/recruiter/*" element={<RecruiterPage />} />
    </Routes>
  )
}
