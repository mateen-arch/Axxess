import React from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { Sidebar } from '../layout/Sidebar';
import { TopHeader } from '../layout/TopHeader';
import { BentoGrid } from '../dashboard/BentoGrid';
import { PatientsView } from '../patients/PatientsView';
import { ScheduleView } from '../schedule/ScheduleView';
import { IntakeView } from '../intake/IntakeView';
import { ReportCenterView } from '../reports/ReportCenterView';
import { ConnectAndPlannerSuite } from '../connect/ConnectAndPlannerSuite';

export const AxxessCentralApp: React.FC = () => {
  const { activeNavTab, organization } = useHealthcare();

  const renderActiveView = () => {
    switch (activeNavTab) {
      case 'dashboard':
        return <BentoGrid />;
      case 'patients':
        return <PatientsView />;
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
    <div className="app-container">
      {/* 1. Left Modern Navigation Sidebar */}
      <Sidebar />

      {/* 2. Main Work Area */}
      <div className="main-content">
        {/* Top Header Bar */}
        <TopHeader />

        {/* Dynamic View Body */}
        <main className="content-body">
          {renderActiveView()}
        </main>

        {/* Modern Enterprise Status Footer */}
        <footer className="app-footer mt-auto py-3.5 px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] transition-colors">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-slate-800 dark:text-slate-200">Axxess Central Healthcare</span>
            <span>•</span>
            <span>Release Version: {organization.releaseVersion}</span>
            <span>•</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Environment: {organization.environment}
            </span>
          </div>
          <div className="font-medium text-slate-500 dark:text-slate-400">
            Built with pride for {organization.name} • Dallas, Texas
          </div>
        </footer>
      </div>
    </div>
  );
};
