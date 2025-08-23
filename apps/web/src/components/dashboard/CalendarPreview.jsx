import React from 'react';
import { Calendar } from 'lucide-react';
import Card from '../ui/Card';

const CalendarPreview = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
        <Calendar className="w-5 h-5 text-purple-600 mr-2" />
        This Week's Schedule
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div key={day} className="text-center">
            <div className="text-xs font-medium text-slate-500 mb-2">{day}</div>
            <div className="w-10 h-10 rounded-lg border-2 border-slate-200 flex items-center justify-center text-sm font-medium text-slate-700 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CalendarPreview;
