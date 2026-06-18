from sqlalchemy import Column, Integer, String, Float, Boolean
from app.models.user import Base

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    fraud_amount_threshold = Column(Float, default=10000.0)
    high_risk_amount_threshold = Column(Float, default=50000.0)
    suspicious_locations = Column(String(500), default="Unknown,Foreign,DarkWeb")
    two_factor_enabled = Column(Boolean, default=False)
    session_timeout = Column(Integer, default=30)
