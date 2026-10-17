from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from typing import Optional

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, description="Full name or alias")
    password: Optional[str] = Field(None, description="Optional password for backwards compatibility")

class UserLogin(BaseModel):
    email: EmailStr
    password: Optional[str] = None

class SendOTPRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=4, max_length=8)

class OTPResponse(BaseModel):
    message: str
    email: str
    otp_code: Optional[str] = None
    expires_in_seconds: int = 600

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime
