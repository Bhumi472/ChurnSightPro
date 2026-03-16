import json
import pickle
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any
from app.core.config import settings
from app.core.logging import logger


class MLService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_cols = []
        self.accuracy = 0.0
        self.feat_imp: Dict[str, float] = {}

    def load(self):
        logger.info("Loading ML model and scaler...")
        try:
            with open(settings.MODEL_PATH, "rb") as f:
                model_data = pickle.load(f)
            self.model        = model_data["model"]
            self.feature_cols = model_data["feature_cols"]
            self.accuracy     = model_data["accuracy"]

            with open(settings.SCALER_PATH, "rb") as f:
                self.scaler = pickle.load(f)

            try:
                with open(settings.META_PATH) as f:
                    meta = json.load(f)
                self.feat_imp = meta.get("feat_imp", {})
            except FileNotFoundError:
                self.feat_imp = dict(zip(self.feature_cols, self.model.feature_importances_))

            logger.info(f"Model loaded — accuracy={self.accuracy:.4f}, features={len(self.feature_cols)}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def _build_feature_vector(self, inp: Dict[str, Any]) -> pd.DataFrame:
        row = {col: 0 for col in self.feature_cols}

        row["SeniorCitizen"]  = 1 if inp.get("SeniorCitizen") else 0
        row["tenure"]         = float(inp.get("tenure", 0))
        row["MonthlyCharges"] = float(inp.get("MonthlyCharges", 0))
        row["TotalCharges"]   = float(inp.get("TotalCharges", 0))

        def set_if(key, val):
            if key in row:
                row[key] = val

        if inp.get("gender") == "Male":      set_if("gender_Male", 1)
        if inp.get("Partner") == "Yes":      set_if("Partner_Yes", 1)
        if inp.get("Dependents") == "Yes":   set_if("Dependents_Yes", 1)
        if inp.get("PhoneService") == "Yes": set_if("PhoneService_Yes", 1)

        ml = inp.get("MultipleLines", "No")
        if ml == "No phone service": set_if("MultipleLines_No phone service", 1)
        elif ml == "Yes":            set_if("MultipleLines_Yes", 1)

        iservice = inp.get("InternetService", "DSL")
        if iservice == "Fiber optic": set_if("InternetService_Fiber optic", 1)
        elif iservice == "No":        set_if("InternetService_No", 1)

        for svc in ["OnlineSecurity", "OnlineBackup", "DeviceProtection",
                    "TechSupport", "StreamingTV", "StreamingMovies"]:
            val = inp.get(svc, "No")
            if val == "No internet service": set_if(f"{svc}_No internet service", 1)
            elif val == "Yes":               set_if(f"{svc}_Yes", 1)

        contract = inp.get("Contract", "Month-to-month")
        if contract == "One year": set_if("Contract_One year", 1)
        if contract == "Two year": set_if("Contract_Two year", 1)

        if inp.get("PaperlessBilling") == "Yes": set_if("PaperlessBilling_Yes", 1)

        pm_map = {
            "Credit card (automatic)": "PaymentMethod_Credit card (automatic)",
            "Electronic check":        "PaymentMethod_Electronic check",
            "Mailed check":            "PaymentMethod_Mailed check",
        }
        pm = inp.get("PaymentMethod", "")
        if pm in pm_map: set_if(pm_map[pm], 1)

        return pd.DataFrame([row])[self.feature_cols]

    def predict(self, inp: Dict[str, Any]) -> Tuple[float, int, str]:
        X    = self._build_feature_vector(inp)
        # Keep as DataFrame so sklearn doesn't warn about feature names
        X_sc = pd.DataFrame(
            self.scaler.transform(X),
            columns=self.feature_cols
        )
        prob = float(self.model.predict_proba(X_sc)[0][1])
        pred = int(prob >= 0.5)
        risk = "High" if prob >= 0.65 else "Medium" if prob >= 0.40 else "Low"
        return round(prob, 4), pred, risk

    def get_top_features(self, n: int = 10):
        return sorted(self.feat_imp.items(), key=lambda x: -x[1])[:n]


ml_service = MLService()