const TOKEN_KEY = 'junhi_auth_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || `Yêu cầu thất bại (${res.status})`)
  }

  return data as T
}

export interface User {
  id: number
  email: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface CloudEntry {
  date: string
  mood: number
  energy: number
  sleepHours: number
  tags: string[]
  content: string
}

export async function authRegister(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function authLogin(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function authGetMe(): Promise<{
  user: User
  settings: { reminderEnabled: boolean; reminderTime: string } | null
}> {
  return apiRequest('/api/auth/me')
}

export async function syncUpload(entries: CloudEntry[]): Promise<{ syncedCount: number }> {
  return apiRequest('/api/sync/upload', {
    method: 'POST',
    body: JSON.stringify({ entries }),
  })
}

export async function syncDownload(): Promise<{ entries: CloudEntry[] }> {
  return apiRequest('/api/sync/download')
}

export async function updateCloudReminder(enabled: boolean, time: string): Promise<void> {
  return apiRequest('/api/settings/reminder', {
    method: 'POST',
    body: JSON.stringify({ enabled, time }),
  })
}
