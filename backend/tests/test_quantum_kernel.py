import pytest
import numpy as np
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.quantum.feature_map import build_zz_feature_map, inspect_circuit
from app.quantum.kernel import estimate_quantum_kernel

def test_zz_feature_map_construction():
    fmap = build_zz_feature_map(feature_dimension=2, reps=1, entanglement="linear")
    assert fmap.num_qubits == 2
    assert len(fmap.parameters) == 2

def test_circuit_inspection():
    inspection = inspect_circuit(feature_dimension=3, reps=2, entanglement="linear")
    assert inspection["num_qubits"] == 3
    assert inspection["reps"] == 2
    assert inspection["circuit_depth"] > 0
    assert "circuit_ascii" in inspection
    assert len(inspection["circuit_layers_description"]) == 4

def test_quantum_fidelity_kernel_properties():
    # 4 synthetic points in 2D
    X_train = np.array([
        [0.2, 0.5],
        [1.2, 2.4],
        [3.1, 0.8],
        [5.0, 4.2]
    ])
    X_test = np.array([
        [0.3, 0.6],
        [4.8, 4.0]
    ])

    K_train, K_test, props, elapsed = estimate_quantum_kernel(
        X_train=X_train,
        X_test=X_test,
        reps=1,
        entanglement="linear",
        use_cache=False
    )

    # 1. Shape validation
    assert K_train.shape == (4, 4)
    assert K_test.shape == (2, 4)

    # 2. Symmetry validation: K = K.T
    np.testing.assert_allclose(K_train, K_train.T, atol=1e-5)
    assert props["is_symmetric"] is True

    # 3. Unit diagonal: K_ii == 1.0
    np.testing.assert_allclose(np.diag(K_train), np.ones(4), atol=1e-5)
    assert props["unit_diagonal"] is True

    # 4. Values bounded in [0, 1]
    assert np.all(K_train >= -1e-5)
    assert np.all(K_train <= 1.0 + 1e-5)
    assert np.all(K_test >= -1e-5)
    assert np.all(K_test <= 1.0 + 1e-5)
