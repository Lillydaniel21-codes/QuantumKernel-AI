import React, { useState, useEffect } from 'react';
import {
  Grid3X3,
  Download,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { apiExperiments } from '../services/api';
import { ExperimentSummary, ExperimentDetail } from '../types';
import { KernelHeatmap } from '../components/KernelHeatmap';

export const KernelAnalysisPage: React.FC = () => {
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<number | null>(null);
  const [experimentDetail, setExperimentDetail] = useState<ExperimentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadExperimentsList();
  }, []);

  const loadExperimentsList = async () => {
    try {
      const data = await apiExperiments.getAll();
      setExperiments(data);
      if (data.length > 0) {
        setSelectedExpId(data[0].id);
        loadDetail(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load experiments for kernel analysis:", err);
    }
  };

  const loadDetail = async (id: number) => {
    setLoading(true);
    try {
      const detail = await apiExperiments.getById(id);
      setExperimentDetail(detail);
    } catch (err) {
      console.error("Failed to load experiment detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExp = (id: number) => {
    setSelectedExpId(id);
    loadDetail(id);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Quantum Kernel Matrix Diagnostics
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/30">
                Fidelity Overlap |⟨φ(x)|φ(y)⟩|²
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Inspect the symmetric Gram matrix calculated via statevector simulation. 
              Verify mathematical symmetry, diagonal unity, and export raw values to standard CSV format.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Diagnostic Banner: Overlap Dataflow & 3D Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-cyan-500/20 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Quantum Fidelity Overlap Mechanics</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              K(x,y) = |⟨Φ(x)|Φ(y)⟩|²
            </span>
          </div>
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 p-2">
            <img
              src="/images/quantum_kernel_overlap.svg"
              alt="Quantum Kernel Overlap Diagram"
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Measures the geometric inner product of two statevectors in 2ⁿ-dimensional Hilbert space. Identical inputs yield maximum overlap <code className="text-cyan-300 font-mono">K(x,x) = 1.0</code>, establishing the unit diagonal.
          </p>
        </div>

        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-violet-500/20 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="h-4 w-4 text-violet-400" />
              <span>3D Gram Matrix Perspective</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/30">
              Gram Spectrum
            </span>
          </div>
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 p-2">
            <img
              src="/images/quantum_kernel_matrix.png"
              alt="Quantum Kernel Gram Matrix"
              className="w-full h-44 object-cover rounded-lg"
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            The computed Gram matrix <code className="text-violet-300 font-mono">K ∈ ℝ^(N×N)</code> is guaranteed positive semi-definite, enabling convex dual optimization in Support Vector Machines.
          </p>
        </div>
      </div>

      {/* Experiment Selector Bar */}
      {experiments.length > 0 && (
        <div className="glass-panel rounded-2xl p-4 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">Select Experiment Run:</span>
          </div>

          <select
            value={selectedExpId || ''}
            onChange={(e) => handleSelectExp(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-cyan-400 max-w-md"
          >
            {experiments.map((exp) => (
              <option key={exp.id} value={exp.id}>
                #{exp.id} — {exp.dataset_name} ({exp.train_count} Samples, {exp.feature_dim} Qubits, Reps={exp.reps})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Heatmap & Matrix Telemetry */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-16 text-center text-slate-400">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-cyan-400 animate-spin" />
          <p className="text-sm">Retrieving quantum kernel matrix from database...</p>
        </div>
      ) : experimentDetail?.kernel_matrix_train ? (
        <div className="space-y-6">
          <KernelHeatmap
            matrix={experimentDetail.kernel_matrix_train}
            title={`Training Kernel Matrix — Experiment #${experimentDetail.id}`}
            subtitle={`${experimentDetail.dataset_name} (${experimentDetail.train_count} × ${experimentDetail.train_count}) • Calculated in ${experimentDetail.quantum_kernel_time_ms} ms`}
            properties={experimentDetail.kernel_properties}
            csvDownloadUrl={apiExperiments.getKernelCsvUrl(experimentDetail.id)}
          />

          {/* Test vs Train Kernel Matrix if available */}
          {experimentDetail.kernel_matrix_test && experimentDetail.kernel_matrix_test.length > 0 && (
            <KernelHeatmap
              matrix={experimentDetail.kernel_matrix_test}
              title={`Test-versus-Train Kernel Matrix K(x_test, x_train)`}
              subtitle={`Cross-overlap matrix evaluated on ${experimentDetail.test_count} held-out test samples against ${experimentDetail.train_count} support training samples`}
              csvDownloadUrl={undefined}
            />
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <Grid3X3 className="h-8 w-8 mx-auto text-cyan-400 opacity-60" />
          <p className="text-sm">No quantum kernel matrices found.</p>
          <p className="text-xs text-slate-500">
            Execute a training experiment in the Playground to compute and inspect quantum kernel matrices.
          </p>
        </div>
      )}
    </div>
  );
};
