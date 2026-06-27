from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.models.user import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    user_name = Column(String(100), nullable=True)
    user_email = Column(String(100), nullable=True)
    user_role = Column(String(50), nullable=True)
    
    action = Column(String(100), nullable=False, index=True)  # LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, etc.
    resource_type = Column(String(50), nullable=True)  # TRANSACTION, ALERT, SETTINGS, USER, etc.
    resource_id = Column(String(100), nullable=True)  # ID of the affected resource
    
    details = Column(JSON, nullable=True)  # Additional context about the action
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(String(500), nullable=True)
    
    status = Column(String(20), default="SUCCESS")  # SUCCESS, FAILURE, ERROR
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, user={self.user_email}, status={self.status})>"
