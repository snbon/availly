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
    <div className="px-3 sm:px-0">
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 sm:mb-3 md:mb-4">Configure Your Schedule</h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 px-2">Set your weekly availability for meetings and appointments</p>
      </div>

      <div className="space-y-3 sm:space-y-4 md:space-y-6 mb-6 sm:mb-8 md:mb-12">
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
          className="w-full py-3 sm:py-4 md:py-6 border-2 border-dashed border-slate-300 rounded-lg sm:rounded-xl md:rounded-2xl text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 flex items-center justify-center space-x-2 sm:space-x-3 group hover:bg-blue-50"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
          <span className="text-sm sm:text-base md:text-lg font-medium">Add Another Time Slot</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <Button
          variant="ghost"
          onClick={onPrevious}
          icon={ArrowLeft}
          iconPosition="left"
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          icon={ArrowRight}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ScheduleStep;
