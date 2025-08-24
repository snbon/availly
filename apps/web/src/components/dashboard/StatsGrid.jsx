import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Card from '../ui/Card';
import QuickActions from './QuickActions';
import { brandAnimations } from '../../theme/brand';

const StatCard = ({ stat }) => {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    if (stat.onClick) {
      // If there's a custom onClick handler, use it
      stat.onClick();
      if (stat.isClickable && stat.label === 'Copy Link') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else if (stat.isClickable) {
      // Fallback to old copy behavior
      try {
        await navigator.clipboard.writeText(`https://${stat.value}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  return (
    <Card 
      className={`${brandAnimations.scaleHover} ${(stat.isClickable || stat.onClick) ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={(stat.isClickable || stat.onClick) ? handleClick : undefined}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
          {stat.isClickable && copied ? (
            <Check className={`w-6 h-6 ${stat.iconColor}`} />
          ) : stat.isClickable ? (
            <Copy className={`w-6 h-6 ${stat.iconColor}`} />
          ) : (
            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
          )}
        </div>
        <div className={`text-sm font-medium px-2 py-1 rounded-full ${
          stat.changeType === 'positive' 
            ? 'bg-green-100 text-green-700' 
            : stat.changeType === 'warning'
            ? 'bg-orange-100 text-orange-700'
            : stat.changeType === 'neutral'
            ? 'bg-slate-100 text-slate-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {stat.isClickable && copied ? 'Copied!' : stat.change}
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold text-slate-900 mb-1 ${stat.isClickable ? 'truncate' : ''}`}>
          {stat.value}
        </p>
        <p className="text-slate-600 text-sm">{stat.label}</p>
      </div>
    </Card>
  );
};

const StatsGrid = ({ stats, showQuickActions = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
      {showQuickActions && <QuickActions />}
    </div>
  );
};

export default StatsGrid;
