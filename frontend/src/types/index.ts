export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface CustomerInput {
  tenure: number
  MonthlyCharges: number
  TotalCharges: number
  SeniorCitizen: number
  gender: 'Male' | 'Female'
  Partner: 'Yes' | 'No'
  Dependents: 'Yes' | 'No'
  PhoneService: 'Yes' | 'No'
  MultipleLines: string
  InternetService: 'DSL' | 'Fiber optic' | 'No'
  OnlineSecurity: string
  OnlineBackup: string
  DeviceProtection: string
  TechSupport: string
  StreamingTV: string
  StreamingMovies: string
  Contract: 'Month-to-month' | 'One year' | 'Two year'
  PaperlessBilling: 'Yes' | 'No'
  PaymentMethod: string
}

export interface PredictionResult {
  id: number
  churn_probability: number
  churn_prediction: number
  risk_level: RiskLevel
  created_at: string
}

export interface PredictionRecord {
  id: number
  created_at: string
  churn_probability: number
  churn_prediction: number
  risk_level: RiskLevel
  tenure: number | null
  monthly_charges: number | null
  total_charges: number | null
  contract: string | null
  internet_service: string | null
  payment_method: string | null
}

export interface StatsData {
  total_predictions: number
  predicted_churners: number
  retention_rate: number
  avg_churn_probability: number
  model_accuracy: number
  risk_distribution: Record<string, number>
  feature_importances: [string, number][]
  churn_trend: { date: string; total: number; churned: number }[]
}

export interface HealthData {
  status: string
  model_accuracy: number
  features: number
  version: string
}
