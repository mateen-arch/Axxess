import React from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { InquiriesTableView } from './InquiriesTableView';
import { ReferralsView } from './ReferralsView';

export const IntakeView: React.FC = () => {
  const { intakeSubTab } = useHealthcare();

  return (
    <div className="w-full">
      {intakeSubTab === 'referrals' ? <ReferralsView /> : <InquiriesTableView />}
    </div>
  );
};
