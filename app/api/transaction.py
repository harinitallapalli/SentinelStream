from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.db import get_db
from app.models.transaction import Transaction
from app.models.fraud_alert import FraudAlert
from app.schemas.transaction import TransactionCreate
from app.services.fraud_service import check_fraud

router = APIRouter()


@router.post("/")
async def create_transaction(
    transaction: TransactionCreate,
    db: AsyncSession = Depends(get_db)
):
    status = check_fraud(
        transaction.amount,
        transaction.location
    )

    new_transaction = Transaction(
        user_id=transaction.user_id,
        amount=transaction.amount,
        location=transaction.location,
        status=status
    )

    db.add(new_transaction)
    await db.commit()
    await db.refresh(new_transaction)

    if status == "FRAUD":
        alert = FraudAlert(
            transaction_id=new_transaction.id,
            reason="Suspicious Transaction"
        )

        db.add(alert)
        await db.commit()

    return {"message": "Transaction Created"}


@router.get("/")
async def get_transactions(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaction)
    )

    transactions = result.scalars().all()

    return transactions


@router.get("/fraud")
async def get_fraud_transactions(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaction)
    )

    transactions = result.scalars().all()

    fraud_transactions = [
        transaction
        for transaction in transactions
        if transaction.status in ["FRAUD", "HIGH_RISK"]
    ]

    return fraud_transactions