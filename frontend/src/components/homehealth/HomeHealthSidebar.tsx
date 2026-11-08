import React from 'react';
import { Sidebar } from '../layout/Sidebar';

interface HomeHealthSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

/** Home Health shares the compact Central sidebar shell and its navigation behavior. */
export const HomeHealthSidebar: React.FC<HomeHealthSidebarProps> = ({ currentTab, onTabChange }) => (
  <Sidebar variant="home_health" currentTab={currentTab} onTabChange={onTabChange} />
);
