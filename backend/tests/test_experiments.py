import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_run_small_experiment_pipeline():
    req = {
        "title": "Automated Test Experiment",
        "dataset_id": "moons",
        "sample_limit": 16,
        "test_size": 0.25,
        "feature_dim": 2,
        "reps": 1,
        "entanglement": "linear",
        "scaling": "minmax_2pi",
        "c_parameter": 1.0
    }
    response = client.post("/api/experiments", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["train_count"] == 12
    assert data["test_count"] == 4
    assert data["qsvc_accuracy"] is not None
    assert data["classical_accuracy"] is not None
    assert data["quantum_kernel_time_ms"] > 0
    assert len(data["kernel_matrix_train"]) == 12
    assert len(data["kernel_matrix_test"]) == 4

    exp_id = data["id"]

    # Test fetching detail
    detail_res = client.get(f"/api/experiments/{exp_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == exp_id

    # Test CSV download
    csv_res = client.get(f"/api/experiments/{exp_id}/kernel.csv")
    assert csv_res.status_code == 200
    assert "sample_idx" in csv_res.text

    # Test Report generation
    rep_res = client.get(f"/api/experiments/{exp_id}/report")
    assert rep_res.status_code == 200
    assert "methodology" in rep_res.json()
