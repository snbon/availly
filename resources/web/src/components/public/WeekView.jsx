import React, { useState, useEffect } from 'react';
import Tooltip from './Tooltip';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeekView = ({ availability, currentWeekOffset, onWeekChange, onRefresh }) => {
  
  const availableWindows = availability?.availability?.windows || [];
  const userTimezone = availability?.user_timezone || 'Europe/Brussels';
  
  // State to trigger re-render of time indicator every minute
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
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
    const defaultStart = 8;  // 08:00 in user's timezone
    const defaultEnd = 20;   // 20:00 in user's timezone
    
    if (!availableWindows || availableWindows.length === 0) {
      return { start: defaultStart, end: defaultEnd };
    }
    
    // Find earliest and latest availability times in user's timezone
    let earliestHour = 24;
    let latestHour = 0;
    
    availableWindows.forEach(window => {
      // Convert UTC times to user's timezone using proper method
      const start = new Date(window.start);
      const end = new Date(window.end);
      
      // Get hours in user's timezone using toLocaleString with hour option
      const startHour = parseInt(start.toLocaleString("en-US", { 
        timeZone: userTimezone, 
        hour12: false, 
        hour: '2-digit' 
      }));
      const endHour = parseInt(end.toLocaleString("en-US", { 
        timeZone: userTimezone, 
        hour12: false, 
        hour: '2-digit' 
      }));
      

      
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
  
  // Generate hours based on dynamic viewport (include end hour)
  const hours = Array.from(
    { length: localViewport.end - localViewport.start + 1 }, 
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

  // Get current time in user's timezone for time indicator
  const getCurrentTimePosition = () => {
    const now = currentTime;
    
    // Get current hour and minutes in user's timezone
    const currentHour = parseInt(now.toLocaleString("en-US", { 
      timeZone: userTimezone, 
      hour12: false, 
      hour: '2-digit' 
    }));
    const currentMinute = parseInt(now.toLocaleString("en-US", { 
      timeZone: userTimezone, 
      minute: '2-digit' 
    }));
    
    // Check if current time is within viewport
    if (currentHour < localViewport.start || currentHour >= localViewport.end) {
      return null; // Don't show indicator if outside viewport
    }
    
    // Calculate position (60px per hour + minutes offset)
    const hourOffset = currentHour - localViewport.start;
    const minuteOffset = (currentMinute / 60) * 60; // Convert minutes to pixels
    const topPosition = hourOffset * 60 + minuteOffset;
    
    return {
      show: true,
      top: topPosition,
      time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    };
  };
  
  const currentTimeIndicator = getCurrentTimePosition();

  // Get week dates based on current offset
  const getWeekDates = (weekOffset = 0) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Convert Sunday (0) to Monday-based week (Sunday becomes 6)
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday
    
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset + (weekOffset * 7));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
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

  // Mobile-friendly day view component
  const MobileDayView = ({ date, dayName }) => {
    const today = isToday(date);
    const availabilityBlocks = getAvailabilityBlocks(date);
    
    return (
      <div 
        className={`p-3 border rounded-lg transition-all ${
          today 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Day header */}
        <div className="text-center mb-3">
          <div className={`text-sm font-medium ${
            today ? 'text-blue-700' : 'text-slate-600'
          }`}>
            {dayName}
          </div>
          <div className={`text-lg font-bold ${
            today ? 'text-blue-800' : 'text-slate-900'
          }`}>
            {date.getDate()}
          </div>
        </div>

        {/* Availability blocks */}
        {availabilityBlocks.length > 0 ? (
          <div className="space-y-2">
            {availabilityBlocks.map((block, index) => (
              <div key={index} className="bg-green-100 border border-green-200 rounded-md p-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-green-800">
                    {block.timeRange}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-xs text-slate-400">No availability</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Week Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {isCurrentWeek() ? "This Week's Schedule" : "Week Schedule"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Times shown in {getTimezoneDisplay(userTimezone)}
          </p>
        </div>
        <div className="flex items-center justify-center sm:justify-end space-x-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-slate-700 min-w-[140px] sm:min-w-[200px] text-center">
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

      {/* Mobile: Day cards grid */}
      <div className="block sm:hidden">
        <div className="grid grid-cols-2 gap-3">
          {DAYS.map((day, index) => {
            const date = weekDates[index];
            if (!date) return null;
            
            return (
              <MobileDayView 
                key={day} 
                date={date} 
                dayName={day} 
              />
            );
          })}
        </div>
      </div>

      {/* Desktop: Full calendar view */}
      <div className="hidden sm:block">
        {/* Calendar Header */}
        <div className="flex border-b border-slate-200 mb-4">
        {/* Time column header - matches body width */}
        <div className="w-20 p-3 text-sm font-medium text-slate-500 text-center">Time</div>
        
        {/* Day columns header */}
        <div className="flex-1 grid grid-cols-7">
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
                  
                  {/* Current time indicator - only show on today */}
                  {today && currentTimeIndicator && (
                    <div
                      className="absolute left-0 right-0 z-30 pointer-events-none"
                      style={{ top: `${currentTimeIndicator.top}px` }}
                    >
                      {/* Time indicator line */}
                      <div className="h-0.5 bg-red-500 shadow-sm"></div>
                      {/* Time label */}
                      <div className="absolute -left-1 -top-2 bg-red-500 text-white text-xs px-1 rounded text-center min-w-[40px]">
                        {currentTimeIndicator.time}
                      </div>
                      {/* Arrow pointing to the line */}
                      <div className="absolute left-10 -top-1 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-red-500"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm space-y-3 sm:space-y-0">
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
            onClick={() => onWeekChange(0)}
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
