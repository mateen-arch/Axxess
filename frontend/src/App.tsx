import React from 'react';
import { HealthcareProvider, useHealthcare } from './context/HealthcareContext';
import { AxxessHubLanding } from './components/portal/AxxessHubLanding';
import { AxxessCentralApp } from './components/apps/AxxessCentralApp';
import { AxxessHomeHealthApp } from './components/apps/AxxessHomeHealthApp';
import { AxxessConnectApp } from './components/apps/AxxessConnectApp';
import { CommandPaletteModal } from './components/layout/CommandPaletteModal';
import { PatientDrawer } from './components/patients/PatientDrawer';
import { NewPatientModal } from './components/patients/NewPatientModal';
import { MessageDetailModal } from './components/dashboard/MessageDetailModal';
import { VideoModal } from './components/video/VideoModal';
import './styles/modern-ui.css';

const MainAppContent: React.FC = () => {
  const { currentWebsite } = useHealthcare();

  const renderCurrentWebsite = () => {
    switch (currentWebsite) {
      case 'hub':
        return <AxxessHubLanding />;
      case 'central':
        return <AxxessCentralApp />;
      case 'home_health':
        return <AxxessHomeHealthApp />;
      case 'connect':
        return <AxxessConnectApp />;
      default:
        return <AxxessHubLanding />;
    }
  };

  return (
    <>
      {/* 1. Dynamic Selected Website */}
      {renderCurrentWebsite()}

      {/* 2. Interactive Global Modals and Drawers (Shared Across All 3 Websites) */}
      <CommandPaletteModal />
      <PatientDrawer />
      <NewPatientModal />
      <MessageDetailModal />
      <VideoModal />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <HealthcareProvider>
      <MainAppContent />
    </HealthcareProvider>
  );
};

export default App;
