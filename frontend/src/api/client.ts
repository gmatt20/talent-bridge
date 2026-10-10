import { ApiError } from './errors'

export { ApiError }

const TOKEN_KEY = 'tb.token'
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable (private mode); session just won't persist
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const token = getToken()

  if (useMocks) {
    const { mockRequest } = await import('./mocks/handlers')
    return mockRequest<T>(method, path, body, token)
  }

  const res = await fetch(path, {
    method,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  const data = text ? safeParse(text) : undefined

  if (!res.ok) throw new ApiError(res.status, errorMessage(data) ?? res.statusText)
  return data as T
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function errorMessage(data: unknown): string | undefined {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object') {
    const d = data as { error?: { message?: string } | string; message?: string }
    if (typeof d.error === 'string') return d.error
    return d.error?.message ?? d.message
  }
}
