# QuantumKernel AI — High-Dimensional Quantum Kernel Classifier
> **Problem Statement PS-Q2**: Nonlinear classification via quantum Hilbert feature space transformations using Qiskit ZZFeatureMap and Fidelity Support Vector Machines (QSVC).

[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.143-009688.svg)](https://fastapi.tiangolo.com/)
[![Qiskit](https://img.shields.io/badge/Qiskit-2.6.0-6929C4.svg)](https://qiskit.org/)
[![Qiskit ML](https://img.shields.io/badge/Qiskit_ML-0.9.1-8A3FFC.svg)](https://qiskit-community.github.io/qiskit-machine-learning/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Pytest-12%20Passed-success.svg)](https://pytest.org/)

---

## 1. Project Overview & Problem Statement

**QuantumKernel AI** is a scientific research and demonstration web platform that illustrates how classical benchmark classification data can be mapped into a high-dimensional quantum Hilbert state space using an actual **ZZFeatureMap**, how the quantum state transition fidelity matrix is estimated, and how a Support Vector Classifier utilizing this quantum kernel (**QSVC**) performs nonlinear decision boundary separation against classical Gaussian RBF SVM baselines.

### The Quantum Kernel Formulation

For classical feature vectors $\mathbf{x}, \mathbf{y} \in \mathbb{R}^d$, the quantum feature map unitary $U_{\Phi}(\mathbf{x})$ encodes classical data into a $2^n$-dimensional normalized quantum state $|\phi(\mathbf{x})\rangle = U_{\Phi}(\mathbf{x}) |0\rangle^{\otimes n}$.

The quantum fidelity kernel is defined as:
$$K(\mathbf{x}, \mathbf{y}) = |\langle \phi(\mathbf{x}) \mid \phi(\mathbf{y}) \rangle|^2 = |\langle 0^{\otimes n} \mid U_{\Phi}^\dagger(\mathbf{y}) U_{\Phi}(\mathbf{x}) \mid 0^{\otimes n} \rangle|^2$$

The **ZZFeatureMap** implements second-order Pauli-$Z$ Hamiltonian evolution:
$$U_{\Phi}(\mathbf{x}) = \left( \exp\left( i \sum_{j=1}^n \phi_j(\mathbf{x}) Z_j + \sum_{j < k} \phi_{jk}(\mathbf{x}) Z_j Z_k \right) H^{\otimes n} \right)^d$$
Where:
- $\phi_j(\mathbf{x}) = x_j$ (single-qubit $R_z(2 x_j)$ phase shifts)
- $\phi_{jk}(\mathbf{x}) = (\pi - x_j)(\pi - x_k)$ (two-qubit $CNOT - R_z(2 \phi_{jk}) - CNOT$ interactions)
- $d$ represents the repetition depth (`reps`)

---

## 2. Key Features

- **Genuine Qiskit 2.6 & Qiskit Machine Learning 0.9.1 Integration**: Executes real `zz_feature_map` circuits and `FidelityQuantumKernel` evaluations with mathematical symmetry and unit-diagonal validation.
- **5 Benchmark Datasets**: Scikit-Learn Moons, Concentric Circles, 2D Synthetic Classification, Fisher's Iris Flower (multiclass), and Breast Cancer Wisconsin (clinical binary diagnostic with PCA dimensionality reduction).
- **Zero Data Leakage Pipeline**: All feature scalers (MinMaxScaler to $[0, 2\pi]$) and PCA projection matrices are fitted *strictly on training splits*.
- **Interactive Classifier Playground**: Live sliders for sample limits (20-150), test split ratio, Gaussian noise, random seed, qubit count (2-8), repetition layers (1-4), entanglement topology (linear, full, circular), and SVM regularization ($C$).
- **Dynamic 5-Stage Stepper**: Real-time progress indicators: Preprocessing $\rightarrow$ Circuit Synthesis $\rightarrow$ Kernel Estimation $\rightarrow$ QSVC QP Optimization $\rightarrow$ Classical SVM Baseline.
- **Side-by-Side Model Benchmarking**: Comparative analysis of Accuracy, Precision, Recall, F1-Score, Confusion Matrices, and distinct Kernel Evaluation vs. QP Training vs. Prediction latencies (ms).
- **Interactive Quantum Kernel Heatmap**: Cell hover inspection displaying pair overlap fidelity, color legend, symmetry badge ($|K - K^T| < 10^{-4}$), and standard CSV export.
- **Decomposed Circuit Inspector**: Monospace circuit viewer displaying qubit wires, gate breakdown (Hadamard, $R_z$, CNOT), circuit depth, and copyable ASCII diagram.
- **SQLite Experiment Persistence**: Filterable, searchable historical logs with JSON/CSV export and detailed inspection drawers.
- **Automated Peer-Review Research Report**: Automatically generates an academic-grade experimental report complete with abstract, mathematical formulation, empirical findings, and NISQ hardware constraints.
- **10-Chapter Educational Curriculum**: Interactive QML primer with a responsive 9-step workflow diagram.
- **Authentication & Security**: Secure 12-round Bcrypt password hashing, signed JWT Bearer tokens, CORS controls, and a **One-Click Demo Account Access** shortcut.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 with Vite 8
- **Language**: TypeScript (strict typing)
- **Styling**: Tailwind CSS v4 (dark navy `#060913`, electric cyan `#06b6d4`, violet `#8b5cf6`, and glassmorphic cards)
- **Visualizations**: Recharts (Scatter plots, Comparative metric bar charts)
- **Icons**: Lucide Icons
- **Port**: `5173`

### Backend
- **Framework**: Python 3.11 with FastAPI
- **Quantum Stack**: Qiskit 2.6.0 & Qiskit Machine Learning 0.9.1 (`FidelityQuantumKernel`, `zz_feature_map`)
- **Machine Learning**: Scikit-learn 1.9.1 (`SVC(kernel='precomputed')`, `SVC(kernel='rbf')`, PCA, metrics)
- **Data Engine**: NumPy 2.4.6, Pandas 3.0.6
- **Database**: SQLite with SQLAlchemy 2.1
- **Security**: Bcrypt password hashing, PyJWT Bearer token verification
- **Validation**: Pydantic v2
- **Testing**: Pytest with HTTPX TestClient
- **Port**: `8000` (Swagger docs at `/docs`)

---

## 4. Local Installation & Quick Start

### Prerequisites
- Python 3.10+ (Python 3.11 recommended)
- Node.js 18+ and npm
- Windows PowerShell / Command Prompt, Linux, or macOS

### Fast One-Click Launch (Windows)
Double-click `start.bat` or run:
```cmd
start.bat
```
This automatically verifies dependencies, starts the backend on port 8000, and starts the frontend on port 5173 in separate terminal windows.

---

### Manual Step-by-Step Setup

#### Step 1: Clone or Navigate to the Workspace
```bash
cd "c:\Users\lenovo\OneDrive\Documents\Quantum kernel classifer"
```

#### Step 2: Setup Python Virtual Environment & Backend
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (CMD):
.venv\Scripts\activate.bat
# Linux / macOS:
source .venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Run backend automated test suite (12 tests)
pytest backend/tests/ -v

# Start FastAPI backend server
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API is now running at `http://localhost:8000` with interactive Swagger API docs at `http://localhost:8000/docs`.

#### Step 3: Setup & Run Frontend (In a New Terminal)
```bash
cd frontend

# Install Node dependencies
npm.cmd install

# Run frontend development server
npm.cmd run dev
```
The frontend application is now running at `http://localhost:5173`.

---

## 5. Demonstration & Evaluation Credentials

You can sign in using either of two methods:

### Method A: One-Click Demo Access (Recommended)
On the login screen, click **"One-Click Demo Account Access"**. This automatically creates and logs in as the pre-configured researcher session.

### Method B: Manual Credentials
- **Email**: `demo@quantumkernel.ai`
- **Password**: `QuantumAI2026!`

*(You can also register a brand new researcher account using the Register screen).*

---

## 6. Running Automated Tests

Run the backend Pytest test suite:
```bash
.venv\Scripts\pytest backend/tests/ -v
```
All **12 automated tests** verify:
- Backend health endpoints (`/health`, `/api/health`)
- Authentication, Bcrypt hashing, JWT issuance, and invalid login rejection
- Benchmark dataset catalogs and PCA leakage-proof previews
- Modern `zz_feature_map` circuit decomposition and depth
- Quantum fidelity kernel matrix mathematical properties ($K_{ij} = K_{ji}$, $K_{ii} = 1.0$, $0 \le K \le 1$)
- Complete end-to-end QSVC vs Classical SVM training, SQLite storage, CSV download, and research report generation

---

## 7. Example API Request

Run an experiment via HTTP POST:
```bash
curl -X POST "http://localhost:8000/api/experiments" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Moons Classification Run",
    "dataset_id": "moons",
    "sample_limit": 40,
    "test_size": 0.25,
    "noise": 0.1,
    "feature_dim": 2,
    "reps": 2,
    "entanglement": "linear",
    "scaling": "minmax_2pi",
    "c_parameter": 1.0
  }'
```

---

## 8. Limitations of Quantum Simulation

1. **Statevector Complexity**: Simulating statevectors on a classical CPU scales exponentially with qubit count ($\mathcal{O}(2^n)$). For interactive responsiveness, qubit counts are bounded to $\le 8$ qubits.
2. **Ideal Statevector vs. Physical NISQ Noise**: The Fidelity simulator computes exact algebraic inner products $|\langle \phi(x) \mid \phi(y) \rangle|^2$. Physical quantum processors experience gate infidelity, decoherence ($T_1/T_2$), and finite measurement sampling shot noise.
3. **No Blanket Quantum Supremacy**: Classical RBF SVM evaluates spatial Gaussian distances in $\mathcal{O}(d)$ per pair and may perform equally well or better on simple lower-dimensional geometries. Quantum advantage requires complex, entangled topological distributions.

---

## 9. License

Developed for the **PS-Q2 Quantum Machine Learning Hackathon**. Open-source under the MIT License.
