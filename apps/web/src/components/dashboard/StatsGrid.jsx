import React from 'react';
import Card from '../ui/Card';
import { brandAnimations } from '../../theme/brand';

const StatCard = ({ stat }) => {
  return (
    <Card className={brandAnimations.scaleHover}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
          <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
        </div>
        <div className={`text-sm font-medium px-2 py-1 rounded-full ${
          stat.changeType === 'positive' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {stat.change}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
        <p className="text-slate-600 text-sm">{stat.label}</p>
      </div>
    </Card>
  );
};

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
};

export default StatsGrid;
