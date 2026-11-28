import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAdmin } from '../context/AdminContext';

export const AdminLoginPage: React.FC = () => {
  const { setAdminSession } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your administrator email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await adminApi.loginAdmin(email.trim(), password);
      if (res.success && res.token && res.admin) {
        setAdminSession(res.admin, res.token);
      } else {
        setError('Invalid administrator credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-charcoal-850 rounded-3xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-rose-700 to-rose-900 px-8 py-7 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-rose-200">
                CareOrbit Governance
              </div>
              <h1 className="text-xl font-black tracking-tight">Super Admin Portal</h1>
            </div>
          </div>
          <p className="text-xs text-rose-100/90 leading-relaxed">
            Restricted system governance console. Only the designated Super Administrator account is permitted access.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              <ShieldAlert size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@careorbit.health"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-sm shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Panel</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="pt-3 border-t border-pearl-100 dark:border-charcoal-750 text-center text-[11px] text-slate-400">
            Authorized Super Administrator access only • No self-registration permitted
          </div>
        </form>
      </div>
    </div>
  );
};
