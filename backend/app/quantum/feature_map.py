import io
import contextlib
from typing import Dict, Any, Tuple
import numpy as np

# Use modern zz_feature_map with compatibility fallback
try:
    from qiskit.circuit.library import zz_feature_map
except ImportError:
    from qiskit.circuit.library import ZZFeatureMap as zz_feature_map

from qiskit import QuantumCircuit

def build_zz_feature_map(
    feature_dimension: int,
    reps: int = 2,
    entanglement: str = "linear"
) -> QuantumCircuit:
    r"""
    Constructs a modern Qiskit ZZFeatureMap circuit.
    
    Formula:
      U_phi(x) = exp( i * sum_j phi_j(x) Z_j + sum_{j<k} phi_{jk}(x) Z_j Z_k ) H^{\otimes n}
    Where:
      phi_j(x) = x_j
      phi_{jk}(x) = (pi - x_j) * (pi - x_k)
    """
    fmap = zz_feature_map(
        feature_dimension=feature_dimension,
        reps=reps,
        entanglement=entanglement
    )
    return fmap

def inspect_circuit(
    feature_dimension: int,
    reps: int = 2,
    entanglement: str = "linear"
) -> Dict[str, Any]:
    """
    Analyzes circuit depth, gate counts, and decomposes to generate
    clean UTF-8/ASCII circuit diagram and layer breakdown.
    """
    fmap = build_zz_feature_map(feature_dimension, reps, entanglement)
    decomposed = fmap.decompose()

    # Extract gate counts
    gate_counts = dict(decomposed.count_ops())
    circuit_depth = decomposed.depth()
    num_parameters = len(fmap.parameters)
    num_qubits = fmap.num_qubits

    # Generate ASCII circuit string safely without cp1252 crash
    try:
        # text drawing with single_string
        circuit_ascii = decomposed.draw(output="text").single_string()
    except Exception:
        circuit_ascii = f"ZZFeatureMap Circuit ({num_qubits} Qubits, {reps} Reps, {entanglement} Entanglement)"

    # Layer explanation
    layers = [
        {
            "layer_name": "Hadamard Superposition Layer",
            "description": f"Applies H gate to all {num_qubits} qubits to create an equal superposition state |+⟩^{{\\otimes {num_qubits}}}."
        },
        {
            "layer_name": "Single-Qubit Phase Rotation Layer",
            "description": "Applies Rz(2 * x_i) single-qubit phase rotations encoding each feature x_i onto qubit i."
        },
        {
            "layer_name": f"Two-Qubit ZZ Entanglement Layer ({entanglement})",
            "description": f"Applies CNOT - Rz(2 * (pi - x_j)*(pi - x_k)) - CNOT interactions connecting qubit pairs to encode nonlinear interactions."
        },
        {
            "layer_name": f"Repetitions (reps={reps})",
            "description": f"The H-rot-ZZ sequence is repeated {reps} times to increase the expressive capacity of the quantum state space."
        }
    ]

    formula = "U_{\\Phi(x)} = \\left( \\exp\\left( i \\sum_{j=1}^n x_j Z_j + \\sum_{j < k} (\\pi - x_j)(\\pi - x_k) Z_j Z_k \\right) H^{\\otimes n} \\right)^d"

    return {
        "feature_dim": feature_dimension,
        "reps": reps,
        "entanglement": entanglement,
        "num_qubits": num_qubits,
        "num_parameters": num_parameters,
        "circuit_depth": circuit_depth,
        "gate_counts": gate_counts,
        "circuit_ascii": circuit_ascii,
        "circuit_layers_description": layers,
        "mathematical_formula": formula,
    }
