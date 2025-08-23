import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import { api } from '../../services/api';

const CalendarPreview = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [availabilityRules, setAvailabilityRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAvailability, setHasAvailability] = useState(false);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  // Days starting with Monday
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Generate hours from 12 AM to 11 PM (24 hours)
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour24 = i;
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return {
      hour24,
      display: `${hour12}:00 ${ampm}`,
      isBusinessHour: hour24 >= 7 && hour24 <= 21 // 7 AM to 9 PM
    };
  });

  useEffect(() => {
    generateWeekDates();
    fetchAvailabilityRules();
  }, [currentDate]);

  useEffect(() => {
    // Scroll to current hour positioned at 25% of the view
    if (scrollContainerRef.current && weekDates.length > 0) {
      const now = new Date();
      const currentHour = now.getHours();
      const hourHeight = 60; // Height of each hour slot
      const containerHeight = scrollContainerRef.current.clientHeight;
      
      // Position current hour at 25% of the container height
      const targetPosition = (currentHour * hourHeight) - (containerHeight * 0.25);
      
      // Ensure we don't scroll beyond the bounds
      const maxScroll = (24 * hourHeight) - containerHeight;
      const scrollPosition = Math.max(0, Math.min(targetPosition, maxScroll));
      
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [weekDates]);

  const fetchAvailabilityRules = async () => {
    try {
      setLoading(true);
      const response = await api.getAvailabilityRules();
      setAvailabilityRules(response.rules || []);
      setHasAvailability((response.rules || []).length > 0);
    } catch (error) {
      console.error('Failed to fetch availability rules:', error);
      setAvailabilityRules([]);
      setHasAvailability(false);
    } finally {
      setLoading(false);
    }
  };

  const generateWeekDates = () => {
    const today = new Date(currentDate);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as day 0
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    
    setWeekDates(dates);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentWeek = () => {
    const today = new Date();
    const startOfWeek = weekDates[0];
    const endOfWeek = weekDates[6];
    return startOfWeek && endOfWeek && today >= startOfWeek && today <= endOfWeek;
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

  // Get availability blocks for a specific date
  const getAvailabilityBlocks = (date) => {
    const dayOfWeek = date.getDay();
    
    // Filter rules for this specific weekday
    const dayRules = availabilityRules.filter(rule => {
      // Convert API weekday (0=Monday, 6=Sunday) to JS weekday (0=Sunday, 6=Saturday)
      const apiWeekday = rule.weekday;
      const jsWeekday = apiWeekday === 6 ? 0 : apiWeekday + 1;
      return jsWeekday === dayOfWeek;
    });

    // Convert time rules to availability blocks
    return dayRules.map(rule => {
      const [startHour, startMinute] = rule.start_time_local.split(':').map(Number);
      const [endHour, endMinute] = rule.end_time_local.split(':').map(Number);
      
      const startDecimal = startHour + (startMinute / 60);
      const endDecimal = endHour + (endMinute / 60);
      
      // Format time for display (remove seconds)
      const formatTime = (timeStr) => {
        const [hour, minute] = timeStr.split(':');
        return `${hour}:${minute}`;
      };
      
      return {
        start: startDecimal,
        end: endDecimal,
        title: 'Available',
        timeRange: `${formatTime(rule.start_time_local)} - ${formatTime(rule.end_time_local)}`
      };
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  };

  const isCurrentHour = (date, hour) => {
    const now = new Date();
    return isToday(date) && hour === now.getHours();
  };

  // Convert hour to pixel position (each hour is 60px)
  const getTimePosition = (hour) => {
    return hour * 60;
  };

  const getBlockHeight = (startHour, endHour) => {
    return (endHour - startHour) * 60;
  };

  const handleSetAvailability = () => {
    navigate('/onboarding');
  };

  // Empty state component
  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No availability set</h3>
        <p className="text-slate-600 mb-6">
          Set your availability times so people can book appointments with you.
        </p>
        <button
          onClick={handleSetAvailability}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Settings className="w-4 h-4 mr-2" />
          Set Your Availability
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your schedule...</p>
        </div>
      </Card>
    );
  }

  if (!hasAvailability) {
    return (
      <Card className="h-[600px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            Weekly Schedule
          </h3>
        </div>
        <EmptyState />
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <Calendar className="w-5 h-5 text-purple-600 mr-2" />
          {isCurrentWeek() ? "This Week's Schedule" : "Week Schedule"}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-sm font-medium text-slate-700 min-w-[200px] text-center">
            {formatWeekRange()}
          </span>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-8 border-b border-slate-200 mb-4">
        <div className="p-3 text-sm font-medium text-slate-500">Time</div>
        {days.map((day, index) => {
          const date = weekDates[index];
          if (!date) return <div key={day}></div>;
          
          const today = isToday(date);
          
          return (
            <div key={day} className={`p-3 text-center ${today ? 'bg-purple-50' : ''}`}>
              <div className="text-sm font-medium text-slate-900">{day}</div>
              <div className={`text-xs mt-1 ${today ? 'text-purple-700 font-semibold' : 'text-slate-500'}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable Calendar Body */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto border border-slate-200 rounded-lg relative"
      >
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
            {days.map((day, dayIndex) => {
              const date = weekDates[dayIndex];
              if (!date) return <div key={day} className="border-r border-slate-200"></div>;
              
              const today = isToday(date);
              const availabilityBlocks = getAvailabilityBlocks(date);
              const currentTime = getCurrentTime();
              
              return (
                <div key={day} className="relative border-r border-slate-200">
                  {/* Hour grid lines */}
                  {hours.map((hour) => (
                    <div
                      key={hour.hour24}
                      className={`
                        h-[60px] border-b border-slate-200
                        ${hour.isBusinessHour ? 'bg-white' : 'bg-slate-50'}
                        ${today ? 'bg-purple-25' : ''}
                      `}
                    />
                  ))}
                  
                  {/* Availability blocks */}
                  {availabilityBlocks.map((block, blockIndex) => (
                    <div
                      key={blockIndex}
                      className="absolute left-1 right-1 bg-green-200 border border-green-300 rounded-md shadow-sm hover:bg-green-300 cursor-pointer transition-colors z-20"
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
                    </div>
                  ))}
                  
                  {/* Current time indicator */}
                  {today && currentTime >= 0 && currentTime <= 24 && (
                    <>
                      {/* Time line */}
                      <div
                        className="absolute left-0 right-0 h-0.5 bg-red-500 z-30"
                        style={{ top: `${getTimePosition(currentTime)}px` }}
                      />
                      {/* Time dot */}
                      <div
                        className="absolute -left-1 w-2 h-2 bg-red-500 rounded-full z-30"
                        style={{ top: `${getTimePosition(currentTime) - 4}px` }}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-green-200 border border-green-300 rounded"></div>
            <span className="text-slate-600">Available time blocks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-100 rounded"></div>
            <span className="text-slate-600">Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-red-500 rounded"></div>
            <span className="text-slate-600">Current time</span>
          </div>
        </div>
        {!isCurrentWeek() && (
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Go to current week
          </button>
        )}
      </div>
    </Card>
  );
};

export default CalendarPreview;
