import type {ReactNode} from 'react';
import {Navigate, useLocation} from 'react-router';
import {Loader2} from 'lucide-react';
import type {Role} from '../types/api';
import {homePath, useAuth} from './AuthContext';

/** Props for {@link RequireRole}. */
export interface RequireRoleProps {
  /** Omit to allow any signed-in user. */
  role?: Role;
  children: ReactNode;
}

/**
 * Renders `children` only for a signed-in user with the given role. Sends
 * everyone else to `/login` (then back here) or to their own dashboard.
 */
export function RequireRole({role, children}: RequireRoleProps) {
  const {user, loading} = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center"
        role="status"
      >
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
        <span className="sr-only">Loading your account…</span>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{from: location.pathname}} />;
  }
  if (role && user.role !== role) {
    return <Navigate to={homePath(user.role)} replace />;
  }
  return children;
}
