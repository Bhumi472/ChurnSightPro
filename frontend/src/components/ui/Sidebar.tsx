import { clsx } from 'clsx'
import { useHealth, useStats } from '@/hooks/useChurn'

type Page = 'predict' | 'result' | 'history' | 'analytics'

interface Props {
  page: Page
  setPage: (p: Page) => void
  hasResult: boolean
}

const NAV = [
  { id: 'predict'   as Page, icon: '⚡', label: 'Predict' },
  { id: 'result'    as Page, icon: '🎯', label: 'Result' },
  { id: 'history'   as Page, icon: '🗃️', label: 'History' },
  { id: 'analytics' as Page, icon: '📊', label: 'Analytics' },
]

export default function Sidebar({ page, setPage, hasResult }: Props) {
  const { data: health } = useHealth()
  const { data: stats } = useStats()
  const online = !!health?.status

  return (
    <aside className="w-60 min-h-screen bg-surface border-r border-border flex flex-col px-4 py-6 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #00D4FF22, #00D4FF44)', border: '1px solid rgba(0,212,255,0.3)' }}>
          <span className="text-lg">⚡</span>
        </div>
        <div>
          <div className="font-display font-bold text-text text-base tracking-tight">ChurnSight</div>
          <div className="text-xs text-dim font-mono">v2.0 · AI Engine</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 mb-6">
        {NAV.map(({ id, icon, label }) => {
          const disabled = id === 'result' && !hasResult
          return (
            <button
              key={id}
              onClick={() => !disabled && setPage(id)}
              disabled={disabled}
              className={clsx('nav-item', page === id && 'active', disabled && 'opacity-30 cursor-not-allowed')}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="glow-line mb-6" />

      {/* Status */}
      <div className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono mb-6',
        online ? 'bg-emerald/10 text-emerald border border-emerald/20' : 'bg-rose/10 text-rose border border-rose/20'
      )}>
        <span className={clsx('w-2 h-2 rounded-full', online ? 'bg-emerald' : 'bg-rose')}
              style={{ animation: 'pulse-dot 2s infinite' }} />
        {online ? `API Online · ${(health!.model_accuracy * 100).toFixed(1)}% acc` : 'API Offline'}
      </div>

      {/* Mini stats */}
      {stats && (
        <div className="flex flex-col gap-2 mb-auto">
          {[
            { label: 'Predictions', val: stats.total_predictions.toString(), color: 'text-text' },
            { label: 'Churn Rate', val: `${stats.total_predictions ? Math.round(stats.predicted_churners / stats.total_predictions * 100) : 0}%`, color: 'text-rose' },
            { label: 'Retention', val: `${stats.retention_rate}%`, color: 'text-emerald' },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex justify-between items-center px-3 py-2 bg-card rounded-lg border border-border">
              <span className="text-xs text-dim">{label}</span>
              <span className={clsx('text-sm font-display font-bold', color)}>{val}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 px-2">
        <div className="text-xs text-muted leading-relaxed font-mono">
          RandomForest · 200 trees<br />
          Telco Dataset · PostgreSQL
        </div>
      </div>
    </aside>
  )
}
