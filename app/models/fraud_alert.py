from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from app.models.user import Base



class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id = Column(Integer, primary_key=True, index=True)

    transaction_id = Column(
        Integer,
        ForeignKey("transactions.id")
    )

    reason = Column(String)
    resolved = Column(Boolean, default=False)
    priority = Column(String(50), default="MEDIUM")
    review_notes = Column(String(500), nullable=True)
    reason_code = Column(String(100), nullable=True)
    resolved_by = Column(String(100), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
