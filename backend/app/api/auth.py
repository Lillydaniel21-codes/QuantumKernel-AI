from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    security_scheme
)
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.email == payload["sub"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not credentials:
        return None
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        return None
    return db.query(User).filter(User.email == payload["sub"]).first()

from datetime import datetime, timezone, timedelta
import secrets

# In-memory temporary OTP storage: email -> {"code": str, "expires_at": datetime}
active_otps: dict[str, dict] = {}

from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserResponse,
    SendOTPRequest,
    VerifyOTPRequest,
    OTPResponse
)

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    email_clean = user_in.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists. Please sign in directly."
        )

    hashed_pw = hash_password(user_in.password) if user_in.password else hash_password(secrets.token_urlsafe(32))

    user = User(
        email=email_clean,
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        role="researcher"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Email-only login. Users authenticate simply by entering their registered email address."""
    email_clean = credentials.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No researcher account found for this email address. Please register first or use the Demo Account."
        )

    token = create_access_token(data={"sub": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/send-otp", response_model=OTPResponse)
def send_otp(request: SendOTPRequest):
    """Generates and delivers a 6-digit verification code OTP for passwordless authentication."""
    email_clean = request.email.lower().strip()
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    active_otps[email_clean] = {
        "code": otp_code,
        "expires_at": expires_at
    }

    return OTPResponse(
        message="Verification code generated and sent successfully.",
        email=email_clean,
        otp_code=otp_code,
        expires_in_seconds=600
    )

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verifies a 6-digit OTP code and signs in or auto-provisions the researcher account."""
    email_clean = request.email.lower().strip()
    record = active_otps.get(email_clean)

    if not record or record.get("code") != request.otp_code.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid verification code. Please check the 6-digit code or request a new one."
        )

    if datetime.now(timezone.utc) > record["expires_at"]:
        active_otps.pop(email_clean, None)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Verification code has expired. Please request a new code."
        )

    # Invalidate used OTP
    active_otps.pop(email_clean, None)

    # Retrieve or provision user
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        alias = email_clean.split("@")[0].replace(".", " ").title()
        user = User(
            email=email_clean,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            full_name=alias or "Researcher",
            role="researcher"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/demo-login", response_model=TokenResponse)
def demo_login(db: Session = Depends(get_db)):
    """Convenience one-click authentication for presentation and demonstration."""
    demo_email = settings.DEMO_USER_EMAIL.lower()
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(
            email=demo_email,
            hashed_password=hash_password(settings.DEMO_USER_PASSWORD),
            full_name=settings.DEMO_USER_NAME,
            role="lead_researcher"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
