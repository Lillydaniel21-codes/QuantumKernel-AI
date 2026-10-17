import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_demo_login():
    response = client.post("/api/auth/demo-login")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "demo@quantumkernel.ai"

def test_register_and_login_flow():
    test_email = "tester_qml_emailonly@quantumkernel.ai"

    # 1. Register with email-only (no password required)
    reg_res = client.post("/api/auth/register", json={
        "email": test_email,
        "full_name": "Test Researcher"
    })
    if reg_res.status_code == 200:
        data = reg_res.json()
        assert data["user"]["email"] == test_email
        token = data["access_token"]
    else:
        assert reg_res.status_code == 400

    # 2. Login using only email (no password provided!)
    login_res = client.post("/api/auth/login", json={
        "email": test_email
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert login_res.json()["user"]["email"] == test_email

    # 3. Access protected /auth/me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email

def test_invalid_login_rejected():
    res = client.post("/api/auth/login", json={
        "email": "nonexistent_researcher_xyz@quantumkernel.ai"
    })
    assert res.status_code == 401
    assert "No researcher account found" in res.json()["detail"]

def test_email_otp_flow():
    test_email = "otp_quantum_user@quantumkernel.ai"

    # 1. Send OTP
    send_res = client.post("/api/auth/send-otp", json={"email": test_email})
    assert send_res.status_code == 200
    data = send_res.json()
    assert data["email"] == test_email
    otp_code = data["otp_code"]
    assert len(otp_code) == 6

    # 2. Reject incorrect OTP
    bad_res = client.post("/api/auth/verify-otp", json={
        "email": test_email,
        "otp_code": "999999"
    })
    assert bad_res.status_code == 401

    # 3. Accept valid OTP
    good_res = client.post("/api/auth/verify-otp", json={
        "email": test_email,
        "otp_code": otp_code
    })
    assert good_res.status_code == 200
    assert "access_token" in good_res.json()
    assert good_res.json()["user"]["email"] == test_email
