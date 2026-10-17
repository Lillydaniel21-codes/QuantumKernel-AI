import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Activity, ShieldCheck, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { SpectralProperties } from '../types';

interface SpectralAnalysisCardProps {
  spectral?: SpectralProperties;
}

export const SpectralAnalysisCard: React.FC<SpectralAnalysisCardProps> = ({ spectral }) => {
  if (!spectral) {
    return null;
  }

  const chartData = spectral.eigenvalues.map((val, idx) => ({
    mode: `λ_${idx + 1}`,
    eigenvalue: Number(val.toFixed(3)),
  }));

  const isHealthy = spectral.spectral_status === 'Well-Conditioned';
  const isModerate = spectral.spectral_status === 'Moderate';

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white tracking-wide">
              Quantum Gram Matrix Spectral Health & Eigenvalues
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold border ${
                isHealthy
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : isModerate
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
              }`}
            >
              {spectral.spectral_status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Eigenvalue decay spectrum reveals kernel expressivity and guards against exponential concentration
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>Condition Number (κ)</span>
          </div>
          <p className="text-lg font-bold text-cyan-300 font-mono">
            {spectral.condition_number.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            {spectral.condition_number < 1000 ? 'Numerically Stable' : 'High Variance Spread'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span>Effective Dimension</span>
          </div>
          <p className="text-lg font-bold text-violet-300 font-mono">
            {spectral.effective_dimension.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            Participation ratio (∑λ)² / ∑λ²
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Numerical Matrix Rank</span>
          </div>
          <p className="text-lg font-bold text-emerald-300 font-mono">
            {spectral.rank}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            Active independent Hilbert modes
          </span>
        </div>
      </div>

      {/* Eigenvalue Spectrum Chart */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
          Top 10 Eigenvalues Distribution:
        </h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="mode" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#38bdf8',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="eigenvalue" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
        <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          <strong>Scientific Principle:</strong> If all eigenvalues were equal to 1, the matrix would degenerate into the identity matrix 
          (extreme kernel concentration / barren plateau). A balanced non-zero eigenvalue decay confirms the quantum feature map produces 
          sufficient geometric structure for Support Vector margin separation.
        </p>
      </div>
    </div>
  );
};
