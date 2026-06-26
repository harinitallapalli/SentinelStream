import asyncio
from sqlalchemy import select
from app.database.db import AsyncSessionLocal
from app.models.user import User

async def check_users():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()
        print("Existing users in database:")
        print("=" * 60)
        for user in users:
            print(f"ID: {user.id}")
            print(f"Name: {user.name}")
            print(f"Email: {user.email}")
            print(f"Role: {user.role}")
            print(f"Active: {user.is_active}")
            print("-" * 60)

if __name__ == "__main__":
    asyncio.run(check_users())
