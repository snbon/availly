import React from 'react';
import { Bell } from 'lucide-react';
import Card from '../ui/Card';

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking': return '🎯';
      case 'share': return '📤';
      case 'update': return '⚙️';
      case 'connect': return '🔗';
      default: return '📝';
    }
  };

  return (
    <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{activity.action}</p>
        <p className="text-xs text-slate-500">{activity.user} • {activity.time}</p>
      </div>
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
        <span className="text-xs font-medium text-slate-600">{activity.avatar}</span>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
        <Bell className="w-5 h-5 text-purple-600 mr-2" />
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
      <button className="w-full mt-4 py-2 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors">
        View all activity →
      </button>
    </Card>
  );
};

export default RecentActivity;
