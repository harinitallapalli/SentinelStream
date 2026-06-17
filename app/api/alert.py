from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import List

from app.database.db import get_db
from app.models.fraud_alert import FraudAlert

router = APIRouter()

class BulkResolveRequest(BaseModel):
    alert_ids: List[int]


@router.get("/")
async def get_alerts(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(FraudAlert).order_by(FraudAlert.id.desc())
    )

    alerts = result.scalars().all()

    return alerts


@router.put("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(FraudAlert).filter(FraudAlert.id == alert_id)
    )
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.resolved = True
    await db.commit()
    await db.refresh(alert)
    return {"message": "Alert resolved", "alert": alert}


@router.post("/resolve-multiple")
async def resolve_multiple_alerts(
    request: BulkResolveRequest,
    db: AsyncSession = Depends(get_db)
):
    if not request.alert_ids:
        return {"message": "No alert IDs provided"}
    
    # Bulk update resolved to True
    await db.execute(
        update(FraudAlert)
        .where(FraudAlert.id.in_(request.alert_ids))
        .values(resolved=True)
    )
    await db.commit()
    return {"message": f"Successfully resolved {len(request.alert_ids)} alerts"}

