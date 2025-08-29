import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const WelcomeStep = ({ onNext }) => {
  return (
    <div className="text-center max-w-2xl mx-auto px-4">
      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
        <Calendar className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-blue-600" />
      </div>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-4 sm:mb-6">Set Your Availability</h2>
      <p className="text-sm sm:text-base md:text-xl text-slate-600 mb-6 sm:mb-8 md:mb-10 leading-relaxed">
        Configure when you're available for meetings and appointments. You can always adjust these settings later from your dashboard.
      </p>
      <Button
        size="lg"
        onClick={onNext}
        icon={ArrowRight}
        className="mx-auto w-full sm:w-auto"
      >
        Get Started
      </Button>
    </div>
  );
};

export default WelcomeStep;
