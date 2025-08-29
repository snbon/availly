import React from 'react';
import { Calendar } from 'lucide-react';

const OnboardingHeader = () => {
  return (
    <div className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-xl">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">Welcome to Availly</h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto px-2">
            Let's get you set up in just a few steps.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingHeader;
