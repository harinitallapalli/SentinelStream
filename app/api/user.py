from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.models.transaction import Transaction

router = APIRouter()


@router.post("/")
async def create_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    new_user = User(
        name=user.name,
        email=user.email
    )

    db.add(new_user)
    await db.commit()

    return {"message": "User Created"}


@router.get("/")
async def get_users(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User)
    )

    users = result.scalars().all()

    return users
@router.get("/{user_id}/transactions")
async def get_user_transactions(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Transaction).where(
            Transaction.user_id == user_id
        )
    )


    transactions = result.scalars().all()

    return transactions