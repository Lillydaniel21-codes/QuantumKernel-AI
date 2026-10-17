from fastapi import APIRouter
from app.schemas.experiment import CircuitPreviewRequest, CircuitPreviewResponse
from app.quantum.feature_map import inspect_circuit

router = APIRouter(prefix="/quantum", tags=["Quantum Circuit & Feature Map"])

@router.post("/circuit-preview", response_model=CircuitPreviewResponse)
def get_circuit_preview(req: CircuitPreviewRequest):
    """
    Generate circuit diagram, layer decomposition, depth, and gate statistics
    for the configured ZZFeatureMap.
    """
    inspection = inspect_circuit(
        feature_dimension=req.feature_dim,
        reps=req.reps,
        entanglement=req.entanglement
    )
    return CircuitPreviewResponse(**inspection)
