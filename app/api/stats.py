from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta

from app.database.db import get_db
from app.models.transaction import Transaction
from app.utils.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
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


@router.get("/trend")
async def get_trend(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Transaction).order_by(Transaction.timestamp.asc())
    )
    transactions = result.scalars().all()

    trend_dict = {}

    today = datetime.utcnow()
    for i in range(6, -1, -1):
        day_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        trend_dict[day_str] = {"date": day_str, "Safe": 0, "Fraud": 0, "HighRisk": 0}

    for t in transactions:
        if t.timestamp:
            date_str = t.timestamp.strftime("%Y-%m-%d")
            if date_str not in trend_dict:
                trend_dict[date_str] = {"date": date_str, "Safe": 0, "Fraud": 0, "HighRisk": 0}

            if t.status == "SAFE":
                trend_dict[date_str]["Safe"] += 1
            elif t.status == "FRAUD":
                trend_dict[date_str]["Fraud"] += 1
            elif t.status == "HIGH_RISK":
                trend_dict[date_str]["HighRisk"] += 1

    sorted_trend = sorted(trend_dict.values(), key=lambda x: x["date"])
    return sorted_trend