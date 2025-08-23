import React from 'react';
import { Calendar, Link as LinkIcon, BarChart3, Filter } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import EmptyState from './EmptyState';

const TabHeader = ({ title, description, buttonText, onButtonClick }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
        <p className="text-slate-600 mt-2">{description}</p>
      </div>
      {buttonText && onButtonClick && (
        <Button onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </div>
  );
};

const AvailabilityTab = () => {
  return (
    <Card padding="lg">
      <TabHeader
        title="Availability Settings"
        description="Configure your weekly availability schedule"
        buttonText="+ Add Time Slot"
        onButtonClick={() => {}}
      />
      <EmptyState
        icon={Calendar}
        title="No availability rules set"
        description="Start by adding your available time slots for the week"
        buttonText="Set Availability"
        onButtonClick={() => {}}
      />
    </Card>
  );
};

const LinksTab = () => {
  return (
    <Card padding="lg">
      <TabHeader
        title="Your Links"
        description="Manage your public availability links"
        buttonText="+ Create Link"
        onButtonClick={() => {}}
      />
      <EmptyState
        icon={LinkIcon}
        title="No links created yet"
        description="Create your first public availability link to start sharing"
        buttonText="Create First Link"
        onButtonClick={() => {}}
      />
    </Card>
  );
};

const AnalyticsTab = () => {
  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Analytics</h3>
          <p className="text-slate-600 mt-2">View insights about your calendar usage</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" icon={Filter}>
            Filter
          </Button>
          <select className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        </div>
      </div>
      <EmptyState
        icon={BarChart3}
        title="No analytics data yet"
        description="Start sharing your calendar to see analytics and insights"
      />
    </Card>
  );
};

const TabContent = ({ activeTab }) => {
  switch (activeTab) {
    case 'availability':
      return <AvailabilityTab />;
    case 'links':
      return <LinksTab />;
    case 'analytics':
      return <AnalyticsTab />;
    default:
      return null;
  }
};

export default TabContent;
