import React, { useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Calendar, Clock, AlertTriangle, CheckSquare } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import AllIcons from "../assets/images/assets";

const { CompletedIcon, DuetodayIcon, OverdueIcon, UpcomingRemindersIcon } =
  AllIcons;

// Dummy data for reminders
const remindersData = [
  { lead: 1, name: "Amit Patel", phone: "+919876543210", disease: "Diabetes", days: 3, visitingLocation: "Ambavadi" },
  { lead: 2, name: "Sneha Sharma", phone: "+918765432109", disease: "Hypertension", days: 7, visitingLocation: "Nikol" },
  { lead: 3, name: "Rahul Mehta", phone: "+917654321098", disease: "Asthma", days: 15, visitingLocation: "Ambavadi" },
  { lead: 4, name: "Priya Desai", phone: "+916543210987", disease: "Arthritis", days: 30, visitingLocation: "Nikol" },
  { lead: 5, name: "Vikram Singh", phone: "+915432109876", disease: "Migraine", days: 3, visitingLocation: "Ambavadi" },
  { lead: 6, name: "Neha Gupta", phone: "+914321098765", disease: "Cold", days: 7, visitingLocation: "Nikol" },
  { lead: 7, name: "Karan Joshi", phone: "+913210987654", disease: "Fever", days: 15, visitingLocation: "Ambavadi" },
];

const Reminders = () => {
  const [filterDays, setFilterDays] = useState(null); // State to track selected filter

  // Filter reminders based on selected days
  const filteredReminders = filterDays
    ? remindersData.filter((reminder) => reminder.days === filterDays)
    : remindersData;

  const handleFilter = (days) => {
    setFilterDays(days);
  };

  return (
    <div className="container mx-auto bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Reminders & 
        </h1>
      </div>

      <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
              Visiting in
            </span>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <Button variant={filterDays === null ? "primary" : "secondary"} onClick={() => handleFilter(null)}>All</Button>
              <Button variant="secondary" onClick={() => handleFilter(3)}>3 days</Button>
              <Button variant="secondary" onClick={() => handleFilter(7)}>7 days</Button>
              <Button variant="secondary" onClick={() => handleFilter(15)}>15 days</Button>
              <Button variant="secondary" onClick={() => handleFilter(30)}>1 month</Button>
            </div>
          </div>

          <p className="text-sm text-gray-500">Showing {filteredReminders.length} of {remindersData.length} reminders</p>
        </div>
        <div className="p-4">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-text-secondary">
              <tr>
                <th className="p-4 font-semibold">#</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Diseases</th>
                <th className="p-4 font-semibold">Visiting in Days</th>
                <th className="p-4 font-semibold">Visiting Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredReminders.map((reminder, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="p-3 text-gray-800 font-medium">
                    {index + 1}
                  </td>
                  <td className="p-3 text-gray-600">{reminder.name}</td>
                  <td className="p-3 text-gray-600">{reminder.phone}</td>
                  <td className="p-3 text-gray-600">{reminder.disease}</td>
                  <td className="p-3 text-gray-600">{reminder.days} days</td>
                  <td className="p-3 text-gray-600">{reminder.visitingLocation}</td>
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