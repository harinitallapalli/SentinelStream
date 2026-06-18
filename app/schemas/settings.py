from pydantic import BaseModel
from typing import Optional

class SystemSettingsUpdate(BaseModel):
    fraud_amount_threshold: float
    high_risk_amount_threshold: float
    suspicious_locations: str
    two_factor_enabled: Optional[bool] = False
    session_timeout: Optional[int] = 30
