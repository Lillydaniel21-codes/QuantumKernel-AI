import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "QuantumKernel AI"
    PROJECT_DESCRIPTION: str = "High-Dimensional Quantum Kernel Classifier Dashboard & Research Platform"
    API_V1_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "quantum_secret_key_super_secure_development_2026_qsvc")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./quantumkernel.db")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    # Default demo credentials
    DEMO_USER_EMAIL: str = "demo@quantumkernel.ai"
    DEMO_USER_PASSWORD: str = "QuantumAI2026!"
    DEMO_USER_NAME: str = "Dr. Quantum Researcher"

settings = Settings()
