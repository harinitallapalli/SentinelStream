from sqlalchemy import Column, Integer, String, DateTime
from app.models.user import Base
from datetime import datetime

class SystemReport(Base):
    __tablename__ = "system_reports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200))
    file_type = Column(String(50), default="PDF")
    created_at = Column(DateTime, default=datetime.utcnow)
    file_size = Column(String(50), default="1.2 MB")
    status = Column(String(50), default="COMPLETED")
