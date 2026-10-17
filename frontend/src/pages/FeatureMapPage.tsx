import React, { useState, useEffect, useCallback } from 'react';
import {
  Binary,
  Cpu,
  Layers,
  Sparkles,
  Info,
  BookOpen,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiQuantum } from '../services/api';
import { CircuitPreviewResponse } from '../types';
import { CircuitViewer } from '../components/CircuitViewer';

export const FeatureMapPage: React.FC = () => {
  const [featureDim, setFeatureDim] = useState<number>(2);
  const [reps, setReps] = useState<number>(2);
  const [entanglement, setEntanglement] = useState<string>('linear');

  const [circuitData, setCircuitData] = useState<CircuitPreviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadCircuit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiQuantum.getCircuitPreview({
        feature_dim: featureDim,
        reps: reps,
        entanglement: entanglement,
      });
      setCircuitData(data);
    } catch (err: any) {
      setError(err.message || 'Circuit synthesis failed.');
    } finally {
      setLoading(false);
    }
  }, [featureDim, reps, entanglement]);

  useEffect(() => {
    loadCircuit();
  }, [loadCircuit]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Quantum Feature Map Architecture (ZZFeatureMap)
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/30">
                Pauli-Z Phase Interaction
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Constructs nonlinear Hilbert space representations by encoding classical coordinates into quantum phase 
              rotations and entangling pairs with two-qubit ZZ interactions.
            </p>
          </div>
        </div>
      </div>

      {/* Mathematical Principles Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
          <BookOpen className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Mathematical Formulation of ZZFeatureMap</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-slate-300">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              1. Superposition Induction
            </span>
            <p className="text-slate-400">
              Applies a Hadamard gate H to every qubit wire, transforming the initial state |0...0⟩ into an unbiased 
              superposition |+⟩^⊗n across all 2ⁿ basis states.
            </p>
            <div className="p-2 bg-slate-950 rounded font-mono text-[11px] text-cyan-400">
              |ψ₀⟩ = H^⊗n |0⟩^⊗n
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="font-semibold text-violet-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              2. Single-Qubit Phase Rotation
            </span>
            <p className="text-slate-400">
              Each input feature x_j rotates the phase of qubit j around the Z-axis by angle ϕ_j(x) = 2x_j.
            </p>
            <div className="p-2 bg-slate-950 rounded font-mono text-[11px] text-violet-300">
              U_Z(x) = exp(i ∑ x_j Z_j)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              3. Two-Qubit Entanglement
            </span>
            <p className="text-slate-400">
              Pairs (j, k) are entangled via CNOT-Rz-CNOT gates with interaction phase ϕ_jk(x) = 2(π - x_j)(π - x_k).
            </p>
            <div className="p-2 bg-slate-950 rounded font-mono text-[11px] text-indigo-300">
              U_ZZ(x) = exp(i ∑ ϕ_jk Z_j Z_k)
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Architecture Parameter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-200">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Number of Qubits</h3>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Qubit Wires:</span>
              <span className="font-mono font-bold text-cyan-300">{featureDim} Qubits</span>
            </div>
            <input
              type="range"
              min={2}
              max={6}
              step={1}
              value={featureDim}
              onChange={(e) => setFeatureDim(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Encodes {featureDim} continuous input features into {Math.pow(2, featureDim)}-dimensional quantum state space.
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-200">
            <Layers className="h-4 w-4 text-violet-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Circuit Repetitions</h3>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Layer Reps (d):</span>
              <span className="font-mono font-bold text-violet-300">{reps} Layer(s)</span>
            </div>
            <input
              type="range"
              min={1}
              max={4}
              step={1}
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className="w-full accent-violet-400"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Repeated unitary blocks increase quantum expressivity and kernel nonlinearity.
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-200">
            <Sliders className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Entanglement Coupling</h3>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Qubit Interaction Graph
            </label>
            <select
              value={entanglement}
              onChange={(e) => setEntanglement(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
            >
              <option value="linear">Linear (Nearest Neighbor)</option>
              <option value="full">Full (All-to-All Pairs)</option>
              <option value="circular">Circular (Periodic Ring)</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              Determines which pairs of qubits undergo ZZ phase coupling.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Schematics: Gate Decomposition & Bloch Manifold */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gate Interaction Diagram */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-cyan-500/20 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>Havlíček ZZ Interaction Unitary Decomposition</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              CNOT-Rz-CNOT
            </span>
          </div>
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 p-2">
            <img
              src="/images/zz_gate_interaction.svg"
              alt="ZZ Gate Interaction Diagram"
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The nonlinear interaction phase <code className="text-violet-300 font-mono">2(π-x₀)(π-x₁)</code> is synthesized via a central <code className="text-cyan-300 font-mono">Rz</code> gate sandwiched between two entangling <code className="text-cyan-300 font-mono">CNOT</code> gates.
          </p>
        </div>

        {/* Bloch Sphere Geometry */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-indigo-500/20 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Bloch Sphere Statevector Geometry</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              |Φ(x)⟩ Manifold
            </span>
          </div>
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 p-2 flex items-center justify-center">
            <img
              src="/images/bloch_sphere.svg"
              alt="Bloch Sphere Geometry"
              className="w-full max-h-56 object-contain"
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Input coordinates map to polar rotation angles <code className="text-cyan-300 font-mono">θ = 2x₁</code> and azimuthal angles <code className="text-violet-300 font-mono">φ = 2x₂</code> on the unit Bloch sphere.
          </p>
        </div>
      </div>

      {/* Rendered Circuit */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <CircuitViewer circuitData={circuitData} loading={loading} />
    </div>
  );
};
