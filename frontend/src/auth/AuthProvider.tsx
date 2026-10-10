import {useCallback, useEffect, useMemo, useState, type ReactNode} from 'react';
import * as api from '../api';
import {getToken, setToken} from '../api/client';
import type {AuthResponse, User} from '../types/api';
import {AuthContext, type AuthState} from './AuthContext';

/** Props for {@link AuthProvider}. */
export interface AuthProviderProps {
  children: ReactNode;
}

/** Restores the session from the stored token and provides it to the app. */
export function AuthProvider({children}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api.auth
      .me()
      .then(u => setUser(u))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const accept = useCallback(({token, user}: AuthResponse) => {
    setToken(token);
    setUser(user);
    return user;
  }, []);

  // Memoized so consumers only re-render when the session actually changes.
  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      login: body => api.auth.login(body).then(res => accept(res)),
      register: body => api.auth.register(body).then(res => accept(res)),
      logout: () => {
        setToken(null);
        setUser(null);
      },
    }),
    [user, loading, accept],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
