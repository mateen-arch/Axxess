import React from 'react';
import { HealthcareProvider, useHealthcare } from './context/HealthcareContext';
import { CareOrbitHubLanding } from './components/portal/CareOrbitHubLanding';
import { CareOrbitCentralApp } from './components/apps/CareOrbitCentralApp';
import { CareOrbitHomeHealthApp } from './components/apps/CareOrbitHomeHealthApp';
import { CareOrbitConnectApp } from './components/apps/CareOrbitConnectApp';
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
        return <CareOrbitHubLanding />;
      case 'central':
        return <CareOrbitCentralApp />;
      case 'home_health':
        return <CareOrbitHomeHealthApp />;
      case 'connect':
        return <CareOrbitConnectApp />;
      default:
        return <CareOrbitHubLanding />;
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
