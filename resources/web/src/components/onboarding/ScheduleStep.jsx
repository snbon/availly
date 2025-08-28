import React from 'react';
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import AvailabilityRule from './AvailabilityRule';

const ScheduleStep = ({ 
  availabilityRules, 
  days, 
  onAddRule, 
  onRemoveRule, 
  onUpdateRule, 
  onPrevious, 
  onNext 
}) => {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Configure Your Schedule</h2>
        <p className="text-xl text-slate-600">Set your weekly availability for meetings and appointments</p>
      </div>

      <div className="space-y-6 mb-12">
        {availabilityRules.map((rule) => (
          <AvailabilityRule
            key={rule.id}
            rule={rule}
            days={days}
            onUpdate={onUpdateRule}
            onRemove={onRemoveRule}
          />
        ))}

        <button
          onClick={onAddRule}
          className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 flex items-center justify-center space-x-3 group hover:bg-blue-50"
        >
          <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-lg font-medium">Add Another Time Slot</span>
        </button>
      </div>

      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={onPrevious}
          icon={ArrowLeft}
          iconPosition="left"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          icon={ArrowRight}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ScheduleStep;
