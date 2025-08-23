import React from 'react';
import { Calendar } from 'lucide-react';
import Card from '../ui/Card';

const QuickActions = () => {
  const handleUpdateAvailability = () => {
    // Navigate to availability tab or onboarding
    window.location.href = '/onboarding';
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
        <Calendar className="w-5 h-5 text-green-600 mr-2" />
        Quick Actions
      </h3>
      <div className="space-y-3">
        <button 
          onClick={handleUpdateAvailability}
          className="w-full flex items-center space-x-3 p-4 border border-slate-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <span className="font-medium text-slate-900">Update My Availability</span>
        </button>
      </div>
    </Card>
  );
};

export default QuickActions;
