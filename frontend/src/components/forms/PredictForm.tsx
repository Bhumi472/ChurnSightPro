import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clsx } from 'clsx'
import type { CustomerInput } from '@/types'

const schema = z.object({
  tenure:           z.number().min(0).max(72),
  MonthlyCharges:   z.number().min(0).max(200),
  TotalCharges:     z.number().min(0),
  SeniorCitizen:    z.number().min(0).max(1),
  gender:           z.enum(['Male', 'Female']),
  Partner:          z.enum(['Yes', 'No']),
  Dependents:       z.enum(['Yes', 'No']),
  PhoneService:     z.enum(['Yes', 'No']),
  MultipleLines:    z.string(),
  InternetService:  z.enum(['DSL', 'Fiber optic', 'No']),
  OnlineSecurity:   z.string(),
  OnlineBackup:     z.string(),
  DeviceProtection: z.string(),
  TechSupport:      z.string(),
  StreamingTV:      z.string(),
  StreamingMovies:  z.string(),
  Contract:         z.enum(['Month-to-month', 'One year', 'Two year']),
  PaperlessBilling: z.enum(['Yes', 'No']),
  PaymentMethod:    z.string(),
})

type FormData = z.infer<typeof schema>

interface Props { onSubmit: (d: CustomerInput) => void; loading: boolean }

const DEFAULTS: FormData = {
  tenure: 24, MonthlyCharges: 65, TotalCharges: 1560,
  SeniorCitizen: 0, gender: 'Male', Partner: 'No', Dependents: 'No',
  PhoneService: 'Yes', MultipleLines: 'No', InternetService: 'Fiber optic',
  OnlineSecurity: 'No', OnlineBackup: 'No', DeviceProtection: 'No',
  TechSupport: 'No', StreamingTV: 'No', StreamingMovies: 'No',
  Contract: 'Month-to-month', PaperlessBilling: 'Yes', PaymentMethod: 'Electronic check',
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-mono text-dim uppercase tracking-widest mb-1.5">{children}</label>
}

function FieldWrap({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div>
      {children}
      {error && <p className="text-rose text-xs mt-1 font-mono">{error}</p>}
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={clsx(
        'relative w-11 h-6 rounded-full border transition-all duration-300 mt-1',
        value ? 'bg-accent/20 border-accent' : 'bg-surface border-border'
      )}>
      <span className={clsx(
        'absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 shadow-sm',
        value ? 'left-5 bg-accent' : 'left-0.5 bg-muted'
      )} />
    </button>
  )
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-sm">{icon}</div>
      <h3 className="font-display font-semibold text-text text-sm tracking-wide">{title}</h3>
      <div className="flex-1 h-px bg-border ml-2" />
    </div>
  )
}

