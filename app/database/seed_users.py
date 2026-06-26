import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.db import engine
from app.models.user import User, Base
from app.utils.auth import get_password_hash


async def seed_users():
    """Seed the database with sample users for each role."""
    async with AsyncSession(engine) as db:
        # Check if users already exist
        result = await db.execute(select(User))
        existing_users = result.scalars().all()
        
        if existing_users:
            print(f"Found {len(existing_users)} existing users. Skipping seed.")
            return
        
        # Create sample users
        sample_users = [
            {
                "name": "Viewer User",
                "email": "viewer@sentinelstream.com",
                "password": "Viewer123!",
                "role": "Viewer"
            },
            {
                "name": "Analyst User",
                "email": "analyst@sentinelstream.com",
                "password": "Analyst123!",
                "role": "Analyst"
            },
            {
                "name": "Admin User",
                "email": "admin@sentinelstream.com",
                "password": "Admin123!",
                "role": "Admin"
            }
        ]
        
        for user_data in sample_users:
            user = User(
                name=user_data["name"],
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"],
                is_active=True
            )
            db.add(user)
            print(f"Created {user_data['role']} user: {user_data['email']}")
        
        await db.commit()
        print("\n✅ Sample users seeded successfully!")
        print("\nLogin Credentials:")
        print("=" * 50)
        for user_data in sample_users:
            print(f"\n{user_data['role']}:")
            print(f"  Email: {user_data['email']}")
            print(f"  Password: {user_data['password']}")


if __name__ == "__main__":
    asyncio.run(seed_users())
