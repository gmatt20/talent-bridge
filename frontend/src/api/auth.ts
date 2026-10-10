import type {
  AuthResponse,
  GoogleAuthResponse,
  GoogleSignInRequest,
  LoginRequest,
  RegisterRequest,
  User,
} from '../types/api';
import {request} from './client';

/** Creates an account and returns its session token and user. */
export function register(body: RegisterRequest) {
  return request<AuthResponse>('POST', '/api/auth/register', body);
}

/** Exchanges an email and password for a session token and user. */
export function login(body: LoginRequest) {
  return request<AuthResponse>('POST', '/api/auth/login', body);
}

/**
 * Exchanges a Google ID token for a session, creating the account when the
 * Google email is new and a role is given.
 */
export function googleSignIn(body: GoogleSignInRequest) {
  return request<GoogleAuthResponse>('POST', '/api/auth/google', body);
}

/** Loads the user the current session token belongs to. */
export function me() {
  return request<User>('GET', '/api/users/me');
}
