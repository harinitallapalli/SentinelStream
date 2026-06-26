import asyncio
from sqlalchemy import select, update
from app.database.db import AsyncSessionLocal
from app.models.user import User
from app.utils.auth import get_password_hash

async def update_user_emails():
    async with AsyncSessionLocal() as db:
        # Update existing users to use sentinelstream.com domain
        updates = [
            {"old_email": "admin@sentinel.com", "new_email": "admin@sentinelstream.com", "password": "Admin123!"},
            {"old_email": "analyst@sentinel.com", "new_email": "analyst@sentinelstream.com", "password": "Analyst123!"},
            {"old_email": "viewer@sentinel.com", "new_email": "viewer@sentinelstream.com", "password": "Viewer123!"},
        ]
        
        for update_data in updates:
            result = await db.execute(
                select(User).filter(User.email == update_data["old_email"])
            )
            user = result.scalars().first()
            
            if user:
                user.email = update_data["new_email"]
                user.hashed_password = get_password_hash(update_data["password"])
                print(f"Updated: {update_data['old_email']} -> {update_data['new_email']}")
            else:
                print(f"Not found: {update_data['old_email']}")
        
        await db.commit()
        print("\n✅ User emails updated successfully!")
        
        # Display updated users
        result = await db.execute(select(User))
        users = result.scalars().all()
        print("\nUpdated users:")
        print("=" * 60)
        for user in users:
            if user.email.endswith("@sentinelstream.com"):
                print(f"Name: {user.name}")
                print(f"Email: {user.email}")
                print(f"Role: {user.role}")
                print("-" * 60)

if __name__ == "__main__":
    asyncio.run(update_user_emails())
