import React, { useState } from 'react';
import { Atom, Mail, User as UserIcon, ArrowRight, Shield, AlertCircle, Sparkles } from 'lucide-react';
import { apiAuth } from '../services/api';
import { User } from '../types';

interface RegisterPageProps {
  onRegisterSuccess: (user: User) => void;
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameClean = fullName.trim();
    const emailClean = email.trim();

    if (!nameClean || !emailClean) {
      setError('Please provide your full name and email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiAuth.register(emailClean, nameClean);
      onRegisterSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#060913] quantum-radial-gradient">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Registration Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="text-left space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 p-[1px] shadow-xl shadow-cyan-500/20 mb-1">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-950">
                <Atom className="h-6 w-6 text-cyan-400 animate-spin" style={{ animationDuration: '14s' }} />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">QuantumKernel AI</h1>
            <p className="text-xs text-slate-400">
              Create your researcher profile to execute and persist quantum experiments
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-cyan-500/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-semibold text-white">New Researcher Account</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Passwordless Email Profile Creation</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Email Only
              </span>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name / Researcher Alias
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Marie Curie"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Researcher Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marie.curie@research.ai"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <span>{loading ? 'Creating Profile...' : 'Create Researcher Account'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
              >
                Already registered? Sign in with email
              </button>
            </div>
          </div>

          <div className="flex items-center justify-start gap-2 text-[11px] text-slate-500">
            <Shield className="h-3.5 w-3.5 text-cyan-400/80" />
            <span>Passwordless Email Authentication • Signed JWT Tokens • SQLite</span>
          </div>
        </div>

        {/* Right Column: Visual Showcase */}
        <div className="hidden lg:block lg:col-span-6 relative">
          <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-slate-950/80 p-2 group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <img
                src="/images/quantum_kernel_matrix.png"
                alt="Quantum Kernel Gram Matrix"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-[11px] text-cyan-300 font-mono">
                  <Shield className="h-3 w-3 text-cyan-400" />
                  <span>Gram Matrix K ∈ ℝ^(N×N) (Unit Diagonal)</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Statevector Transition Fidelity Engine
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                  Computes exact quantum inner products in exponential Hilbert space for nonlinear SVM classification.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2 mt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
                <span className="text-slate-400 block text-[10px]">Dataset Suite</span>
                <span className="font-semibold text-cyan-300 font-mono">5 Benchmarks Included</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
                <span className="text-slate-400 block text-[10px]">Copilot AI</span>
                <span className="font-semibold text-violet-300 font-mono">Realtime QML Tuning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
