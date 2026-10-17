@echo off
echo ===============================================================================
echo               QUANTUMKERNEL AI - STARTUP LAUNCHER (WINDOWS)
echo       High-Dimensional Quantum Kernel Classifier with ZZFeatureMap & QSVC
echo ===============================================================================
echo.

:: 1. Check or activate Python virtual environment
if not exist ".venv\Scripts\activate.bat" (
    echo [1/3] Python virtual environment not found. Creating .venv...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment. Ensure Python 3.10+ is installed.
        pause
        exit /b 1
    )
    echo Installing backend dependencies...
    .venv\Scripts\pip install -r backend\requirements.txt
) else (
    echo [1/3] Python virtual environment detected (.venv).
)

:: 2. Check frontend dependencies
if not exist "frontend\node_modules" (
    echo [2/3] Installing frontend dependencies (node_modules)...
    cd frontend
    call npm.cmd install
    cd ..
) else (
    echo [2/3] Frontend node_modules verified.
)

:: 3. Launch Backend in separate terminal window
echo [3/3] Launching Backend on http://localhost:8000 and Frontend on http://localhost:5173...
start "QuantumKernel AI - Backend (Port 8000)" cmd /k "cd /d %~dp0 && .venv\Scripts\activate.bat && cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: 4. Launch Frontend in separate terminal window
start "QuantumKernel AI - Frontend (Port 5173)" cmd /k "cd /d %~dp0\frontend && npm.cmd run dev"

echo.
echo ===============================================================================
echo QuantumKernel AI servers are starting in separate windows!
echo.
echo   * Frontend Dashboard:   http://localhost:5173
echo   * Backend REST API:     http://localhost:8000
echo   * Swagger API Docs:     http://localhost:8000/docs
echo.
echo Demo Account:
echo   Email:    demo@quantumkernel.ai
echo   Password: QuantumAI2026!
echo   (Or click 'One-Click Demo Account Access' on the login screen)
echo ===============================================================================
echo.
pause
