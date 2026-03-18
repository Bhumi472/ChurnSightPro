import type { CustomerInput, PredictionResult, PredictionRecord, StatsData, HealthData } from '@/types'

const BASE = 'https://churnsightpro-production.up.railway.app/api'
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  health:        ()                                   => request<HealthData>('/health'),
  predict:       (data: CustomerInput)                => request<PredictionResult>('/predict', { method: 'POST', body: JSON.stringify(data) }),
  getHistory:    (params?: { risk_level?: string })   => request<PredictionRecord[]>(`/history${params?.risk_level ? `?risk_level=${params.risk_level}` : ''}`),
  deleteHistory: (id: number)                         => request<void>(`/history/${id}`, { method: 'DELETE' }),
  getStats:      ()                                   => request<StatsData>('/stats'),
}
