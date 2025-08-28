import React from 'react';
import { Shield, Eye, Lock, Database } from 'lucide-react';
import Card from '../ui/Card';

const PrivacySettings = () => {
  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Privacy & Security</h2>
          <p className="text-slate-600">
            Manage your privacy preferences and security settings.
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
          <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Privacy Settings Coming Soon</h3>
          <p className="text-slate-600 mb-4">
            We're working on adding comprehensive privacy and security management features.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Visibility Controls</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Access Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Data Controls</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrivacySettings;
