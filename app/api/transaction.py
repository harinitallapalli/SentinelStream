from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.db import get_db
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate
from app.services.fraud_service import check_fraud
import inspect

print("SCHEMA FILE:", inspect.getfile(TransactionCreate))
print(TransactionCreate.model_json_schema())

router = APIRouter()


@router.post("/")
async def create_transaction(
    transaction: TransactionCreate,
    db: AsyncSession = Depends(get_db)
):
    print("Transaction received:")
    print(transaction)
    print(transaction.model_dump())

    new_transaction = Transaction(
        user_id=transaction.user_id,
        amount=transaction.amount,
        location=transaction.location,
        status=check_fraud(transaction.amount)
    )

    db.add(new_transaction)
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