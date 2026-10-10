import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/api'
import { request } from './client'

export const register = (body: RegisterRequest) =>
  request<AuthResponse>('POST', '/api/auth/register', body)

export const login = (body: LoginRequest) => request<AuthResponse>('POST', '/api/auth/login', body)

export const me = () => request<User>('GET', '/api/users/me')
