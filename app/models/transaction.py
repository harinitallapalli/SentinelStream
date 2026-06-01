from sqlalchemy import Column, Integer, Float, String
from app.models.user import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    amount = Column(Float)
    location = Column(String(100))
    status = Column(String(50))