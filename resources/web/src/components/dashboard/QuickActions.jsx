import React from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import { brandAnimations } from '../../theme/brand';

const QuickActions = () => {
  const navigate = useNavigate();

  const handleMyCalendars = () => {
            navigate('/app/settings#calendars');
  };

  return (
    <Card 
      className={`${brandAnimations.scaleHover} cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={handleMyCalendars}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 flex-shrink-0 bg-indigo-50 rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="text-sm font-medium px-3 py-1 rounded-full ml-3 max-w-[120px] break-words bg-indigo-100 text-indigo-700">
          Manage
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 mb-1">
          My Calendars
        </p>
        <p className="text-slate-600 text-sm">Calendar Settings</p>
      </div>
    </Card>
  );
};

export default QuickActions;
