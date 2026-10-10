import { createContext, useContext } from 'react'
import type { LoginRequest, RegisterRequest, Role, User } from '@/types/api'

export interface AuthState {
  user: User | null
  loading: boolean
  login: (body: LoginRequest) => Promise<User>
  register: (body: RegisterRequest) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function homePath(role: Role): string {
  if (role === 'organization') return '/org'
  if (role === 'student') return '/student'
  return '/projects'
}
