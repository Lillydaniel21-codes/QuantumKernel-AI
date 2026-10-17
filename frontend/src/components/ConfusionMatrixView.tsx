import React from 'react';
import { Grid, Cpu, Scale } from 'lucide-react';

interface ConfusionMatrixViewProps {
  quantumCm?: number[][];
  classicalCm?: number[][];
}

export const ConfusionMatrixView: React.FC<ConfusionMatrixViewProps> = ({
  quantumCm,
  classicalCm,
}) => {
  if (!quantumCm || !classicalCm) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center text-slate-400">
        <p className="text-xs">No confusion matrix data available.</p>
      </div>
    );
  }

  const renderMatrix = (cm: number[][], modelName: string, isQuantum: boolean) => {
    const total = cm.flat().reduce((a, b) => a + b, 0);
    const correct = cm.reduce((acc, row, idx) => acc + (row[idx] || 0), 0);
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const nClasses = cm.length;

    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isQuantum ? (
              <Cpu className="h-4 w-4 text-cyan-400" />
            ) : (
              <Scale className="h-4 w-4 text-indigo-400" />
            )}
            <span className="text-sm font-semibold text-white">{modelName}</span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            {correct}/{total} Correct ({accuracy.toFixed(1)}%)
          </span>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2 text-slate-500 font-mono text-[10px]">Actual \ Pred</th>
                {Array.from({ length: nClasses }).map((_, j) => (
                  <th key={j} className="p-2 text-slate-300 font-mono text-[11px] font-semibold">
                    Class {j}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cm.map((row, i) => (
                <tr key={i}>
                  <td className="p-2 text-slate-300 font-mono text-[11px] font-semibold text-left">
                    Class {i}
                  </td>
                  {row.map((val, j) => {
                    const isDiagonal = i === j;
                    const maxVal = Math.max(...row, 1);
                    const intensity = val / maxVal;
                    
                    return (
                      <td key={j} className="p-2">
                        <div
                          className={`py-2 px-3 rounded-lg font-mono font-bold transition-transform ${
                            isDiagonal
                              ? isQuantum
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-950'
                              : val > 0
                              ? 'bg-rose-950/40 text-rose-300 border border-rose-900/40'
                              : 'bg-slate-950/60 text-slate-600'
                          }`}
                        >
                          {val}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
          <span>Diagonal = True Classifications</span>
          <span>Off-Diagonal = Misclassifications</span>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white tracking-wide">
            Test Confusion Matrix Comparison
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Breakdown of true positive and false positive predictions across held-out test samples
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderMatrix(quantumCm, 'Quantum QSVC Matrix', true)}
        {renderMatrix(classicalCm, 'Classical SVM Matrix', false)}
      </div>
    </div>
  );
};
