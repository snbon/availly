import React from 'react';
import WelcomeBanner from './WelcomeBanner';
import StatsGrid from './StatsGrid';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import CalendarPreview from './CalendarPreview';

const OverviewTab = ({ user, stats, recentActivity }) => {
  return (
    <div className="space-y-8">
      <WelcomeBanner user={user} />
      <StatsGrid stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QuickActions />
        <RecentActivity activities={recentActivity} />
      </div>
      
      <CalendarPreview />
    </div>
  );
};

export default OverviewTab;
