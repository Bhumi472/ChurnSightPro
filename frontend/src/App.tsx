import { useState } from 'react'
import { clsx } from 'clsx'
import Sidebar from '@/components/ui/Sidebar'
import PredictForm from '@/components/forms/PredictForm'
import ResultCard from '@/components/ui/ResultCard'
import HistoryTable from '@/components/ui/HistoryTable'
import AnalyticsDashboard from '@/components/charts/AnalyticsDashboard'
import { usePredict } from '@/hooks/useChurn'
import type { PredictionResult } from '@/types'

type Page = 'predict' | 'result' | 'history' | 'analytics'

const PAGE_TITLES: Record<Page, string> = {
  predict:   'Customer Churn Predictor',
  result:    'Prediction Result',
  history:   'Prediction History',
  analytics: 'Analytics Dashboard',
}

export default function App() {
  const [page, setPage]     = useState<Page>('predict')
  const [result, setResult] = useState<PredictionResult | null>(null)
  const predict = usePredict()

  const handlePredict = async (data: Parameters<typeof predict.mutateAsync>[0]) => {
    try {
      const res = await predict.mutateAsync(data)
      setResult(res)
      setPage('result')
    } catch {}
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar page={page} setPage={setPage} hasResult={!!result} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-surface/80 border-b border-border flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h1 className="font-display font-bold text-text">{PAGE_TITLES[page]}</h1>
            {page === 'predict' && (
              <span className="text-xs font-mono text-dim bg-card border border-border px-2 py-1 rounded-full hidden sm:block">
                19 features · RandomForest
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-mono text-dim hidden md:flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: 'pulse-dot 2s infinite' }} />
              ML Powered
            </div>
          </div>
        </header>

        {/* Error banner */}
        {predict.isError && (
          <div className="mx-8 mt-4 flex items-center justify-between bg-rose/10 border border-rose/30 text-rose px-5 py-3 rounded-xl text-sm font-mono">
            <span>❌ {predict.error?.message || 'Could not reach backend. Is it running on port 8000?'}</span>
            <button onClick={() => predict.reset()} className="text-rose/60 hover:text-rose ml-4">✕</button>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          {page === 'predict' && (
            <PredictForm onSubmit={handlePredict} loading={predict.isPending} />
          )}
          {page === 'result' && result && (
            <ResultCard result={result} onNewPrediction={() => setPage('predict')} />
          )}
          {page === 'history' && <HistoryTable />}
          {page === 'analytics' && <AnalyticsDashboard />}
        </main>
      </div>
    </div>
  )
}
