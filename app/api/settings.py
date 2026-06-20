from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import secrets

from app.database.session import get_db
from app.models.settings import SystemSettings
from app.models.api_key import ApiKey
from app.schemas.settings import SystemSettingsUpdate
from app.schemas.api_key import ApiKeyCreate
from app.utils.auth import get_current_user, RoleChecker
from app.models.user import User

router = APIRouter()

@router.get("/rules")
async def get_rules(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(SystemSettings).filter(SystemSettings.id == 1))
    settings = result.scalars().first()
    
    if not settings:
        # Create default settings
        settings = SystemSettings(
            id=1,
            fraud_amount_threshold=10000.0,
            high_risk_amount_threshold=50000.0,
            suspicious_locations="Unknown,Foreign,DarkWeb",
            two_factor_enabled=False,
            session_timeout=30
        )
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
        
    return settings

@router.post("/rules")
async def update_rules(
    payload: SystemSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin"]))
):
    result = await db.execute(select(SystemSettings).filter(SystemSettings.id == 1))
    settings = result.scalars().first()
    
    if not settings:
        settings = SystemSettings(id=1)
        db.add(settings)
        
    settings.fraud_amount_threshold = payload.fraud_amount_threshold
    settings.high_risk_amount_threshold = payload.high_risk_amount_threshold
    settings.suspicious_locations = payload.suspicious_locations
    settings.two_factor_enabled = payload.two_factor_enabled
    settings.session_timeout = payload.session_timeout
    
    await db.commit()
    await db.refresh(settings)
    return {"message": "Settings updated successfully", "settings": settings}

@router.get("/keys")
async def list_keys(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin"]))
):
    result = await db.execute(select(ApiKey).order_by(ApiKey.id.desc()))
    keys = result.scalars().all()
    return keys

@router.post("/keys")
async def create_key(
    payload: ApiKeyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin"]))
):
    random_hex = secrets.token_hex(16)
    preview = f"sentinel_live_{random_hex[:8]}...{random_hex[-4:]}"
    full_token = f"sentinel_live_{random_hex}"
    
    new_key = ApiKey(
        key_name=payload.key_name,
        token_preview=preview,
        is_active=True
    )
    db.add(new_key)
    await db.commit()
    await db.refresh(new_key)
    
    return {
        "message": "API Key created successfully",
        "key": new_key,
        "raw_token": full_token  # Returned only once on creation
    }

@router.delete("/keys/{key_id}")
async def revoke_key(
    key_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["Admin"]))
):
    result = await db.execute(select(ApiKey).filter(ApiKey.id == key_id))
    key = result.scalars().first()
    if not key:
        raise HTTPException(status_code=404, detail="API Key not found")
    
    await db.delete(key)
    await db.commit()
    return {"message": "API Key revoked successfully"}

