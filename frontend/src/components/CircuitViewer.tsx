import React, { useState } from 'react';
import { Copy, Check, Binary, Layers, Cpu, Compass, BookOpen } from 'lucide-react';
import { CircuitPreviewResponse } from '../types';

interface CircuitViewerProps {
  circuitData: CircuitPreviewResponse | null;
  loading?: boolean;
}

export const CircuitViewer: React.FC<CircuitViewerProps> = ({
  circuitData,
  loading = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!circuitData?.circuit_ascii) return;
    navigator.clipboard.writeText(circuitData.circuit_ascii);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
        <Cpu className="h-8 w-8 mx-auto mb-3 text-cyan-400 animate-pulse" />
        <p className="text-sm">Synthesizing quantum feature map circuit and decomposing unitary gates...</p>
      </div>
    );
  }

  if (!circuitData) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-slate-400">
        <Binary className="h-8 w-8 mx-auto mb-2 text-cyan-400 opacity-60" />
        <p className="text-sm">Configure circuit parameters to generate and inspect the ZZFeatureMap.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl space-y-6">
      {/* Header and Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white tracking-wide">
              ZZFeatureMap Quantum Circuit Architecture
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 font-mono border border-violet-500/30">
              {circuitData.num_qubits} Qubits
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Qiskit synthesized unitary representation: U_Φ(x) = [exp(i ∑ ϕ_j Z_j + ∑ ϕ_jk Z_j Z_k) H^⊗n]^d
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition-all"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
          <span>{copied ? 'Copied' : 'Copy ASCII'}</span>
        </button>
      </div>

      {/* Circuit Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Qubit Wires</span>
          </div>
          <p className="text-lg font-bold text-cyan-300 font-mono">{circuitData.num_qubits}</p>
          <span className="text-[10px] text-slate-500 font-mono">2^{circuitData.num_qubits} Hilbert dim</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Layers className="h-3.5 w-3.5 text-violet-400" />
            <span>Circuit Depth</span>
          </div>
          <p className="text-lg font-bold text-violet-300 font-mono">{circuitData.circuit_depth}</p>
          <span className="text-[10px] text-slate-500 font-mono">{circuitData.reps} repetition layer(s)</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Compass className="h-3.5 w-3.5 text-indigo-400" />
            <span>Entanglement Topology</span>
          </div>
          <p className="text-sm font-bold text-indigo-300 font-mono capitalize">{circuitData.entanglement}</p>
          <span className="text-[10px] text-slate-500 font-mono">ZZ interaction pair coupling</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Binary className="h-3.5 w-3.5 text-emerald-400" />
            <span>Decomposed Gates</span>
          </div>
          <p className="text-sm font-bold text-emerald-300 font-mono">
            {Object.entries(circuitData.gate_counts).map(([g, c]) => `${g}:${c}`).join(' ')}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">{circuitData.num_parameters} mapped features</span>
        </div>
      </div>

      {/* Rendered ASCII Circuit Container */}
      <div className="relative">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900 rounded-t-xl border border-b-0 border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
            Qiskit Decomposed Gate Stream
          </span>
          <span className="text-slate-500">Wires 0 to {circuitData.num_qubits - 1}</span>
        </div>
        <div className="overflow-x-auto p-4 bg-slate-950 rounded-b-xl border border-slate-800 shadow-inner">
          <pre className="font-mono text-xs text-cyan-300 whitespace-pre leading-relaxed select-all">
            {circuitData.circuit_ascii}
          </pre>
        </div>
      </div>

      {/* Layer-by-Layer Architectural Breakdown */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
          Quantum Circuit Execution Sequence:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {circuitData.circuit_layers_description.map((layer, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 text-[11px] font-mono font-bold">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-200">{layer.layer_name}</span>
              </div>
              <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">{layer.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
