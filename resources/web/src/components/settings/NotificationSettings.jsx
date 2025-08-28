import React from 'react';
import { Bell, Mail, Smartphone, Volume2 } from 'lucide-react';
import Card from '../ui/Card';

const NotificationSettings = () => {
  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Notification Settings</h2>
          <p className="text-slate-600">
            Configure how you want to be notified about calendar events and updates.
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
          <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Notification Settings Coming Soon</h3>
          <p className="text-slate-600 mb-4">
            We're working on adding comprehensive notification management features.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email Notifications</span>
            </div>
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>Push Notifications</span>
            </div>
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <span>Sound Alerts</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationSettings;
