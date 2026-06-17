from fastapi import APIRouter, Depends, HTTPException
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

    if status in ["FRAUD", "HIGH_RISK"]:
        priority = "HIGH" if status == "HIGH_RISK" else "MEDIUM"
        alert = FraudAlert(
            transaction_id=new_transaction.id,
            reason="Suspicious Transaction",
            priority=priority
        )

        db.add(alert)
        await db.commit()

    return {"message": "Transaction Created"}


@router.get("/")
async def get_transactions(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaction).order_by(Transaction.id.desc())
    )

    transactions = result.scalars().all()

    return transactions


@router.get("/fraud")
async def get_fraud_transactions(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaction).order_by(Transaction.id.desc())
    )

    transactions = result.scalars().all()

    fraud_transactions = [
        transaction
        for transaction in transactions
        if transaction.status in ["FRAUD", "HIGH_RISK"]
    ]

    return fraud_transactions


@router.put("/{transaction_id}/status")
async def update_transaction_status(
    transaction_id: int,
    status: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaction).filter(Transaction.id == transaction_id)
    )
    transaction = result.scalars().first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    transaction.status = status.upper()
    await db.commit()
    await db.refresh(transaction)
    return {"message": "Transaction status updated", "transaction": transaction}