import time
from typing import Dict, Any, Tuple, List, Optional
import numpy as np
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

def train_and_evaluate_qsvc(
    K_train: np.ndarray,
    K_test: np.ndarray,
    y_train: np.ndarray,
    y_test: np.ndarray,
    c_parameter: float = 1.0
) -> Tuple[Dict[str, Any], SVC]:
    """
    Trains a Support Vector Classifier using the precomputed quantum kernel matrix.
    Evaluates predictions, timing, and full metrics.
    Returns (results_dict, fitted_qsvc_model).
    """
    # 1. Train QSVC on quantum kernel matrix
    t0 = time.perf_counter()
    qsvc = SVC(kernel="precomputed", C=c_parameter)
    qsvc.fit(K_train, y_train)
    train_time_ms = round((time.perf_counter() - t0) * 1000, 2)

    # 2. Predict on held-out test set using K_test
    t1 = time.perf_counter()
    y_pred = qsvc.predict(K_test)
    predict_time_ms = round((time.perf_counter() - t1) * 1000, 2)

    # 3. Compute metrics
    is_binary = len(np.unique(y_train)) <= 2
    avg_mode = "binary" if is_binary else "weighted"

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, average=avg_mode, zero_division=0))
    rec = float(recall_score(y_test, y_pred, average=avg_mode, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average=avg_mode, zero_division=0))

    cm = confusion_matrix(y_test, y_pred).tolist()
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

    results = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1": round(f1, 4),
        "train_time_ms": train_time_ms,
        "predict_time_ms": predict_time_ms,
        "confusion_matrix": cm,
        "classification_report": report,
        "predictions": y_pred.tolist(),
        "n_support_vectors": int(len(qsvc.support_)) if hasattr(qsvc, "support_") else 0
    }
    return results, qsvc

def train_and_evaluate_classical_svm(
    X_train: np.ndarray,
    X_test: np.ndarray,
    y_train: np.ndarray,
    y_test: np.ndarray,
    c_parameter: float = 1.0,
    gamma: str = "scale"
) -> Tuple[Dict[str, Any], SVC]:
    """
    Trains a Classical Support Vector Classifier with Gaussian RBF kernel.
    Serves as the rigorous classical baseline comparison.
    Returns (results_dict, fitted_classical_svm).
    """
    t0 = time.perf_counter()
    svm = SVC(kernel="rbf", C=c_parameter, gamma=gamma)
    svm.fit(X_train, y_train)
    train_time_ms = round((time.perf_counter() - t0) * 1000, 2)

    t1 = time.perf_counter()
    y_pred = svm.predict(X_test)
    predict_time_ms = round((time.perf_counter() - t1) * 1000, 2)

    is_binary = len(np.unique(y_train)) <= 2
    avg_mode = "binary" if is_binary else "weighted"

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, average=avg_mode, zero_division=0))
    rec = float(recall_score(y_test, y_pred, average=avg_mode, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average=avg_mode, zero_division=0))

    cm = confusion_matrix(y_test, y_pred).tolist()
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

    results = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1": round(f1, 4),
        "train_time_ms": train_time_ms,
        "predict_time_ms": predict_time_ms,
        "confusion_matrix": cm,
        "classification_report": report,
        "predictions": y_pred.tolist(),
        "n_support_vectors": int(len(svm.support_)) if hasattr(svm, "support_") else 0
    }
    return results, svm

def compute_2d_decision_mesh(
    X_train: np.ndarray,
    qsvc: SVC,
    classical_svm: SVC,
    fidelity_kernel_eval_fn,
    grid_resolution: int = 14
) -> List[Dict[str, Any]]:
    """
    Computes a 2D mesh grid over feature space and evaluates both models
    to visualize the decision boundaries.
    """
    if X_train.shape[1] != 2:
        return []

    x_min, x_max = float(np.min(X_train[:, 0])), float(np.max(X_train[:, 0]))
    y_min, y_max = float(np.min(X_train[:, 1])), float(np.max(X_train[:, 1]))

    # Add margin
    x_pad = (x_max - x_min) * 0.15 or 0.5
    y_pad = (y_max - y_min) * 0.15 or 0.5

    xx, yy = np.meshgrid(
        np.linspace(x_min - x_pad, x_max + x_pad, grid_resolution),
        np.linspace(y_min - y_pad, y_max + y_pad, grid_resolution)
    )
    mesh_points = np.c_[xx.ravel(), yy.ravel()]

    try:
        # Evaluate Quantum cross-kernel for grid
        K_mesh = fidelity_kernel_eval_fn(mesh_points)
        q_preds = qsvc.predict(K_mesh)
        c_preds = classical_svm.predict(mesh_points)

        results = []
        for pt, qp, cp in zip(mesh_points, q_preds, c_preds):
            results.append({
                "x": round(float(pt[0]), 3),
                "y": round(float(pt[1]), 3),
                "qsvc_pred": int(qp),
                "classical_pred": int(cp)
            })
        return results
    except Exception:
        return []
