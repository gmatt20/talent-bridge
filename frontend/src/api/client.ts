import {ApiError} from './errors';

export {ApiError};

const TOKEN_KEY = 'tb.token';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Absolute backend origin (e.g. the deployed API). When empty, requests use
// relative paths and rely on the Vite dev proxy. Trailing slash is trimmed so
// `${API_BASE}${path}` never produces a double slash.
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/** Returns the stored session token, or null when signed out. */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Stores the session token; null signs out. */
export function setToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Storage unavailable (private mode); the session just won't persist.
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Sends a request to the API (or to the in-browser mocks when
 * `VITE_USE_MOCKS=true`) with the session token, and returns the parsed JSON.
 * Throws an `ApiError` for any non-2xx response.
 */
export async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken();

  if (USE_MOCKS) {
    const {mockRequest} = await import('./mocks/handlers');
    return mockRequest<T>(method, path, body, token);
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? safeParse(text) : undefined;

  if (!res.ok) {
    throw new ApiError(res.status, messageFrom(data) ?? res.statusText);
  }
  // The response shape is defined by the API contract for this endpoint.
  return data as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function messageFrom(data: unknown): string | undefined {
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    // Error bodies are `{error: {message}}`, `{error: string}` or `{message}`;
    // every field is checked before use.
    const d = data as {error?: {message?: string} | string; message?: string};
    if (typeof d.error === 'string') return d.error;
    return d.error?.message ?? d.message;
  }
}
