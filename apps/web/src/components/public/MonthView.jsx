import React from 'react';
import Tooltip from './Tooltip';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthView = ({ availability, currentMonthOffset, onMonthChange, onRefresh }) => {
  const availableWindows = availability?.availability?.windows || [];
  
  // Calculate current month/year based on offset
  const today = new Date();
  const currentMonth = (today.getMonth() + currentMonthOffset + 12) % 12;
  const currentYear = today.getFullYear() + Math.floor((today.getMonth() + currentMonthOffset) / 12);
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Helper function to check if a date has any availability
  const hasAvailabilityOnDate = (date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return availableWindows.some(window => {
      const windowStart = new Date(window.start);
      const windowEnd = new Date(window.end);
      
      return (windowStart >= dayStart && windowStart <= dayEnd) ||
             (windowEnd >= dayStart && windowEnd <= dayEnd) ||
             (windowStart <= dayStart && windowEnd >= dayEnd);
    });
  };

  const navigateMonth = (direction) => {
    onMonthChange(currentMonthOffset + direction);
  };

  const isCurrentMonth = () => {
    return currentMonthOffset === 0;
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    calendarDays.push({
      day,
      date,
      hasAvailability: hasAvailabilityOnDate(date),
      isToday: date.toDateString() === new Date().toDateString()
    });
  }

  const DayCell = ({ dayInfo }) => {
    if (!dayInfo) {
      return <div className="h-16 border-r border-b border-slate-200 bg-slate-50"></div>;
    }

    const { day, hasAvailability, isToday } = dayInfo;
    
    const baseClasses = "h-16 p-2 border-r border-b border-slate-200 transition-all duration-200 relative";
    const todayClasses = isToday ? "bg-blue-50 ring-1 ring-blue-200" : "";
    const availabilityClasses = hasAvailability 
      ? "bg-green-50 hover:bg-green-100 cursor-default" 
      : "bg-white hover:bg-slate-50";

    const cellContent = (
      <div className={`${baseClasses} ${todayClasses} ${availabilityClasses}`}>
        <div className="flex items-start justify-between h-full">
          <span className={`text-sm font-medium ${isToday ? 'text-blue-700' : 'text-slate-900'}`}>
            {day}
          </span>
          {hasAvailability && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </div>
      </div>
    );

    if (hasAvailability) {
      return (
        <Tooltip content="Hey, I'm free here 🙂" position="top">
          {cellContent}
        </Tooltip>
      );
    }

    return cellContent;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          {isCurrentMonth() ? "This Month" : "Month View"}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-medium text-slate-700 min-w-[200px] text-center">
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="h-8 flex items-center justify-center">
            <span className="text-sm font-medium text-slate-500">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7">
          {calendarDays.map((dayInfo, index) => (
            <DayCell key={index} dayInfo={dayInfo} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-slate-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
            <span className="text-slate-600">Unavailable</span>
          </div>
        </div>
                  {!isCurrentMonth() && (
            <button
              onClick={() => onMonthChange(0)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to current month
            </button>
          )}
      </div>
    </div>
  );
};

export default MonthView;
