import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchConfirmedLeads } from "../store/leadsSlice";
import { Calendar, Clock, AlertTriangle, CheckSquare, Stethoscope, Activity } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import AllIcons from "../assets/images/assets";
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";
import SimplePagination from "../components/ui/SimplePagination";
import SearchInput from "../components/ui/SearchInput";
import DiseasesSort from "../components/ui/DiseasesSort";
import LocationsSort from "../components/ui/LocationsSort";
import { filterByDisease } from "../utils/diseaseFilter";
import { filterByLocation } from "../utils/locationFilter";
import EmptyState from "../components/ui/EmptyState";
import { FileSearch } from "lucide-react";

const { CompletedIcon, DuetodayIcon, OverdueIcon, UpcomingRemindersIcon } =
  AllIcons;

const Reminders = () => {
  const dispatch = useDispatch();
  const { leads, pagination, isLoading, error } = useSelector((state) => state.leads);
  const [filterDays, setFilterDays] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDisease, setSelectedDisease] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100; // Fixed to 100 as per API

  useEffect(() => {
    dispatch(fetchConfirmedLeads());
  }, [dispatch]);

  // Handle next page using API's next URL
  const handleNextPage = () => {
    if (pagination.next) {
      dispatch(fetchConfirmedLeads(pagination.next));
      setCurrentPage(prev => prev + 1);
    }
  };

  // Handle previous page using API's previous URL
  const handlePreviousPage = () => {
    if (pagination.previous) {
      dispatch(fetchConfirmedLeads(pagination.previous));
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  };

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

  // Filter and sort reminders
  const filteredReminders = filterByDisease(processLeads(leads), selectedDisease)
    .filter(reminder => filterByLocation([reminder], selectedLocation).length > 0)
    .filter((reminder) => {
      const matchesSearch =
        (reminder.patient_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (reminder.phone?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (reminder.disease?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (reminder.location?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .filter(reminder => {
      if (filterDays === null) return true;
      return reminder.days === filterDays;
    });

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
       <div className="flex text-red-700 gap-3 text-xl font-medium"><Stethoscope color="#b91c1c" size={35} className="animate-bounce"/> {error}</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reminders</h1>
              <p className="text-sm text-gray-600 mt-0.5">Track and manage patient reminders</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">{sortedReminders.length}</span>
              <span className="text-sm text-gray-600">Total Reminders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card className="overflow-hidden shadow-sm border border-gray-200 bg-white">
        {/* Filter Section */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4">
            {/* Search Input */}
            <div className="flex-1 min-w-full lg:min-w-[280px] lg:max-w-md">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Search</label>
              <SearchInput
                placeholder="Name, phone, disease, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="min-w-full sm:min-w-[200px]">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Disease</label>
                <DiseasesSort 
                  selectedDisease={selectedDisease} 
                  onDiseaseChange={setSelectedDisease} 
                  className="w-full"
                />
              </div>

              <div className="min-w-full sm:min-w-[200px]">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Location</label>
                <LocationsSort 
                  selectedLocation={selectedLocation} 
                  onLocationChange={setSelectedLocation} 
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Days Filter */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Visiting in
                </span>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <Button
                    variant={filterDays === null ? "primary" : "secondary"}
                    onClick={() => handleFilter(null)}
                    className="px-3 py-1.5 text-sm"
                  >
                    All
                  </Button>

                  <Button
                    variant={filterDays === 3 ? "primary" : "secondary"}
                    onClick={() => handleFilter(3)}
                    className="px-3 py-1.5 text-sm"
                  >
                    3 days
                  </Button>

                  <Button
                    variant={filterDays === 7 ? "primary" : "secondary"}
                    onClick={() => handleFilter(7)}
                    className="px-3 py-1.5 text-sm"
                  >
                    7 days
                  </Button>

                  <Button
                    variant={filterDays === 15 ? "primary" : "secondary"}
                    onClick={() => handleFilter(15)}
                    className="px-3 py-1.5 text-sm"
                  >
                    15 days
                  </Button>

                  <Button
                    variant={filterDays === 30 ? "primary" : "secondary"}
                    onClick={() => handleFilter(30)}
                    className="px-3 py-1.5 text-sm"
                  >
                    1 month
                  </Button>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Showing {sortedReminders.length} reminders
              </p>
            </div>
          </div>
        </div>
        
        {/* Table Section - Horizontally Scrollable */}
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[50px]">#</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[150px]">Name</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[130px]">Phone</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[140px]">Diseases</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[140px]">Visiting in Days</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[150px]">Visiting Location</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[130px]">Assigned To</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">Relation</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
              {sortedReminders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8">
                    <EmptyState
                      title="No Reminders Found"
                      description="No reminders match your current filters."
                      icon={FileSearch}
                    />
                  </td>
                </tr>
              ) : (
                sortedReminders.map((reminder, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-3 py-3 text-gray-600 font-medium text-sm whitespace-nowrap">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-3 py-3 text-gray-900 font-medium text-sm whitespace-nowrap">
                      {reminder.patient_name}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {reminder.phone?.replace("whatsapp:", "") ||
                        "No Data Found"}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200 whitespace-nowrap">
                        {reminder.disease}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {reminder.days ? `${reminder.days} days` : "Not Available"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {reminder.location || "Not Specified"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {reminder.assigned_to?.name || "Not Assigned"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {reminder.relation || "Not Specified"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
            </div>
          </div>
        </div>
        
        {/* Simple Pagination Component */}
        <SimplePagination
          next={pagination.next}
          previous={pagination.previous}
          onNext={handleNextPage}
          onPrevious={handlePreviousPage}
          totalItems={pagination.count}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
      </Card>
    </div>
  );
};

export default Reminders;