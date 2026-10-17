from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.experiment import Experiment
from app.api import auth, datasets, quantum, experiments, ai_agent

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Seed default demo account
    db: Session = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.email == settings.DEMO_USER_EMAIL.lower()).first()
        if not demo_user:
            demo = User(
                email=settings.DEMO_USER_EMAIL.lower(),
                hashed_password=hash_password(settings.DEMO_USER_PASSWORD),
                full_name=settings.DEMO_USER_NAME,
                role="lead_researcher"
            )
            db.add(demo)
            db.commit()
    finally:
        db.close()
        
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for local frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "quantum_engine": "Qiskit 2.6.0 + Qiskit Machine Learning 0.9.1",
        "simulation_mode": "FidelityQuantumKernel Statevector Simulator",
        "ai_agent": "Quantum Copilot v1.0 Active"
    }

# Register API routers under /api
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(datasets.router, prefix=settings.API_V1_PREFIX)
app.include_router(quantum.router, prefix=settings.API_V1_PREFIX)
app.include_router(experiments.router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_agent.router, prefix=settings.API_V1_PREFIX)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
