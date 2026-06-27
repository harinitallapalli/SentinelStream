from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.models.transaction import Transaction
from app.utils.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.services.audit_service import AuditService

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # Check if user already exists
    result = await db.execute(select(User).filter(User.email == user_data.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role or "Analyst",
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Log registration
    await AuditService.log_action(
        db=db,
        action="REGISTER",
        user=new_user,
        resource_type="USER",
        resource_id=str(new_user.id),
        details={"email": new_user.email, "role": new_user.role},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return new_user


@router.post("/login", response_model=TokenResponse)
async def login_user(
    login_data: UserLogin,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).filter(User.email == login_data.email))
    user = result.scalars().first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        # Log failed login attempt
        await AuditService.log_action(
            db=db,
            action="LOGIN_FAILED",
            user=None,
            resource_type="USER",
            details={"email": login_data.email},
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            status="FAILURE",
            error_message="Incorrect email or password"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        # Log inactive user login attempt
        await AuditService.log_action(
            db=db,
            action="LOGIN_FAILED",
            user=user,
            resource_type="USER",
            details={"email": user.email},
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            status="FAILURE",
            error_message="User is inactive"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is inactive"
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "name": user.name})
    
    # Log successful login
    await AuditService.log_action(
        db=db,
        action="LOGIN",
        user=user,
        resource_type="USER",
        resource_id=str(user.id),
        details={"email": user.email},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/", response_model=list[UserResponse])
async def get_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users


@router.get("/{user_id}/transactions")
async def get_user_transactions(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Transaction).where(
            Transaction.user_id == user_id
        )
    )
    transactions = result.scalars().all()
    return transactions
