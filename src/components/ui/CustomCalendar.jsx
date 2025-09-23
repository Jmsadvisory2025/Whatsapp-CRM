import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const CustomCalendar = ({ value, onClickDay, visitCounts }) => {
  const [currentDate, setCurrentDate] = useState(value || new Date());
  
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const isToday = (day) => {
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };
  
  const hasVisits = (day) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const visitData = visitCounts.find(item => item.date === dateStr);
    return visitData?.count > 0 ? visitData.count : 0;
  };
  
  const handleDayClick = (day) => {
    const date = new Date(year, month, day);
    onClickDay(date);
  };
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Previous month's trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <div
          key={`prev-${day}`}
          className="h-10 flex items-center justify-center text-gray-300 text-sm relative cursor-default rounded-lg"
        >
          {day}
        </div>
      );
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const visitCount = hasVisits(day);
      const todayClass = isToday(day);
      
      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`
            h-10 flex items-center justify-center text-sm font-semibold relative cursor-pointer 
            rounded-lg transition-all duration-300 group
            ${todayClass 
              ? 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 border-2 border-orange-300' 
              : visitCount > 0 
                ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 text-blue-800 border-2 border-blue-200 hover:from-blue-100 hover:via-indigo-100 hover:to-blue-200 hover:border-blue-300 shadow-md hover:shadow-lg' 
                : 'text-gray-700 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 hover:shadow-md border-2 border-transparent hover:border-gray-200'
            }
          `}
          onClick={() => handleDayClick(day)}
        >
          <span className={`z-10 ${todayClass ? 'font-bold' : ''}`}>{day}</span>
          
          {visitCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white group-hover:scale-110 transition-transform duration-200"
            >
              {visitCount}
            </motion.div>
          )}
          
          {/* Hover effect overlay */}
          <div className={`
            absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300
            ${!todayClass && visitCount === 0 ? 'bg-gradient-to-br from-blue-400/10 to-indigo-400/10' : ''}
          `} />
        </motion.div>
      );
    }
    
    // Next month's leading days
    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDayOfWeek + daysInMonth);
    
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className="h-10 flex items-center justify-center text-gray-300 text-sm relative cursor-default rounded-lg"
        >
          {day}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.9 }}
          onClick={goToPrevMonth}
          className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
        </motion.button>
        
        <motion.h3 
          key={`${month}-${year}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent"
        >
          {monthNames[month]} {year}
        </motion.h3>
        
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
          whileTap={{ scale: 0.9 }}
          onClick={goToNextMonth}
          className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors" />
        </motion.button>
      </div>
      
      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className="h-8 flex items-center justify-center text-xs font-bold text-gray-500 uppercase tracking-wider"
          >
            <span className={`
              px-2 py-1 rounded-md transition-colors duration-200
              ${index === 0 || index === 6 ? 'text-red-500' : 'text-gray-600'}
            `}>
              {day}
            </span>
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <motion.div 
        key={`${month}-${year}-grid`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, staggerChildren: 0.02 }}
        className="grid grid-cols-7 gap-2"
      >
        {renderCalendarDays()}
      </motion.div>
      
      {/* Mini Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span className="font-medium">
            Active Days: {visitCounts.filter(item => item.count > 0).length}
          </span>
          <span className="font-medium">
            Total Visits: {visitCounts.reduce((sum, item) => sum + item.count, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomCalendar;