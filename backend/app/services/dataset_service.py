from typing import Dict, Any, Tuple, List
import numpy as np
import pandas as pd
from sklearn.datasets import make_moons, make_circles, make_classification, load_iris, load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.decomposition import PCA
from app.schemas.dataset import DatasetMetadata, DatasetPreviewResponse, SamplePoint

DATASET_CATALOG: Dict[str, Dict[str, Any]] = {
    "moons": {
        "id": "moons",
        "name": "Scikit-Learn Moons",
        "description": "Two interleaving half-circles with customizable Gaussian noise. Classic benchmark for non-linear quantum decision boundaries.",
        "default_qubits": 2,
        "classes": 2,
        "scientific_context": "Tests ability of the ZZ interaction terms to separate intertwined topological manifolds that linear kernels cannot separate."
    },
    "circles": {
        "id": "circles",
        "name": "Concentric Circles",
        "description": "Two concentric circular rings with non-linear radial boundaries.",
        "default_qubits": 2,
        "classes": 2,
        "scientific_context": "Radial symmetry test. Highlights quantum Hilbert space mapping where concentric patterns become linearly separable."
    },
    "synthetic": {
        "id": "synthetic",
        "name": "2D Synthetic Classification",
        "description": "Multi-cluster synthetic classification problem generated with controlled Gaussian clusters and class separation.",
        "default_qubits": 2,
        "classes": 2,
        "scientific_context": "Controlled benchmark to evaluate quantum kernel robustness against cluster overlap and noise."
    },
    "iris": {
        "id": "iris",
        "name": "Fisher's Iris Flower",
        "description": "Famous 4-feature biological benchmark. Projected to configured qubits using stratified Principal Component Analysis (PCA).",
        "default_qubits": 2,
        "classes": 3,
        "scientific_context": "Evaluates multiclass quantum kernel classification and dimensional compression via PCA."
    },
    "breast_cancer": {
        "id": "breast_cancer",
        "name": "Breast Cancer Wisconsin (Diagnostic)",
        "description": "High-dimensional clinical diagnostic dataset (30 features, Malignant vs Benign). Reduced to 2-8 features via PCA for quantum circuit simulation.",
        "default_qubits": 2,
        "classes": 2,
        "scientific_context": "Real-world medical diagnostic benchmark demonstrating PCA feature selection followed by quantum Hilbert space classification."
    }
}

def list_datasets() -> List[DatasetMetadata]:
    result = []
    for k, v in DATASET_CATALOG.items():
        total_samples = 100 if k in ["moons", "circles", "synthetic"] else (150 if k == "iris" else 569)
        orig_features = 2 if k in ["moons", "circles", "synthetic"] else (4 if k == "iris" else 30)
        dim_red = k in ["iris", "breast_cancer"]
        
        result.append(DatasetMetadata(
            id=v["id"],
            name=v["name"],
            description=v["description"],
            total_samples=total_samples,
            features=orig_features,
            classes=v["classes"],
            class_distribution={"Class 0": total_samples // v["classes"], "Class 1": total_samples // v["classes"]},
            default_qubits=v["default_qubits"],
            dimension_reduction_applied=dim_red,
            reduction_technique="Principal Component Analysis (PCA)" if dim_red else None,
            scientific_context=v["scientific_context"]
        ))
    return result

def load_raw_dataset(dataset_id: str, sample_limit: int, noise: float, random_seed: int) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    rng = np.random.RandomState(random_seed)
    
    if dataset_id == "moons":
        X, y = make_moons(n_samples=sample_limit, noise=noise, random_state=random_seed)
        feature_names = ["Moon Coordinate X₁", "Moon Coordinate X₂"]
    elif dataset_id == "circles":
        X, y = make_circles(n_samples=sample_limit, noise=noise, factor=0.5, random_state=random_seed)
        feature_names = ["Circle Coordinate X₁", "Circle Coordinate X₂"]
    elif dataset_id == "synthetic":
        X, y = make_classification(
            n_samples=sample_limit,
            n_features=2,
            n_informative=2,
            n_redundant=0,
            n_clusters_per_class=1,
            class_sep=1.0,
            random_state=random_seed
        )
        feature_names = ["Latent Dimension 1", "Latent Dimension 2"]
    elif dataset_id == "iris":
        data = load_iris()
        indices = rng.permutation(len(data.data))[:sample_limit]
        X = data.data[indices]
        y = data.target[indices]
        feature_names = list(data.feature_names)
    elif dataset_id == "breast_cancer":
        data = load_breast_cancer()
        indices = rng.permutation(len(data.data))[:sample_limit]
        X = data.data[indices]
        y = data.target[indices]
        feature_names = list(data.feature_names)
    else:
        # Fallback to moons
        X, y = make_moons(n_samples=sample_limit, noise=noise, random_state=random_seed)
        feature_names = ["Coordinate X₁", "Coordinate X₂"]

    return X, y, feature_names

def prepare_dataset_pipeline(
    dataset_id: str,
    sample_limit: int = 50,
    test_size: float = 0.25,
    noise: float = 0.1,
    random_seed: int = 42,
    feature_dim: int = 2,
    scaling: str = "minmax_2pi"
) -> Dict[str, Any]:
    """
    Complete reproducible data preparation pipeline:
    1. Loads raw dataset with exact seed.
    2. Stratified train/test split.
    3. Fits PCA (if dimensionality reduction required) ONLY on training set to avoid data leakage.
    4. Fits Scaler (MinMaxScaler [0, 2pi]) ONLY on training set.
    5. Returns processed arrays and metadata.
    """
    X_raw, y, feature_names = load_raw_dataset(dataset_id, sample_limit, noise, random_seed)
    
    # Stratified train/test split
    try:
        X_train_raw, X_test_raw, y_train, y_test = train_test_split(
            X_raw, y, test_size=test_size, random_state=random_seed, stratify=y
        )
    except Exception:
        # If class distribution has too few samples for stratification
        X_train_raw, X_test_raw, y_train, y_test = train_test_split(
            X_raw, y, test_size=test_size, random_state=random_seed
        )

    # Dimensionality reduction if feature count > feature_dim or dataset requires it
    final_feature_names = feature_names[:feature_dim]
    if X_train_raw.shape[1] != feature_dim:
        pca = PCA(n_components=feature_dim, random_state=random_seed)
        # FIT ONLY ON TRAIN to prevent leakage!
        X_train_reduced = pca.fit_transform(X_train_raw)
        X_test_reduced = pca.transform(X_test_raw)
        final_feature_names = [f"PC_{i+1} ({round(var*100, 1)}% var)" for i, var in enumerate(pca.explained_variance_ratio_)]
    else:
        X_train_reduced = X_train_raw
        X_test_reduced = X_test_raw

    # Feature scaling for Quantum ZZFeatureMap phase rotations
    if scaling == "minmax_2pi":
        # Standard quantum encoding angles: [0, 2*pi]
        scaler = MinMaxScaler(feature_range=(0.0, 2.0 * np.pi))
    elif scaling == "minmax_pi":
        scaler = MinMaxScaler(feature_range=(-np.pi, np.pi))
    else:
        scaler = StandardScaler()

    # Fit scaler ONLY on train!
    X_train = scaler.fit_transform(X_train_reduced)
    X_test = scaler.transform(X_test_reduced)

    return {
        "dataset_id": dataset_id,
        "dataset_name": DATASET_CATALOG.get(dataset_id, {}).get("name", dataset_id),
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "feature_names": final_feature_names,
        "n_train": len(X_train),
        "n_test": len(X_test),
        "feature_dim": feature_dim,
        "classes": sorted(list(np.unique(y).astype(int))),
    }

def get_dataset_preview(request: Any) -> DatasetPreviewResponse:
    pipeline = prepare_dataset_pipeline(
        dataset_id=request.dataset_id,
        sample_limit=request.sample_limit,
        test_size=request.test_size,
        noise=request.noise,
        random_seed=request.random_seed,
        feature_dim=request.feature_dim,
        scaling=request.scaling
    )

    X_train = pipeline["X_train"]
    X_test = pipeline["X_test"]
    y_train = pipeline["y_train"]
    y_test = pipeline["y_test"]

    points: List[SamplePoint] = []
    table_preview: List[Dict[str, Any]] = []

    # Assemble train points
    for idx, (x_vec, label) in enumerate(zip(X_train, y_train)):
        pt = SamplePoint(
            sample_idx=idx,
            x=round(float(x_vec[0]), 4),
            y=round(float(x_vec[1]), 4) if len(x_vec) > 1 else 0.0,
            features=[round(float(f), 4) for f in x_vec],
            label=int(label),
            split="train"
        )
        points.append(pt)
        if len(table_preview) < 15:
            table_row = {
                "Sample": f"Train #{idx+1}",
                "Split": "Train",
                "Label": f"Class {int(label)}",
            }
            for f_i, val in enumerate(x_vec):
                table_row[pipeline["feature_names"][f_i]] = round(float(val), 4)
            table_preview.append(table_row)

    # Assemble test points
    for idx, (x_vec, label) in enumerate(zip(X_test, y_test)):
        sample_i = len(X_train) + idx
        pt = SamplePoint(
            sample_idx=sample_i,
            x=round(float(x_vec[0]), 4),
            y=round(float(x_vec[1]), 4) if len(x_vec) > 1 else 0.0,
            features=[round(float(f), 4) for f in x_vec],
            label=int(label),
            split="test"
        )
        points.append(pt)
        if len(table_preview) < 25:
            table_row = {
                "Sample": f"Test #{idx+1}",
                "Split": "Test",
                "Label": f"Class {int(label)}",
            }
            for f_i, val in enumerate(x_vec):
                table_row[pipeline["feature_names"][f_i]] = round(float(val), 4)
            table_preview.append(table_row)

    # Class distribution
    unique, counts = np.unique(np.concatenate([y_train, y_test]), return_counts=True)
    class_distribution = {f"Class {int(k)}": int(c) for k, c in zip(unique, counts)}

    return DatasetPreviewResponse(
        dataset_id=pipeline["dataset_id"],
        dataset_name=pipeline["dataset_name"],
        n_samples=len(points),
        n_train=len(X_train),
        n_test=len(X_test),
        n_features=pipeline["feature_dim"],
        classes=pipeline["classes"],
        class_distribution=class_distribution,
        points=points,
        feature_names=pipeline["feature_names"],
        table_preview=table_preview
    )
