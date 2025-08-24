import React from 'react';
import Tooltip from './Tooltip';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const WeekView = ({ availability, currentWeekOffset, onWeekChange, onRefresh }) => {
  
  const viewport = availability?.viewport || { start_hour: 7, end_hour: 20 };
  const availableWindows = availability?.availability?.windows || [];
  const userTimezone = availability?.user_timezone || 'Europe/Brussels';
  
  // Helper function to get timezone display name
  const getTimezoneDisplay = (timezone) => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'short'
      });
      const parts = formatter.formatToParts(now);
      const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || '';
      
      // Get city name from timezone
      const cityName = timezone.split('/').pop()?.replace(/_/g, ' ') || '';
      
      return `${cityName} (${timeZoneName})`;
    } catch (error) {
      return timezone;
    }
  };

  
  // Calculate dynamic viewport based on availability and default range
  const calculateViewport = () => {
    const defaultStart = 8;  // 08:00
    const defaultEnd = 20;   // 20:00
    
    if (!availableWindows || availableWindows.length === 0) {
      return { start: defaultStart, end: defaultEnd };
    }
    
    // Find earliest and latest availability times
    let earliestHour = 24;
    let latestHour = 0;
    
    availableWindows.forEach(window => {
      const start = new Date(window.start);
      const end = new Date(window.end);
      const startHour = start.getHours();
      const endHour = end.getHours();
      
      earliestHour = Math.min(earliestHour, startHour);
      latestHour = Math.max(latestHour, endHour);
    });
    
    // Extend by ±2 hours from availability window
    const extendedStart = Math.max(0, earliestHour - 2);
    const extendedEnd = Math.min(24, latestHour + 2);
    
    // Ensure minimum viewport of default range
    const finalStart = Math.min(extendedStart, defaultStart);
    const finalEnd = Math.max(extendedEnd, defaultEnd);
    
    return { start: finalStart, end: finalEnd };
  };
  
  const localViewport = calculateViewport();
  
  // Generate hours based on dynamic viewport
  const hours = Array.from(
    { length: localViewport.end - localViewport.start }, 
    (_, i) => {
      const hour24 = localViewport.start + i;
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return {
        hour24,
        display: `${hour12}:00 ${ampm}`,
        isBusinessHour: hour24 >= 7 && hour24 <= 21 // 7 AM to 9 PM
      };
    }
  );

  // Get week dates based on current offset
  const getWeekDates = (weekOffset = 0) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const sundayOffset = dayOfWeek; // Days since Sunday
    
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - sundayOffset + (weekOffset * 7));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekOffset);

  // Helper function to check if a specific time slot is available
  const isTimeSlotAvailable = (dayIndex, hour) => {
    const slotDate = weekDates[dayIndex];
    if (!slotDate) return false;
    
    const slotStart = new Date(slotDate);
    slotStart.setHours(hour, 0, 0, 0);
    
    const slotEnd = new Date(slotDate);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    
    return availableWindows.some(window => {
      const windowStart = new Date(window.start);
      const windowEnd = new Date(window.end);
      
      return slotStart >= windowStart && slotEnd <= windowEnd;
    });
  };

  // Get availability blocks for a specific date
  const getAvailabilityBlocks = (date) => {
    // Convert date to start and end of day in UTC
    const startOfDay = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
    
    const filteredWindows = availableWindows.filter(window => {
      const windowStart = new Date(window.start);
      const windowEnd = new Date(window.end);
      
      // Check if window overlaps with this date
      const hasOverlap = windowStart < endOfDay && windowEnd > startOfDay;
      
      return hasOverlap;
    });
    
    return filteredWindows.map(window => {
      const start = new Date(window.start);
      const end = new Date(window.end);
      
      // Convert to decimal hours for positioning (like dashboard)
      const startDecimal = start.getHours() + (start.getMinutes() / 60);
      const endDecimal = end.getHours() + (end.getMinutes() / 60);
      
      const block = {
        start: startDecimal,
        end: endDecimal,
        title: 'Available',
        timeRange: `${start.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })} - ${end.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })}`
      };
      
      return block;
    });
  };

  // Convert hour to pixel position (each hour is 60px) - adjusted for dynamic viewport
  const getTimePosition = (hour) => {
    // Since viewport starts at localViewport.start, we need to adjust the position
    // If viewport starts at 5:00 AM and hour is 7:00 AM, position should be (7-5)*60 = 120px
    const adjustedHour = hour - localViewport.start;
    const position = adjustedHour * 60;
    return position;
  };

  const getBlockHeight = (startHour, endHour) => {
    return (endHour - startHour) * 60;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };



  const navigateWeek = (direction) => {
    onWeekChange(currentWeekOffset + direction);
  };

  const isCurrentWeek = () => {
    return currentWeekOffset === 0;
  };

  const formatWeekRange = () => {
    if (weekDates.length === 0) return '';
    const start = weekDates[0];
    const end = weekDates[6];
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    
    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {isCurrentWeek() ? "This Week's Schedule" : "Week Schedule"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Times shown in {getTimezoneDisplay(userTimezone)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-slate-700 min-w-[200px] text-center">
            {formatWeekRange()}
          </span>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Go to current week button */}
          {!isCurrentWeek() && (
            <button
              onClick={() => onWeekChange(0)}
              className="ml-4 px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              Go to current week
            </button>
          )}
        </div>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-8 border-b border-slate-200 mb-4">
        <div className="p-3 text-sm font-medium text-slate-500">Time</div>
        {DAYS.map((day, index) => {
          const date = weekDates[index];
          if (!date) return <div key={day}></div>;
          
          const today = isToday(date);
          
          return (
            <div key={day} className={`p-3 text-center ${today ? 'bg-blue-50' : ''}`}>
              <div className="text-sm font-medium text-slate-900">{day}</div>
              <div className={`text-xs mt-1 ${today ? 'text-blue-700 font-semibold' : 'text-slate-500'}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar Body */}
      <div className="border border-slate-200 rounded-lg relative overflow-hidden">
        <div className="flex">
          {/* Time Column */}
          <div className="w-20 bg-slate-50 border-r border-slate-200 sticky left-0 z-10">
            {hours.map((hour) => (
              <div
                key={hour.hour24}
                className={`
                  h-[60px] flex items-start justify-end pr-2 pt-1 text-xs font-medium border-b border-slate-200
                  ${hour.isBusinessHour ? 'text-slate-900' : 'text-slate-400'}
                `}
              >
                {hour.hour24 > 0 && hour.display}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          <div className="flex-1 grid grid-cols-7">
            {DAYS.map((day, dayIndex) => {
              const date = weekDates[dayIndex];
              if (!date) return <div key={day} className="border-r border-slate-200"></div>;
              
              const today = isToday(date);
              const availabilityBlocks = getAvailabilityBlocks(date);

              
              return (
                <div key={day} className="relative border-r border-slate-200" style={{ minHeight: `${hours.length * 60}px` }}>
                  {/* Hour grid lines */}
                  {hours.map((hour) => (
                    <div
                      key={hour.hour24}
                      className={`
                        h-[60px] border-b border-slate-200
                        ${hour.isBusinessHour ? 'bg-white' : 'bg-slate-50'}
                        ${today ? 'bg-blue-25' : ''}
                      `}
                    />
                  ))}
                  
                  {/* Availability blocks */}
                  {availabilityBlocks.map((block, blockIndex) => (
                    <div
                      key={blockIndex}
                      className="absolute left-1 right-1 bg-green-200 border border-green-300 rounded-md shadow-sm hover:bg-green-300 cursor-pointer transition-colors z-20 group"
                      style={{
                        top: `${getTimePosition(block.start)}px`,
                        height: `${getBlockHeight(block.start, block.end) - 2}px`
                      }}
                    >
                      <div className="p-2 text-xs font-medium text-green-800">
                        <div className="truncate">{block.title}</div>
                        <div className="text-green-600 mt-1">
                          {block.timeRange}
                        </div>
                      </div>
                      
                      {/* CSS-only tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
                        Hey, I'm free here 🙂
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-green-200 border border-green-300 rounded"></div>
            <span className="text-slate-600">Available time blocks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span className="text-slate-600">Today</span>
          </div>
        </div>
        {!isCurrentWeek() && (
          <button
            onClick={() => setCurrentWeekOffset(0)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go to current week
          </button>
        )}
      </div>
    </div>
  );
};

export default WeekView;
