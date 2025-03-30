import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarWidget = ({ events = [] }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
    
    let calendarDays = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      const hasEvent = events.some(event => event.date === dateStr);
      const isToday = 
        day === today.getDate() && 
        currentMonth === today.getMonth() && 
        currentYear === today.getFullYear();
      
      calendarDays.push(
        <div 
          key={day} 
          className={`h-8 w-8 flex items-center justify-center rounded-full text-sm 
            ${isToday ? 'bg-indigo-600 text-white' : ''}
            ${hasEvent && !isToday ? 'border-2 border-indigo-400 text-indigo-800' : 'text-indigo-800'}
            cursor-pointer hover:bg-indigo-100 transition duration-200
            ${!isToday && !hasEvent ? 'hover:bg-indigo-50' : ''}
          `}
        >
          {day}
        </div>
      );
    }
    
    return calendarDays;
  };
  
  return (
    <div className="calendar-widget bg-white rounded-xl shadow-sm border border-indigo-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-indigo-900">
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-indigo-50 text-indigo-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-indigo-50 text-indigo-600"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-xs font-medium text-indigo-400">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {renderCalendar()}
      </div>
      
      {/* Legend */}
      <div className="mt-4 text-xs text-indigo-500 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-indigo-600 mr-1"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full border-2 border-indigo-400 mr-1"></div>
          <span>Event</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
