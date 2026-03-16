import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.logging import logger
from app.schemas.prediction import CustomerInput
from app.models.prediction import Prediction
from app.services.ml_service import ml_service

router = APIRouter(prefix="/predict", tags=["predict"])


@router.post("", status_code=201)
def predict_churn(payload: CustomerInput, db: Session = Depends(get_db)):
    try:
        inp = payload.model_dump()
        prob, pred, risk = ml_service.predict(inp)

        record = Prediction(
            customer_data     = json.dumps(inp),
            churn_probability = prob,
            churn_prediction  = pred,
            risk_level        = risk,
            tenure            = inp.get("tenure"),
            monthly_charges   = inp.get("MonthlyCharges"),
            total_charges     = inp.get("TotalCharges"),
            contract          = inp.get("Contract"),
            internet_service  = inp.get("InternetService"),
            payment_method    = inp.get("PaymentMethod"),
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        logger.info(f"Prediction #{record.id} — prob={prob:.3f} risk={risk}")

        return {
            "id":                record.id,
            "churn_probability": record.churn_probability,
            "churn_prediction":  record.churn_prediction,
            "risk_level":        record.risk_level,
            "created_at":        record.created_at.isoformat() if record.created_at else None,
        }

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))