import asyncio

from app.database.db import engine
from app.models.user import Base
from app.models.transaction import Transaction
from app.models.fraud_alert import FraudAlert
from app.models.settings import SystemSettings
from app.models.report import SystemReport
from app.models.api_key import ApiKey

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    asyncio.run(create_tables())