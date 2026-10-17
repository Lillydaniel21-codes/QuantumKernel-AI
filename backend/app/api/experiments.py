from typing import List, Optional
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.auth import get_optional_user
from app.models.user import User
from app.schemas.experiment import (
    ExperimentRunRequest,
    ExperimentDetailResponse,
    ExperimentSummary,
    ComparisonRequest,
    ComparisonResponse
)
from app.services.experiment_service import (
    run_experiment_pipeline,
    get_experiment_detail,
    list_experiments,
    delete_experiment,
    export_kernel_matrix_csv,
    build_research_report,
    compare_multiple_experiments
)

router = APIRouter(prefix="/experiments", tags=["Experiments"])

@router.post("", response_model=ExperimentDetailResponse)
def create_and_run_experiment(
    req: ExperimentRunRequest,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    """
    Execute full quantum kernel classification pipeline and classical SVM baseline,
    storing and returning comprehensive experimental metrics.
    """
    user_id = user.id if user else None
    return run_experiment_pipeline(req=req, user_id=user_id, db=db)

@router.get("", response_model=List[ExperimentSummary])
def get_all_experiments(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    """Retrieve history of completed experiments."""
    user_id = user.id if user else None
    return list_experiments(db=db, user_id=user_id)

@router.post("/compare", response_model=ComparisonResponse)
def compare_experiments(
    req: ComparisonRequest,
    db: Session = Depends(get_db)
):
    """Compare multiple experiments side-by-side with automated AI verdict."""
    return compare_multiple_experiments(exp_ids=req.experiment_ids, db=db)

@router.get("/{experiment_id}", response_model=ExperimentDetailResponse)
def get_single_experiment(experiment_id: int, db: Session = Depends(get_db)):
    """Retrieve full details, kernel matrices, and confusion matrices for an experiment."""
    return get_experiment_detail(exp_id=experiment_id, db=db)

@router.delete("/{experiment_id}")
def remove_experiment(experiment_id: int, db: Session = Depends(get_db)):
    """Delete a recorded experiment."""
    delete_experiment(exp_id=experiment_id, db=db)
    return {"message": f"Experiment #{experiment_id} successfully deleted", "id": experiment_id}

@router.get("/{experiment_id}/kernel.csv")
def download_kernel_csv(experiment_id: int, db: Session = Depends(get_db)):
    """Download computed training quantum kernel matrix as standard CSV."""
    csv_data = export_kernel_matrix_csv(exp_id=experiment_id, db=db)
    filename = f"quantum_kernel_matrix_exp_{experiment_id}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{experiment_id}/report")
def get_experiment_report(experiment_id: int, db: Session = Depends(get_db)):
    """Retrieve structured scientific research report for the experiment."""
    return build_research_report(exp_id=experiment_id, db=db)
