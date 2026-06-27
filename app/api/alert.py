from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.database.db import get_db
from app.models.fraud_alert import FraudAlert
from app.utils.auth import get_current_user, require_analyst_or_admin, require_admin, require_viewer_or_above
from app.models.user import User
from app.services.audit_service import AuditService

router = APIRouter()


class BulkResolveRequest(BaseModel):
    alert_ids: List[int]
    review_notes: Optional[str] = "Bulk resolved"
    reason_code: Optional[str] = "RESOLVED_BULK"


class ResolveAlertRequest(BaseModel):
    review_notes: str
    reason_code: str


# Connection Manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"WebSocket client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"WebSocket client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending WebSocket message: {e}")


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle heartbeats
            data = await websocket.receive_text()
            await websocket.send_json({"type": "PONG", "data": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket connection error: {e}")
        manager.disconnect(websocket)


@router.get("/")
async def get_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_viewer_or_above())
):
    result = await db.execute(
        select(FraudAlert).order_by(FraudAlert.id.desc())
    )

    alerts = result.scalars().all()

    return alerts


@router.put("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    payload: ResolveAlertRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_analyst_or_admin())
):
    result = await db.execute(
        select(FraudAlert).filter(FraudAlert.id == alert_id)
    )
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.resolved = True
    alert.review_notes = payload.review_notes
    alert.reason_code = payload.reason_code
    alert.resolved_by = current_user.name or current_user.email
    alert.resolved_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(alert)
    
    # Log alert resolution
    await AuditService.log_action(
        db=db,
        action="RESOLVE",
        user=current_user,
        resource_type="ALERT",
        resource_id=str(alert_id),
        details={
            "transaction_id": alert.transaction_id,
            "review_notes": payload.review_notes,
            "reason_code": payload.reason_code
        },
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return {"message": "Alert resolved", "alert": alert}


@router.post("/resolve-multiple")
async def resolve_multiple_alerts(
    request: BulkResolveRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_analyst_or_admin())
):
    if not request.alert_ids:
        return {"message": "No alert IDs provided"}
    
    # Bulk update resolved columns
    await db.execute(
        update(FraudAlert)
        .where(FraudAlert.id.in_(request.alert_ids))
        .values(
            resolved=True,
            review_notes=request.review_notes,
            reason_code=request.reason_code,
            resolved_by=current_user.name or current_user.email,
            resolved_at=datetime.utcnow()
        )
    )
    await db.commit()
    
    # Log bulk alert resolution
    await AuditService.log_action(
        db=db,
        action="BULK_RESOLVE",
        user=current_user,
        resource_type="ALERT",
        details={
            "alert_ids": request.alert_ids,
            "review_notes": request.review_notes,
            "reason_code": request.reason_code,
            "count": len(request.alert_ids)
        },
        ip_address=http_request.client.host if http_request.client else None,
        user_agent=http_request.headers.get("user-agent")
    )
    
    return {"message": f"Successfully resolved {len(request.alert_ids)} alerts"}


