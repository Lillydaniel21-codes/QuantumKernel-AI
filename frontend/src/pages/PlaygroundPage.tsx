import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Sliders,
  AlertTriangle,
  Cpu,
  Database,
  Clock,
  Bot,
  Sparkles
} from 'lucide-react';
import { apiDatasets, apiExperiments, apiAIAgent } from '../services/api';
import {
  DatasetMetadata,
  ExperimentDetail,
  ExperimentRunPayload,
  SamplePoint,
  AIAnalyzeResponse
} from '../types';
import { MetricsComparison } from '../components/MetricsComparison';
import { KernelHeatmap } from '../components/KernelHeatmap';
import { ConfusionMatrixView } from '../components/ConfusionMatrixView';
import { DataScatterPlot } from '../components/DataScatterPlot';
import { DecisionBoundaryPlot } from '../components/DecisionBoundaryPlot';
import { SpectralAnalysisCard } from '../components/SpectralAnalysisCard';

interface PlaygroundPageProps {
  onNavigateToReport?: (experimentId: number) => void;
  onOpenAIChat?: (expId?: number) => void;
}

export const PlaygroundPage: React.FC<PlaygroundPageProps> = ({
  onNavigateToReport,
  onOpenAIChat,
}) => {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('moons');
  const [sampleLimit, setSampleLimit] = useState<number>(50);
  const [testSize, setTestSize] = useState<number>(0.25);
  const [noise, setNoise] = useState<number>(0.1);
  const [randomSeed, setRandomSeed] = useState<number>(42);
  const [featureDim, setFeatureDim] = useState<number>(2);
  const [reps, setReps] = useState<number>(2);
  const [entanglement, setEntanglement] = useState<string>('linear');
  const [scaling, setScaling] = useState<string>('minmax_2pi');
  const [cParam, setCParam] = useState<number>(1.0);
  const [noiseModel, setNoiseModel] = useState<string>('ideal_statevector');
  const [noiseRate, setNoiseRate] = useState<number>(0.0);

  // Live preview points for chosen dataset
  const [previewPoints, setPreviewPoints] = useState<SamplePoint[]>([]);
  const [previewFeatureNames, setPreviewFeatureNames] = useState<string[]>([]);

  // Execution state
  const [running, setRunning] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [experimentResult, setExperimentResult] = useState<ExperimentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AI Copilot Critique
  const [aiCritique, setAiCritique] = useState<AIAnalyzeResponse | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Tab view within results
  const [activeResultTab, setActiveResultTab] = useState<'metrics' | 'boundary' | 'heatmap' | 'spectral' | 'confusion'>('metrics');

  const loadDatasetPreview = useCallback(async () => {
    try {
      const preview = await apiDatasets.preview({
        dataset_id: selectedDatasetId,
        sample_limit: sampleLimit,
        test_size: testSize,
        noise: noise,
        random_seed: randomSeed,
        feature_dim: featureDim,
        scaling: scaling,
      });
      setPreviewPoints(preview.points);
      setPreviewFeatureNames(preview.feature_names);
    } catch (err) {
      console.error("Failed to load preview in playground:", err);
    }
  }, [selectedDatasetId, sampleLimit, testSize, noise, randomSeed, featureDim, scaling]);

  useEffect(() => {
    apiDatasets.getAll().then(setDatasets).catch(console.error);
  }, []);

  useEffect(() => {
    loadDatasetPreview();
  }, [loadDatasetPreview]);

  const handleDatasetChange = (id: string) => {
    setSelectedDatasetId(id);
    const d = datasets.find(item => item.id === id);
    if (d) {
      setFeatureDim(d.default_qubits || 2);
    }
  };

  const handleRunExperiment = async () => {
    setError(null);
    setRunning(true);
    setAiCritique(null);
    setActiveStep(1);

    const payload: ExperimentRunPayload = {
      title: `${selectedDatasetId.toUpperCase()} (${featureDim}Q, ${reps} Reps, C=${cParam}${noiseRate > 0 ? `, NISQ ${noiseRate * 100}%` : ''})`,
      dataset_id: selectedDatasetId,
      sample_limit: sampleLimit,
      test_size: testSize,
      noise: noise,
      random_seed: randomSeed,
      feature_dim: featureDim,
      reps: reps,
      entanglement: entanglement,
      scaling: scaling,
      c_parameter: cParam,
      noise_model: noiseModel,
      noise_rate: noiseRate,
      compute_decision_mesh: true,
    };

    try {
      const stepTimer1 = setTimeout(() => setActiveStep(2), 300);
      const stepTimer2 = setTimeout(() => setActiveStep(3), 800);
      const stepTimer3 = setTimeout(() => setActiveStep(4), 1600);

      const result = await apiExperiments.run(payload);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setActiveStep(5);
      setExperimentResult(result);
    } catch (err: any) {
      setError(err.message || 'Execution failed. Please verify parameters.');
    } finally {
      setRunning(false);
    }
  };

  const handleFetchAICritique = async () => {
    if (!experimentResult) return;
    setAiLoading(true);
    try {
      const critique = await apiAIAgent.analyze(experimentResult.id);
      setAiCritique(critique);
    } catch (err) {
      console.error("AI analysis error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Interactive Quantum Classifier Playground
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/30">
                Live Statevector & NISQ Simulation
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Configure dataset parameters and quantum circuit architecture to estimate fidelity kernels and compare 
              Quantum Support Vector Classification against Classical Gaussian RBF SVM in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAIChat && (
              <button
                onClick={() => onOpenAIChat(experimentResult?.id)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30 text-violet-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <Bot className="h-4 w-4 text-violet-400" />
                <span>Ask Q-Copilot</span>
              </button>
            )}

            <button
              onClick={handleRunExperiment}
              disabled={running}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
                running
                  ? 'bg-cyan-800 text-slate-300 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 cursor-pointer'
              }`}
            >
              {running ? (
                <>
                  <Cpu className="h-4 w-4 animate-spin" />
                  <span>Estimating Quantum Kernel...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-slate-950" />
                  <span>Execute Experiment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Matrix Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Dataset & Split */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-200">
            <Database className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">1. Dataset Selection</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Benchmark Dataset
            </label>
            <select
              value={selectedDatasetId}
              onChange={(e) => handleDatasetChange(e.target.value)}
              disabled={running}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.classes} Classes, {d.features} Features)
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Sample Limit:</span>
              <span className="font-mono font-bold text-cyan-300">{sampleLimit} samples</span>
            </div>
            <input
              type="range"
              min={20}
              max={150}
              step={10}
              value={sampleLimit}
              onChange={(e) => setSampleLimit(Number(e.target.value))}
              disabled={running}
              className="w-full accent-cyan-400"
            />
            {sampleLimit > 100 && (
              <p className="text-[10px] text-amber-400 flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Large sample sizes require evaluating O(N²) quantum state overlaps.</span>
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Test Split Ratio:</span>
              <span className="font-mono font-bold text-indigo-300">{(testSize * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.15}
              max={0.4}
              step={0.05}
              value={testSize}
              onChange={(e) => setTestSize(Number(e.target.value))}
              disabled={running}
              className="w-full accent-indigo-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Gaussian Noise:</span>
              <span className="font-mono text-slate-400">{noise.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={0.4}
              step={0.05}
              value={noise}
              onChange={(e) => setNoise(Number(e.target.value))}
              disabled={running}
              className="w-full accent-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Feature Scaling Method
            </label>
            <select
              value={scaling}
              onChange={(e) => setScaling(e.target.value)}
              disabled={running}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
            >
              <option value="minmax_2pi">MinMax to [0, 2π] (Quantum Phase)</option>
              <option value="minmax_pi">MinMax to [0, π]</option>
              <option value="standard">StandardScaler (Zero-Mean Unit-Var)</option>
            </select>
          </div>
        </div>

        {/* Column 2: ZZFeatureMap Quantum Architecture */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-200">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">2. ZZFeatureMap Architecture</h3>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Qubits / Feature Dimension:</span>
              <span className="font-mono font-bold text-cyan-300">{featureDim} Qubits</span>
            </div>
            <input
              type="range"
              min={2}
              max={selectedDatasetId === 'moons' || selectedDatasetId === 'circles' || selectedDatasetId === 'synthetic' ? 2 : 6}
              step={1}
              value={featureDim}
              onChange={(e) => setFeatureDim(Number(e.target.value))}
              disabled={running}
              className="w-full accent-cyan-400"
            />
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              Hilbert State Space: 2^{featureDim} = {Math.pow(2, featureDim)} dimensions
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Feature Map Repetitions (reps):</span>
              <span className="font-mono font-bold text-violet-300">{reps} Layer(s)</span>
            </div>
            <input
              type="range"
              min={1}
              max={4}
              step={1}
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              disabled={running}
              className="w-full accent-violet-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Entanglement Topology
            </label>
            <select
              value={entanglement}
              onChange={(e) => setEntanglement(e.target.value)}
              disabled={running}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
            >
              <option value="linear">Linear (Nearest Neighbor)</option>
              <option value="full">Full (All-to-All Pairs)</option>
              <option value="circular">Circular (Periodic Ring)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Simulation Backend & Noise Model
            </label>
            <select
              value={noiseModel}
              onChange={(e) => {
                setNoiseModel(e.target.value);
                if (e.target.value === 'ideal_statevector') setNoiseRate(0.0);
                else setNoiseRate(0.05);
              }}
              disabled={running}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
            >
              <option value="ideal_statevector">Ideal Statevector Simulator</option>
              <option value="depolarizing_nisq">Simulate NISQ Depolarizing Noise</option>
            </select>
          </div>

          {noiseModel === 'depolarizing_nisq' && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>NISQ Noise Rate:</span>
                <span className="font-mono text-amber-300 font-bold">{(noiseRate * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={0.15}
                step={0.01}
                value={noiseRate}
                onChange={(e) => setNoiseRate(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
          )}
        </div>

        {/* Column 3: Classifier Hyperparameters & Execution */}
        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-200">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">3. Classifier Hyperparameters</h3>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>SVM Regularization Parameter (C):</span>
              <span className="font-mono font-bold text-emerald-300">{cParam.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={10.0}
              step={0.5}
              value={cParam}
              onChange={(e) => setCParam(Number(e.target.value))}
              disabled={running}
              className="w-full accent-emerald-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Random Seed:</span>
              <span className="font-mono text-slate-400">{randomSeed}</span>
            </div>
            <input
              type="number"
              value={randomSeed}
              onChange={(e) => setRandomSeed(Number(e.target.value))}
              disabled={running}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              Runtime Estimation:
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Evaluating ~{sampleLimit * sampleLimit} statevector inner products. Expected calculation time: 
              <strong className="text-cyan-300 font-mono"> ~{sampleLimit < 60 ? '150 - 400 ms' : '600 - 1800 ms'}</strong>.
            </p>
          </div>

          <button
            onClick={handleRunExperiment}
            disabled={running}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            {running ? 'Execution in Progress...' : 'Start Training Run'}
          </button>
        </div>
      </div>

      {/* Dataset Scatter Plot Preview */}
      {previewPoints.length > 0 && (
        <DataScatterPlot
          points={previewPoints}
          featureNames={previewFeatureNames}
          title={`Pre-Run Preview: ${selectedDatasetId.toUpperCase()} Manifold`}
          subtitle="Inspect input coordinate distributions before launching quantum state encoding"
        />
      )}

      {/* Execution Stepper / Progress Bar */}
      {running && (
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 shadow-2xl space-y-4 animate-pulse">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
            <span className="flex items-center gap-2">
              <Cpu className="h-4 w-4 animate-spin text-cyan-400" />
              Executing Quantum Workflow Pipeline
            </span>
            <span>Step {activeStep} of 5</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            {[
              "1. Stratified Preprocessing",
              "2. ZZFeatureMap Synthesis",
              "3. Kernel Fidelity Matrix",
              "4. QSVC Optimization",
              "5. Classical SVM Comparison"
            ].map((stepText, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  activeStep > idx + 1
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : activeStep === idx + 1
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-950/40 border-slate-800 text-slate-600'
                }`}
              >
                {stepText}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-100">Experiment Execution Interrupted:</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results View Container */}
      {experimentResult && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Experiment #{experimentResult.id}: Results & Analysis
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Completed in {((experimentResult.quantum_kernel_time_ms || 0) + (experimentResult.qsvc_train_time_ms || 0)).toFixed(1)} ms 
                total calculation latency ({experimentResult.train_count} Train / {experimentResult.test_count} Test)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveResultTab('metrics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeResultTab === 'metrics'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                Model Metrics
              </button>
              <button
                onClick={() => setActiveResultTab('boundary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeResultTab === 'boundary'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                2D Decision Boundary
              </button>
              <button
                onClick={() => setActiveResultTab('heatmap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeResultTab === 'heatmap'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                Kernel Matrix Heatmap
              </button>
              <button
                onClick={() => setActiveResultTab('spectral')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeResultTab === 'spectral'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                Spectral Analysis
              </button>
              <button
                onClick={() => setActiveResultTab('confusion')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeResultTab === 'confusion'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                Confusion Matrix
              </button>
              <button
                onClick={handleFetchAICritique}
                disabled={aiLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/40 hover:bg-violet-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Bot className="h-3.5 w-3.5 text-violet-400" />
                <span>{aiLoading ? 'AI Analyzing...' : 'AI Critique'}</span>
              </button>
              {onOpenAIChat && (
                <button
                  onClick={() => onOpenAIChat(experimentResult.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Chat with Copilot</span>
                </button>
              )}
              {onNavigateToReport && (
                <button
                  onClick={() => onNavigateToReport(experimentResult.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all cursor-pointer"
                >
                  Scientific Report →
                </button>
              )}
            </div>
          </div>

          {/* AI Copilot Automated Critique Banner */}
          {aiCritique && (
            <div className="glass-panel rounded-2xl p-6 border border-violet-500/30 shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/30 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-violet-500/20">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-violet-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Q-Copilot Automated Scientific Critique
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  Experiment #{aiCritique.experiment_id}
                </span>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-slate-300">
                <p><strong>Executive Summary:</strong> {aiCritique.executive_summary}</p>
                <p><strong>Quantum vs Classical Analysis:</strong> {aiCritique.quantum_vs_classical_critique}</p>
                <p><strong>Gram Matrix Health:</strong> <code className="text-cyan-300 font-mono">{aiCritique.spectral_health}</code></p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-violet-300 uppercase tracking-wider block mb-2">
                  Recommended Hyperparameter Tuning Actions:
                </span>
                <ul className="space-y-1 text-xs text-slate-400 list-disc pl-5">
                  {aiCritique.hyperparameter_tuning_advice.map((advice, i) => (
                    <li key={i}>{advice}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Active Tab Panel */}
          {activeResultTab === 'metrics' && (
            <MetricsComparison experiment={experimentResult} />
          )}

          {activeResultTab === 'boundary' && (
            <DecisionBoundaryPlot
              decisionMesh={experimentResult.decision_mesh}
              dataPoints={previewPoints}
            />
          )}

          {activeResultTab === 'heatmap' && experimentResult.kernel_matrix_train && (
            <KernelHeatmap
              matrix={experimentResult.kernel_matrix_train}
              properties={experimentResult.kernel_properties}
              csvDownloadUrl={apiExperiments.getKernelCsvUrl(experimentResult.id)}
            />
          )}

          {activeResultTab === 'spectral' && experimentResult.kernel_properties?.spectral && (
            <SpectralAnalysisCard spectral={experimentResult.kernel_properties.spectral} />
          )}

          {activeResultTab === 'confusion' && (
            <ConfusionMatrixView
              quantumCm={experimentResult.confusion_matrix_quantum}
              classicalCm={experimentResult.confusion_matrix_classical}
            />
          )}
        </div>
      )}
    </div>
  );
};
