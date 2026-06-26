from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.db import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.fraud_alert import FraudAlert
from app.utils.auth import get_current_user, require_viewer_or_above

router = APIRouter()


@router.get("/")
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_viewer_or_above())
):
    users_result = await db.execute(
        select(User)
    )
    users = users_result.scalars().all()

    transactions_result = await db.execute(
        select(Transaction)
    )
    transactions = transactions_result.scalars().all()

    alerts_result = await db.execute(
        select(FraudAlert)
    )
    alerts = alerts_result.scalars().all()

    total_users = len(users)
    total_transactions = len(transactions)
    total_alerts = len(alerts)

    fraud_transactions = sum(
        1 for t in transactions
        if getattr(t, "status", "").upper()
        in ("FRAUD", "HIGH_RISK")
    )

    fraud_rate = 0.0

    if total_transactions > 0:
        fraud_rate = round(
            (fraud_transactions / total_transactions) * 100,
            2
        )

    return {
        "total_users": total_users,
        "total_transactions": total_transactions,
        "fraud_alerts": total_alerts,
        "fraud_rate": f"{fraud_rate}%"
    }