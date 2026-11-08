import React from 'react';
import { HeroWelcome } from './HeroWelcome';
import { ActivePatientsChart } from './ActivePatientsChart';
import { UnassignedVisitsCard } from './UnassignedVisitsCard';
import { IntakePipelineCard } from './IntakePipelineCard';
import { ScheduledVisitsPerformance } from './ScheduledVisitsPerformance';
import { UnreadMessagesCard } from './UnreadMessagesCard';
import { NewsAndVideoCard } from './NewsAndVideoCard';

export const BentoGrid: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome & Executive KPI Strip */}
      <HeroWelcome />

      {/* 2. Top Bento Row: Active Census & Unassigned Visits */}
      <div className="bento-grid">
        <div className="col-span-7">
          <ActivePatientsChart />
        </div>
        <div className="col-span-5">
          <UnassignedVisitsCard />
        </div>
      </div>

      {/* 3. Middle Bento Row: Intake Hub & Scheduled Visits Performance */}
      <div className="bento-grid">
        <div className="col-span-6">
          <IntakePipelineCard />
        </div>
        <div className="col-span-6">
          <ScheduledVisitsPerformance />
        </div>
      </div>

      {/* 4. Bottom Bento Row: Unread Clinical Messages & Care Intelligence Keynote */}
      <div className="bento-grid">
        <div className="col-span-5">
          <UnreadMessagesCard />
        </div>
        <div className="col-span-7">
          <NewsAndVideoCard />
        </div>
      </div>
    </div>
  );
};
