import React from 'react';
import { Plus, Calendar, Users } from 'lucide-react';
import Card from '../ui/Card';

const QuickActionButton = ({ icon: Icon, label, bgColor, hoverBg, iconColor }) => {
  return (
    <button className="w-full flex items-center space-x-3 p-4 border border-slate-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
      <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center ${hoverBg} transition-colors`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <span className="font-medium text-slate-900">{label}</span>
    </button>
  );
};

const QuickActions = () => {
  const actions = [
    {
      icon: Plus,
      label: 'Create New Link',
      bgColor: 'bg-purple-100',
      hoverBg: 'group-hover:bg-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      icon: Calendar,
      label: 'Update Availability',
      bgColor: 'bg-green-100',
      hoverBg: 'group-hover:bg-green-200',
      iconColor: 'text-green-600'
    },
    {
      icon: Users,
      label: 'View Analytics',
      bgColor: 'bg-indigo-100',
      hoverBg: 'group-hover:bg-indigo-200',
      iconColor: 'text-indigo-600'
    }
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
        <Plus className="w-5 h-5 text-purple-600 mr-2" />
        Quick Actions
      </h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <QuickActionButton key={action.label} {...action} />
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;
