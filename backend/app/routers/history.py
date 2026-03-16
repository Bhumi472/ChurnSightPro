from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.core.database import get_db
from app.models.prediction import Prediction

router = APIRouter(prefix="/history", tags=["history"])


@router.get("")
def get_history(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    risk_level: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    q = db.query(Prediction).order_by(desc(Prediction.created_at))
    if risk_level and risk_level in ("Low", "Medium", "High"):
        q = q.filter(Prediction.risk_level == risk_level)
    records = q.offset(offset).limit(limit).all()

    return [
        {
            "id":                r.id,
            "created_at":        r.created_at.isoformat() if r.created_at else None,
            "churn_probability": r.churn_probability,
            "churn_prediction":  r.churn_prediction,
            "risk_level":        r.risk_level,
            "tenure":            r.tenure,
            "monthly_charges":   r.monthly_charges,
            "total_charges":     r.total_charges,
            "contract":          r.contract,
            "internet_service":  r.internet_service,
            "payment_method":    r.payment_method,
        }
        for r in records
    ]


@router.delete("/{pred_id}", status_code=204)
def delete_prediction(pred_id: int, db: Session = Depends(get_db)):
    record = db.query(Prediction).filter(Prediction.id == pred_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")
    db.delete(record)
    db.commit()