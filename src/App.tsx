import { AppLayout } from '@/layouts/AppLayout'
import { AlertsPage } from '@/pages/AlertsPage'
import { AuditTrailPage } from '@/pages/AuditTrailPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { MilestonesPage } from '@/pages/MilestonesPage'
import { RecruitmentPage } from '@/pages/RecruitmentPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { StudiesPage } from '@/pages/StudiesPage'
import { StudyDetailPage } from '@/pages/StudyDetailPage'
import { UsersPage } from '@/pages/UsersPage'
import { useAuth } from '@/hooks/useAuth'
import { navItems } from '@/data/navigation'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

function RoleRoute({ href, children }: { href: string; children: ReactNode }) {
  const { role } = useAuth()
  const item = navItems.find((nav) => nav.href === href)
  if (item && !item.roles.includes(role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/studies" element={<StudiesPage />} />
        <Route path="/studies/:id" element={<StudyDetailPage />} />
        <Route path="/recruitment" element={<RecruitmentPage />} />
        <Route path="/milestones" element={<MilestonesPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route
          path="/audit"
          element={
            <RoleRoute href="/audit">
              <AuditTrailPage />
            </RoleRoute>
          }
        />
        <Route
          path="/users"
          element={
            <RoleRoute href="/users">
              <UsersPage />
            </RoleRoute>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
