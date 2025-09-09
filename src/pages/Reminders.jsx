import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Calendar, Clock, AlertTriangle, CheckSquare } from 'lucide-react';
import { remindersData } from '../data/mockData';
import StatCard from '../components/ui/StatCard';
import AllIcons from '../assets/images/assets';

const {  CompletedIcon,
  DuetodayIcon,
  OverdueIcon,
  UpcomingRemindersIcon,} = AllIcons

const Reminders = () => {
  return (
    <div className="container mx-auto bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reminders & Follow-ups</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md">
          + New Reminder
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={UpcomingRemindersIcon} value="5" label="Upcoming" color="#3b82f6" />
        <StatCard icon={DuetodayIcon} value="1" label="Due Today" color="#FDE680" />
        <StatCard icon={OverdueIcon} value="1" label="Overdue" color="#ef4444" />
        <StatCard icon={CompletedIcon} value="1" label="Completed" color="#10b981" />
      </div>

      <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <select className="border rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>All Status</option>
            </select>
            <select className="border rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>All Types</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">Showing 7 of 7 reminders</p>
        </div>
        <div className="p-4">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr className="border-b border-gray-200">
                <th className="p-3 text-sm font-semibold uppercase tracking-wider">Lead</th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider">Date & Time</th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody>
              {remindersData.map((reminder, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="p-3 text-gray-800 font-medium">{reminder.lead}</td>
                  <td className="p-3 text-gray-600">{reminder.dateTime}</td>
                  <td className="p-3 text-gray-600">{reminder.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reminders;