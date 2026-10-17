import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Scale,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { apiExperiments } from '../services/api';
import { ExperimentSummary, ExperimentDetail } from '../types';
import { MetricsComparison } from '../components/MetricsComparison';
import { KernelHeatmap } from '../components/KernelHeatmap';

interface ResearchReportPageProps {
  initialExperimentId?: number | null;
}

export const ResearchReportPage: React.FC<ResearchReportPageProps> = ({
  initialExperimentId,
}) => {
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<number | null>(initialExperimentId || null);
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadExperimentsList();
  }, []);

  useEffect(() => {
    if (selectedExpId) {
      loadReport(selectedExpId);
    }
  }, [selectedExpId]);

  const loadExperimentsList = async () => {
    try {
      const data = await apiExperiments.getAll();
      setExperiments(data);
      if (!selectedExpId && data.length > 0) {
        setSelectedExpId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load experiments for report:", err);
    }
  };

  const loadReport = async (id: number) => {
    setLoading(true);
    try {
      const rep = await apiExperiments.getReport(id);
      setReportData(rep);
    } catch (err) {
      console.error("Failed to load report data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!reportData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `quantumkernel_research_report_${reportData.report_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 pb-12 print:p-0 print:space-y-4">
      {/* Header and Controls */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl print:border-none print:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Automated Scientific Research Report
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/30">
                Peer Review Format
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Dynamically generated research artifact compiling methodology, statevector kernel overlaps, 
              benchmarked empirical metrics, and NISQ hardware limitations.
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {experiments.length > 0 && (
              <select
                value={selectedExpId || ''}
                onChange={(e) => setSelectedExpId(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-cyan-400"
              >
                {experiments.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    Exp #{exp.id}: {exp.dataset_name} ({exp.feature_dim}Q, Reps={exp.reps})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              <Printer className="h-3.5 w-3.5 text-cyan-400" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleExportJson}
              disabled={!reportData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Report Document Container */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-16 text-center text-slate-400">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-cyan-400 animate-spin" />
          <p className="text-sm">Generating scientific report from experimental telemetry...</p>
        </div>
      ) : reportData ? (
        <article className="glass-panel rounded-2xl p-6 sm:p-10 border border-cyan-500/20 shadow-2xl space-y-8 bg-slate-950/90 text-slate-300 text-xs leading-relaxed print:bg-white print:text-black">
          {/* Document Header */}
          <div className="pb-6 border-b border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500">
              <span>DOC ID: {reportData.report_id}</span>
              <span>GENERATED: {new Date(reportData.generated_at).toUTCString()}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white print:text-black tracking-tight">
              Empirical Evaluation of High-Dimensional Quantum Kernel Classification using ZZFeatureMap Overlaps
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-cyan-400 pt-1">
              <span>Benchmark Dataset: <strong>{reportData.dataset_name}</strong></span>
              <span>•</span>
              <span>Platform: <strong>QuantumKernel AI</strong></span>
              <span>•</span>
              <span>Engine: <strong>Qiskit 2.6.0 FidelityQuantumKernel</strong></span>
            </div>
          </div>

          {/* Section 1: Abstract / Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white print:text-black flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-cyan-400 print:text-black" />
              1. Abstract & Objective
            </h3>
            <p className="text-slate-300 print:text-gray-800 leading-relaxed text-justify">
              This report investigates the classification performance of Support Vector Machines augmented by a 
              quantum Hilbert state space mapping. Classical benchmark coordinates are projected onto 
              a <strong>2^{reportData.methodology.qubits}</strong>-dimensional quantum state space via the unitary evolution operator 
              of a <strong>ZZFeatureMap</strong> with {reportData.methodology.reps} repetition layers and {reportData.methodology.entanglement} entanglement topology. 
              Pairwise transition fidelities <code className="text-cyan-300 font-mono">K(x, y) = |⟨0| U^†(y) U(x) |0⟩|²</code> are 
              synthesized into a symmetric Gram matrix to train a dual Quadratic Programming Support Vector Classifier (QSVC).
            </p>
          </div>

          {/* Section 2: Methodology & Mathematical Rigor */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white print:text-black flex items-center gap-2">
              <Cpu className="h-4 w-4 text-violet-400 print:text-black" />
              2. Quantum Kernel Methodology & Circuit Construction
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 print:border-gray-300">
                <span className="font-semibold text-slate-200 print:text-black">Feature Map Operator:</span>
                <p className="font-mono text-cyan-300 text-[11px] print:text-black">
                  {reportData.methodology.feature_map}
                </p>
                <p className="text-[11px] text-slate-400 print:text-gray-700">
                  Applies single-qubit rotations Rz(2x_i) and non-local ZZ phase interactions CNOT-Rz(2(π-x_i)(π-x_j))-CNOT.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 print:border-gray-300">
                <span className="font-semibold text-slate-200 print:text-black">Kernel Overlap Metric:</span>
                <p className="font-mono text-cyan-300 text-[11px] print:text-black">
                  {reportData.methodology.kernel_formula}
                </p>
                <p className="text-[11px] text-slate-400 print:text-gray-700">
                  Evaluated using statevector inner product simulation with exact algebraic representation.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Metrics Side-by-Side Comparison */}
          {reportData.detail && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white print:text-black flex items-center gap-2">
                <Scale className="h-4 w-4 text-indigo-400 print:text-black" />
                3. Experimental Metrics & Classical Baseline Comparison
              </h3>
              <MetricsComparison experiment={reportData.detail} />
            </div>
          )}

          {/* Section 4: Kernel Matrix Telemetry */}
          {reportData.detail?.kernel_matrix_train && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white print:text-black flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400 print:text-black" />
                4. Computed Quantum Gram Matrix
              </h3>
              <KernelHeatmap
                matrix={reportData.detail.kernel_matrix_train}
                properties={reportData.detail.kernel_properties}
                csvDownloadUrl={apiExperiments.getKernelCsvUrl(reportData.experiment_id)}
              />
            </div>
          )}

          {/* Section 5: Key Findings */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white print:text-black flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400 print:text-black" />
              5. Empirical Findings
            </h3>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-300 print:text-gray-800">
              {reportData.findings.map((f: string, idx: number) => (
                <li key={idx} className="leading-relaxed">{f}</li>
              ))}
            </ul>
          </div>

          {/* Section 6: Limitations & NISQ Reality */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white print:text-black flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 print:text-black" />
              6. Hardware Limitations & Simulation Constraints
            </h3>
            <ul className="space-y-1.5 list-disc pl-5 text-slate-300 print:text-gray-800">
              {reportData.limitations.map((l: string, idx: number) => (
                <li key={idx} className="leading-relaxed">{l}</li>
              ))}
            </ul>
          </div>

          {/* Section 7: Conclusion */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 print:border-gray-300">
            <h3 className="text-xs font-bold text-white print:text-black uppercase">
              7. Conclusion & Research Outlook
            </h3>
            <p className="text-slate-300 print:text-gray-800 leading-relaxed">
              {reportData.conclusion} For higher-dimensional topological manifolds where classical polynomial and Gaussian RBF kernels 
              suffer from the curse of dimensionality, quantum feature spaces offer structured representational advantages without 
              requiring deep variational optimization loops.
            </p>
          </div>
        </article>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
          <p>Select or run an experiment to generate a research publication report.</p>
        </div>
      )}
    </div>
  );
};
