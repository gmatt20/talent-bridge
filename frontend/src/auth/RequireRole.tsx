import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { Loader2 } from 'lucide-react'
import type { Role } from '@/types/api'
import { homePath, useAuth } from './AuthContext'

export function RequireRole({ role, children }: { role?: Role; children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
        <span className="sr-only">Loading your account…</span>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (role && user.role !== role) return <Navigate to={homePath(user.role)} replace />
  return children
}
