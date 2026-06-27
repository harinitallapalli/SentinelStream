import asyncio
from sqlalchemy import text, select
from app.database.db import engine
from app.database.session import SessionLocal
from app.models.user import Base, User
from app.models.audit_log import AuditLog
from app.utils.auth import get_password_hash

async def run_migrations():
    print("Running database migrations...")
    
    # 1. Create tables first if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # 2. Add columns dynamically using PostgreSQL raw SQL ALTER TABLE IF NOT EXISTS
        # Users Table
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(200);"
        ))
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Analyst';"
        ))
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;"
        ))
        
        # Fraud Alerts Table
        await conn.execute(text(
            "ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS review_notes VARCHAR(500);"
        ))
        await conn.execute(text(
            "ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS reason_code VARCHAR(100);"
        ))
        await conn.execute(text(
            "ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS resolved_by VARCHAR(100);"
        ))
        await conn.execute(text(
            "ALTER TABLE fraud_alerts ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITHOUT TIME ZONE;"
        ))
        
    print("Migrations completed successfully.")
    
    # 3. Seed Default Users
    async with SessionLocal() as session:
        default_users = [
            {
                "email": "admin@sentinel.com",
                "name": "Admin User",
                "role": "Admin",
                "password": "admin123"
            },
            {
                "email": "analyst@sentinel.com",
                "name": "Analyst User",
                "role": "Analyst",
                "password": "analyst123"
            },
            {
                "email": "viewer@sentinel.com",
                "name": "Viewer User",
                "role": "Viewer",
                "password": "viewer123"
            }
        ]
        
        for u_data in default_users:
            # Check if user already exists
            result = await session.execute(select(User).filter(User.email == u_data["email"]))
            existing_user = result.scalars().first()
            
            if not existing_user:
                print(f"Seeding user: {u_data['email']} ({u_data['role']})")
                new_user = User(
                    name=u_data["name"],
                    email=u_data["email"],
                    hashed_password=get_password_hash(u_data["password"]),
                    role=u_data["role"],
                    is_active=True
                )
                session.add(new_user)
        
        await session.commit()
    print("Database seeding completed.")

if __name__ == "__main__":
    asyncio.run(run_migrations())
