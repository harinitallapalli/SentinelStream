from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.db import get_db
from app.models.fraud_alert import FraudAlert

router = APIRouter()


@router.get("/")
async def get_alerts(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(FraudAlert)
    )

    alerts = result.scalars().all()

    return alerts
