from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database.session import get_db
from app.models.user import User
from app.utils.auth import get_current_user, require_admin
from app.services.audit_service import AuditService
from app.schemas.audit_log import AuditLogResponse, AuditLogFilter

router = APIRouter(prefix="/audit", tags=["Audit Logs"])


@router.get("/logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    filters: AuditLogFilter = AuditLogFilter(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Retrieve audit logs (Admin only)."""
    logs = await AuditService.get_audit_logs(
        db=db,
        user_id=filters.user_id,
        action=filters.action,
        resource_type=filters.resource_type,
        limit=filters.limit,
        offset=filters.offset
    )
    return logs


@router.get("/security-events", response_model=List[AuditLogResponse])
async def get_security_events(
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Retrieve security-related events (Admin only)."""
    logs = await AuditService.get_security_events(db=db, limit=limit)
    return logs


@router.get("/my-activity", response_model=List[AuditLogResponse])
async def get_my_activity(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve current user's activity."""
    logs = await AuditService.get_user_activity(db=db, user_id=current_user.id, limit=limit)
    return logs


@router.get("/stats")
async def get_audit_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Get audit log statistics (Admin only)."""
    from sqlalchemy import select, func
    from app.models.audit_log import AuditLog
    
    # Total logs
    total_result = await db.execute(select(func.count()).select_from(AuditLog))
    total = total_result.scalar()
    
    # Logs by action
    action_result = await db.execute(
        select(AuditLog.action, func.count()).group_by(AuditLog.action)
    )
    by_action = {row[0]: row[1] for row in action_result}
    
    # Logs by status
    status_result = await db.execute(
        select(AuditLog.status, func.count()).group_by(AuditLog.status)
    )
    by_status = {row[0]: row[1] for row in status_result}
    
    # Recent failures
    failures = await AuditService.get_audit_logs(
        db=db,
        action="LOGIN_FAILED",
        limit=10
    )
    
    return {
        "total_logs": total,
        "by_action": by_action,
        "by_status": by_status,
        "recent_failures": len(failures)
    }
