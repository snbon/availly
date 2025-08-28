import React from 'react';
import WelcomeBanner from './WelcomeBanner';
import StatsGrid from './StatsGrid';
import QuickActions from './QuickActions';
import CalendarPreview from './CalendarPreview';

const OverviewTab = ({ user, stats }) => {
  return (
    <div className="space-y-8">
      <WelcomeBanner user={user} />
      <StatsGrid stats={stats} showQuickActions={true} />
      
      <CalendarPreview />
    </div>
  );
};

export default OverviewTab;
