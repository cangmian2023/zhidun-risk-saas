import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
import { useAuth } from './auth/AuthContext'
import Login from './pages/Login'
import Console from './console/Console'
import Platform from './platform/Platform'
import Home from './pages/Home'
import CreditRisk from './pages/CreditRisk'
import Scoring from './pages/Scoring'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/credit-risk" element={<CreditRisk />} />
        <Route path="/scoring" element={<Scoring />} />
        <Route path="/login" element={<Login />} />
        <Route path="/console" element={<Navigate to="/console/cr/overview" replace />} />
        <Route
          path="/platform"
          element={
            <RequireAuth>
              <Navigate to="/platform/profile/account" replace />
            </RequireAuth>
          }
        />
        <Route
          path="/platform/:module"
          element={
            <RequireAuth>
              <Platform />
            </RequireAuth>
          }
        />
        <Route
          path="/platform/:module/:page"
          element={
            <RequireAuth>
              <Platform />
            </RequireAuth>
          }
        />
        <Route
          path="/console/:sub"
          element={
            <RequireAuth>
              <Console />
            </RequireAuth>
          }
        />
        <Route
          path="/console/:sub/:page"
          element={
            <RequireAuth>
              <Console />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
