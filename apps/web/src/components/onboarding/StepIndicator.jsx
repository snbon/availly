import React from 'react';
import { CheckCircle } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="flex justify-center mb-16">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className={`flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300 ${
            currentStep >= step.number 
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg scale-110' 
              : 'bg-white border-slate-300 text-slate-400'
          }`}>
            {currentStep > step.number ? (
              <CheckCircle className="w-8 h-8" />
            ) : (
              <span className="text-xl font-bold">{step.number}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-20 h-1 mx-6 rounded-full transition-all duration-300 ${
              currentStep > step.number ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
