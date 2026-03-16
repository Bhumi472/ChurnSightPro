from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Tuple
from datetime import datetime
from enum import Enum


class InternetServiceEnum(str, Enum):
    DSL = "DSL"
    Fiber = "Fiber optic"
    No = "No"


class ContractEnum(str, Enum):
    Monthly = "Month-to-month"
    OneYear = "One year"
    TwoYear = "Two year"


class PaymentEnum(str, Enum):
    ElectronicCheck = "Electronic check"
    MailedCheck = "Mailed check"
    BankTransfer = "Bank transfer (automatic)"
    CreditCard = "Credit card (automatic)"


class CustomerInput(BaseModel):
    tenure:           int   = Field(..., ge=0, le=72,    description="Months as customer")
    MonthlyCharges:   float = Field(..., ge=0, le=200,   description="Monthly bill amount")
    TotalCharges:     float = Field(..., ge=0,           description="Total spend to date")
    SeniorCitizen:    int   = Field(..., ge=0, le=1)
    gender:           str   = Field(..., pattern="^(Male|Female)$")
    Partner:          str   = Field(..., pattern="^(Yes|No)$")
    Dependents:       str   = Field(..., pattern="^(Yes|No)$")
    PhoneService:     str   = Field(..., pattern="^(Yes|No)$")
    MultipleLines:    str
    InternetService:  InternetServiceEnum
    OnlineSecurity:   str
    OnlineBackup:     str
    DeviceProtection: str
    TechSupport:      str
    StreamingTV:      str
    StreamingMovies:  str
    Contract:         ContractEnum
    PaperlessBilling: str   = Field(..., pattern="^(Yes|No)$")
    PaymentMethod:    PaymentEnum

    @field_validator("TotalCharges")
    @classmethod
    def total_gte_monthly(cls, v, info):
        return v  # Allow any total — could be first partial month


class PredictionResponse(BaseModel):
    id:                int
    churn_probability: float
    churn_prediction:  int
    risk_level:        str
    created_at:        datetime

    class Config:
        from_attributes = True


class PredictionRecord(BaseModel):
    id:                int
    created_at:        datetime
    churn_probability: float
    churn_prediction:  int
    risk_level:        str
    tenure:            Optional[float]
    monthly_charges:   Optional[float]
    total_charges:     Optional[float]
    contract:          Optional[str]
    internet_service:  Optional[str]
    payment_method:    Optional[str]

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    total_predictions:     int
    predicted_churners:    int
    retention_rate:        float
    avg_churn_probability: float
    model_accuracy:        float
    risk_distribution:     dict
    feature_importances:   List[Tuple[str, float]]
    churn_trend:           List[dict]
