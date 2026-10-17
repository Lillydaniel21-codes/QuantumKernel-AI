import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_ai_agent_chat_general():
    response = client.post("/api/ai-agent/chat", json={
        "message": "Explain how ZZFeatureMap works in quantum machine learning"
    })
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "Hadamard" in data["reply"]
    assert len(data["recommendations"]) > 0
    assert len(data["suggested_prompts"]) > 0

def test_ai_agent_analyze_experiment():
    # First create a small experiment
    exp_res = client.post("/api/experiments", json={
        "title": "AI Analysis Benchmark",
        "dataset_id": "moons",
        "sample_limit": 16,
        "test_size": 0.25,
        "feature_dim": 2,
        "reps": 1,
        "compute_decision_mesh": True
    })
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    exp_id = exp_data["id"]

    # Test decision mesh was generated
    assert "decision_mesh" in exp_data
    if exp_data["decision_mesh"]:
        assert len(exp_data["decision_mesh"]) > 0
        assert "qsvc_pred" in exp_data["decision_mesh"][0]

    # Test spectral properties
    assert exp_data["kernel_properties"]["spectral"] is not None
    assert len(exp_data["kernel_properties"]["spectral"]["eigenvalues"]) > 0

    # Test AI analysis endpoint
    ai_res = client.post("/api/ai-agent/analyze", json={"experiment_id": exp_id})
    assert ai_res.status_code == 200
    ai_data = ai_res.json()
    assert ai_data["experiment_id"] == exp_id
    assert "executive_summary" in ai_data
    assert len(ai_data["hyperparameter_tuning_advice"]) > 0

def test_experiments_comparison():
    # Fetch experiments list
    list_res = client.get("/api/experiments")
    exps = list_res.json()
    if len(exps) >= 2:
        compare_res = client.post("/api/experiments/compare", json={
            "experiment_ids": [exps[0]["id"], exps[1]["id"]]
        })
        assert compare_res.status_code == 200
        comp_data = compare_res.json()
        assert len(comp_data["experiments"]) == 2
        assert "ai_verdict" in comp_data
