import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Trophy, Clock, Cpu, ShieldCheck, Scale, AlertTriangle } from 'lucide-react';
import { ExperimentDetail } from '../types';

interface MetricsComparisonProps {
  experiment: ExperimentDetail;
}

export const MetricsComparison: React.FC<MetricsComparisonProps> = ({ experiment }) => {
  const qAcc = experiment.qsvc_accuracy ?? 0;
  const cAcc = experiment.classical_accuracy ?? 0;
  const qF1 = experiment.qsvc_f1 ?? 0;
  const cF1 = experiment.classical_f1 ?? 0;
  const qPrec = experiment.qsvc_precision ?? 0;
  const cPrec = experiment.classical_precision ?? 0;
  const qRec = experiment.qsvc_recall ?? 0;
  const cRec = experiment.classical_recall ?? 0;

  const chartData = [
    {
      metric: 'Accuracy',
      Quantum_QSVC: Number((qAcc * 100).toFixed(1)),
      Classical_SVM: Number((cAcc * 100).toFixed(1)),
    },
    {
      metric: 'Precision',
      Quantum_QSVC: Number((qPrec * 100).toFixed(1)),
      Classical_SVM: Number((cPrec * 100).toFixed(1)),
    },
    {
      metric: 'Recall',
      Quantum_QSVC: Number((qRec * 100).toFixed(1)),
      Classical_SVM: Number((cRec * 100).toFixed(1)),
    },
    {
      metric: 'F1-Score',
      Quantum_QSVC: Number((qF1 * 100).toFixed(1)),
      Classical_SVM: Number((cF1 * 100).toFixed(1)),
    },
  ];

  const diffAcc = qAcc - cAcc;
  const winner = diffAcc > 0.001 ? 'quantum' : diffAcc < -0.001 ? 'classical' : 'tied';

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl space-y-6">
      {/* Header and Outcome Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white tracking-wide">
            Model Benchmarking: Quantum QSVC vs Classical RBF SVM
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Evaluated on identical stratified test set ({experiment.test_count} samples) using identical feature scaling
          </p>
        </div>

        <div className="flex items-center gap-2">
          {winner === 'quantum' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Trophy className="h-3.5 w-3.5 text-cyan-400" />
              <span>Quantum Margin: +{(diffAcc * 100).toFixed(1)}%</span>
            </div>
          )}
          {winner === 'classical' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Scale className="h-3.5 w-3.5 text-indigo-400" />
              <span>Classical Baseline Margin: +{(Math.abs(diffAcc) * 100).toFixed(1)}%</span>
            </div>
          )}
          {winner === 'tied' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Identical Accuracy: {(qAcc * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary KPI Side-by-Side Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quantum QSVC Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">Quantum QSVC</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              ZZFeatureMap (reps={experiment.reps})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">Accuracy</span>
              <p className="text-base font-bold text-cyan-300 font-mono">{(qAcc * 100).toFixed(1)}%</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">F1-Score</span>
              <p className="text-base font-bold text-cyan-300 font-mono">{(qF1 * 100).toFixed(1)}%</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">Precision</span>
              <p className="text-base font-bold text-slate-200 font-mono">{(qPrec * 100).toFixed(1)}%</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">Recall</span>
              <p className="text-base font-bold text-slate-200 font-mono">{(qRec * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-cyan-400" /> Kernel Eval: {experiment.quantum_kernel_time_ms} ms
            </span>
            <span>Train: {experiment.qsvc_train_time_ms} ms</span>
            <span>Pred: {experiment.qsvc_predict_time_ms} ms</span>
          </div>
        </div>

        {/* Classical RBF SVM Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-bold text-white">Classical SVM Baseline</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              RBF Kernel (Gaussian)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">Accuracy</span>
              <p className="text-base font-bold text-indigo-300 font-mono">{(cAcc * 100).toFixed(1)}%</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">F1-Score</span>
              <p className="text-base font-bold text-indigo-300 font-mono">{(cF1 * 100).toFixed(1)}%</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">Precision</span>
              <p className="text-base font-bold text-slate-200 font-mono">{(cPrec * 100).toFixed(1)}%</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400">Recall</span>
              <p className="text-base font-bold text-slate-200 font-mono">{(cRec * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-indigo-400" /> Kernel: Direct RBF
            </span>
            <span>Train: {experiment.classical_train_time_ms} ms</span>
            <span>Pred: {experiment.classical_predict_time_ms} ms</span>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart Comparison */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
          Comparative Metric Breakdown (%):
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="metric" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#38bdf8',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Quantum_QSVC" fill="#06b6d4" name="Quantum QSVC" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Classical_SVM" fill="#818cf8" name="Classical RBF SVM" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scientific Honesty Notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-300">Empirical Findings Notice:</strong> In accordance with rigorous scientific practices, 
          quantum kernel models are evaluated objectively against classical baselines. The quantum fidelity kernel constructs an inner product 
          in Hilbert space <code className="text-cyan-300">|⟨φ(x)|φ(y)⟩|²</code>, whereas classical SVM uses Gaussian spatial distance 
          <code className="text-indigo-300">exp(-γ||x - y||²)</code>. Depending on the topological geometry of the benchmark data, classical RBF 
          may match or exceed QSVC accuracy on lower-dimensional manifolds.
        </p>
      </div>
    </div>
  );
};
