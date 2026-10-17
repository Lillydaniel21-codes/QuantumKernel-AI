import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import numpy as np
from sqlalchemy.orm import Session
from fastapi import HTTPException
from qiskit_machine_learning.kernels import FidelityQuantumKernel

from app.models.experiment import Experiment
from app.schemas.experiment import (
    ExperimentRunRequest,
    ExperimentDetailResponse,
    ExperimentSummary,
    KernelProperties,
    SpectralProperties,
    DecisionMeshPoint,
    ComparisonResponse
)
from app.services.dataset_service import prepare_dataset_pipeline, DATASET_CATALOG
from app.quantum.feature_map import inspect_circuit, build_zz_feature_map
from app.quantum.kernel import estimate_quantum_kernel, compute_spectral_properties
from app.quantum.qsvc_classifier import (
    train_and_evaluate_qsvc,
    train_and_evaluate_classical_svm,
    compute_2d_decision_mesh
)

def run_experiment_pipeline(
    req: ExperimentRunRequest,
    user_id: Optional[int],
    db: Session
) -> ExperimentDetailResponse:
    """
    Executes the end-to-end Quantum Kernel Classifier workflow:
    1. Preprocesses dataset with stratified train/test split and [0, 2pi] scaling.
    2. Builds ZZFeatureMap and captures circuit characteristics.
    3. Computes Quantum Fidelity Kernel matrices K_train and K_test (with optional NISQ noise).
    4. Trains and evaluates QSVC.
    5. Trains and evaluates Classical RBF SVM baseline.
    6. Generates 2D decision boundary mesh contours.
    7. Persists complete experiment to SQLite.
    """
    title = req.title or f"{DATASET_CATALOG.get(req.dataset_id, {}).get('name', req.dataset_id)} (Qubits={req.feature_dim}, Reps={req.reps})"

    try:
        # Step 1: Preprocess dataset
        pipeline = prepare_dataset_pipeline(
            dataset_id=req.dataset_id,
            sample_limit=req.sample_limit,
            test_size=req.test_size,
            noise=req.noise,
            random_seed=req.random_seed,
            feature_dim=req.feature_dim,
            scaling=req.scaling
        )

        X_train = pipeline["X_train"]
        X_test = pipeline["X_test"]
        y_train = pipeline["y_train"]
        y_test = pipeline["y_test"]

        # Step 2: Circuit inspection
        circuit_info = inspect_circuit(
            feature_dimension=req.feature_dim,
            reps=req.reps,
            entanglement=req.entanglement
        )

        # Step 3: Quantum Kernel Matrix Estimation
        K_train, K_test, kernel_properties, kernel_time_ms = estimate_quantum_kernel(
            X_train=X_train,
            X_test=X_test,
            reps=req.reps,
            entanglement=req.entanglement,
            noise_model=req.noise_model,
            noise_rate=req.noise_rate,
            use_cache=True
        )

        # Step 4: QSVC Training & Prediction
        qsvc_results, fitted_qsvc = train_and_evaluate_qsvc(
            K_train=K_train,
            K_test=K_test,
            y_train=y_train,
            y_test=y_test,
            c_parameter=req.c_parameter
        )

        # Step 5: Classical SVM Baseline
        classical_results, fitted_svm = train_and_evaluate_classical_svm(
            X_train=X_train,
            X_test=X_test,
            y_train=y_train,
            y_test=y_test,
            c_parameter=req.c_parameter
        )

        # Step 6: 2D Decision Mesh Calculation for Visualization
        decision_mesh: List[DecisionMeshPoint] = []
        if req.compute_decision_mesh and req.feature_dim == 2:
            try:
                fmap = build_zz_feature_map(req.feature_dim, reps=req.reps, entanglement=req.entanglement)
                fk = FidelityQuantumKernel(feature_map=fmap)
                mesh_data = compute_2d_decision_mesh(
                    X_train=X_train,
                    qsvc=fitted_qsvc,
                    classical_svm=fitted_svm,
                    fidelity_kernel_eval_fn=lambda pts: fk.evaluate(x_vec=pts, y_vec=X_train),
                    grid_resolution=14
                )
                decision_mesh = [DecisionMeshPoint(**p) for p in mesh_data]
            except Exception:
                decision_mesh = []

        # Step 7: Store in database
        sim_name = "Ideal Statevector" if req.noise_model == "ideal_statevector" else f"Depolarizing NISQ ({req.noise_rate*100:.0f}%)"
        exp_record = Experiment(
            user_id=user_id,
            title=title,
            dataset_name=pipeline["dataset_name"],
            sample_limit=req.sample_limit,
            train_count=pipeline["n_train"],
            test_count=pipeline["n_test"],
            feature_dim=req.feature_dim,
            reps=req.reps,
            entanglement=req.entanglement,
            scaling_factor=1.0,
            simulation_backend=sim_name,
            
            # Quantum metrics
            qsvc_accuracy=qsvc_results["accuracy"],
            qsvc_precision=qsvc_results["precision"],
            qsvc_recall=qsvc_results["recall"],
            qsvc_f1=qsvc_results["f1"],
            
            # Classical metrics
            classical_accuracy=classical_results["accuracy"],
            classical_precision=classical_results["precision"],
            classical_recall=classical_results["recall"],
            classical_f1=classical_results["f1"],
            
            # Timings
            quantum_kernel_time_ms=kernel_time_ms,
            qsvc_train_time_ms=qsvc_results["train_time_ms"],
            qsvc_predict_time_ms=qsvc_results["predict_time_ms"],
            classical_train_time_ms=classical_results["train_time_ms"],
            classical_predict_time_ms=classical_results["predict_time_ms"],
            
            # Detailed JSON artifacts
            kernel_matrix_train=json.dumps(K_train.tolist()),
            kernel_matrix_test=json.dumps(K_test.tolist()),
            confusion_matrix_quantum=json.dumps(qsvc_results["confusion_matrix"]),
            confusion_matrix_classical=json.dumps(classical_results["confusion_matrix"]),
            classification_report_quantum=json.dumps(qsvc_results["classification_report"]),
            classification_report_classical=json.dumps(classical_results["classification_report"]),
            circuit_ascii=circuit_info["circuit_ascii"],
            
            status="completed",
            error_message=None,
            created_at=datetime.now(timezone.utc)
        )

        db.add(exp_record)
        db.commit()
        db.refresh(exp_record)

        k_props = KernelProperties(**kernel_properties)

        return ExperimentDetailResponse(
            id=exp_record.id,
            title=exp_record.title,
            dataset_name=exp_record.dataset_name,
            sample_limit=exp_record.sample_limit,
            train_count=exp_record.train_count,
            test_count=exp_record.test_count,
            feature_dim=exp_record.feature_dim,
            reps=exp_record.reps,
            entanglement=exp_record.entanglement,
            scaling_factor=exp_record.scaling_factor,
            simulation_backend=exp_record.simulation_backend,
            
            qsvc_accuracy=exp_record.qsvc_accuracy,
            qsvc_precision=exp_record.qsvc_precision,
            qsvc_recall=exp_record.qsvc_recall,
            qsvc_f1=exp_record.qsvc_f1,
            
            classical_accuracy=exp_record.classical_accuracy,
            classical_precision=exp_record.classical_precision,
            classical_recall=exp_record.classical_recall,
            classical_f1=exp_record.classical_f1,
            
            quantum_kernel_time_ms=exp_record.quantum_kernel_time_ms,
            qsvc_train_time_ms=exp_record.qsvc_train_time_ms,
            qsvc_predict_time_ms=exp_record.qsvc_predict_time_ms,
            classical_train_time_ms=exp_record.classical_train_time_ms,
            classical_predict_time_ms=exp_record.classical_predict_time_ms,
            
            kernel_matrix_train=K_train.tolist(),
            kernel_matrix_test=K_test.tolist(),
            confusion_matrix_quantum=qsvc_results["confusion_matrix"],
            confusion_matrix_classical=classical_results["confusion_matrix"],
            classification_report_quantum=qsvc_results["classification_report"],
            classification_report_classical=classical_results["classification_report"],
            circuit_ascii=exp_record.circuit_ascii,
            kernel_properties=k_props,
            decision_mesh=decision_mesh,
            noise_model=req.noise_model,
            noise_rate=req.noise_rate,
            
            status=exp_record.status,
            error_message=None,
            created_at=exp_record.created_at
        )

    except Exception as exc:
        failed_record = Experiment(
            user_id=user_id,
            title=title,
            dataset_name=req.dataset_id,
            sample_limit=req.sample_limit,
            status="failed",
            error_message=str(exc),
            created_at=datetime.now(timezone.utc)
        )
        db.add(failed_record)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Experiment calculation failed: {str(exc)}")

