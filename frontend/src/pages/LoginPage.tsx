import React, { useState } from 'react';
import { Atom, Mail, ArrowRight, Sparkles, Shield, AlertCircle, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';
import { apiAuth } from '../services/api';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  const [email, setEmail] = useState('');
  const [authMode, setAuthMode] = useState<'direct' | 'otp'>('direct');
  const [otpCode, setOtpCode] = useState('');
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Direct Email-Only Sign In
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const emailClean = email.trim();
    if (!emailClean) {
      setError('Please enter your researcher email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiAuth.login(emailClean);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  // Request 6-digit Email OTP
  const handleRequestOtp = async () => {
    setError(null);
    setInfoMessage(null);

    const emailClean = email.trim();
    if (!emailClean) {
      setError('Please enter your email address to receive a verification code.');
      return;
    }

    setOtpSending(true);
    try {
      const res = await apiAuth.sendOtp(emailClean);
      setSentOtp(res.otp_code || null);
      setAuthMode('otp');
      setInfoMessage(`A 6-digit verification code has been dispatched for ${emailClean}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setOtpSending(false);
    }
  };

  // Verify OTP & Sign In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailClean = email.trim();
    const codeClean = otpCode.trim();

    if (!codeClean) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiAuth.verifyOtp(emailClean, codeClean);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setInfoMessage(null);
    setDemoLoading(true);
    try {
      const res = await apiAuth.demoLogin();
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#060913] quantum-radial-gradient">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Email-Only Login Card */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand Header */}
          <div className="text-left space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 p-[1px] shadow-xl shadow-cyan-500/20 mb-1">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-950">
                <Atom className="h-6 w-6 text-cyan-400 animate-spin" style={{ animationDuration: '14s' }} />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">QuantumKernel AI</h1>
            <p className="text-xs text-slate-400">
              High-Dimensional Quantum Kernel Classifier Platform
            </p>
          </div>

          {/* Login Card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-cyan-500/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-semibold text-white">Researcher Sign In</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Passwordless Email Authentication</p>
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

            {infoMessage && (
              <div className="p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{infoMessage}</span>
              </div>
            )}

            {/* Quick Demo Account Action */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading || loading}
              className="w-full group flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-violet-500/20 hover:from-cyan-500/30 hover:to-violet-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>{demoLoading ? 'Signing In with Demo...' : 'One-Click Demo Account Access'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[10px] text-slate-500 font-mono uppercase">
                Or sign in with email
              </span>
            </div>

            {/* Simulated OTP Notification Banner if sent */}
            {sentOtp && authMode === 'otp' && (
              <div className="p-3.5 rounded-xl bg-violet-950/60 border border-violet-500/40 text-violet-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5 text-violet-300">
                    <KeyRound className="h-3.5 w-3.5 text-violet-400" />
                    Secure Verification Code
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Valid 10 min</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-violet-500/30">
                  <span className="font-mono text-base font-bold text-cyan-300 tracking-widest">
                    {sentOtp}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(sentOtp)}
                    className="text-[10px] px-2 py-1 rounded bg-violet-500/20 hover:bg-violet-500/40 text-violet-300 font-semibold transition-colors cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>
            )}

            {/* Direct Email Form */}
            {authMode === 'direct' ? (
              <form onSubmit={handleDirectLogin} className="space-y-4">
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
                      placeholder="demo@quantumkernel.ai"
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading || demoLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={otpSending}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                    title="Sign in with a 6-digit email verification code"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-violet-400" />
                    <span>{otpSending ? 'Sending...' : 'Use OTP Code'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* OTP Verification Form */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="demo@quantumkernel.ai"
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 font-mono tracking-widest focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    <span>{loading ? 'Verifying...' : 'Verify & Enter Platform'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('direct');
                      setError(null);
                      setInfoMessage(null);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
              >
                Need a research account? Register with email
              </button>
            </div>
          </div>

          {/* Security Footer */}
          <div className="flex items-center justify-start gap-2 text-[11px] text-slate-500">
            <Shield className="h-3.5 w-3.5 text-cyan-400/80" />
            <span>Passwordless Email Authentication • Signed JWT Tokens • SQLite</span>
          </div>
        </div>

        {/* Right Column: Hero Quantum Visual Showcase */}
        <div className="hidden lg:block lg:col-span-6 relative">
          <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-slate-950/80 p-2 group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <img
                src="/images/quantum_hero.png"
                alt="Quantum Statevector Processor"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-transparent to-transparent opacity-80" />
              
              {/* Badges on the image */}
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-[11px] text-cyan-300 font-mono">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  <span>Statevector Overlap: K(x,y) = |⟨Φ(x)|Φ(y)⟩|²</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  High-Dimensional Hilbert Space Mapping
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                  Transforms classical nonlinear data into exponential quantum statevectors using Qiskit ZZFeatureMap.
                </p>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-2 p-2 mt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
                <span className="text-slate-400 block text-[10px]">Quantum Feature Map</span>
                <span className="font-semibold text-cyan-300 font-mono">ZZFeatureMap (Havlíček)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
                <span className="text-slate-400 block text-[10px]">Dual Optimization</span>
                <span className="font-semibold text-violet-300 font-mono">QSVC vs Scikit-Learn SVM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
