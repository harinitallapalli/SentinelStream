from fastapi import FastAPI
from app.api.user import router as user_router
from app.api.transaction import router as transaction_router
from app.api.alert import router as alert_router
from app.api.stats import router as stats_router
from app.api.dashboard import router as dashboard_router
from app.api.settings import router as settings_router
from app.api.reports import router as reports_router
from app.api.audit import router as audit_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SentinelStream")

@app.on_event("startup")
async def startup_event():
    from app.database.migrations import run_migrations
    await run_migrations()

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
app.include_router(
    settings_router,
    prefix="/settings",
    tags=["Settings"]
)
app.include_router(
    reports_router,
    prefix="/reports",
    tags=["Reports"]
)
app.include_router(
    audit_router,
    tags=["Audit Logs"]
)

@app.get("/")
async def root():
    return {"message": "SentinelStream Running"}