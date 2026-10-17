from typing import List
from fastapi import APIRouter
from app.schemas.dataset import DatasetMetadata, DatasetPreviewRequest, DatasetPreviewResponse
from app.services.dataset_service import list_datasets, get_dataset_preview

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.get("", response_model=List[DatasetMetadata])
def get_all_datasets():
    """Retrieve metadata catalog for all supported quantum benchmark datasets."""
    return list_datasets()

@router.post("/preview", response_model=DatasetPreviewResponse)
def preview_dataset(req: DatasetPreviewRequest):
    """
    Generate interactive scatter points, feature names, and preview table 
    with reproducible splitting and scaling applied.
    """
    return get_dataset_preview(req)
