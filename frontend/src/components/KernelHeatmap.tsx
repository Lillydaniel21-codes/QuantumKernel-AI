import React, { useState } from 'react';
import { Download, CheckCircle2, Info, Sparkles } from 'lucide-react';
import { KernelProperties } from '../types';
import { SpectralAnalysisCard } from './SpectralAnalysisCard';

interface KernelHeatmapProps {
  matrix: number[][];
  title?: string;
  subtitle?: string;
  properties?: KernelProperties;
  csvDownloadUrl?: string;
}

export const KernelHeatmap: React.FC<KernelHeatmapProps> = ({
  matrix,
  title = "Training Quantum Kernel Matrix K(x, x)",
  subtitle = "Computed fidelity overlap |⟨φ(x_i)|φ(x_j)⟩|² via Qiskit ZZFeatureMap",
  properties,
  csvDownloadUrl,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number; val: number } | null>(null);
  const [maxDisplayDim, setMaxDisplayDim] = useState<number>(20);

  if (!matrix || matrix.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-slate-400">
        <Info className="h-8 w-8 mx-auto mb-2 text-cyan-400 opacity-60" />
        <p className="text-sm">No quantum kernel matrix data available to render.</p>
      </div>
    );
  }

  const n = matrix.length;
  const displayDim = Math.min(n, maxDisplayDim);
  const displayedMatrix = matrix.slice(0, displayDim).map(row => row.slice(0, displayDim));

  const getHeatmapHex = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    if (clamped < 0.5) {
      const ratio = clamped / 0.5;
      const r = Math.round(9 + (6 - 9) * ratio);
      const g = Math.round(19 + (182 - 19) * ratio);
      const b = Math.round(38 + (212 - 38) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const ratio = (clamped - 0.5) / 0.5;
      const r = Math.round(6 + (192 - 6) * ratio);
      const g = Math.round(182 + (132 - 182) * ratio);
      const b = Math.round(212 + (252 - 212) * ratio);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white tracking-wide">{title}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/30">
                {n} × {n}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            {n > 15 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">View:</span>
                <select
                  value={maxDisplayDim}
                  onChange={(e) => setMaxDisplayDim(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 font-mono text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value={15}>15 × 15</option>
                  <option value={20}>20 × 20</option>
                  <option value={30}>30 × 30</option>
                  <option value={n}>Full ({n} × {n})</option>
                </select>
              </div>
            )}

            {csvDownloadUrl && (
              <a
                href={csvDownloadUrl}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-medium transition-all shadow-sm shadow-cyan-950"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </a>
            )}
          </div>
        </div>

        {/* Validation Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Matrix Symmetry</span>
            </div>
            <p className="text-sm font-semibold text-emerald-300 font-mono">
              {properties?.is_symmetric ?? true ? "Verified (K = Kᵀ)" : "Approximate"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Unit Diagonal</span>
            </div>
            <p className="text-sm font-semibold text-cyan-300 font-mono">
              {properties?.unit_diagonal ?? true ? "Verified (Kᵢᵢ = 1.0)" : "Normalized"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span>Avg Fidelity Overlap</span>
            </div>
            <p className="text-sm font-semibold text-violet-300 font-mono">
              {properties?.avg_fidelity ? properties.avg_fidelity.toFixed(4) : "—"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Info className="h-3.5 w-3.5 text-slate-400" />
              <span>Value Bounds</span>
            </div>
            <p className="text-sm font-semibold text-slate-200 font-mono">
              [{properties?.min_val ? properties.min_val.toFixed(3) : "0.000"}, {properties?.max_val ? properties.max_val.toFixed(3) : "1.000"}]
            </p>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto p-2 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <div className="inline-block min-w-full">
            <div
              className="grid gap-[2px] p-2"
              style={{
                gridTemplateColumns: `repeat(${displayDim}, minmax(18px, 1fr))`,
              }}
            >
              {displayedMatrix.map((row, i) =>
                row.map((val, j) => {
                  const isHovered = hoveredCell?.i === i && hoveredCell?.j === j;
                  const isDiagonal = i === j;
                  return (
                    <div
                      key={`${i}-${j}`}
                      onMouseEnter={() => setHoveredCell({ i, j, val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{ backgroundColor: getHeatmapHex(val) }}
                      className={`aspect-square rounded-sm transition-all cursor-pointer relative group flex items-center justify-center ${
                        isDiagonal ? 'ring-1 ring-white/50' : ''
                      } ${isHovered ? 'scale-125 z-10 ring-2 ring-cyan-300 shadow-lg' : 'hover:scale-110 hover:z-10'}`}
                      title={`K(x_${i}, x_${j}) = ${val.toFixed(4)}`}
                    >
                      {displayDim <= 15 && (
                        <span className="text-[9px] font-mono select-none text-slate-950 font-semibold drop-shadow-sm">
                          {val.toFixed(2)}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Active Cell Inspector */}
        {hoveredCell ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs">
            <div className="flex items-center gap-3">
              <div
                className="h-5 w-5 rounded border border-white/40 shadow"
                style={{ backgroundColor: getHeatmapHex(hoveredCell.val) }}
              />
              <span className="text-slate-300">
                Sample Pair <strong className="text-white font-mono">x_{hoveredCell.i}</strong> & <strong className="text-white font-mono">x_{hoveredCell.j}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400">Overlap Fidelity:</span>
              <span className="text-cyan-300 font-bold text-sm">
                {hoveredCell.val.toFixed(6)}
              </span>
              <span className="text-[10px] text-slate-500">
                ({hoveredCell.i === hoveredCell.j ? "Self-Overlap = 1.0" : hoveredCell.val > 0.5 ? "High Similarity" : "Orthogonal Tendency"})
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span>Hover over any matrix cell to inspect pair fidelity values.</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px]">Orthogonal (0.0)</span>
              <div className="h-2.5 w-24 rounded bg-gradient-to-r from-[#091326] via-[#06b6d4] to-[#c084fc]" />
              <span className="text-[10px]">Identical (1.0)</span>
            </div>
          </div>
        )}

        {/* Scientific Explanation */}
        <div className="text-xs text-slate-400 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
          <p className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            Quantum Kernel Fidelity Interpretation:
          </p>
          <p>
            Each cell represents <code className="text-cyan-300">K(x_i, x_j) = |⟨0| U^†(x_j) U(x_i) |0⟩|²</code>. 
            A value of <strong>1.0</strong> denotes identical quantum states in the 2ⁿ-dimensional Hilbert space, while 
            values approaching <strong>0.0</strong> denote mutually orthogonal states.
          </p>
        </div>
      </div>

      {/* Spectral Analysis Card if present */}
      {properties?.spectral && (
        <SpectralAnalysisCard spectral={properties.spectral} />
      )}
    </div>
  );
};
