import React from 'react';
import { User, Mail, MapPin, Globe } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ProfileSettings = () => {
  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Settings</h2>
          <p className="text-slate-600">
            Update your personal information and account preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  icon={User}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  icon={Mail}
                />
              </div>
            </div>
          </div>

          {/* Location & Timezone */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Location & Timezone</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <Input
                  type="text"
                  placeholder="City, Country"
                  icon={MapPin}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Timezone
                </label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>UTC (GMT+0:00)</option>
                  <option>Eastern Time (GMT-5:00)</option>
                  <option>Central Time (GMT-6:00)</option>
                  <option>Mountain Time (GMT-7:00)</option>
                  <option>Pacific Time (GMT-8:00)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </div>
      </Card>

      {/* Coming Soon Notice */}
      <Card padding="lg">
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
          <Globe className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Profile Settings Coming Soon</h3>
          <p className="text-slate-600">
            We're working on adding comprehensive profile management features.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSettings;
