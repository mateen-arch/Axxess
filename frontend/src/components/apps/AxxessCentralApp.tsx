import React from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { Sidebar } from '../layout/Sidebar';
import { TopHeader } from '../layout/TopHeader';
import { BentoGrid } from '../dashboard/BentoGrid';
import { PatientChartsView } from '../patients/PatientChartsView';
import { ScheduleView } from '../schedule/ScheduleView';
import { IntakeView } from '../intake/IntakeView';
import { ReportCenterView } from '../reports/ReportCenterView';
import { ConnectAndPlannerSuite } from '../connect/ConnectAndPlannerSuite';

export const CareOrbitCentralApp: React.FC = () => {
  const { activeNavTab, organization } = useHealthcare();

  const renderActiveView = () => {
    switch (activeNavTab) {
      case 'dashboard':
        return <BentoGrid />;
      case 'patients':
        return <PatientChartsView />;
      case 'schedule':
        return <ScheduleView />;
      case 'intake':
        return <IntakeView />;
      case 'messages':
      case 'connect':
      case 'planner':
        return <ConnectAndPlannerSuite />;
      case 'reports':
        return <ReportCenterView />;
      default:
        return <BentoGrid />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-pearl-100 dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* 1. Left Modern Navigation Sidebar */}
      <Sidebar />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header Bar */}
        <TopHeader />

        {/* Dynamic View Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden content-body">
          {renderActiveView()}

          {/* Modern Enterprise Status Footer */}
          <footer className="app-footer no-print print:hidden mt-auto py-3.5 px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-center md:text-left transition-colors">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
              <span className="font-extrabold text-slate-800 dark:text-slate-200">CareOrbit Central Healthcare</span>
              <span className="hidden sm:inline">•</span>
              <span>Release Version: {organization.releaseVersion}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Environment: {organization.environment}
              </span>
            </div>
            <div className="font-medium text-slate-500 dark:text-slate-400">
              Built with pride for {organization.name} • Dallas, Texas
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
