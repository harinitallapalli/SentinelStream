from fastapi import FastAPI
from app.api.user import router as user_router
from app.api.transaction import router as transaction_router
from app.api.alert import router as alert_router
from app.api.stats import router as stats_router
from app.api.dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SentinelStream")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
app.include_router(
    alert_router,
    prefix="/alerts",
    tags=["Alerts"]
)
app.include_router(
    stats_router,
    prefix="/stats",
    tags=["Stats"]
)
app.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

@app.get("/")
async def root():
    return {"message": "SentinelStream Running"}