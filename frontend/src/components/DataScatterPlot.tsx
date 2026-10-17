import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { SamplePoint } from '../types';

interface DataScatterPlotProps {
  points: SamplePoint[];
  featureNames: string[];
  title?: string;
  subtitle?: string;
}

export const DataScatterPlot: React.FC<DataScatterPlotProps> = ({
  points,
  featureNames,
  title = "2D Quantum Feature Space Projection",
  subtitle = "Samples scaled to [0, 2π] phase angles for ZZFeatureMap encoding",
}) => {
  if (!points || points.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-slate-400">
        <p className="text-sm">No dataset points to visualize.</p>
      </div>
    );
  }

  // Group by Class and Split
  const class0Train = points.filter(p => p.label === 0 && p.split === 'train');
  const class0Test = points.filter(p => p.label === 0 && p.split === 'test');
  const class1Train = points.filter(p => p.label === 1 && p.split === 'train');
  const class1Test = points.filter(p => p.label === 1 && p.split === 'test');
  const class2 = points.filter(p => p.label === 2);

  const xLabel = featureNames[0] || 'Feature 1 (x₁)';
  const yLabel = featureNames[1] || 'Feature 2 (x₂)';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: SamplePoint = payload[0].payload;
      return (
        <div className="p-3 bg-slate-900 border border-cyan-500/40 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-semibold text-white">
            Sample #{data.sample_idx} ({data.split.toUpperCase()})
          </p>
          <p className="text-slate-400">
            Label: <strong className="text-cyan-300 font-mono">Class {data.label}</strong>
          </p>
          <p className="text-slate-400 font-mono">
            {xLabel}: {data.x.toFixed(4)}
          </p>
          <p className="text-slate-400 font-mono">
            {yLabel}: {data.y.toFixed(4)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white tracking-wide">{title}</h3>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>
        <div className="text-xs font-mono text-cyan-400 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
          {points.length} Samples ({points.filter(p => p.split === 'train').length} Train / {points.filter(p => p.split === 'test').length} Test)
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              type="number"
              dataKey="x"
              name={xLabel}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              domain={['auto', 'auto']}
              label={{ value: xLabel, position: 'bottom', offset: 0, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yLabel}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              domain={['auto', 'auto']}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
            
            <Scatter name="Class 0 (Train)" data={class0Train} fill="#06b6d4" shape="circle" />
            <Scatter name="Class 0 (Test)" data={class0Test} fill="#22d3ee" shape="cross" />
            <Scatter name="Class 1 (Train)" data={class1Train} fill="#a855f7" shape="circle" />
            <Scatter name="Class 1 (Test)" data={class1Test} fill="#c084fc" shape="cross" />
            {class2.length > 0 && (
              <Scatter name="Class 2" data={class2} fill="#10b981" shape="circle" />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
