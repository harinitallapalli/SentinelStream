from fastapi import FastAPI
from app.api.user import router as user_router

app = FastAPI(title="SentinelStream")

app.include_router(
    user_router,
    prefix="/users",
    tags=["Users"]
)


@app.get("/")
async def root():
    return {"message": "SentinelStream Running"}