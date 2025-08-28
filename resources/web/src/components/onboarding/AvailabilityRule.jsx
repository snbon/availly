import React from 'react';
import { Clock, X } from 'lucide-react';
import Select from '../ui/Select';
import Input from '../ui/Input';

const AvailabilityRule = ({ rule, days, onUpdate, onRemove }) => {
  return (
    <div className="flex items-center space-x-6 p-6 border-2 border-slate-200 rounded-2xl hover:border-blue-300 transition-all duration-200 bg-slate-50/50">
      <div className="flex-1">
        <Select
          value={rule.day}
          onChange={(e) => onUpdate(rule.id, 'day', e.target.value)}
          options={days}
          className="w-full"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <Clock className="w-6 h-6 text-slate-400" />
        <Input
          type="time"
          value={rule.startTime}
          onChange={(e) => onUpdate(rule.id, 'startTime', e.target.value)}
          className="font-medium"
        />
        <span className="text-slate-500 font-medium">to</span>
        <Input
          type="time"
          value={rule.endTime}
          onChange={(e) => onUpdate(rule.id, 'endTime', e.target.value)}
          className="font-medium"
        />
      </div>

      <button
        onClick={() => onRemove(rule.id)}
        className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
};

export default AvailabilityRule;
