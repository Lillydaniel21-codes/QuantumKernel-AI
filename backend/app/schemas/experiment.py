from datetime import datetime
from typing import Optional, Any, List, Dict
from pydantic import BaseModel, Field, ConfigDict

class SpectralProperties(BaseModel):
    eigenvalues: List[float]
    condition_number: float
    effective_dimension: float
    rank: int
    spectral_status: str  # "Well-Conditioned", "Moderate", "Ill-Conditioned", "Degenerate"

class DecisionMeshPoint(BaseModel):
    x: float
    y: float
    qsvc_pred: int
    classical_pred: int

class ExperimentRunRequest(BaseModel):
    title: Optional[str] = Field(default=None)
    dataset_id: str = Field(default="moons")
    sample_limit: int = Field(default=50, ge=10, le=200, description="Number of samples to preserve simulation feasibility")
    test_size: float = Field(default=0.25, ge=0.1, le=0.5)
    noise: float = Field(default=0.1, ge=0.0, le=0.5)
    random_seed: int = Field(default=42)
    feature_dim: int = Field(default=2, ge=2, le=8, description="Number of qubits / features")
    reps: int = Field(default=2, ge=1, le=4, description="ZZFeatureMap repetitions")
    entanglement: str = Field(default="linear", description="linear, full, or circular")
    scaling: str = Field(default="minmax_2pi", description="minmax_2pi or standard")
    c_parameter: float = Field(default=1.0, ge=0.01, le=100.0)
    noise_model: str = Field(default="ideal_statevector", description="ideal_statevector or depolarizing_nisq")
    noise_rate: float = Field(default=0.0, ge=0.0, le=0.25, description="Simulated NISQ depolarizing noise probability")
    compute_decision_mesh: bool = Field(default=True, description="Compute 2D decision boundary mesh for visualization")

class KernelProperties(BaseModel):
    matrix_dim: int
    min_val: float
    max_val: float
    is_symmetric: bool
    unit_diagonal: bool
    avg_fidelity: float
    diagonal_tolerance: float
    spectral: Optional[SpectralProperties] = None

class ExperimentSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    dataset_name: str
    sample_limit: int
    train_count: int
    test_count: int
    feature_dim: int
    reps: int
    entanglement: str
    qsvc_accuracy: Optional[float] = None
    qsvc_f1: Optional[float] = None
    classical_accuracy: Optional[float] = None
    classical_f1: Optional[float] = None
    quantum_kernel_time_ms: Optional[float] = None
    status: str
    created_at: datetime

class ExperimentDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    dataset_name: str
    sample_limit: int
    train_count: int
    test_count: int
    feature_dim: int
    reps: int
    entanglement: str
    scaling_factor: float
    simulation_backend: str

    qsvc_accuracy: Optional[float]
    qsvc_precision: Optional[float]
    qsvc_recall: Optional[float]
    qsvc_f1: Optional[float]

    classical_accuracy: Optional[float]
    classical_precision: Optional[float]
    classical_recall: Optional[float]
    classical_f1: Optional[float]

    quantum_kernel_time_ms: Optional[float]
    qsvc_train_time_ms: Optional[float]
    qsvc_predict_time_ms: Optional[float]
    classical_train_time_ms: Optional[float]
    classical_predict_time_ms: Optional[float]

    kernel_matrix_train: Optional[list[list[float]]]
    kernel_matrix_test: Optional[list[list[float]]]
    confusion_matrix_quantum: Optional[list[list[int]]]
    confusion_matrix_classical: Optional[list[list[int]]]
    classification_report_quantum: Optional[dict[str, Any]]
    classification_report_classical: Optional[dict[str, Any]]
    circuit_ascii: Optional[str]
    kernel_properties: Optional[KernelProperties]
    decision_mesh: Optional[List[DecisionMeshPoint]] = None
    noise_model: Optional[str] = "ideal_statevector"
    noise_rate: Optional[float] = 0.0

    status: str
    error_message: Optional[str]
    created_at: datetime

class CircuitPreviewRequest(BaseModel):
    feature_dim: int = Field(default=2, ge=2, le=8)
    reps: int = Field(default=2, ge=1, le=4)
    entanglement: str = Field(default="linear")
    data_sample: Optional[list[float]] = None

class CircuitPreviewResponse(BaseModel):
    feature_dim: int
    reps: int
    entanglement: str
    num_qubits: int
    num_parameters: int
    circuit_depth: int
    gate_counts: dict[str, int]
    circuit_ascii: str
    circuit_layers_description: list[dict[str, str]]
    mathematical_formula: str

class ComparisonRequest(BaseModel):
    experiment_ids: List[int] = Field(..., min_length=2, max_length=5)

class ComparisonResponse(BaseModel):
    experiments: List[ExperimentDetailResponse]
    best_quantum_id: Optional[int]
    best_classical_id: Optional[int]
    summary_table: List[Dict[str, Any]]
    ai_verdict: str
