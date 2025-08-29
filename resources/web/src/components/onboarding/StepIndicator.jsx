import React from 'react';
import { CheckCircle } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="mb-8 sm:mb-12 md:mb-16">
      {/* Horizontal step indicator for all screen sizes */}
      <div className="flex justify-center items-center overflow-x-auto px-2 pb-2">
        <div className="flex items-center min-w-max">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                {/* Step circle */}
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.number 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg' 
                    : 'bg-white border-slate-300 text-slate-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  ) : (
                    <span className="text-xs sm:text-sm md:text-lg font-bold">{step.number}</span>
                  )}
                </div>
                
                {/* Step title - hidden on very small screens, shown on larger */}
                <div className="mt-2 text-center max-w-16 sm:max-w-20 md:max-w-24 hidden sm:block">
                  <h3 className={`text-xs font-semibold ${
                    currentStep >= step.number ? 'text-slate-900' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </h3>
                </div>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-12 md:w-16 h-0.5 sm:h-1 mx-2 sm:mx-3 md:mx-6 rounded-full transition-all duration-300 ${
                  currentStep > step.number ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
