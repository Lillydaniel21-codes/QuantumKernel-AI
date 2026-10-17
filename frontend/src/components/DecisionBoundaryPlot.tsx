import React, { useState } from 'react';
import { Cpu, Scale, Layers, Info } from 'lucide-react';
import { DecisionMeshPoint, SamplePoint } from '../types';

interface DecisionBoundaryPlotProps {
  decisionMesh?: DecisionMeshPoint[];
  dataPoints?: SamplePoint[];
}

export const DecisionBoundaryPlot: React.FC<DecisionBoundaryPlotProps> = ({
  decisionMesh,
  dataPoints = [],
}) => {
  const [activeModel, setActiveModel] = useState<'both' | 'quantum' | 'classical'>('both');

  if (!decisionMesh || decisionMesh.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 space-y-2">
        <Layers className="h-7 w-7 mx-auto text-cyan-400 opacity-60" />
        <p className="text-sm">2D Decision boundary mesh is computed for 2-feature benchmark datasets (e.g. Moons, Circles, Synthetic, or 2D PCA).</p>
      </div>
    );
  }

  // Derive bounding boxes for SVG coordinates
  const allX = decisionMesh.map(p => p.x);
  const allY = decisionMesh.map(p => p.y);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  const rangeX = maxX - minX || 1.0;
  const rangeY = maxY - minY || 1.0;

  const svgWidth = 320;
  const svgHeight = 280;
  const padding = 20;

  const toSvgX = (x: number) => padding + ((x - minX) / rangeX) * (svgWidth - 2 * padding);
  const toSvgY = (y: number) => svgHeight - padding - ((y - minY) / rangeY) * (svgHeight - 2 * padding);

  const renderContourCanvas = (isQuantum: boolean, title: string) => {
    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 flex-1">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {isQuantum ? <Cpu className="h-4 w-4 text-cyan-400" /> : <Scale className="h-4 w-4 text-indigo-400" />}
            <h4 className="text-xs font-bold text-white">{title}</h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {decisionMesh.length} Grid Points
          </span>
        </div>

        {/* SVG Contour and Scatter Overlay */}
        <div className="flex justify-center bg-slate-950 rounded-xl p-2 border border-slate-900">
          <svg width={svgWidth} height={svgHeight} className="overflow-hidden">
            {/* Background mesh grid cells */}
            {decisionMesh.map((pt, i) => {
              const pred = isQuantum ? pt.qsvc_pred : pt.classical_pred;
              const cx = toSvgX(pt.x);
              const cy = toSvgY(pt.y);
              return (
                <rect
                  key={i}
                  x={cx - 10}
                  y={cy - 10}
                  width={20}
                  height={20}
                  fill={pred === 0 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(168, 85, 247, 0.18)'}
                  rx={2}
                />
              );
            })}

            {/* Foreground Actual Data Points */}
            {dataPoints.map((pt, i) => {
              const cx = toSvgX(pt.x);
              const cy = toSvgY(pt.y);
              const isClass0 = pt.label === 0;
              const isTrain = pt.split === 'train';

              return (
                <circle
                  key={`pt-${i}`}
                  cx={cx}
                  cy={cy}
                  r={isTrain ? 3.5 : 4.5}
                  fill={isClass0 ? '#06b6d4' : '#a855f7'}
                  stroke={isTrain ? '#020617' : '#ffffff'}
                  strokeWidth={1.5}
                  opacity={0.9}
                >
                  <title>{`Sample #${pt.sample_idx} (Class ${pt.label}, ${pt.split})`}</title>
                </circle>
              );
            })}
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-cyan-500/20 border border-cyan-500/40" />
            <span>Class 0 Partition</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-violet-500/20 border border-violet-500/40" />
            <span>Class 1 Partition</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white tracking-wide">
            2D Decision Boundary Topology Comparison
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluates statevector kernel fidelity vs Euclidean Gaussian distance across a 2D mesh grid
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveModel('both')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeModel === 'both' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setActiveModel('quantum')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeModel === 'quantum' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
            }`}
          >
            Quantum Only
          </button>
          <button
            onClick={() => setActiveModel('classical')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeModel === 'classical' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-400'
            }`}
          >
            Classical Only
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {(activeModel === 'both' || activeModel === 'quantum') &&
          renderContourCanvas(true, 'Quantum QSVC Decision Space')}
        {(activeModel === 'both' || activeModel === 'classical') &&
          renderContourCanvas(false, 'Classical RBF SVM Decision Space')}
      </div>

      <div className="flex items-start gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
        <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          Notice how the quantum decision boundary reflects the periodic trigonometry of the ZZFeatureMap 
          <code className="text-cyan-300">exp(i 2(π - x_i)(π - x_j))</code>, curving to wrap around nonlinearly entangled samples.
        </p>
      </div>
    </div>
  );
};
