from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.ai_agent import (
    AIChatRequest,
    AIChatResponse,
    AIAnalyzeRequest,
    AIAnalyzeResponse
)
from app.services.ai_agent_service import handle_ai_chat, analyze_experiment_with_ai

router = APIRouter(prefix="/ai-agent", tags=["Quantum AI Agent & Copilot"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_agent(
    req: AIChatRequest,
    db: Session = Depends(get_db)
):
    """
    Conversational endpoint with Q-Copilot AI Agent.
    Provides expert QML diagnosis, hyperparameter advice, and mathematical breakdowns.
    """
    return handle_ai_chat(
        message=req.message,
        experiment_id=req.experiment_id,
        dataset_id=req.dataset_id,
        context=req.context,
        history=req.history or [],
        db=db
    )

@router.post("/analyze", response_model=AIAnalyzeResponse)
def analyze_experiment(
    req: AIAnalyzeRequest,
    db: Session = Depends(get_db)
):
    """
    Automated deep scientific critique for a given experiment run.
    Evaluates quantum vs classical accuracy, Gram matrix conditioning, and proposed tuning steps.
    """
    try:
        return analyze_experiment_with_ai(exp_id=req.experiment_id, db=db)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis error: {str(e)}")
