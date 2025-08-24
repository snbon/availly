import React from 'react';
import { Button } from '../ui';
import TimezoneSelector from '../settings/TimezoneSelector';

const TimezoneStep = ({ 
  timezone, 
  onTimezoneChange, 
  onPrevious, 
  onNext,
  error 
}) => {
  const handleNext = () => {
    if (!timezone) {
      return;
    }
    onNext();
  };

  return (
    <div className="text-center space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900">
          Set Your Timezone
        </h1>
        
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          This ensures your availability is displayed correctly to visitors and synced properly with your calendar.
        </p>
      </div>

      {/* Timezone Selection */}
      <div className="max-w-md mx-auto">
        <TimezoneSelector
          value={timezone}
          onChange={onTimezoneChange}
          error={error}
          required={true}
        />
      </div>

      {/* Timezone Info */}
      {timezone && (
        <div className="max-w-md mx-auto p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700">
              Current time in {timezone}: {new Date().toLocaleString('en-US', { 
                timeZone: timezone,
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="px-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!timezone}
          className="px-8"
        >
          Continue
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default TimezoneStep;
