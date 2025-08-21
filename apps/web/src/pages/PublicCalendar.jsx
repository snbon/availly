import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const PublicCalendar = () => {
  const { slug } = useParams();
  const [view, setView] = useState('week');
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch availability from API
    const fetchAvailability = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/${slug}/availability`);
        const data = await response.json();
        setAvailability(data);
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading availability...</p>
        </div>
      </div>
    );
  }

  if (!availability) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Not Found</h1>
          <p className="text-gray-600">This availability link could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {slug}'s Availability
                </h1>
                <p className="text-gray-600">Click on any available time to see details</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setView('week')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    view === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setView('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    view === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {view === 'week' ? (
              <WeekView availability={availability} />
            ) : (
              <MonthView availability={availability} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const WeekView = ({ availability }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div>
      <div className="grid grid-cols-8 gap-1">
        {/* Time column */}
        <div className="w-16"></div>
        {days.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="space-y-1">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 gap-1">
            <div className="w-16 text-sm text-gray-500 py-1">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {days.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="h-12 border border-gray-200 rounded relative cursor-pointer group"
                title={import.meta.env.VITE_TOOLTIP_COPY}
              >
                {/* Available time blocks */}
                {availability?.availability?.windows?.map((window, index) => {
                  const startHour = new Date(window.start).getUTCHours();
                  const endHour = new Date(window.end).getUTCHours();
                  if (hour >= startHour && hour < endHour) {
                    return (
                      <div
                        key={index}
                        className="absolute inset-1 bg-green-500 rounded opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    );
                  }
                  return null;
                })}
                
                {/* Busy time overlays */}
                {availability?.availability?.busy?.map((busy, index) => {
                  const startHour = new Date(busy.start).getUTCHours();
                  const endHour = new Date(busy.end).getUTCHours();
                  if (hour >= startHour && hour < endHour) {
                    return (
                      <div
                        key={index}
                        className="absolute inset-1 bg-red-500 rounded opacity-60"
                      />
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const MonthView = ({ availability }) => {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">Month view coming soon...</p>
      <p className="text-sm text-gray-400">Currently showing week view</p>
    </div>
  );
};

export default PublicCalendar;
