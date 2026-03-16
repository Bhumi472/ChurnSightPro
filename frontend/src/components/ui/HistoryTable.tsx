import { useState } from 'react'
import { clsx } from 'clsx'
import { format } from 'date-fns'
import { useHistory, useDeletePrediction } from '@/hooks/useChurn'

const RISK_FILTERS = ['All', 'High', 'Medium', 'Low']

export default function HistoryTable() {
  const [filter, setFilter] = useState('All')
  const { data, isLoading, error, refetch } = useHistory(filter === 'All' ? undefined : filter)
  const deleteMutation = useDeletePrediction()

  if (isLoading) return (
    <div className="space-y-3 animate-fade-up">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton h-14 w-full" />
      ))}
    </div>
  )

  if (error) return (
    <div className="glass-card p-8 text-center animate-fade-up">
      <div className="text-4xl mb-3">⚠️</div>
      <p className="text-rose text-sm">Failed to load history. Is the backend running?</p>
    </div>
  )

  const riskColor: Record<string, string> = { High: '#FF4D6A', Medium: '#FFB547', Low: '#00E5A0' }
  const riskCls: Record<string, string> = { High: 'risk-high', Medium: 'risk-medium', Low: 'risk-low' }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-bold text-text text-lg">Prediction History</h2>
          {data && (
            <span className="text-xs font-mono text-dim bg-card border border-border px-2 py-1 rounded-full">
              {data.length} records
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {RISK_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150',
                filter === f ? 'bg-accent/10 text-accent border border-accent/30' : 'text-dim border border-border hover:text-text'
              )}>
              {f}
            </button>
          ))}
          <button onClick={() => refetch()} className="btn-ghost text-xs ml-2">↻ Refresh</button>
        </div>
      </div>

      {/* Table */}
      {!data?.length ? (
        <div className="glass-card p-16 text-center">
          <div className="text-5xl mb-4">🗃️</div>
          <p className="text-dim text-sm">No predictions yet. Run your first analysis!</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['#', 'Date', 'Tenure', 'Contract', 'Monthly', 'Internet', 'Probability', 'Risk', 'Verdict', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-mono text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={r.id}
                    className="border-b border-border/50 hover:bg-surface/50 transition-colors duration-100"
                    style={{ animation: `fadeUp 0.3s ${i * 0.03}s both` }}>
                    <td className="px-4 py-3 font-mono text-xs text-muted">#{r.id}</td>
                    <td className="px-4 py-3 text-xs text-dim whitespace-nowrap">
                      {format(new Date(r.created_at), 'MMM d, HH:mm')}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.tenure ?? '—'} mo</td>
                    <td className="px-4 py-3 text-xs text-dim">{r.contract ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">${r.monthly_charges ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-dim">{r.internet_service ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${Math.round(r.churn_probability * 100)}%`, background: riskColor[r.risk_level] }} />
                        </div>
                        <span className="font-mono text-xs">{Math.round(r.churn_probability * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('text-xs font-mono px-2 py-1 rounded-full border', riskCls[r.risk_level])}>
                        {r.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('text-xs font-mono px-2 py-1 rounded-full',
                        r.churn_prediction ? 'bg-rose/10 text-rose' : 'bg-emerald/10 text-emerald')}>
                        {r.churn_prediction ? 'Churn' : 'Stay'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteMutation.mutate(r.id)}
                        disabled={deleteMutation.isPending}
                        className="text-muted hover:text-rose transition-colors text-xs p-1 rounded"
                      >🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
