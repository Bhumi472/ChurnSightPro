import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CustomerInput } from '@/types'

export const useHealth = () =>
  useQuery({ queryKey: ['health'], queryFn: api.health, refetchInterval: 30_000 })

export const useStats = () =>
  useQuery({ queryKey: ['stats'], queryFn: api.getStats, refetchInterval: 10_000 })

export const useHistory = (riskLevel?: string) =>
  useQuery({
    queryKey: ['history', riskLevel],
    queryFn: () => api.getHistory({ risk_level: riskLevel }),
  })

export const usePredict = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CustomerInput) => api.predict(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['history'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export const useDeletePrediction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteHistory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['history'] }),
  })
}
