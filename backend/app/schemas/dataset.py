from typing import Optional, Any
from pydantic import BaseModel, Field

class DatasetMetadata(BaseModel):
    id: str
    name: str
    description: str
    total_samples: int
    features: int
    classes: int
    class_distribution: dict[str, int]
    default_qubits: int
    dimension_reduction_applied: bool = False
    reduction_technique: Optional[str] = None
    scientific_context: str

class DatasetPreviewRequest(BaseModel):
    dataset_id: str = Field(default="moons")
    sample_limit: int = Field(default=60, ge=10, le=300)
    test_size: float = Field(default=0.25, ge=0.1, le=0.5)
    noise: float = Field(default=0.1, ge=0.0, le=0.5)
    random_seed: int = Field(default=42)
    feature_dim: int = Field(default=2, ge=2, le=8)
    scaling: str = Field(default="minmax_2pi", description="minmax_2pi, minmax_pi, or standard")

class SamplePoint(BaseModel):
    sample_idx: int
    x: float
    y: float
    features: list[float]
    label: int
    split: str  # 'train' or 'test'

class DatasetPreviewResponse(BaseModel):
    dataset_id: str
    dataset_name: str
    n_samples: int
    n_train: int
    n_test: int
    n_features: int
    classes: list[int]
    class_distribution: dict[str, int]
    points: list[SamplePoint]
    feature_names: list[str]
    table_preview: list[dict[str, Any]]
