import React, { useEffect, useState } from 'react';
import {
  FlaskConical,
  Database,
  Binary,
  FileText,
  Activity,
  Trophy,
  Clock,
  ArrowUpRight,
  Sparkles,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiExperiments, apiDatasets } from '../services/api';
import { ExperimentSummary, ExperimentDetail, User, DatasetMetadata } from '../types';
import { MetricsComparison } from '../components/MetricsComparison';
import { KernelHeatmap } from '../components/KernelHeatmap';

interface DashboardPageProps {
  user: User | null;
  onNavigate: (tab: string, experimentId?: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate }) => {
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [latestDetail, setLatestDetail] = useState<ExperimentDetail | null>(null);
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [exps, dsets] = await Promise.all([
        apiExperiments.getAll(),
        apiDatasets.getAll()
      ]);
      setExperiments(exps);
      setDatasets(dsets);

      if (exps.length > 0) {
        const detail = await apiExperiments.getById(exps[0].id);
        setLatestDetail(detail);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalExps = experiments.length;
  const latestExp = experiments[0];
  const qAccuracy = latestExp?.qsvc_accuracy ? (latestExp.qsvc_accuracy * 100).toFixed(1) : null;
  const cAccuracy = latestExp?.classical_accuracy ? (latestExp.classical_accuracy * 100).toFixed(1) : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-cyan-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-violet-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>PS-Q2 Quantum Machine Learning Benchmark</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name || 'Researcher'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore high-dimensional statevector fidelity mapping using Qiskit <strong>ZZFeatureMap</strong> and 
              evaluate nonlinear Support Vector Classification against classical Gaussian RBF baselines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('playground')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
            >
              <FlaskConical className="h-4 w-4" />
              <span>Launch Experiment</span>
            </button>
            <button
              onClick={() => onNavigate('education')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              <span>Workflow Theory</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Experiments */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Experiments</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-white font-mono">{totalExps}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Persisted in SQLite database</p>
          </div>
        </div>

        {/* Latest Classification Accuracy */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Latest QSVC Accuracy</span>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-cyan-300 font-mono">
              {qAccuracy ? `${qAccuracy}%` : 'No runs yet'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {cAccuracy ? `vs Classical SVM: ${cAccuracy}%` : 'Run experiment to compare'}
            </p>
          </div>
        </div>

        {/* Selected / Recent Dataset */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Benchmark</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-white truncate">
              {latestExp?.dataset_name || 'Moons (Default)'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {datasets.length} benchmark suites loaded
            </p>
          </div>
        </div>

        {/* Simulation Backend Status */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Quantum Simulator</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-sm font-bold text-emerald-300 font-mono">Statevector Fidelity</p>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Qiskit Machine Learning 0.9.1</p>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('playground')}
          className="glass-panel glass-panel-hover p-4 rounded-xl text-left border border-cyan-500/20 group"
        >
          <div className="flex items-center justify-between mb-2">
            <FlaskConical className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <h3 className="text-xs font-bold text-white group-hover:text-cyan-300">Run New Experiment</h3>
          <p className="text-[11px] text-slate-400 mt-1">Configure qubits, reps, and evaluate live QSVC</p>
        </button>

        <button
          onClick={() => onNavigate('datasets')}
          className="glass-panel glass-panel-hover p-4 rounded-xl text-left border border-cyan-500/20 group"
        >
          <div className="flex items-center justify-between mb-2">
            <Database className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </div>
          <h3 className="text-xs font-bold text-white group-hover:text-indigo-300">Explore Datasets</h3>
          <p className="text-[11px] text-slate-400 mt-1">Moons, Circles, Synthetic, Iris, Breast Cancer</p>
        </button>

        <button
          onClick={() => onNavigate('feature-map')}
          className="glass-panel glass-panel-hover p-4 rounded-xl text-left border border-cyan-500/20 group"
        >
          <div className="flex items-center justify-between mb-2">
            <Binary className="h-5 w-5 text-violet-400 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
          </div>
          <h3 className="text-xs font-bold text-white group-hover:text-violet-300">Circuit Inspector</h3>
          <p className="text-[11px] text-slate-400 mt-1">Inspect Hadamard, phase rotations, and ZZ gates</p>
        </button>

        <button
          onClick={() => onNavigate('report', latestExp?.id)}
          className="glass-panel glass-panel-hover p-4 rounded-xl text-left border border-cyan-500/20 group"
        >
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h3 className="text-xs font-bold text-white group-hover:text-emerald-300">Scientific Report</h3>
          <p className="text-[11px] text-slate-400 mt-1">Automated research report with exportable data</p>
        </button>
      </div>

      {/* Quantum Architecture Visual Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Quantum Architecture Visual Overview
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Qiskit 2.6 Native Visuals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Visual Card 1: Quantum Processor */}
          <div
            onClick={() => onNavigate('playground')}
            className="glass-panel rounded-2xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/40 shadow-xl transition-all group cursor-pointer flex flex-col"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-950">
              <img
                src="/images/quantum_hero.png"
                alt="Quantum Statevector Processor"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-transparent to-transparent opacity-80" />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                Hilbert Mapping
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  High-Dimensional Quantum Mapping
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  Classical coordinates are encoded into 2ⁿ-dimensional quantum statevectors |Φ(x)⟩ using ZZ feature maps.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                <span>Launch Playground</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* Visual Card 2: Kernel Gram Matrix */}
          <div
            onClick={() => onNavigate('kernel-analysis')}
            className="glass-panel rounded-2xl overflow-hidden border border-violet-500/20 hover:border-violet-500/40 shadow-xl transition-all group cursor-pointer flex flex-col"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-950">
              <img
                src="/images/quantum_kernel_matrix.png"
                alt="Quantum Kernel Gram Matrix"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-transparent to-transparent opacity-80" />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-violet-500/30 text-[10px] font-mono text-violet-300">
                Gram Matrix K
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                  Fidelity Transition Overlap Engine
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  Evaluates pair-wise state overlap K(x,y) = |⟨Φ(x)|Φ(y)⟩|² with unit diagonal and non-negative spectrum.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-violet-400">
                <span>Kernel Heatmap</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* Visual Card 3: Bloch Sphere Geometry */}
          <div
            onClick={() => onNavigate('feature-map')}
            className="glass-panel rounded-2xl overflow-hidden border border-indigo-500/20 hover:border-indigo-500/40 shadow-xl transition-all group cursor-pointer flex flex-col"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-950 flex items-center justify-center p-2">
              <img
                src="/images/bloch_sphere.svg"
                alt="Bloch Sphere Geometry"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
                Bloch Sphere
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Spherical Phase Manifold Mapping
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  Rotates single-qubit states by phase angles θ = 2x₁ and φ = 2x₂ prior to entangling ZZ two-qubit couplers.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-indigo-400">
                <span>Circuit Inspector</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Experiment Deep Dive or Clean Empty State */}
      {latestDetail ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Latest Experiment Metrics</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Experiment #{latestDetail.id}: {latestDetail.title} ({new Date(latestDetail.created_at).toLocaleString()})
              </p>
            </div>
            <button
              onClick={() => onNavigate('playground')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>Open in Playground</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <MetricsComparison experiment={latestDetail} />

          {latestDetail.kernel_matrix_train && (
            <KernelHeatmap
              matrix={latestDetail.kernel_matrix_train}
              properties={latestDetail.kernel_properties}
              csvDownloadUrl={apiExperiments.getKernelCsvUrl(latestDetail.id)}
            />
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center border border-cyan-500/20 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Experiments Executed Yet</h3>
            <p className="text-xs text-slate-400">
              Run your first quantum kernel experiment to estimate fidelity matrices and train QSVC.
            </p>
          </div>
          <button
            onClick={() => onNavigate('playground')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
          >
            <FlaskConical className="h-4 w-4" />
            <span>Launch Initial Experiment</span>
          </button>
        </div>
      )}

      {/* Recent Experiments History Table Preview */}
      {experiments.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-white">Recent Experiment History</h3>
              <p className="text-xs text-slate-400 mt-0.5">Recorded runs stored in local SQLite database</p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>View All History</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">ID</th>
                  <th className="py-2.5 px-3">Dataset</th>
                  <th className="py-2.5 px-3">Qubits</th>
                  <th className="py-2.5 px-3">Reps</th>
                  <th className="py-2.5 px-3">QSVC Acc</th>
                  <th className="py-2.5 px-3">Classical Acc</th>
                  <th className="py-2.5 px-3">Kernel Time</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {experiments.slice(0, 5).map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400">#{exp.id}</td>
                    <td className="py-3 px-3 font-medium text-white">{exp.dataset_name}</td>
                    <td className="py-3 px-3 font-mono">{exp.feature_dim} Q</td>
                    <td className="py-3 px-3 font-mono">{exp.reps}</td>
                    <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                      {exp.qsvc_accuracy ? `${(exp.qsvc_accuracy * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {exp.classical_accuracy ? `${(exp.classical_accuracy * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {exp.quantum_kernel_time_ms ? `${exp.quantum_kernel_time_ms} ms` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onNavigate('report', exp.id)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
