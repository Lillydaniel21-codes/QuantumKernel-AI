import React from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  Database,
  Binary,
  Grid3X3,
  History,
  FileText,
  GraduationCap,
  User as UserIcon,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard, badge: 'Overview' },
    { id: 'playground', label: 'Interactive Playground', icon: FlaskConical, badge: 'Live QSVC' },
    { id: 'datasets', label: 'Benchmark Datasets', icon: Database, badge: '5 Sets' },
    { id: 'feature-map', label: 'Quantum Feature Map', icon: Binary, badge: 'ZZ Circuit' },
    { id: 'kernel-analysis', label: 'Kernel Matrix Heatmap', icon: Grid3X3, badge: 'Fidelity' },
    { id: 'history', label: 'Experiment History', icon: History, badge: 'SQLite' },
    { id: 'report', label: 'Research Report', icon: FileText, badge: 'Export' },
    { id: 'education', label: 'Theory & Education', icon: GraduationCap, badge: 'QML Guide' },
    { id: 'profile', label: 'Researcher Profile', icon: UserIcon, badge: 'Session' },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-cyan-500/15 bg-slate-950/95 p-4 transition-transform duration-200 ease-in-out lg:translate-x-0 overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 px-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400/80 font-mono">
            Navigation Menu
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-violet-500/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                  {isActive && <ChevronRight className="h-3 w-3 text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Hardware Architecture Status Card */}
        <div className="mt-8 pt-4 border-t border-slate-800/80">
          <div className="rounded-xl p-3 bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200">Quantum Simulator</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
              Executing exact statevector inner products |⟨φ(x)|φ(y)⟩|² via Qiskit Machine Learning.
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/90 pt-1 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> Precomputed SVC
              </span>
              <span>2 - 8 Qubits</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
