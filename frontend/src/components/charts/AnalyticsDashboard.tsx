import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts'
import { useStats } from '@/hooks/useChurn'
import { clsx } from 'clsx'

function KPICard({ icon, value, label, color, delay }: {
  icon: string; value: string; label: string; color: string; delay: string
}) {
  return (
    <div className="glass-card p-5 flex flex-col gap-2" style={{ animation: `fadeUp 0.4s ${delay} both` }}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        </div>
      </div>
      <div className="font-display font-black text-3xl tracking-tight" style={{ color }}>{value}</div>
      <div className="text-xs font-mono text-dim uppercase tracking-wider">{label}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 text-xs font-mono shadow-xl">
      <div className="text-dim mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</div>
      ))}
    </div>
  )
}

export default function AnalyticsDashboard() {
  const { data: stats, isLoading, error } = useStats()

  if (isLoading) return (
    <div className="space-y-4 animate-fade-up">
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28" />)}</div>
      <div className="skeleton h-64" />
    </div>
  )

  if (error || !stats) return (
    <div className="glass-card p-16 text-center animate-fade-up">
      <div className="text-4xl mb-3">📊</div>
      <p className="text-dim text-sm">No analytics data yet. Run some predictions first!</p>
    </div>
  )

  const { total_predictions, predicted_churners, retention_rate, avg_churn_probability,
          model_accuracy, risk_distribution, feature_importances, churn_trend } = stats

  const riskData = Object.entries(risk_distribution).map(([name, value]) => ({
    name, value,
    color: name === 'High' ? '#FF4D6A' : name === 'Medium' ? '#FFB547' : '#00E5A0'
  }))

  const featData = feature_importances.slice(0, 8).map(([name, val]) => ({
    name: name.length > 20 ? name.slice(0, 20) + '…' : name,
    value: Math.round(val * 1000) / 10,
  }))

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard icon="🔢" value={total_predictions.toString()} label="Total Predictions" color="#00D4FF" delay="0ms" />
        <KPICard icon="⚠️" value={predicted_churners.toString()} label="Predicted Churners" color="#FF4D6A" delay="50ms" />
        <KPICard icon="✅" value={`${retention_rate}%`} label="Retention Rate" color="#00E5A0" delay="100ms" />
        <KPICard icon="🎯" value={`${model_accuracy}%`} label="Model Accuracy" color="#00D4FF" delay="150ms" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Risk distribution */}
        <div className="glass-card p-5 animate-fade-up-1">
          <h3 className="font-display font-semibold text-sm text-dim uppercase tracking-wider mb-5">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={riskData} barSize={40}>
              <XAxis dataKey="name" tick={{ fill: '#8892A4', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8892A4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Avg probability meter */}
        <div className="glass-card p-5 animate-fade-up-2 flex flex-col">
          <h3 className="font-display font-semibold text-sm text-dim uppercase tracking-wider mb-5">Avg Churn Probability</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative">
              <svg width="160" height="100" viewBox="0 0 160 100">
                <path d="M 20 90 A 70 70 0 0 1 140 90" fill="none" stroke="#1E2A3D" strokeWidth="12" strokeLinecap="round" />
                <path d="M 20 90 A 70 70 0 0 1 140 90"
                  fill="none" stroke="#00D4FF" strokeWidth="12" strokeLinecap="round"
                  strokeDasharray="220"
                  strokeDashoffset={220 - (avg_churn_probability * 220)}
                  style={{ transition: 'stroke-dashoffset 1.5s ease', filter: 'drop-shadow(0 0 6px #00D4FF66)' }}
                />
                <text x="80" y="75" textAnchor="middle" fontSize="24" fontWeight="800" fill="#00D4FF" fontFamily="Syne">
                  {Math.round(avg_churn_probability * 100)}%
                </text>
                <text x="80" y="92" textAnchor="middle" fontSize="9" fill="#8892A4" fontFamily="DM Mono">average probability</text>
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full mt-2">
              {[
                { label: 'Churners', val: predicted_churners, color: '#FF4D6A' },
                { label: 'Retained', val: total_predictions - predicted_churners, color: '#00E5A0' },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-surface rounded-xl p-3 text-center border border-border">
                  <div className="font-display font-bold text-xl" style={{ color }}>{val}</div>
                  <div className="text-xs font-mono text-muted mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trend */}
        <div className="glass-card p-5 animate-fade-up-3">
          <h3 className="font-display font-semibold text-sm text-dim uppercase tracking-wider mb-5">Churn Trend</h3>
          {churn_trend.length > 1 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={churn_trend}>
                <CartesianGrid stroke="#1E2A3D" strokeDasharray="4 4" />
                <XAxis dataKey="date" tick={{ fill: '#8892A4', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8892A4', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="churned" stroke="#FF4D6A" strokeWidth={2} dot={false} name="Churned" />
                <Line type="monotone" dataKey="total" stroke="#00D4FF" strokeWidth={2} dot={false} name="Total" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-dim text-sm font-mono">
              Need more data to show trend
            </div>
          )}
        </div>
      </div>

      {/* Feature importances */}
      <div className="glass-card p-5 animate-fade-up-4">
        <h3 className="font-display font-semibold text-sm text-dim uppercase tracking-wider mb-5">
          Top Feature Importances <span className="text-muted normal-case font-mono font-normal text-xs ml-2">— what drives the model's decisions</span>
        </h3>
        <div className="space-y-3">
          {featData.map(({ name, value }, i) => (
            <div key={name} className="flex items-center gap-4">
              <span className="text-xs font-mono text-muted w-5 text-right">#{i + 1}</span>
              <span className="text-xs font-mono text-dim w-44 truncate">{name}</span>
              <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(value * 5, 100)}%`,
                    background: `linear-gradient(90deg, #00D4FF, #00E5A0)`,
                    animationDelay: `${i * 60}ms`,
                    boxShadow: '0 0 6px rgba(0,212,255,0.3)'
                  }} />
              </div>
              <span className="text-xs font-mono text-dim w-12 text-right">{value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
