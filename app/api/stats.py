from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.db import get_db
from app.models.transaction import Transaction

router = APIRouter()


@router.get("/")
async def get_stats(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaction)
    )

    transactions = result.scalars().all()
    total_amount = sum((t.amount or 0) for t in transactions)

    total_transactions = len(transactions)
    fraud_transactions = sum(
        1 for t in transactions if getattr(t, "status", "").upper() in ("FRAUD", "HIGH_RISK")
    )
    safe_transactions = total_transactions - fraud_transactions

    fraud_rate = 0.0
    if total_transactions > 0:
        fraud_rate = round((fraud_transactions / total_transactions) * 100, 2)

    return {
        "total_transactions": total_transactions,
        "fraud_transactions": fraud_transactions,
        "safe_transactions": safe_transactions,
        "fraud_rate": f"{fraud_rate}%",
        "total_amount_processed": total_amount,
    }