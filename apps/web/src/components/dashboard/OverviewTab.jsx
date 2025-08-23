import React from 'react';
import WelcomeBanner from './WelcomeBanner';
import StatsGrid from './StatsGrid';
import QuickActions from './QuickActions';
import CalendarPreview from './CalendarPreview';

const OverviewTab = ({ user, stats }) => {
  return (
    <div className="space-y-8">
      <WelcomeBanner user={user} />
      <StatsGrid stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QuickActions />
        <div></div> {/* Empty space for layout balance */}
      </div>
      
      <CalendarPreview />
    </div>
  );
};

export default OverviewTab;
