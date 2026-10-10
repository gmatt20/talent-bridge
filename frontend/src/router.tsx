import { createBrowserRouter } from 'react-router'
import { RequireRole } from '@/auth/RequireRole'
import { AppShell } from '@/components/layout/AppShell'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import NewProject from '@/pages/org/NewProject'
import OrgDashboard from '@/pages/org/OrgDashboard'
import OrgProjectDetail from '@/pages/org/OrgProjectDetail'
import OrgOnboarding from '@/pages/onboarding/OrgOnboarding'
import Register from '@/pages/Register'
import StudentDashboard from '@/pages/StudentDashboard'
import StudentOnboarding from '@/pages/onboarding/StudentOnboarding'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        path: 'onboarding/student',
        element: (
          <RequireRole role="student">
            <StudentOnboarding />
          </RequireRole>
        ),
      },
      {
        path: 'onboarding/org',
        element: (
          <RequireRole role="organization">
            <OrgOnboarding />
          </RequireRole>
        ),
      },
      {
        path: 'student',
        element: (
          <RequireRole role="student">
            <StudentDashboard />
          </RequireRole>
        ),
      },
      {
        path: 'org',
        element: (
          <RequireRole role="organization">
            <OrgDashboard />
          </RequireRole>
        ),
      },
      {
        path: 'org/projects/new',
        element: (
          <RequireRole role="organization">
            <NewProject />
          </RequireRole>
        ),
      },
      {
        path: 'org/projects/:id',
        element: (
          <RequireRole role="organization">
            <OrgProjectDetail />
          </RequireRole>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])
