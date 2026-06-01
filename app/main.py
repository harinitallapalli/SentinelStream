from fastapi import FastAPI
from app.api.user import router as user_router
from app.api.transaction import router as transaction_router

app = FastAPI(title="SentinelStream")

app.include_router(
    user_router,
    prefix="/users",
    tags=["Users"]
)
app.include_router(
    transaction_router,
    prefix="/transactions",
    tags=["Transactions"]
)


@app.get("/")
async def root():
    return {"message": "SentinelStream Running"}