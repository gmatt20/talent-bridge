import {createContext, useContext} from 'react';
import type {
  GoogleAuthResponse,
  GoogleSignInRequest,
  LoginRequest,
  RegisterRequest,
  Role,
  User,
} from '../types/api';

/** The signed-in user and the actions that change the session. */
export interface AuthState {
  user: User | null;
  loading: boolean;
  login: (body: LoginRequest) => Promise<User>;
  register: (body: RegisterRequest) => Promise<User>;
  googleSignIn: (body: GoogleSignInRequest) => Promise<GoogleAuthResponse>;
  logout: () => void;
}

/** Holds the session; provided by `AuthProvider`. */
export const AuthContext = createContext<AuthState | null>(null);

/** Returns the current session. Must be used inside `AuthProvider`. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Returns the dashboard path for a role. */
export function homePath(role: Role): string {
  if (role === 'organization') return '/org';
  if (role === 'student') return '/student';
  return '/projects';
}
