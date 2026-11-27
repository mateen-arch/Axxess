import React, { useState } from 'react';
import {
  Sliders,
  Database,
  ShieldCheck,
  Server,
  Lock,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const SystemSettingsPage: React.FC = () => {
  const { showToast } = useAdmin();
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<'healthy' | 'error'>('healthy');
  const [dbLatency, setDbLatency] = useState<number>(4);

  const handleTestDb = async () => {
    setIsTestingDb(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const elapsed = Math.round(performance.now() - start);
      setDbLatency(elapsed);
      if (res.ok) {
        setDbStatus('healthy');
        showToast(`PostgreSQL connection healthy (${elapsed}ms latency)`, 'success');
      } else {
        setDbStatus('error');
        showToast('Database health check returned an error', 'error');
      }
    } catch {
      setDbStatus('error');
      showToast('Unable to reach backend health endpoint', 'error');
    } finally {
      setIsTestingDb(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl">
      {/* 1. Header Segment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <Sliders size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
              <span>Platform Infrastructure & Governance</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live PostgreSQL database telemetry, super admin credentials, and platform security policies
            </p>
          </div>
        </div>
      </div>

      {/* 2. Database Status Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-pearl-100 dark:border-charcoal-750">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                PostgreSQL Enterprise Database
              </h3>
              <p className="text-[11px] text-slate-400">Connection pool and query executor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
              <CheckCircle2 size={12} />
              <span>Connected ({dbLatency}ms)</span>
            </span>

            <button
              type="button"
              onClick={handleTestDb}
              disabled={isTestingDb}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pearl-200 dark:border-charcoal-700 bg-pearl-50 dark:bg-charcoal-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-rose-600 transition cursor-pointer"
            >
              <RefreshCw size={12} className={isTestingDb ? 'animate-spin' : ''} />
              <span>Ping Database</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Host</span>
            <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">localhost:5432</div>
          </div>
          <div className="p-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Database Name</span>
            <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">axxess</div>
          </div>
          <div className="p-3 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Backend API Port</span>
            <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">HTTP :5000</div>
          </div>
        </div>
      </div>

      {/* 3. Super Admin Profile */}
      <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-pearl-100 dark:border-charcoal-750">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Super Administrator Identity
            </h3>
            <p className="text-[11px] text-slate-400">Authenticated master account credentials</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-pearl-50 dark:bg-charcoal-800 border border-pearl-200 dark:border-charcoal-700 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              SS
            </div>
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">Dr. Sarah Sterling, MD</div>
              <div className="text-slate-500 font-medium">admin@careorbit.health • Chief Medical & Compliance Officer</div>
              <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                Full Root Privileges across Central, Home Health, and Connect
              </div>
            </div>
          </div>

          <span className="px-3 py-1 rounded-xl bg-rose-600 text-white font-extrabold text-[11px]">
            Master Key Active
          </span>
        </div>
      </div>

      {/* 4. Platform Deployment Architecture */}
      <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-850 border border-pearl-200 dark:border-charcoal-700 shadow-2xs space-y-3 text-xs">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Multi-Website Deployment Architecture
        </h3>

        <div className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
            <div>
              <strong className="text-slate-900 dark:text-white">CareOrbit Super Admin Portal (This Website)</strong>
              <div className="text-[11px] text-slate-400">Dedicated administrative control website with root privileges</div>
            </div>
            <span className="font-mono font-bold text-rose-600">http://localhost:5174</span>
          </div>

          <div className="p-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
            <div>
              <strong className="text-slate-900 dark:text-white">CareOrbit Client Platform (Main Application)</strong>
              <div className="text-[11px] text-slate-400">Central Intake, Home Health EMR, Connect & Route Planner</div>
            </div>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-rose-600"
            >
              <span>http://localhost:5173</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="p-3 rounded-xl border border-pearl-200 dark:border-charcoal-700 flex items-center justify-between">
            <div>
              <strong className="text-slate-900 dark:text-white">CareOrbit REST API & Express Backend</strong>
              <div className="text-[11px] text-slate-400">Real-time Node.js Express server with PostgreSQL pool</div>
            </div>
            <span className="font-mono font-bold text-emerald-600">http://localhost:5000</span>
          </div>
        </div>
      </div>
    </div>
  );
};
