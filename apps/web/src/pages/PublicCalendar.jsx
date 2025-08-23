import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  LoadingState,
  ErrorState,
  CalendarHeader,
  WeekView,
  MonthView
} from '../components/public';

const PublicCalendar = () => {
  const { slug } = useParams();
  const [view, setView] = useState('week');
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  const fetchAvailability = async (weekOffset = 0, monthOffset = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      let startDate, endDate;
      
      if (view === 'week') {
        // Calculate the date range for the requested week
        const today = new Date();
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
        
        startDate = new Date(sunday);
        endDate = new Date(sunday);
        endDate.setDate(sunday.getDate() + 6);
      } else {
        // Calculate the date range for the requested month
        const today = new Date();
        const currentMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
        startDate = new Date(currentMonth);
        endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      }
      
      const rangeParam = `${startDate.toISOString().split('T')[0]}..${endDate.toISOString().split('T')[0]}`;
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/${slug}/availability?range=${rangeParam}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('not_found');
        } else {
          setError('server_error');
        }
        return;
      }
      
      const data = await response.json();
      setAvailability(data);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      setError('network_error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      if (view === 'week') {
        fetchAvailability(currentWeekOffset, 0);
      } else {
        fetchAvailability(0, currentMonthOffset);
      }
    }
  }, [slug, currentWeekOffset, currentMonthOffset, view]);

  // Early returns for different states
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!availability) {
    return <ErrorState error="not_found" />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <CalendarHeader
          userName={availability.user_name}
          view={view}
          onViewChange={setView}
        />
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {view === 'week' ? (
              <WeekView 
                availability={availability} 
                currentWeekOffset={currentWeekOffset}
                onWeekChange={setCurrentWeekOffset}
                onRefresh={() => fetchAvailability(currentWeekOffset, 0)}
              />
            ) : (
              <MonthView 
                availability={availability}
                currentMonthOffset={currentMonthOffset}
                onMonthChange={setCurrentMonthOffset}
                onRefresh={() => fetchAvailability(0, currentMonthOffset)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCalendar;
