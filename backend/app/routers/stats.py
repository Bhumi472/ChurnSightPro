from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from app.core.database import get_db
from app.models.prediction import Prediction
from app.services.ml_service import ml_service

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("")
def get_stats(db: Session = Depends(get_db)):
    total    = db.query(func.count(Prediction.id)).scalar() or 0
    churners = db.query(func.count(Prediction.id)).filter(Prediction.churn_prediction == 1).scalar() or 0
    avg_prob = db.query(func.avg(Prediction.churn_probability)).scalar() or 0.0

    risk_rows = db.query(Prediction.risk_level, func.count(Prediction.id))\
                  .group_by(Prediction.risk_level).all()
    risk_dist = {r[0]: r[1] for r in risk_rows}

    # Churn trend last 14 days
    try:
        trend_rows = (
            db.query(
                cast(Prediction.created_at, Date).label("day"),
                func.count(Prediction.id).label("total"),
                func.sum(Prediction.churn_prediction).label("churned"),
            )
            .group_by("day")
            .order_by("day")
            .limit(14)
            .all()
        )
        trend = [
            {
                "date":    str(r.day),
                "total":   r.total,
                "churned": int(r.churned or 0),
            }
            for r in trend_rows
        ]
    except Exception:
        trend = []

    return {
        "total_predictions":     total,
        "predicted_churners":    churners,
        "retention_rate":        round((total - churners) / total * 100, 1) if total else 0.0,
        "avg_churn_probability": round(float(avg_prob), 4),
        "model_accuracy":        round(ml_service.accuracy * 100, 2),
        "risk_distribution":     risk_dist,
        "feature_importances":   ml_service.get_top_features(10),
        "churn_trend":           trend,
    }