import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Download,
  ArrowUpRight,
  Sparkles,
  X,
  AlertCircle,
  Scale,
  Bot,
  Trophy
} from 'lucide-react';
import { apiExperiments } from '../services/api';
import { ExperimentSummary, ExperimentDetail, ComparisonResponse } from '../types';
import { MetricsComparison } from '../components/MetricsComparison';
import { KernelHeatmap } from '../components/KernelHeatmap';

interface ExperimentHistoryPageProps {
  onNavigateToReport: (experimentId: number) => void;
}

export const ExperimentHistoryPage: React.FC<ExperimentHistoryPageProps> = ({
  onNavigateToReport,
}) => {
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDatasetFilter, setSelectedDatasetFilter] = useState<string>('all');
  const [selectedDetail, setSelectedDetail] = useState<ExperimentDetail | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Multi-Experiment Comparison State
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [comparing, setComparing] = useState<boolean>(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiExperiments.getAll();
      setExperiments(data);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleOpenDetail = async (id: number) => {
    try {
      const detail = await apiExperiments.getById(id);
      setSelectedDetail(detail);
    } catch (err) {
      console.error("Failed to load detail modal:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiExperiments.delete(id);
      setDeleteConfirmId(null);
      if (selectedDetail?.id === id) {
        setSelectedDetail(null);
      }
      setSelectedForComparison(prev => prev.filter(item => item !== id));
      loadHistory();
    } catch (err) {
      console.error("Failed to delete experiment:", err);
    }
  };

  const toggleComparisonSelection = (id: number) => {
    setSelectedForComparison(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleRunComparison = async () => {
    if (selectedForComparison.length < 2) return;
    setComparing(true);
    try {
      const res = await apiExperiments.compare(selectedForComparison);
      setComparisonData(res);
    } catch (err) {
      console.error("Failed to run comparison:", err);
    } finally {
      setComparing(false);
    }
  };

  const handleExportAllJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(experiments, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `quantumkernel_experiments_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredExperiments = experiments.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.dataset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.id.toString().includes(searchTerm);
    const matchesFilter =
      selectedDatasetFilter === 'all' ||
      exp.dataset_name.toLowerCase().includes(selectedDatasetFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Experiment Logs & SQLite History
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/30">
                {experiments.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Complete historical record of quantum kernel executions, metrics, and parameters persisted in SQLite.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedForComparison.length >= 2 && (
              <button
                onClick={handleRunComparison}
                disabled={comparing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-300 text-xs font-semibold transition-all shadow-sm"
              >
                <Scale className="h-4 w-4 text-violet-400" />
                <span>Compare Selected ({selectedForComparison.length})</span>
              </button>
            )}

            <button
              onClick={handleExportAllJson}
              disabled={experiments.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-sm"
            >
              <Download className="h-4 w-4 text-cyan-400" />
              <span>Export History JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search experiments by ID, title, or dataset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={selectedDatasetFilter}
            onChange={(e) => setSelectedDatasetFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Benchmark Datasets</option>
            <option value="moons">Moons</option>
            <option value="circles">Concentric Circles</option>
            <option value="synthetic">2D Synthetic</option>
            <option value="iris">Iris Flower</option>
            <option value="breast_cancer">Breast Cancer</option>
          </select>
        </div>
      </div>

      {/* Experiment Table */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <Sparkles className="h-6 w-6 animate-spin mx-auto text-cyan-400 mb-2" />
            <p className="text-xs">Loading experiment records...</p>
          </div>
        ) : filteredExperiments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <History className="h-8 w-8 mx-auto text-cyan-400 opacity-60" />
            <p className="text-sm font-semibold text-slate-300">No matching experiments found</p>
            <p className="text-xs text-slate-500">Run a new experiment in the Playground to populate history.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-3 rounded-l-lg w-8">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="py-3 px-3">Exp ID</th>
                  <th className="py-3 px-3">Title & Dataset</th>
                  <th className="py-3 px-3">Qubits</th>
                  <th className="py-3 px-3">Reps</th>
                  <th className="py-3 px-3">QSVC Acc</th>
                  <th className="py-3 px-3">Classical Acc</th>
                  <th className="py-3 px-3">Kernel Latency</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredExperiments.map((exp) => {
                  const isChecked = selectedForComparison.includes(exp.id);
                  return (
                    <tr
                      key={exp.id}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        isChecked ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleComparisonSelection(exp.id)}
                          className="rounded accent-cyan-400 cursor-pointer"
                          title="Select to compare"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-cyan-400">#{exp.id}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white truncate max-w-xs">{exp.title}</div>
                        <div className="text-[11px] text-slate-400">{exp.dataset_name} ({exp.sample_limit} Samples)</div>
                      </td>
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
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(exp.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenDetail(exp.id)}
                          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 font-medium"
                          title="View inspection modal"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => onNavigateToReport(exp.id)}
                          className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30"
                          title="View research report"
                        >
                          Report
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(exp.id)}
                          className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Multi-Experiment Comparison Modal */}
      {comparisonData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Multi-Experiment Side-by-Side Comparison ({comparisonData.experiments.length} Runs)
                </h3>
              </div>
              <button
                onClick={() => setComparisonData(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* AI Verdict Box */}
            <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30 space-y-2">
              <div className="flex items-center gap-2 text-violet-300 text-xs font-bold uppercase tracking-wider">
                <Bot className="h-4 w-4 text-violet-400" />
                <span>Q-Copilot Multi-Run Verdict:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {comparisonData.ai_verdict}
              </p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Run ID</th>
                    <th className="py-2.5 px-3">Dataset</th>
                    <th className="py-2.5 px-3">Qubits</th>
                    <th className="py-2.5 px-3">Reps</th>
                    <th className="py-2.5 px-3">Entanglement</th>
                    <th className="py-2.5 px-3">QSVC Acc</th>
                    <th className="py-2.5 px-3">Classical Acc</th>
                    <th className="py-2.5 px-3">Kernel Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {comparisonData.summary_table.map((row) => {
                    const isBestQ = row.id === comparisonData.best_quantum_id;
                    return (
                      <tr key={row.id} className={isBestQ ? 'bg-cyan-500/10' : ''}>
                        <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1">
                          #{row.id}
                          {isBestQ && <Trophy className="h-3 w-3 text-cyan-400" />}
                        </td>
                        <td className="py-2.5 px-3 text-slate-200">{row.dataset}</td>
                        <td className="py-2.5 px-3 text-cyan-300">{row.qubits} Q</td>
                        <td className="py-2.5 px-3 text-violet-300">{row.reps}</td>
                        <td className="py-2.5 px-3 text-slate-300 capitalize">{row.entanglement}</td>
                        <td className="py-2.5 px-3 font-bold text-cyan-400">
                          {(row.qsvc_accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-indigo-300">
                          {(row.classical_accuracy * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{row.kernel_time_ms} ms</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setComparisonData(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel rounded-2xl p-6 border border-red-500/40 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <AlertCircle className="h-5 w-5" />
              <span>Confirm Record Deletion</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete Experiment #{deleteConfirmId} from the SQLite database?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-950"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Inspection Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Experiment #{selectedDetail.id}: {selectedDetail.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedDetail.dataset_name} • {selectedDetail.feature_dim} Qubits • {selectedDetail.reps} Reps ({selectedDetail.entanglement} entanglement)
                </p>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <MetricsComparison experiment={selectedDetail} />

            {selectedDetail.kernel_matrix_train && (
              <KernelHeatmap
                matrix={selectedDetail.kernel_matrix_train}
                properties={selectedDetail.kernel_properties}
                csvDownloadUrl={apiExperiments.getKernelCsvUrl(selectedDetail.id)}
              />
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  const id = selectedDetail.id;
                  setSelectedDetail(null);
                  onNavigateToReport(id);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
              >
                <span>View Full Research Publication</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
