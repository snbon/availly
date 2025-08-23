import React from 'react';
import { Calendar } from 'lucide-react';

const OnboardingHeader = () => {
  return (
    <div className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-xl">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Welcome to MyFreeSlots</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Let's get you set up in just a few steps to start managing your availability like a pro
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingHeader;
