from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.models.user import Base
from datetime import datetime

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    key_name = Column(String(100))
    token_preview = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
