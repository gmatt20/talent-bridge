import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as api from '@/api'
import { getToken, setToken } from '@/api/client'
import type { AuthResponse, User } from '@/types/api'
import { AuthContext, type AuthState } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => !!getToken())

  useEffect(() => {
    if (!getToken()) return
    api.auth
      .me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const accept = useCallback(({ token, user }: AuthResponse) => {
    setToken(token)
    setUser(user)
    return user
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      login: (body) => api.auth.login(body).then(accept),
      register: (body) => api.auth.register(body).then(accept),
      logout: () => {
        setToken(null)
        setUser(null)
      },
    }),
    [user, loading, accept],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
