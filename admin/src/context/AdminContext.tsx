import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SystemModuleKey } from '../types/admin';
import { adminApi } from '../services/adminApi';

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

export interface AdminAuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  title: string;
}

interface AdminContextType {
  adminUser: AdminAuthUser | null;
  isAuthChecking: boolean;
  setAdminSession: (admin: AdminAuthUser, token: string) => void;
  logoutAdmin: () => void;
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
  const [adminUser, setAdminUser] = useState<AdminAuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('careorbit_admin_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedModule, setSelectedModule] = useState<SystemModuleKey>('central');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('careorbit_admin_dark_mode') === 'true';
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('careorbit_admin_token');
    if (!token) {
      setAdminUser(null);
      setIsAuthChecking(false);
      return;
    }
    adminApi.verifyAdminSession(token)
      .then((res) => {
        if (res.success && res.admin) {
          setAdminUser(res.admin);
          localStorage.setItem('careorbit_admin_user', JSON.stringify(res.admin));
        } else {
          localStorage.removeItem('careorbit_admin_token');
          localStorage.removeItem('careorbit_admin_user');
          setAdminUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('careorbit_admin_token');
        localStorage.removeItem('careorbit_admin_user');
        setAdminUser(null);
      })
      .finally(() => setIsAuthChecking(false));
  }, []);

  const setAdminSession = (admin: AdminAuthUser, token: string) => {
    localStorage.setItem('careorbit_admin_token', token);
    localStorage.setItem('careorbit_admin_user', JSON.stringify(admin));
    setAdminUser(admin);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('careorbit_admin_token');
    localStorage.removeItem('careorbit_admin_user');
    setAdminUser(null);
  };

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
        adminUser,
        isAuthChecking,
        setAdminSession,
        logoutAdmin,
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
