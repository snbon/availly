import React from 'react';
import { Clock, X } from 'lucide-react';
import Select from '../ui/Select';
import Input from '../ui/Input';

const AvailabilityRule = ({ rule, days, onUpdate, onRemove }) => {
  return (
    <div className="p-4 sm:p-6 border border-slate-200 rounded-lg sm:rounded-2xl hover:border-blue-300 transition-all duration-200 bg-white">
      {/* Mobile: Side-by-side with full width utilization */}
      <div className="block sm:hidden space-y-4">
        {/* Day selection - full width */}
        <div>
          <Select
            value={rule.day}
            onChange={(e) => onUpdate(rule.id, 'day', e.target.value)}
            options={days}
            className="w-full"
          />
        </div>
        
        {/* Time inputs - spread out to use full card width */}
        <div className="flex items-center justify-between">
          <div className="w-[45%]">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600 font-medium">Start Time</span>
            </div>
            <Input
              type="time"
              value={rule.startTime}
              onChange={(e) => onUpdate(rule.id, 'startTime', e.target.value)}
              className="w-full text-sm"
            />
          </div>
          
          <div className="flex items-center justify-center w-[10%]">
            <span className="text-sm text-slate-500 font-medium">to</span>
          </div>
          
          <div className="w-[45%]">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600 font-medium">End Time</span>
            </div>
            <Input
              type="time"
              value={rule.endTime}
              onChange={(e) => onUpdate(rule.id, 'endTime', e.target.value)}
              className="w-full text-sm"
            />
          </div>
        </div>
        
        {/* Remove button - full width */}
        <div>
          <button
            onClick={() => onRemove(rule.id)}
            className="w-full px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm font-medium border border-red-200"
          >
            Remove Time Slot
          </button>
        </div>
      </div>

      {/* Desktop: Horizontal layout */}
      <div className="hidden sm:flex items-center space-x-6">
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
    </div>
  );
};

export default AvailabilityRule;
