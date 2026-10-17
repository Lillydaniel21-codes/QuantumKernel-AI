import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  Sparkles,
  Info,
  Sliders,
  Table,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiDatasets } from '../services/api';
import { DatasetMetadata, DatasetPreviewResponse } from '../types';
import { DataScatterPlot } from '../components/DataScatterPlot';

export const DatasetsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [selectedId, setSelectedId] = useState<string>('moons');
  const [sampleLimit, setSampleLimit] = useState<number>(60);
  const [testSize, setTestSize] = useState<number>(0.25);
  const [noise, setNoise] = useState<number>(0.1);
  const [featureDim, setFeatureDim] = useState<number>(2);
  const [scaling, setScaling] = useState<string>('minmax_2pi');

  const [previewData, setPreviewData] = useState<DatasetPreviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadDatasetsList();
  }, []);

  useEffect(() => {
    loadDatasetPreview();
  }, [selectedId, sampleLimit, testSize, noise, featureDim, scaling]);

  const loadDatasetsList = async () => {
    try {
      const data = await apiDatasets.getAll();
      setDatasets(data);
    } catch (err) {
      console.error("Failed to load dataset catalog:", err);
    }
  };

  const loadDatasetPreview = async () => {
    setLoading(true);
    try {
      const preview = await apiDatasets.preview({
        dataset_id: selectedId,
        sample_limit: sampleLimit,
        test_size: testSize,
        noise: noise,
        random_seed: 42,
        feature_dim: featureDim,
        scaling: scaling,
      });
      setPreviewData(preview);
    } catch (err) {
      console.error("Failed to load preview:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentDataset = datasets.find(d => d.id === selectedId);

  const getDatasetThumbnail = (id: string) => {
    switch (id) {
      case 'moons': return '/images/moons_thumb.svg';
      case 'circles': return '/images/circles_thumb.svg';
      case 'synthetic': return '/images/synthetic_thumb.svg';
      case 'iris': return '/images/iris_thumb.svg';
      case 'breast_cancer': return '/images/cancer_thumb.svg';
      default: return '/images/moons_thumb.svg';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Quantum Benchmark Datasets Catalog
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-mono border border-indigo-500/30">
                5 Benchmarks
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Select and preview canonical classification manifolds. Preprocessing and dimensional reduction (PCA) 
              are strictly fitted on training splits to prevent statistical data leakage.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {datasets.map((d) => {
          const isSelected = selectedId === d.id;
          return (
            <button
              key={d.id}
              onClick={() => {
                setSelectedId(d.id);
                setFeatureDim(d.default_qubits);
              }}
              className={`p-3 rounded-xl text-left transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-slate-900 to-cyan-950/60 border-2 border-cyan-400 shadow-lg shadow-cyan-950/60 scale-[1.02]'
                  : 'bg-slate-900/50 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {/* Thumbnail Illustration */}
              <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80 mb-2.5 flex items-center justify-center p-1">
                <img
                  src={getDatasetThumbnail(d.id)}
                  alt={d.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  {d.classes} Classes
                </span>
                {isSelected && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
              </div>
              <h3 className="text-xs font-bold text-white truncate">{d.name}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                {d.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Dataset Details & Methodology */}
      {currentDataset && (
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">{currentDataset.name}</h2>
              <p className="text-xs text-slate-400">{currentDataset.description}</p>
            </div>
            {currentDataset.dimension_reduction_applied && (
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                PCA Dimensionality Reduction Active
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Total Samples:</span>
              <p className="text-sm font-bold text-white font-mono mt-0.5">{currentDataset.total_samples}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Original Features:</span>
              <p className="text-sm font-bold text-cyan-300 font-mono mt-0.5">{currentDataset.features} Dimensions</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Mapped Qubits:</span>
              <p className="text-sm font-bold text-violet-300 font-mono mt-0.5">{featureDim} Qubits</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Data Leakage Guard:</span>
              <p className="text-sm font-bold text-emerald-300 font-mono mt-0.5">Fitted on Train Only</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-cyan-300 font-semibold">Scientific Rationale: </strong>
            {currentDataset.scientific_context}
          </div>
        </div>
      )}

      {/* Interactive Controls & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-200">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Preview Parameters</h3>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Sample Limit:</span>
              <span className="font-mono text-cyan-300 font-bold">{sampleLimit}</span>
            </div>
            <input
              type="range"
              min={20}
              max={150}
              step={10}
              value={sampleLimit}
              onChange={(e) => setSampleLimit(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Test Split Ratio:</span>
              <span className="font-mono text-indigo-300 font-bold">{(testSize * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.15}
              max={0.4}
              step={0.05}
              value={testSize}
              onChange={(e) => setTestSize(Number(e.target.value))}
              className="w-full accent-indigo-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Noise:</span>
              <span className="font-mono text-slate-400">{noise.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={0.4}
              step={0.05}
              value={noise}
              onChange={(e) => setNoise(Number(e.target.value))}
              className="w-full accent-slate-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Target Qubit Wires:</span>
              <span className="font-mono text-violet-300 font-bold">{featureDim} Qubits</span>
            </div>
            <input
              type="range"
              min={2}
              max={selectedId === 'moons' || selectedId === 'circles' || selectedId === 'synthetic' ? 2 : 6}
              step={1}
              value={featureDim}
              onChange={(e) => setFeatureDim(Number(e.target.value))}
              className="w-full accent-violet-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Quantum Feature Scaling
            </label>
            <select
              value={scaling}
              onChange={(e) => setScaling(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
            >
              <option value="minmax_2pi">MinMax [0, 2π] (Phase Rotations)</option>
              <option value="minmax_pi">MinMax [-π, π] (Symmetric Phase)</option>
              <option value="standard">StandardScaler</option>
            </select>
          </div>
        </div>

        {/* 2D Scatter Plot Preview */}
        <div className="lg:col-span-2">
          {previewData ? (
            <DataScatterPlot
              points={previewData.points}
              featureNames={previewData.feature_names}
              title={`${previewData.dataset_name} — 2D Manifold Projection`}
              subtitle={`Visualizing ${previewData.n_train} training points and ${previewData.n_test} test points`}
            />
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
              <p>Loading dataset projection...</p>
            </div>
          )}
        </div>
      </div>

      {/* Dataset Preview Table */}
      {previewData && (
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Table className="h-4 w-4 text-cyan-400" />
              <h3 className="text-base font-semibold text-white">Preprocessed Samples Preview (First 15 Rows)</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {previewData.n_samples} Samples Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  {Object.keys(previewData.table_preview[0] || {}).map((col, idx) => (
                    <th key={idx} className="py-2.5 px-3">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {previewData.table_preview.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                    {Object.values(row).map((val: any, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3">
                        {typeof val === 'number' ? val.toFixed(4) : String(val)}
                      </td>
                    ))}
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