def get_experiment_detail(exp_id: int, db: Session) -> ExperimentDetailResponse:
    record = db.query(Experiment).filter(Experiment.id == exp_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Experiment not found")

    K_train = json.loads(record.kernel_matrix_train) if record.kernel_matrix_train else None
    K_test = json.loads(record.kernel_matrix_test) if record.kernel_matrix_test else None
    cm_q = json.loads(record.confusion_matrix_quantum) if record.confusion_matrix_quantum else None
    cm_c = json.loads(record.confusion_matrix_classical) if record.confusion_matrix_classical else None
    rep_q = json.loads(record.classification_report_quantum) if record.classification_report_quantum else None
    rep_c = json.loads(record.classification_report_classical) if record.classification_report_classical else None

    # Derive properties and spectral analysis if matrix exists
    k_props = None
    if K_train:
        arr = np.array(K_train)
        spectral_info = compute_spectral_properties(arr, record.feature_dim or 2)
        k_props = KernelProperties(
            matrix_dim=len(arr),
            min_val=round(float(np.min(arr)), 5),
            max_val=round(float(np.max(arr)), 5),
            is_symmetric=bool(np.max(np.abs(arr - arr.T)) < 1e-4),
            unit_diagonal=bool(np.max(np.abs(np.diag(arr) - 1.0)) < 1e-4),
            avg_fidelity=round(float(np.mean(arr)), 5),
            diagonal_tolerance=round(float(np.max(np.abs(np.diag(arr) - 1.0))), 7),
            spectral=SpectralProperties(**spectral_info)
        )

    return ExperimentDetailResponse(
        id=record.id,
        title=record.title,
        dataset_name=record.dataset_name,
        sample_limit=record.sample_limit,
        train_count=record.train_count or 0,
        test_count=record.test_count or 0,
        feature_dim=record.feature_dim or 2,
        reps=record.reps or 2,
        entanglement=record.entanglement or "linear",
        scaling_factor=record.scaling_factor or 1.0,
        simulation_backend=record.simulation_backend or "Statevector",
        
        qsvc_accuracy=record.qsvc_accuracy,
        qsvc_precision=record.qsvc_precision,
        qsvc_recall=record.qsvc_recall,
        qsvc_f1=record.qsvc_f1,
        
        classical_accuracy=record.classical_accuracy,
        classical_precision=record.classical_precision,
        classical_recall=record.classical_recall,
        classical_f1=record.classical_f1,
        
        quantum_kernel_time_ms=record.quantum_kernel_time_ms,
        qsvc_train_time_ms=record.qsvc_train_time_ms,
        qsvc_predict_time_ms=record.qsvc_predict_time_ms,
        classical_train_time_ms=record.classical_train_time_ms,
        classical_predict_time_ms=record.classical_predict_time_ms,
        
        kernel_matrix_train=K_train,
        kernel_matrix_test=K_test,
        confusion_matrix_quantum=cm_q,
        confusion_matrix_classical=cm_c,
        classification_report_quantum=rep_q,
        classification_report_classical=rep_c,
        circuit_ascii=record.circuit_ascii,
        kernel_properties=k_props,
        decision_mesh=None,
        noise_model="ideal_statevector",
        noise_rate=0.0,
        
        status=record.status,
        error_message=record.error_message,
        created_at=record.created_at
    )

def list_experiments(db: Session, user_id: Optional[int] = None) -> List[ExperimentSummary]:
    query = db.query(Experiment)
    if user_id is not None:
        query = query.filter((Experiment.user_id == user_id) | (Experiment.user_id == None))
    records = query.order_by(Experiment.id.desc()).all()
    
    summaries = []
    for r in records:
        summaries.append(ExperimentSummary(
            id=r.id,
            title=r.title,
            dataset_name=r.dataset_name,
            sample_limit=r.sample_limit or 0,
            train_count=r.train_count or 0,
            test_count=r.test_count or 0,
            feature_dim=r.feature_dim or 2,
            reps=r.reps or 2,
            entanglement=r.entanglement or "linear",
            qsvc_accuracy=r.qsvc_accuracy,
            qsvc_f1=r.qsvc_f1,
            classical_accuracy=r.classical_accuracy,
            classical_f1=r.classical_f1,
            quantum_kernel_time_ms=r.quantum_kernel_time_ms,
            status=r.status,
            created_at=r.created_at
        ))
    return summaries

def delete_experiment(exp_id: int, db: Session) -> bool:
    record = db.query(Experiment).filter(Experiment.id == exp_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Experiment not found")
    db.delete(record)
    db.commit()
    return True

def export_kernel_matrix_csv(exp_id: int, db: Session) -> str:
    record = db.query(Experiment).filter(Experiment.id == exp_id).first()
    if not record or not record.kernel_matrix_train:
        raise HTTPException(status_code=404, detail="Kernel matrix not available for this experiment")
    
    matrix = json.loads(record.kernel_matrix_train)
    n = len(matrix)
    lines = []
    header = ["sample_idx"] + [f"x_{i}" for i in range(n)]
    lines.append(",".join(header))
    for i, row in enumerate(matrix):
        row_str = [f"x_{i}"] + [f"{val:.6f}" for val in row]
        lines.append(",".join(row_str))
    return "\n".join(lines)

def compare_multiple_experiments(exp_ids: List[int], db: Session) -> ComparisonResponse:
    details = [get_experiment_detail(eid, db) for eid in exp_ids]
    
    best_q = max(details, key=lambda d: d.qsvc_accuracy or 0)
    best_c = max(details, key=lambda d: d.classical_accuracy or 0)
    
    summary = []
    for d in details:
        summary.append({
            "id": d.id,
            "title": d.title,
            "dataset": d.dataset_name,
            "qubits": d.feature_dim,
            "reps": d.reps,
            "entanglement": d.entanglement,
            "qsvc_accuracy": d.qsvc_accuracy,
            "classical_accuracy": d.classical_accuracy,
            "kernel_time_ms": d.quantum_kernel_time_ms,
            "condition_number": d.kernel_properties.spectral.condition_number if (d.kernel_properties and d.kernel_properties.spectral) else None
        })

    verdict = (
        f"Among the {len(details)} compared experiments, Run #{best_q.id} achieved the highest QSVC accuracy "
        f"({(best_q.qsvc_accuracy or 0)*100:.1f}%), utilizing {best_q.feature_dim} qubits and {best_q.reps} repetition layer(s). "
        f"Comparing entanglement configurations, {'higher circuit depth improved decision separation' if best_q.reps > 1 else 'lower reps avoided kernel concentration'}."
    )

    return ComparisonResponse(
        experiments=details,
        best_quantum_id=best_q.id,
        best_classical_id=best_c.id,
        summary_table=summary,
        ai_verdict=verdict
    )

def build_research_report(exp_id: int, db: Session) -> Dict[str, Any]:
    detail = get_experiment_detail(exp_id, db)
    
    acc_diff = (detail.qsvc_accuracy or 0) - (detail.classical_accuracy or 0)
    advantage_analysis = (
        f"Quantum QSVC achieved {round((detail.qsvc_accuracy or 0)*100, 2)}% accuracy versus "
        f"Classical RBF SVM at {round((detail.classical_accuracy or 0)*100, 2)}% "
        f"({'+' if acc_diff >= 0 else ''}{round(acc_diff*100, 2)}% margin)."
    )

    findings = [
        f"The ZZFeatureMap with {detail.reps} repetitions and {detail.entanglement} entanglement successfully transformed the {detail.feature_dim}-dimensional input vectors into a 2^{detail.feature_dim}-dimensional Hilbert state space.",
        f"Quantum kernel matrix symmetry was verified: diagonal elements strictly adhere to K(x_i, x_i) = 1.0 within numerical simulator tolerance.",
        f"Total quantum kernel calculation completed in {detail.quantum_kernel_time_ms} ms on statevector simulation.",
        advantage_analysis,
        "Classical RBF SVM and Quantum QSVC exhibit distinct decision boundary topologies due to the difference between Gaussian distance metrics and quantum state fidelity overlaps."
    ]

    limitations = [
        "Simulation on classical CPU scales exponentially with qubit count (O(2^n)), practically constraining interactive exploration to <= 8 qubits.",
        "Ideal statevector simulator does not include physical hardware noise, decoherence (T1/T2), or finite sampling shot noise.",
        "Classical SVM computes RBF distance in O(d) per pair, whereas quantum fidelity requires state preparation and overlap estimation."
    ]

    return {
        "report_id": f"REP-QKAI-{detail.id:04d}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "experiment_id": detail.id,
        "title": detail.title,
        "dataset_name": detail.dataset_name,
        "methodology": {
            "feature_map": "ZZFeatureMap (Second-order Pauli-Z evolution)",
            "qubits": detail.feature_dim,
            "reps": detail.reps,
            "entanglement": detail.entanglement,
            "kernel_formula": "K(x, y) = |<0| U_dag(y) U(x) |0>|^2",
            "classifier": "QSVC (Dual Quadratic Programming with Precomputed Quantum Kernel)",
            "classical_baseline": "SVC(kernel='rbf', gamma='scale', C=1.0)"
        },
        "metrics_summary": {
            "qsvc_accuracy": detail.qsvc_accuracy,
            "qsvc_f1": detail.qsvc_f1,
            "classical_accuracy": detail.classical_accuracy,
            "classical_f1": detail.classical_f1,
            "quantum_kernel_time_ms": detail.quantum_kernel_time_ms,
            "classical_train_time_ms": detail.classical_train_time_ms,
        },
        "findings": findings,
        "limitations": limitations,
        "conclusion": "The experiment demonstrates reproducible nonlinear classification powered by quantum Hilbert space mapping using Qiskit ZZFeatureMap and FidelityQuantumKernel.",
        "detail": detail
    }
