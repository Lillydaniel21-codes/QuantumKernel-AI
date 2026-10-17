import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_list_datasets():
    response = client.get("/api/datasets")
    assert response.status_code == 200
    datasets = response.json()
    assert len(datasets) >= 5
    ids = [d["id"] for d in datasets]
    assert "moons" in ids
    assert "circles" in ids
    assert "synthetic" in ids
    assert "iris" in ids
    assert "breast_cancer" in ids

def test_dataset_preview_moons():
    req = {
        "dataset_id": "moons",
        "sample_limit": 40,
        "test_size": 0.25,
        "noise": 0.1,
        "random_seed": 42,
        "feature_dim": 2,
        "scaling": "minmax_2pi"
    }
    response = client.post("/api/datasets/preview", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["dataset_id"] == "moons"
    assert data["n_samples"] == 40
    assert data["n_features"] == 2
    assert len(data["points"]) == 40
    assert len(data["table_preview"]) > 0

def test_dataset_preview_breast_cancer_with_pca():
    req = {
        "dataset_id": "breast_cancer",
        "sample_limit": 30,
        "test_size": 0.3,
        "feature_dim": 3,
        "scaling": "minmax_2pi"
    }
    response = client.post("/api/datasets/preview", json=req)
    assert response.status_code == 200
    data = response.json()
    assert data["n_features"] == 3
    assert data["n_samples"] == 30
