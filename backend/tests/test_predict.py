import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)

SAMPLE_PAYLOAD = {
    "tenure": 24,
    "MonthlyCharges": 65.0,
    "TotalCharges": 1560.0,
    "SeniorCitizen": 0,
    "gender": "Male",
    "Partner": "No",
    "Dependents": "No",
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "Fiber optic",
    "OnlineSecurity": "No",
    "OnlineBackup": "No",
    "DeviceProtection": "No",
    "TechSupport": "No",
    "StreamingTV": "No",
    "StreamingMovies": "No",
    "Contract": "Month-to-month",
    "PaperlessBilling": "Yes",
    "PaymentMethod": "Electronic check",
}


def test_health():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


def test_predict_valid():
    resp = client.post("/api/predict", json=SAMPLE_PAYLOAD)
    assert resp.status_code == 201
    data = resp.json()
    assert "churn_probability" in data
    assert 0.0 <= data["churn_probability"] <= 1.0
    assert data["risk_level"] in ("Low", "Medium", "High")
    assert data["churn_prediction"] in (0, 1)


def test_predict_invalid_tenure():
    bad = {**SAMPLE_PAYLOAD, "tenure": -5}
    resp = client.post("/api/predict", json=bad)
    assert resp.status_code == 422


def test_predict_invalid_gender():
    bad = {**SAMPLE_PAYLOAD, "gender": "Unknown"}
    resp = client.post("/api/predict", json=bad)
    assert resp.status_code == 422


def test_history():
    resp = client.get("/api/history")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_stats():
    resp = client.get("/api/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_predictions" in data
    assert "model_accuracy" in data
