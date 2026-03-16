from sqlalchemy import Column, Integer, Float, String, Text, DateTime, func
from app.core.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id                = Column(Integer, primary_key=True, index=True)
    created_at        = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    customer_data     = Column(Text, nullable=False)          # JSON blob of raw inputs
    churn_probability = Column(Float, nullable=False)
    churn_prediction  = Column(Integer, nullable=False)       # 0 or 1
    risk_level        = Column(String(10), nullable=False)    # Low / Medium / High

    # Denormalized for fast queries / filtering
    tenure            = Column(Float, nullable=True)
    monthly_charges   = Column(Float, nullable=True)
    total_charges     = Column(Float, nullable=True)
    contract          = Column(String(50), nullable=True)
    internet_service  = Column(String(50), nullable=True)
    payment_method    = Column(String(80), nullable=True)
