import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchConfirmedLeads } from "../store/leadsSlice";
import { Calendar, Clock, AlertTriangle, CheckSquare, Stethoscope } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import AllIcons from "../assets/images/assets";
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";

const { CompletedIcon, DuetodayIcon, OverdueIcon, UpcomingRemindersIcon } =
  AllIcons;

const Reminders = () => {
  const dispatch = useDispatch();
  const { leads, isLoading, error } = useSelector((state) => state.leads);
  const [filterDays, setFilterDays] = useState(null);

  useEffect(() => {
    dispatch(fetchConfirmedLeads());
  }, [dispatch]);

  // Map status to days and calculate days for sorting
  const processLeads = (leads) =>
    leads.map((lead) => {
      let days = null;
      switch (lead.status.toLowerCase()) {
        case "3 days":
          days = 3;
          break;
        case "7 days":
          days = 7;
          break;
        case "15 days":
          days = 15;
          break;
        case "1 month":
          days = 30;
          break;
        case "confirmed":
        default:
          days = null; // No specific days for confirmed
          break;
      }
      return { ...lead, days };
    });

  const filteredReminders = filterDays
    ? processLeads(leads).filter((reminder) => reminder.days === filterDays)
    : processLeads(leads);

  // Sort by days (null/confirmed last, then ascending)
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (a.days === null && b.days === null) return 0;
    if (a.days === null) return 1;
    if (b.days === null) return -1;
    return a.days - b.days;
  });

  const handleFilter = (days) => {
    setFilterDays(days);
  };

  if (isLoading)
    return (
      <div className="text-center py-10">
        <LoaderDemo />
      </div>
    );
    if (error )
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-10 mt-20 px-4 text-center max-w-xl mx-auto bg-red-50 border border-red-200 rounded-xl shadow-sm">
       <div className="flex text-red-700 gap-3 text-xl font-medium"><Stethoscope color="black" size={35} className="animate-bounce"/> {error}</div>

        {/* <div className="flex flex-wrap justify-center gap-4">
           <Button
          variant="primary"
          size="sm"
          onClick={() => dispatch(clearDashboardError())}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition-all duration-200 flex items-center gap-2 font-medium"
        >
          Dismiss
        </Button> 

          <Button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2 rounded-lg shadow transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div> */}
      </div>
    );

  return (
    <div className="container mx-auto bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
      </div>

      <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
              Visiting in
            </span>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <Button
                variant={filterDays === null ? "primary" : "secondary"}
                onClick={() => handleFilter(null)}
              >
                All
              </Button>

              <Button
                variant={filterDays === 3 ? "primary" : "secondary"}
                onClick={() => handleFilter(3)}
              >
                3 days
              </Button>

              <Button
                variant={filterDays === 7 ? "primary" : "secondary"}
                onClick={() => handleFilter(7)}
              >
                7 days
              </Button>

              <Button
                variant={filterDays === 15 ? "primary" : "secondary"}
                onClick={() => handleFilter(15)}
              >
                15 days
              </Button>

              <Button
                variant={filterDays === 30 ? "primary" : "secondary"}
                onClick={() => handleFilter(30)}
              >
                1 month
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Showing {sortedReminders.length} of {leads.length} reminders
          </p>
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
              {sortedReminders.map((reminder, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="p-3 text-gray-800 font-medium">{index + 1}</td>
                  <td className="p-3 text-gray-600">{reminder.patient_name}</td>
                  <td className="p-3 text-gray-600">
                    {reminder.phone?.replace("whatsapp:", "") ||
                      "No Data Found"}
                  </td>
                  <td className="p-3 text-gray-600">{reminder.disease}</td>
                  <td className="p-3 text-gray-600">
                    {reminder.days ? `${reminder.days} days` : "Not Available"}
                  </td>
                  <td className="p-3 text-gray-600">
                    {reminder.location || "Not Specified"}
                  </td>
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
