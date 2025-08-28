import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const WelcomeStep = ({ onNext }) => {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <Calendar className="w-16 h-16 text-blue-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Set Your Availability</h2>
      <p className="text-xl text-slate-600 mb-10 leading-relaxed">
        Configure when you're available for meetings and appointments. You can always adjust these settings later from your dashboard.
      </p>
      <Button
        size="lg"
        onClick={onNext}
        icon={ArrowRight}
        className="mx-auto"
      >
        Get Started
      </Button>
    </div>
  );
};

export default WelcomeStep;
