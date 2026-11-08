import React from 'react';
import { Sidebar } from '../layout/Sidebar';

/**
 * Connect Sidebar shares the exact same modern collapsible frosted glass shell
 * as Axxess Central, maintaining visual parity while showing only the authentic
 * Connect options: Care Team Chat, Route Planner, and Telehealth Rooms.
 */
export const ConnectSidebar: React.FC = () => {
  return <Sidebar variant="connect" />;
};
