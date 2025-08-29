import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Settings, Clock, MapPin, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useAvailabilityStore } from '../../stores/availabilityStore';
import { useCalendarStore } from '../../stores/calendarStore';

const CalendarPreview = () => {
  const { user } = useAuth();
  const { availabilityRules, isInitialized: availabilityInitialized } = useAvailabilityStore();
  const { 
    events: calendarEvents, 
    isLoading: calendarLoading, 
    fetchEvents: fetchCalendarEvents,
    initialize: initializeCalendar 
  } = useCalendarStore();
  
  // Debug logging
  useEffect(() => {
    console.log('CalendarPreview: Availability store state:', {
      availabilityInitialized,
      availabilityRulesCount: availabilityRules?.length || 0,
      hasAvailability: availabilityRules && availabilityRules.length > 0
    });
    
    // Add calendar events debugging
    console.log('CalendarPreview: Calendar store state:', {
      calendarEventsCount: calendarEvents?.length || 0,
      calendarLoading,
      calendarEvents: calendarEvents
    });
  }, [availabilityInitialized, availabilityRules, calendarEvents, calendarLoading]);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [userTimezone, setUserTimezone] = useState('Europe/Brussels');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [loading, setLoading] = useState(false);
  const hasAvailability = availabilityRules && availabilityRules.length > 0;
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  // Days starting with Monday
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Get calendar events for a specific date
  const getCalendarEvents = (date) => {
    if (!calendarEvents || !date) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    
    const filteredEvents = calendarEvents.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // Convert event dates to the same timezone as the target date
      const eventStartLocal = new Date(eventStart.getTime() - (eventStart.getTimezoneOffset() * 60000));
      const eventEndLocal = new Date(eventEnd.getTime() - (eventEnd.getTimezoneOffset() * 60000));
      
      const eventDateStr = eventStartLocal.toISOString().split('T')[0];
      
      // Check if event starts on the target date OR if it spans across the target date
      return eventDateStr === dateStr || 
             (eventStartLocal <= date && eventEndLocal > date);
    });
    
    return filteredEvents.map(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // Convert to decimal hours for positioning
      const startDecimal = eventStart.getHours() + (eventStart.getMinutes() / 60);
      const endDecimal = eventEnd.getHours() + (eventEnd.getMinutes() / 60);
      
      return {
        id: event.id,
        title: event.title,
        start: startDecimal,
        end: endDecimal,
        allDay: event.all_day,
        provider: event.provider,
        timeRange: event.all_day ? 'All day' : `${eventStart.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        })} - ${eventEnd.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        })}`
      };
    });
  };

  // Calculate dynamic viewport based on availability rules and calendar events
  const calculateViewport = () => {
    const defaultStart = 8;  // 08:00 in user's timezone
    const defaultEnd = 20;   // 20:00 in user's timezone
    
    // Only calculate viewport when not loading
    if (loading) {
      return { start: defaultStart, end: defaultEnd };
    }
    
    // Find earliest and latest times from both availability rules and calendar events
    let earliestHour = 24;
    let latestHour = 0;
    let hasContent = false;
    
    // Check availability rules
    if (availabilityRules && availabilityRules.length > 0) {
      availabilityRules.forEach(rule => {
        const [startHour] = rule.start_time_local.split(':').map(Number);
        const [endHour] = rule.end_time_local.split(':').map(Number);
        
        earliestHour = Math.min(earliestHour, startHour);
        latestHour = Math.max(latestHour, endHour);
        hasContent = true;
      });
    }
    
    // Check calendar events from all days in the current week
    if (weekDates && weekDates.length > 0) {
      weekDates.forEach(date => {
        const dayEvents = getCalendarEvents(date);
        dayEvents.forEach(event => {
          if (!event.allDay) {
            earliestHour = Math.min(earliestHour, event.start);
            latestHour = Math.max(latestHour, event.end);
            hasContent = true;
          }
        });
      });
    }
    
    // If no content, use default range
    if (!hasContent) {
      return { start: defaultStart, end: defaultEnd };
    }
    
    // Extend by ±2 hours from content window
    const extendedStart = Math.max(0, Math.floor(earliestHour) - 2);
    const extendedEnd = Math.min(24, Math.ceil(latestHour) + 2);
    
    // Ensure minimum viewport of default range
    const finalStart = Math.min(extendedStart, defaultStart);
    const finalEnd = Math.max(extendedEnd, defaultEnd);
    
    return { start: finalStart, end: finalEnd };
  };

  const viewport = calculateViewport();

  // Generate hours based on dynamic viewport (include end hour)
  const hours = Array.from(
    { length: viewport.end - viewport.start + 1 }, 
    (_, i) => {
      const hour24 = viewport.start + i;
      return {
        hour24,
        display: `${hour24.toString().padStart(2, '0')}:00`,
        isBusinessHour: hour24 >= 7 && hour24 <= 21 // 7 AM to 9 PM
      };
    }
  );

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      generateWeekDates();
      
      // Set timezone immediately if available
      if (user?.timezone) {
        setUserTimezone(user.timezone);
      } else {
        await fetchUserData();
      }
      
      setLoading(false);
    };
    
    // Initialize immediately when user is available
    if (user) {
      initializeData();
    }
  }, [currentDate, user]);

  // Simplified calendar initialization - always initialize when user is available
  useEffect(() => {
    if (user) {
      // Get current week range or fallback to today ±3 days
      let startDate, endDate;
      
      if (weekDates.length > 0) {
        const weekRange = getCurrentWeekRange();
        startDate = weekRange.startDate;
        endDate = weekRange.endDate;
      } else {
        // Fallback: use today ±3 days
        const today = new Date();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 3);
        endDate = new Date(today);
        endDate.setDate(today.getDate() + 3);
      }
      
      if (startDate && endDate) {
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        initializeCalendar(startDateStr, endDateStr);
      }
    }
  }, [user, weekDates, initializeCalendar]);

  // Add visibility change listener to refresh data when user returns to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Dashboard Calendar: Page became visible, refreshing user data...');
        fetchUserData();
      }
    };

    const handleCalendarSync = () => {
      console.log('Dashboard Calendar: Calendar sync completed, refreshing events...');
      // Force refresh calendar events after sync
      if (weekDates.length > 0) {
        const { startDate, endDate } = getCurrentWeekRange();
        if (startDate && endDate) {
          const startDateStr = startDate.toISOString().split('T')[0];
          const endDateStr = endDate.toISOString().split('T')[0];
          initializeCalendar(startDateStr, endDateStr);
        }
      }
    };

    // Auto-refresh calendar every 2 minutes to stay in sync
    const autoRefreshInterval = setInterval(() => {
      if (weekDates.length > 0 && user) {
        const { startDate, endDate } = getCurrentWeekRange();
        if (startDate && endDate) {
          const startDateStr = startDate.toISOString().split('T')[0];
          const endDateStr = endDate.toISOString().split('T')[0];
          console.log('Dashboard Calendar: Auto-refreshing calendar...');
          initializeCalendar(startDateStr, endDateStr);
        }
      }
    }, 2 * 60 * 1000); // 2 minutes

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('calendar-sync-completed', handleCalendarSync);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('calendar-sync-completed', handleCalendarSync);
      clearInterval(autoRefreshInterval);
    };
  }, [weekDates, user, initializeCalendar]);

  useEffect(() => {
    // Auto-scroll to current time (only if today is in the current week view)
    if (scrollContainerRef.current && weekDates.length > 0) {
      const now = new Date();
      const today = weekDates.find(date => isToday(date));
      
      if (today) {
        // Get precise current time including minutes
        const currentTime = getCurrentTime(); // Returns decimal hours (e.g., 13.5 for 1:30 PM)
        const containerHeight = scrollContainerRef.current.clientHeight;
        
        // Position current time at 25% of the container height for better context
        const targetPosition = getTimePosition(currentTime) - (containerHeight * 0.25);
        
        // Ensure we don't scroll beyond the bounds
        const totalCalendarHeight = hours.length * 60; // Dynamic hours * 60px per hour
        const maxScroll = Math.max(0, totalCalendarHeight - containerHeight);
        const finalPosition = Math.max(0, Math.min(targetPosition, maxScroll));
        
        scrollContainerRef.current.scrollTop = finalPosition;
      }
    }
  }, [weekDates, hours]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user/profile');
      if (response.data.timezone) {
        setUserTimezone(response.data.timezone);
      }
    } catch (error) {
      console.error('Failed to fetch user timezone:', error);
    }
  };

  const generateWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Monday start
    
    startOfWeek.setDate(diff);
    
    const weekDatesArray = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDatesArray.push(date);
    }
    
    setWeekDates(weekDatesArray);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const getCurrentWeekRange = () => {
    if (weekDates.length === 0) return { startDate: null, endDate: null };
    
    const startDate = new Date(weekDates[0]);
    const endDate = new Date(weekDates[6]);
    
    return { startDate, endDate };
  };

  const isCurrentWeek = () => {
    const now = new Date();
    const { startDate, endDate } = getCurrentWeekRange();
    
    if (!startDate || !endDate) return false;
    
    return now >= startDate && now <= endDate;
  };

  const formatWeekRange = () => {
    if (weekDates.length === 0) return '';
    
    const startDate = weekDates[0];
    const endDate = weekDates[6];
    
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
    } else {
      return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${startDate.getFullYear()}`;
    }
  };

  const getTimezoneDisplay = (timezone) => {
    if (!timezone) return 'your timezone';
    
    const city = timezone.split('/').pop()?.replace('_', ' ');
    const offset = new Date().toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'short' }).split(' ').pop();
    
    return `${city} (${offset})`;
  };

  // Get availability blocks for a specific date
  const getAvailabilityBlocks = (date) => {
    const jsWeekday = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    
    // Filter rules for this specific weekday
    const dayRules = availabilityRules.filter(rule => {
      // API weekday: 0=Monday, 1=Tuesday, ..., 6=Sunday
      // Convert JS weekday (0=Sunday, 1=Monday, ..., 6=Saturday) to API weekday (0=Monday, ..., 6=Sunday)
      const apiWeekday = jsWeekday === 0 ? 6 : jsWeekday - 1;
      return rule.weekday === apiWeekday;
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
    return isToday(date) && now.getHours() === hour;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getTimePosition = (time) => {
    const hour = Math.floor(time);
    const minute = (time - hour) * 60;
    return (hour - viewport.start) * 60 + minute;
  };

  const getBlockHeight = (start, end) => {
    return getTimePosition(end) - getTimePosition(start);
  };

  const handleSetAvailability = () => {
    navigate('/app/availability');
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Mobile-friendly day view component
  const MobileDayView = ({ date, dayName }) => {
    const today = isToday(date);
    const availabilityBlocks = getAvailabilityBlocks(date);
    const dayEvents = getCalendarEvents(date);
    
    return (
      <div 
        className={`p-3 border rounded-lg cursor-pointer transition-all ${
          today 
            ? 'bg-purple-50 border-purple-200' 
            : 'bg-white border-slate-200 hover:border-purple-300'
        }`}
        onClick={() => handleDateSelect(date)}
      >
        {/* Day header */}
        <div className="text-center mb-3">
          <div className={`text-sm font-medium ${
            today ? 'text-purple-700' : 'text-slate-600'
          }`}>
            {dayName}
          </div>
          <div className={`text-lg font-bold ${
            today ? 'text-purple-800' : 'text-slate-900'
          }`}>
            {date.getDate()}
          </div>
        </div>

        {/* Availability blocks */}
        {availabilityBlocks.length > 0 && (
          <div className="space-y-2 mb-3">
            {availabilityBlocks.map((block, index) => (
              <div key={index} className="bg-green-100 border border-green-200 rounded-md p-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium text-green-800">
                    {block.timeRange}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendar events */}
        {dayEvents.length > 0 && (
          <div className="space-y-2">
            {dayEvents.map((event, index) => (
              <div key={index} className={`border rounded-md p-2 ${
                event.allDay 
                  ? 'bg-blue-100 border-blue-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="text-xs font-medium text-blue-800 truncate">
                  {event.title}
                </div>
                {!event.allDay && (
                  <div className="text-xs text-blue-600 mt-1">
                    {event.timeRange}
                  </div>
                )}
                <div className="text-xs text-blue-500 mt-1 capitalize">
                  {event.provider}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {availabilityBlocks.length === 0 && dayEvents.length === 0 && (
          <div className="text-center py-4">
            <div className="text-xs text-slate-400">No events</div>
          </div>
        )}
      </div>
    );
  };

  if (loading || calendarLoading) {
    return (
      <Card className="h-[400px] sm:h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your schedule...</p>
        </div>
      </Card>
    );
  }

  if (!hasAvailability) {
    return (
      <Card className="h-[400px] sm:h-[600px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            Weekly Schedule
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">No availability set</h4>
            <p className="text-slate-600 mb-4">Set your weekly availability to start managing your schedule</p>
            <button
              onClick={handleSetAvailability}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Set Your Availability
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            {isCurrentWeek() ? "This Week's Schedule" : "Week Schedule"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Times shown in {getTimezoneDisplay(userTimezone)}
          </p>
        </div>
        
        {/* Week navigation and refresh */}
        <div className="flex items-center justify-center sm:justify-end space-x-2">
          <button
            onClick={() => {
              if (weekDates.length > 0) {
                const { startDate, endDate } = getCurrentWeekRange();
                if (startDate && endDate) {
                  const startDateStr = startDate.toISOString().split('T')[0];
                  const endDateStr = endDate.toISOString().split('T')[0];
                  console.log('Manual refresh requested for:', { startDateStr, endDateStr });
                  // Force refresh by using force parameter
                  initializeCalendar(startDateStr, endDateStr, true);
                }
              }
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh calendar events"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-sm font-medium text-slate-700 min-w-[140px] sm:min-w-[200px] text-center">
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

      {/* Mobile: Day cards grid */}
      <div className="block sm:hidden">
        <div className="grid grid-cols-2 gap-3">
          {days.map((day, index) => {
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
      <div className="hidden sm:block flex-1">
        {/* Calendar Header */}
        <div className="flex border-b border-slate-200 mb-4">
          {/* Time column header - matches body width */}
          <div className="w-20 p-3 text-sm font-medium text-slate-500 text-center">Time</div>
          
          {/* Day columns header */}
          <div className="flex-1 grid grid-cols-7">
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
                const dayEvents = getCalendarEvents(date);
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

                    {/* Calendar Events */}
                    {dayEvents.map((event, eventIndex) => (
                      <div
                        key={`event-${event.id}-${eventIndex}`}
                        className={`absolute left-1 right-1 bg-blue-200 border border-blue-300 rounded-md shadow-sm hover:bg-blue-300 cursor-pointer transition-colors z-30 overflow-hidden ${
                          event.allDay ? 'bg-blue-100 border-blue-200' : ''
                        }`}
                        style={{
                          top: event.allDay ? '2px' : `${getTimePosition(event.start)}px`,
                          height: event.allDay ? 'calc(100% - 4px)' : `${Math.max(getBlockHeight(event.start, event.end) - 2, 50)}px`,
                          minHeight: event.allDay ? 'auto' : '50px'
                        }}
                        title={`${event.title} (${event.provider})`}
                      >
                        <div className={`p-1.5 text-xs font-medium text-blue-800 h-full ${
                          event.allDay ? 'flex flex-col justify-center' : 'flex flex-col'
                        }`}>
                          <div className="truncate font-semibold leading-tight">{event.title}</div>
                          {!event.allDay && (
                            <div className="text-blue-600 text-[10px] leading-tight">
                              {event.timeRange}
                            </div>
                          )}
                          <div className="text-blue-500 text-[9px] capitalize truncate leading-tight">
                            {event.provider}
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
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-green-200 border border-green-300 rounded"></div>
            <span className="text-slate-600">Available time blocks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-blue-200 border border-blue-300 rounded"></div>
            <span className="text-slate-600">Calendar events</span>
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
