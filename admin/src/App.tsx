import React, { useState, useEffect } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { AdminHeader } from './components/layout/AdminHeader';
import { ToastContainer } from './components/common/ToastContainer';
import { OverviewPage } from './pages/OverviewPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { ModerationSafetyPage } from './pages/ModerationSafetyPage';
import { ApprovalsQueuePage } from './pages/ApprovalsQueuePage';
import { ModulesManagementPage } from './pages/ModulesManagementPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';
import { adminApi } from './services/adminApi';

const AdminLayout: React.FC = () => {
  const { activeTab, refreshTrigger } = useAdmin();
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBadgeCounters();
  }, [refreshTrigger]);

  const loadBadgeCounters = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getDashboard();
      if (res.success && res.data) {
        setPendingReportsCount(parseInt(res.data.moderation.pending_reports || '0', 10));
        setPendingApprovalsCount(parseInt(res.data.approvals.pending_approvals || '0', 10));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'users':
        return <UserManagementPage />;
      case 'moderation':
        return <ModerationSafetyPage />;
      case 'approvals':
        return <ApprovalsQueuePage />;
      case 'modules':
        return <ModulesManagementPage />;
      case 'audit':
        return <AuditLogsPage />;
      case 'settings':
        return <SystemSettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-pearl-50 dark:bg-charcoal-900 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* 1. Left Super Admin Sidebar */}
      <AdminSidebar
        pendingReportsCount={pendingReportsCount}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <AdminHeader isLoading={isLoading} />

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-5">
          {renderActiveTabContent()}
        </main>
      </div>

      {/* 3. Global Toasts */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AdminProvider>
      <AdminLayout />
    </AdminProvider>
  );
};

export default App;
