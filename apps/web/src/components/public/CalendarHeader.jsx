import React from 'react';

const CalendarHeader = ({ userName, view, onViewChange }) => {
  const ViewToggleButton = ({ viewType, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 truncate">
              {userName}'s Availability
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Here are my available times. Please propose a slot that works for you.
            </p>
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <ViewToggleButton
              viewType="week"
              label="Week"
              isActive={view === 'week'}
              onClick={() => onViewChange('week')}
            />
            <ViewToggleButton
              viewType="month"
              label="Month"
              isActive={view === 'month'}
              onClick={() => onViewChange('month')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
