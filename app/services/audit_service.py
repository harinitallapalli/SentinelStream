from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.audit_log import AuditLog
from app.models.user import User


class AuditService:
    """Service for logging audit events."""
    
    @staticmethod
    async def log_action(
        db: AsyncSession,
        action: str,
        user: User = None,
        resource_type: str = None,
        resource_id: str = None,
        details: dict = None,
        ip_address: str = None,
        user_agent: str = None,
        status: str = "SUCCESS",
        error_message: str = None
    ):
        """Log an audit action to the database."""
        audit_log = AuditLog(
            user_id=user.id if user else None,
            user_name=user.name if user else None,
            user_email=user.email if user else None,
            user_role=user.role if user else None,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            status=status,
            error_message=error_message
        )
        
        db.add(audit_log)
        await db.commit()
        
    @staticmethod
    async def get_audit_logs(
        db: AsyncSession,
        user_id: int = None,
        action: str = None,
        resource_type: str = None,
        limit: int = 100,
        offset: int = 0
    ):
        """Retrieve audit logs with optional filters."""
        query = select(AuditLog)
        
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if action:
            query = query.filter(AuditLog.action == action)
        if resource_type:
            query = query.filter(AuditLog.resource_type == resource_type)
        
        query = query.order_by(AuditLog.created_at.desc())
        query = query.limit(limit).offset(offset)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    async def get_user_activity(
        db: AsyncSession,
        user_id: int,
        limit: int = 50
    ):
        """Get recent activity for a specific user."""
        return await AuditService.get_audit_logs(
            db=db,
            user_id=user_id,
            limit=limit
        )
    
    @staticmethod
    async def get_security_events(
        db: AsyncSession,
        limit: int = 100
    ):
        """Get security-related events (logins, failures, etc.)."""
        security_actions = ["LOGIN", "LOGOUT", "LOGIN_FAILED", "PASSWORD_CHANGE", "ROLE_CHANGE"]
        return await AuditService.get_audit_logs(
            db=db,
            action=security_actions,
            limit=limit
        )
