import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SystemModuleKey } from '../types/admin';

export type AdminTab = 
  | 'overview' 
  | 'users' 
  | 'moderation' 
  | 'approvals' 
  | 'patients'
  | 'clinicians'
  | 'scheduling'
  | 'clinical_emr'
  | 'reports_census'
  | 'modules' 
  | 'audit' 
  | 'settings';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface AdminContextType {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  selectedModule: SystemModuleKey;
  setSelectedModule: (mod: SystemModuleKey) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
  removeToast: (id: string) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedModule, setSelectedModule] = useState<SystemModuleKey>('central');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('careorbit_admin_dark_mode') === 'true';
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('careorbit_admin_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AdminContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedModule,
        setSelectedModule,
        isDarkMode,
        toggleDarkMode,
        toasts,
        showToast,
        removeToast,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
