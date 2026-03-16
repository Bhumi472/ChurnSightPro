import { clsx } from 'clsx'
import type { PredictionResult } from '@/types'

interface Props { result: PredictionResult; onNewPrediction: () => void }

const RISK = {
  High:   { color: '#FF4D6A', glow: 'shadow-glow-rose',   label: 'High Risk',   emoji: '🔴', cls: 'risk-high' },
  Medium: { color: '#FFB547', glow: 'shadow-glow-cyan',    label: 'Medium Risk', emoji: '🟡', cls: 'risk-medium' },
  Low:    { color: '#00E5A0', glow: 'shadow-glow-emerald', label: 'Low Risk',    emoji: '🟢', cls: 'risk-low' },
}

const RECS = {
  High:   'Immediate action needed. Offer a loyalty discount, contract upgrade, or personal outreach call within 24 hours to prevent this customer from leaving.',
  Medium: 'Monitor closely. A proactive email with a personalized retention offer could significantly reduce this customer\'s churn likelihood.',
  Low:    'This customer appears highly satisfied. Continue standard service quality and schedule a periodic check-in to maintain loyalty.',
}

export default function ResultCard({ result, onNewPrediction }: Props) {
  const { churn_probability, churn_prediction, risk_level } = result
  const cfg = RISK[risk_level]
  const pct = Math.round(churn_probability * 100)
  const willChurn = churn_prediction === 1

  // SVG gauge
  const r = 54, circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="max-w-2xl space-y-5">

      {/* Verdict banner */}
      <div className={clsx('glass-card p-6 flex items-center gap-5 animate-fade-up border-l-4')}
        style={{ borderLeftColor: cfg.color }}>
        <div className="text-4xl">{willChurn ? '⚠️' : '✅'}</div>
        <div className="flex-1">
          <h2 className="font-display font-bold text-2xl mb-1" style={{ color: cfg.color }}>
            {willChurn ? 'Likely to Churn' : 'Likely to Stay'}
          </h2>
          <p className="text-dim text-sm">Prediction #{result.id} · {new Date(result.created_at).toLocaleString()}</p>
        </div>
        <span className={clsx('px-4 py-2 rounded-full text-sm font-display font-semibold border', cfg.cls)}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      {/* Gauge + details */}
      <div className="grid grid-cols-2 gap-5">
        {/* Gauge */}
        <div className="glass-card p-6 flex flex-col items-center justify-center animate-fade-up-1">
          <svg width="160" height="160" viewBox="0 0 120 120">
            {/* Background rings */}
            <circle cx="60" cy="60" r="54" fill="none" stroke="#1E2A3D" strokeWidth="10" />
            <circle cx="60" cy="60" r="44" fill="none" stroke="#131929" strokeWidth="1" strokeDasharray="4 4" />
            {/* Progress arc */}
            <circle cx="60" cy="60" r="54"
              fill="none"
              stroke={cfg.color}
              strokeWidth="10"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${cfg.color}66)` }}
            />
            {/* Center text */}
            <text x="60" y="53" textAnchor="middle" fontSize="24" fontWeight="800" fill={cfg.color} fontFamily="Syne">{pct}%</text>
            <text x="60" y="67" textAnchor="middle" fontSize="9" fill="#8892A4" fontFamily="DM Sans">churn probability</text>
            <text x="60" y="79" textAnchor="middle" fontSize="8" fill="#4A5568" fontFamily="DM Mono">RF · 200 trees</text>
          </svg>
        </div>

        {/* Details */}
        <div className="glass-card p-6 space-y-3 animate-fade-up-2">
          {[
            { label: 'Prediction',   val: willChurn ? 'Will Churn' : 'Will Stay', color: willChurn ? 'text-rose' : 'text-emerald' },
            { label: 'Risk Level',   val: risk_level, color: willChurn ? (risk_level === 'High' ? 'text-rose' : 'text-amber') : 'text-emerald' },
            { label: 'Confidence',   val: `${willChurn ? pct : 100 - pct}%`, color: 'text-text' },
            { label: 'Record ID',    val: `#${result.id}`, color: 'text-dim' },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-xs font-mono text-dim uppercase tracking-wider">{label}</span>
              <span className={clsx('text-sm font-display font-semibold', color)}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="glass-card p-5 animate-fade-up-3" style={{ borderColor: `${cfg.color}33` }}>
        <div className="flex items-start gap-3">
          <div className="text-2xl mt-0.5">💡</div>
          <div>
            <div className="font-display font-semibold text-sm mb-1.5" style={{ color: cfg.color }}>
              Recommended Action
            </div>
            <p className="text-dim text-sm leading-relaxed">{RECS[risk_level]}</p>
          </div>
        </div>
      </div>

      <button onClick={onNewPrediction} className="btn-ghost animate-fade-up-4">
        ← New Prediction
      </button>
    </div>
  )
}
