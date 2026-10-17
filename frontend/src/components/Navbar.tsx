import React from 'react';
import { Atom, Cpu, LogOut, User as UserIcon, Menu, X, Sparkles, Bot } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  activeTab: string;
  onToggleAIChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
  onToggleAIChat,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-cyan-400 lg:hidden rounded-lg hover:bg-slate-900 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-950">
                <Atom className="h-5 w-5 text-cyan-400 animate-spin" style={{ animationDuration: '14s' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">QuantumKernel</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                High-Dimensional Quantum Kernel Classifier
              </p>
            </div>
          </div>
        </div>

        {/* Center: Engine & Simulation Badges */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-mono text-cyan-300 font-medium">Qiskit 2.6.0</span>
            <span className="text-slate-600">|</span>
            <Cpu className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-violet-300">ZZFeatureMap</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 border border-emerald-500/30 text-xs text-emerald-400 font-medium">
            <Sparkles className="h-3 w-3" />
            <span>Fidelity Kernel Simulator</span>
          </div>
        </div>

        {/* Right: User session & Actions */}
        <div className="flex items-center gap-3">
          {/* AI Copilot Button */}
          {onToggleAIChat && (
            <button
              onClick={onToggleAIChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 hover:from-cyan-500/30 hover:to-violet-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-md shadow-cyan-950 transition-all cursor-pointer"
              title="Open Quantum Copilot AI"
            >
              <Bot className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Q-Copilot AI</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{user.full_name}</span>
                <span className="text-[10px] text-cyan-400 font-mono capitalize">{user.role}</span>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-300">
                <UserIcon className="h-4 w-4" />
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Guest Mode</div>
          )}
        </div>
      </div>
    </header>
  );
};
