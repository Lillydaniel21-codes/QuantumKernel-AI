import React from 'react';
import {
  User as UserIcon,
  Shield,
  Key,
  LogOut,
  Calendar,
  Mail,
  Cpu,
  Database,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { User } from '../types';

interface ProfilePageProps {
  user: User | null;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
  const token = localStorage.getItem('qk_token');
  const maskedToken = token ? `${token.substring(0, 16)}••••••••••••••••${token.substring(token.length - 12)}` : 'No active token';

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-950 text-cyan-400">
                <UserIcon className="h-8 w-8" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">{user?.full_name || 'Quantum Researcher'}</h1>
              <p className="text-xs text-cyan-400 font-mono capitalize">{user?.role || 'Lead Researcher'}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>End Active Session</span>
          </button>
        </div>
      </div>

      {/* Account & Security Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
            <Shield className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider">Account Credentials</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400">Full Name / Alias:</span>
              <p className="font-semibold text-white mt-0.5">{user?.full_name}</p>
            </div>
            <div>
              <span className="text-slate-400">Email Address:</span>
              <p className="font-mono text-cyan-300 mt-0.5">{user?.email}</p>
            </div>
            <div>
              <span className="text-slate-400">Access Role:</span>
              <p className="font-mono text-violet-300 mt-0.5 capitalize">{user?.role}</p>
            </div>
            <div>
              <span className="text-slate-400">Account Created:</span>
              <p className="font-mono text-slate-300 mt-0.5">
                {user?.created_at ? new Date(user.created_at).toUTCString() : 'Active Demo Session'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
            <Key className="h-4 w-4 text-violet-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider">JWT Session Token</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400">Token Type:</span>
              <p className="font-mono text-emerald-300 mt-0.5">Bearer (HMAC-SHA256 Signed)</p>
            </div>
            <div>
              <span className="text-slate-400">Token String:</span>
              <p className="font-mono text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800 break-all select-all mt-0.5">
                {maskedToken}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Security Architecture:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                Passwords hashed with 12-round standard Bcrypt. Bearer tokens validated per HTTP request.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Local Environment & Quantum Stack Diagnostics */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
          <Cpu className="h-4 w-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider">System & Quantum Stack Diagnostics</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400">Quantum SDK:</span>
            <p className="font-mono font-bold text-cyan-300 mt-0.5">Qiskit 2.6.0</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400">QML Library:</span>
            <p className="font-mono font-bold text-violet-300 mt-0.5">Qiskit ML 0.9.1</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400">Backend Server:</span>
            <p className="font-mono font-bold text-emerald-300 mt-0.5">FastAPI on Port 8000</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400">Database Engine:</span>
            <p className="font-mono font-bold text-slate-200 mt-0.5">SQLite (Local)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
