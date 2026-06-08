from sqlalchemy import Column, Integer, String, ForeignKey
from app.models.user import Base



class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id = Column(Integer, primary_key=True, index=True)

    transaction_id = Column(
        Integer,
        ForeignKey("transactions.id")
    )

    reason = Column(String)