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

const ADMIN_TAB_ROUTES: Record<AdminTab, string> = {
  overview: '/overview',
  users: '/users',
  moderation: '/moderation',
  approvals: '/approvals',
  patients: '/patients',
  clinicians: '/clinicians',
  scheduling: '/scheduling',
  clinical_emr: '/clinical-emr',
  reports_census: '/reports-census',
  modules: '/modules',
  audit: '/audit',
  settings: '/settings',
};

function parseAdminTabFromPath(pathname: string): AdminTab {
  const clean = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean || clean === 'login' || clean === 'overview') return 'overview';
  for (const [tab, route] of Object.entries(ADMIN_TAB_ROUTES)) {
    const cleanRoute = route.replace(/^\/+/, '').toLowerCase();
    if (clean === cleanRoute || clean === tab.toLowerCase()) {
      return tab as AdminTab;
    }
  }
  return 'overview';
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
  const [activeTab, setActiveTabState] = useState<AdminTab>(() =>
    typeof window !== 'undefined' ? parseAdminTabFromPath(window.location.pathname) : 'overview'
  );
  const [selectedModule, setSelectedModule] = useState<SystemModuleKey>('central');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('careorbit_admin_dark_mode') === 'true';
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const targetPath = ADMIN_TAB_ROUTES[tab] || '/overview';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab }, '', targetPath);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(parseAdminTabFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (isAuthChecking || typeof window === 'undefined') return;
    if (!adminUser) {
      if (window.location.pathname !== '/login') {
        window.history.replaceState(null, '', '/login');
      }
    } else {
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/login') {
        const targetPath = ADMIN_TAB_ROUTES[activeTab] || '/overview';
        window.history.replaceState({ tab: activeTab }, '', targetPath);
      }
    }
  }, [adminUser, isAuthChecking, activeTab]);

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
