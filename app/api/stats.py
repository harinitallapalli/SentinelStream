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

    total_transactions = len(transactions)

    fraud_transactions = sum(
        1
        for t in transactions
        if t.status == "FRAUD"
    )

    high_risk_transactions = sum(
        1
        for t in transactions
        if t.status == "HIGH_RISK"
    )

    safe_transactions = sum(
        1
        for t in transactions
        if t.status == "SAFE"
    )

    total_amount = sum(
        t.amount
        for t in transactions
    )

    fraud_rate = 0

    if total_transactions > 0:
        fraud_rate = round(
            (
                (fraud_transactions + high_risk_transactions)
                / total_transactions
            )
            * 100,
            2,
        )

    return {
        "total_transactions": total_transactions,
        "fraud_transactions": fraud_transactions,
        "high_risk_transactions": high_risk_transactions,
        "safe_transactions": safe_transactions,
        "fraud_rate": f"{fraud_rate}%",
        "total_amount_processed": total_amount,
    }