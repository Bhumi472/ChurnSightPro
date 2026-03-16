"""
Run this script inside Customer_Churn_WebApp/backend/
It will create:
  models/churn_model.pkl  — RandomForestClassifier(n_estimators=200, random_state=42)
  models/scaler.pkl       — StandardScaler

This replicates the exact pipeline from your Telco_Cusomer_Churn.csv notebook:
  1. get_dummies(drop_first=True)
  2. StandardScaler
  3. train_test_split(test_size=0.2, random_state=42)
  4. RandomForestClassifier(n_estimators=200, random_state=42)
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# ── If you have the original CSV, replace this block ──────────────────────────
CSV_PATH = "Telco_Cusomer_Churn.csv"

if os.path.exists(CSV_PATH):
    print(f"Found {CSV_PATH} — training on real data!")
    df = pd.read_csv(CSV_PATH)
    df.drop(columns=['customerID'], inplace=True)
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
    df['TotalCharges'] = df['TotalCharges'].fillna(df['TotalCharges'].median())
    df['Churn'] = df['Churn'].map({'Yes': 1, 'No': 0})

else:
    print("CSV not found — generating synthetic Telco data (same distribution)...")
    np.random.seed(42)
    n = 7043

    tenure   = np.random.randint(0, 72, n)
    monthly  = np.round(np.random.uniform(18.25, 118.75, n), 2)
    total    = np.round(tenure * monthly * np.random.uniform(0.9, 1.1, n), 2)
    senior   = np.random.binomial(1, 0.16, n)
    gender   = np.random.choice(['Male','Female'], n)
    partner  = np.random.choice(['Yes','No'], n)
    deps     = np.random.choice(['Yes','No'], n, p=[0.30, 0.70])
    phone    = np.random.choice(['Yes','No'], n, p=[0.90, 0.10])
    mlines   = np.where(phone=='No', 'No phone service', np.random.choice(['Yes','No'], n))
    internet = np.random.choice(['DSL','Fiber optic','No'], n, p=[0.34, 0.44, 0.22])

    def isvc(col, p):
        return np.where(col=='No', 'No internet service',
               np.where(np.random.random(len(col)) < p, 'Yes', 'No'))

    contract  = np.random.choice(['Month-to-month','One year','Two year'], n, p=[0.55, 0.21, 0.24])
    paperless = np.random.choice(['Yes','No'], n, p=[0.59, 0.41])
    payment   = np.random.choice(
        ['Electronic check','Mailed check','Bank transfer (automatic)','Credit card (automatic)'],
        n, p=[0.33, 0.23, 0.22, 0.22])

    churn_prob = np.clip(
        0.05
        + 0.30 * (contract == 'Month-to-month').astype(float)
        + 0.15 * (internet == 'Fiber optic').astype(float)
        + 0.10 * (payment == 'Electronic check').astype(float)
        - 0.003 * tenure,
        0.02, 0.95)
    churn = np.where(np.random.random(n) < churn_prob, 'Yes', 'No')

    df = pd.DataFrame({
        'gender': gender, 'SeniorCitizen': senior, 'Partner': partner,
        'Dependents': deps, 'tenure': tenure, 'PhoneService': phone,
        'MultipleLines': mlines, 'InternetService': internet,
        'OnlineSecurity': isvc(internet, 0.35), 'OnlineBackup': isvc(internet, 0.44),
        'DeviceProtection': isvc(internet, 0.44), 'TechSupport': isvc(internet, 0.35),
        'StreamingTV': isvc(internet, 0.44), 'StreamingMovies': isvc(internet, 0.44),
        'Contract': contract, 'PaperlessBilling': paperless, 'PaymentMethod': payment,
        'MonthlyCharges': monthly, 'TotalCharges': total, 'Churn': churn
    })

    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce').fillna(0)
    df['Churn'] = df['Churn'].map({'Yes': 1, 'No': 0})

# ── Exact notebook preprocessing ──────────────────────────────────────────────
cat_cols = df.select_dtypes(include='object').columns
df = pd.get_dummies(df, columns=cat_cols, drop_first=True)

feature_cols = [c for c in df.columns if c != 'Churn']
X_raw = df[feature_cols]
y = df['Churn']

# StandardScaler
scaler = StandardScaler()
X_scaled = pd.DataFrame(scaler.fit_transform(X_raw), columns=feature_cols)

# train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42)

# RandomForestClassifier — exact notebook params
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

acc = accuracy_score(y_test, model.predict(X_test))
print(f"\nAccuracy: {acc:.4f}")
print(classification_report(y_test, model.predict(X_test)))

# ── Save pkl files ─────────────────────────────────────────────────────────────
os.makedirs('models', exist_ok=True)

with open('models/churn_model.pkl', 'wb') as f:
    pickle.dump({
        'model': model,
        'feature_cols': feature_cols,
        'accuracy': acc
    }, f)

with open('models/scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

print("\n✅ models/churn_model.pkl saved")
print("✅ models/scaler.pkl saved")
print(f"   Model: RandomForestClassifier(n_estimators=200, random_state=42)")
print(f"   Features: {len(feature_cols)}")
print(f"   Scaler: StandardScaler")

import json
feat_imp = dict(zip(feature_cols, model.feature_importances_.tolist()))
with open('models/meta.json', 'w') as f:
    json.dump({'accuracy': acc, 'feature_cols': feature_cols, 'feat_imp': feat_imp}, f)
print("✅ models/meta.json saved")