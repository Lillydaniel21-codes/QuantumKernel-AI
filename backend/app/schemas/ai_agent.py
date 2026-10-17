from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str
    timestamp: Optional[str] = None

class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    experiment_id: Optional[int] = None
    dataset_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    history: Optional[List[ChatMessage]] = Field(default_factory=list)

class AIChatResponse(BaseModel):
    reply: str
    recommendations: List[str] = Field(default_factory=list)
    suggested_prompts: List[str] = Field(default_factory=list)

class AIAnalyzeRequest(BaseModel):
    experiment_id: int

class AIAnalyzeResponse(BaseModel):
    experiment_id: int
    executive_summary: str
    quantum_vs_classical_critique: str
    kernel_quality_assessment: str
    spectral_health: str
    hyperparameter_tuning_advice: List[str]
    theoretical_context: str
