import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import Landing from '@/pages/Landing'
import NotFound from '@/pages/NotFound'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Landing /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