export default function PredictForm({ onSubmit, loading }: Props) {
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  })

  const internet = watch('InternetService')
  const svcOpts = internet === 'No' ? ['No internet service'] : ['No', 'Yes', 'No internet service']

  return (
    <form onSubmit={handleSubmit(d => onSubmit(d as CustomerInput))} className="max-w-4xl space-y-6">

      {/* Customer Info */}
      <div className="glass-card p-6 animate-fade-up">
        <SectionHeader icon="👤" title="Customer Info" />
        <div className="grid grid-cols-3 gap-5 mb-5">
          <FieldWrap error={errors.tenure?.message}>
            <Label>Tenure (months)</Label>
            <input type="number" {...register('tenure', { valueAsNumber: true })}
              className="field-base" placeholder="24" />
          </FieldWrap>
          <FieldWrap error={errors.MonthlyCharges?.message}>
            <Label>Monthly Charges ($)</Label>
            <input type="number" step="0.01" {...register('MonthlyCharges', { valueAsNumber: true })}
              className="field-base" placeholder="65.00" />
          </FieldWrap>
          <FieldWrap error={errors.TotalCharges?.message}>
            <Label>Total Charges ($)</Label>
            <input type="number" step="0.01" {...register('TotalCharges', { valueAsNumber: true })}
              className="field-base" placeholder="1560.00" />
          </FieldWrap>
        </div>

        <div className="grid grid-cols-4 gap-5">
          <FieldWrap>
            <Label>Gender</Label>
            <select {...register('gender')} className="field-base">
              <option>Male</option><option>Female</option>
            </select>
          </FieldWrap>
          <FieldWrap>
            <Label>Senior Citizen</Label>
            <Controller control={control} name="SeniorCitizen" render={({ field }) => (
              <Toggle value={field.value === 1} onChange={v => field.onChange(v ? 1 : 0)} />
            )} />
          </FieldWrap>
          <FieldWrap>
            <Label>Has Partner</Label>
            <Controller control={control} name="Partner" render={({ field }) => (
              <Toggle value={field.value === 'Yes'} onChange={v => field.onChange(v ? 'Yes' : 'No')} />
            )} />
          </FieldWrap>
          <FieldWrap>
            <Label>Has Dependents</Label>
            <Controller control={control} name="Dependents" render={({ field }) => (
              <Toggle value={field.value === 'Yes'} onChange={v => field.onChange(v ? 'Yes' : 'No')} />
            )} />
          </FieldWrap>
        </div>
      </div>

      {/* Services */}
      <div className="glass-card p-6 animate-fade-up-1">
        <SectionHeader icon="📡" title="Services" />
        <div className="grid grid-cols-3 gap-5 mb-5">
          {[
            { name: 'PhoneService' as const, label: 'Phone Service', opts: ['Yes','No'] },
            { name: 'MultipleLines' as const, label: 'Multiple Lines', opts: ['No','Yes','No phone service'] },
            { name: 'InternetService' as const, label: 'Internet Service', opts: ['DSL','Fiber optic','No'] },
          ].map(({ name, label, opts }) => (
            <FieldWrap key={name}>
              <Label>{label}</Label>
              <select {...register(name)} className="field-base">
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </FieldWrap>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-5">
          {(['OnlineSecurity','OnlineBackup','DeviceProtection','TechSupport','StreamingTV','StreamingMovies'] as const).map(name => (
            <FieldWrap key={name}>
              <Label>{name.replace(/([A-Z])/g, ' $1').trim()}</Label>
              <select {...register(name)} className="field-base">
                {svcOpts.map(o => <option key={o}>{o}</option>)}
              </select>
            </FieldWrap>
          ))}
        </div>
      </div>

      {/* Contract & Billing */}
      <div className="glass-card p-6 animate-fade-up-2">
        <SectionHeader icon="📋" title="Contract & Billing" />
        <div className="grid grid-cols-3 gap-5">
          <FieldWrap>
            <Label>Contract Type</Label>
            <select {...register('Contract')} className="field-base">
              <option>Month-to-month</option>
              <option>One year</option>
              <option>Two year</option>
            </select>
          </FieldWrap>
          <FieldWrap>
            <Label>Payment Method</Label>
            <select {...register('PaymentMethod')} className="field-base">
              <option>Electronic check</option>
              <option>Mailed check</option>
              <option>Bank transfer (automatic)</option>
              <option>Credit card (automatic)</option>
            </select>
          </FieldWrap>
          <FieldWrap>
            <Label>Paperless Billing</Label>
            <Controller control={control} name="PaperlessBilling" render={({ field }) => (
              <Toggle value={field.value === 'Yes'} onChange={v => field.onChange(v ? 'Yes' : 'No')} />
            )} />
          </FieldWrap>
        </div>
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading} className="btn-primary w-full max-w-sm h-12 animate-fade-up-3">
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin-slow" />
            Analyzing customer profile…
          </>
        ) : (
          <>⚡ Predict Churn Risk</>
        )}
      </button>
    </form>
  )
}
