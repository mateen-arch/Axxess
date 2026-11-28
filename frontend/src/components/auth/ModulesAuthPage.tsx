import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  ShieldAlert,
  Building2,
  Stethoscope,
  MessageSquareText,
  Briefcase
} from 'lucide-react';
import { api } from '../../services/api';
import { useHealthcare } from '../../context/HealthcareContext';
import { CareOrbitLogo } from '../../assets/CareOrbitLogo';

export const ModulesAuthPage: React.FC = () => {
  const { setAuthSession } = useHealthcare();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [title, setTitle] = useState('Registered Nurse');
  const [department, setDepartment] = useState('Clinical Operations');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setError('Full name is required.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      if (mode === 'login') {
        const res = await api.loginModuleUser(email.trim(), password);
        if (res.success && res.token && res.user) {
          setAuthSession(res.user, res.token);
        }
      } else {
        const res = await api.registerModuleUser({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          title,
          department,
        });
        if (res.success && res.token && res.user) {
          setAuthSession(res.user, res.token);
        }
      }
    } catch (err: any) {
      setError(err.message || (mode === 'login' ? 'Sign in failed.' : 'Registration failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pearl-100 via-white to-rose-50 dark:from-charcoal-950 dark:via-charcoal-900 dark:to-rose-950/30 p-4 font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 bg-white dark:bg-charcoal-850 rounded-3xl shadow-2xl border border-pearl-200 dark:border-charcoal-700 overflow-hidden">
        {/* Left Branding & Modules Column */}
        <div className="lg:col-span-2 bg-gradient-to-br from-rose-700 via-rose-800 to-slate-900 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="bg-white rounded-xl p-1.5 shadow-sm">
                <CareOrbitLogo size="sm" />
              </div>
              <div>
                <div className="text-sm font-black tracking-tight">CareOrbit</div>
                <div className="text-[10px] font-semibold text-rose-200 uppercase tracking-wider">
                  Healthcare Suite
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight leading-snug mb-3">
              Unified Clinical &amp; Operations Access
            </h2>
            <p className="text-xs text-rose-100/90 leading-relaxed mb-6">
              Sign in once to access all authorized CareOrbit clinical workspaces for Standards Home Care.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs">
                <Building2 size={18} className="text-rose-200 shrink-0" />
                <div>
                  <div className="text-xs font-extrabold">CareOrbit Central</div>
                  <div className="text-[10px] text-rose-100/80">Census, Intake, Charts &amp; Reports</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs">
                <Stethoscope size={18} className="text-rose-200 shrink-0" />
                <div>
                  <div className="text-xs font-extrabold">CareOrbit Home Health</div>
                  <div className="text-[10px] text-rose-100/80">Clinical EHR, OASIS-E &amp; Billing</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs">
                <MessageSquareText size={18} className="text-rose-200 shrink-0" />
                <div>
                  <div className="text-xs font-extrabold">CareOrbit Connect</div>
                  <div className="text-[10px] text-rose-100/80">HIPAA Care Team Messaging &amp; Routes</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/15 text-[10px] text-rose-100/75">
            HIPAA-Compliant Session • Authorized Personnel Only
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-3 p-7 sm:p-9 flex flex-col justify-center">
          {/* Mode Toggle Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-pearl-100 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-charcoal-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Register Staff Account
            </button>
          </div>

          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create a Staff Account'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            {mode === 'login'
              ? 'Enter your authorized CareOrbit credentials to continue.'
              : 'Register to access CareOrbit Central, Home Health, and Connect.'}
          </p>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              <ShieldAlert size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jane Doe, RN"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Clinical Role / Title
                    </label>
                    <div className="relative">
                      <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                      >
                        <option value="Registered Nurse">Registered Nurse (RN)</option>
                        <option value="Clinical Supervisor">Clinical Supervisor</option>
                        <option value="Physical Therapist">Physical Therapist (PT)</option>
                        <option value="Occupational Therapist">Occupational Therapist (OT)</option>
                        <option value="Speech Therapist">Speech Therapist (ST)</option>
                        <option value="Case Manager">Case Manager / MSW</option>
                        <option value="Intake Coordinator">Intake Coordinator</option>
                        <option value="Home Health Aide">Home Health Aide (HHA)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Clinical Operations"
                      className="w-full px-3 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Work Email *
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@standardshomecare.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? 'Enter your password' : 'Minimum 6 characters'}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50/50 dark:bg-charcoal-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to CareOrbit' : 'Register & Enter CareOrbit'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
