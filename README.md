# ⚡ ChurnSight v2.0 — Industry-Grade AI Churn Intelligence

A production-ready full-stack ML application for predicting customer churn, built to industry standards.

## Tech Stack

| Layer       | Technology                                              |
|-------------|---------------------------------------------------------|
| Backend API | **FastAPI** + Uvicorn (ASGI)                           |
| Database    | **PostgreSQL 16** + SQLAlchemy 2.0 ORM                 |
| Validation  | **Pydantic v2** schemas                                 |
| ML Model    | scikit-learn **RandomForestClassifier** (200 trees)    |
| Frontend    | **React 18** + **TypeScript** + **Vite**               |
| Data Layer  | **TanStack React Query v5** (caching + auto-refetch)   |
| Forms       | **React Hook Form** + **Zod** validation               |
| Charts      | **Recharts**                                           |
| Styling     | **Tailwind CSS v3** + custom design system             |
| DevOps      | **Docker** + **docker-compose** + **GitHub Actions**   |

---

## Project Structure

```
ChurnSightPro/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + lifespan
│   │   ├── core/
│   │   │   ├── config.py        # Pydantic settings from .env
│   │   │   ├── database.py      # SQLAlchemy engine + session
│   │   │   └── logging.py       # Structured logging
│   │   ├── models/
│   │   │   └── prediction.py    # SQLAlchemy ORM model
│   │   ├── schemas/
│   │   │   └── prediction.py    # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── predict.py       # POST /api/predict
│   │   │   ├── history.py       # GET/DELETE /api/history
│   │   │   └── stats.py         # GET /api/stats
│   │   └── services/
│   │       └── ml_service.py    # Isolated ML logic
│   ├── tests/
│   │   └── test_predict.py      # pytest test suite
│   ├── generate_model.py        # Train + save model
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx             # Entry + QueryClientProvider
│   │   ├── App.tsx              # Root + page routing
│   │   ├── types/index.ts       # TypeScript interfaces
│   │   ├── lib/api.ts           # Typed fetch wrappers
│   │   ├── hooks/useChurn.ts    # React Query hooks
│   │   └── components/
│   │       ├── forms/PredictForm.tsx      # RHF + Zod form
│   │       ├── ui/Sidebar.tsx             # Navigation
│   │       ├── ui/ResultCard.tsx          # Prediction result
│   │       ├── ui/HistoryTable.tsx        # DB history
│   │       └── charts/AnalyticsDashboard.tsx  # Recharts
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml           # One-command startup
├── .github/workflows/ci.yml     # GitHub Actions CI
└── .gitignore
```

---

## 🚀 Quick Start

### Option A — Docker (Recommended, one command)

```bash
# 1. Train the model first
cd backend
python generate_model.py

# 2. Start everything
cd ..
docker-compose up --build
```

Open **http://localhost:3000**

### Option B — Local Development

**Backend:**
```bash
cd backend

# Virtual environment
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate

# Install
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env — set DATABASE_URL to your PostgreSQL connection

# Train model (once)
python generate_model.py

# Run
uvicorn app.main:app --reload --port 8000
# API docs → http://localhost:8000/docs
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## API Documentation

FastAPI auto-generates interactive docs at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints

| Method | Endpoint              | Description                           |
|--------|-----------------------|---------------------------------------|
| GET    | `/api/health`         | Health check + model info             |
| POST   | `/api/predict`        | Predict churn (validated by Pydantic) |
| GET    | `/api/history`        | Paginated prediction history          |
| DELETE | `/api/history/{id}`   | Delete a prediction record            |
| GET    | `/api/stats`          | Aggregated analytics + feature imp.   |

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

---

## ML Pipeline

1. Load `Telco_Cusomer_Churn.csv` (7,043 real customers)
2. Clean: convert `TotalCharges`, map `Churn` Yes/No → 1/0
3. `pd.get_dummies(drop_first=True)` → 30 features
4. `StandardScaler` normalization
5. `train_test_split(test_size=0.2, random_state=42)`
6. `RandomForestClassifier(n_estimators=200, random_state=42)`
7. Accuracy: ~79.5% on test set

### Risk Thresholds
| Risk   | Probability |
|--------|-------------|
| Low    | < 40%       |
| Medium | 40% – 65%   |
| High   | ≥ 65%       |
