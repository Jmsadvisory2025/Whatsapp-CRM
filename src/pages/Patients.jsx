import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import DiseasesSort from "../components/ui/DiseasesSort";
import LocationsSort from "../components/ui/LocationsSort";
import { filterByDisease } from "../utils/diseaseFilter";
import { filterByLocation } from "../utils/locationFilter";
import RoleBadge from "../components/ui/RoleBadge";
import PatientCard from "../components/PatientCard";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatients } from "../store/patientsSlice";
import { motion } from "framer-motion";
import useErrorRedirect from "../hooks/useErrorRedirect";
import { getIndex, toCamelCase } from "../hooks/utils";
import SearchInput from "../components/ui/SearchInput";
import ExportCSVButton from "../components/ui/ExportCSVButton";
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";
import EmptyState from "../components/ui/EmptyState";
import { FileSearch, Stethoscope, UserCheck, Activity, Calendar, FileImage } from "lucide-react";
import SimplePagination from "../components/ui/SimplePagination";

const confirmationStyles = {
  Confirmed: {
    filled: { bg: "bg-green-100", text: "text-green-700", border: "" },
    outline: {
      bg: "bg-transparent",
      text: "text-green-700",
      border: "border border-green-500",
    },
  },
  Cancelled: {
    filled: { bg: "bg-red-100", text: "text-red-700", border: "" },
    outline: {
      bg: "bg-transparent",
      text: "text-red-700",
      border: "border border-red-500",
    },
  },
  pending: {
    filled: { bg: "bg-yellow-100", text: "text-yellow-700", border: "" },
    outline: {
      bg: "bg-transparent",
      text: "text-yellow-700",
      border: "border border-yellow-500",
    },
  },
};

// Fallback styles if confirmation is not found
const fallback = {
  filled: { bg: "bg-gray-100", text: "text-gray-600", border: "" },
  outline: {
    bg: "bg-transparent",
    text: "text-gray-600",
    border: "border border-gray-400",
  },
};

const Patients = () => {
  const dispatch = useDispatch();
  const { patients, pagination, isLoading, error, errorStatus } = useSelector(
    (state) => state.patients
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDisease, setSelectedDisease] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  useErrorRedirect();
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100; // Fixed to 100 as per API

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  // Handle next page using API's next URL
  const handleNextPage = () => {
    if (pagination.next) {
      dispatch(fetchPatients(pagination.next));
      setCurrentPage(prev => prev + 1);
    }
  };

  // Handle previous page using API's previous URL
  const handlePreviousPage = () => {
    if (pagination.previous) {
      dispatch(fetchPatients(pagination.previous));
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  };

  // Filter patients based on search query, disease, and location
  const filteredPatients = filterByDisease(patients, selectedDisease)
    .filter(patient => filterByLocation([patient], selectedLocation).length > 0)
    .filter((patient) => {
    const matchesSearch =
      (patient.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (patient.phone?.replace("whatsapp:", "")?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (patient.disease?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (patient.location?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );
    return matchesSearch;
  });

  // Handler functions for PatientCard
  const handleOpenCard = (patient) => {
    setSelectedPatient(patient);
    setIsCardOpen(true);
  };

  const handleCloseCard = () => {
    setIsCardOpen(false);
    setSelectedPatient(null);
  };

  // CSV export data and headers for Patients
  const csvHeaders = [
    { label: "#", key: "index" },
    { label: "Name", key: "name" },
    { label: "Phone", key: "phone" },
    { label: "Disease", key: "disease" },
    { label: "Visit Date", key: "visit_date" },
    { label: "Visit Time", key: "visit_time" },
    { label: "Visited Location", key: "visited_location" },
    { label: "Relation", key: "relation" },
    { label: "Confirmation", key: "confirmation" },
  ];

  // Transform data to include index and handle formatting
  const transformedCsvData = filteredPatients.map((patient, index) => ({
    index: getIndex(filteredPatients, patient, true),
    name: toCamelCase(patient.name || "No Data Found"),
    phone: `'${patient.phone?.replace("whatsapp:", "") || "-"}`,
    disease: toCamelCase(patient.disease || "No Data Found"),
    visit_date: patient.visit_date || "No Data Found",
    visit_time: patient.visit_time || "No Data Found",
    visited_location: toCamelCase(patient.visited_location || "No Data Found"),
    relation: toCamelCase(patient.relation || "No Data Found"),
    confirmation: patient.confirmation || "No Data Found",
  }));

  if (isLoading) return <div className="text-center py-10"><LoaderDemo /></div>;

  if (error && !errorStatus)
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patient Management</h1>
              <p className="text-sm text-gray-600 mt-0.5">Track and manage patients</p>
            </div>
          </div>

          {/* Stats and Export */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">{filteredPatients.length}</span>
              <span className="text-sm text-gray-600">Total Patients</span>
            </div>
            {/* <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">{todaysPatients.length}</span>
              <span className="text-sm text-gray-600">Today's Patients</span>
            </div> */}
            <ExportCSVButton
              data={transformedCsvData}
              headers={csvHeaders}
              filename="patients.csv"
            />
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
        </div>

        {/* Table Section - Horizontally Scrollable */}
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[50px]">ID</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[150px]">Name</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[130px]">Phone</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[140px]">Disease</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[80px]">Assets</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">Visit Date</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">Visit Time</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[150px]">Location</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">Relation</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">Confirmation</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8">
                    <EmptyState
                      title="No Patients Found"
                      description="No patients match your current filters."
                      icon={FileSearch}
                    />
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient, index) => (
                  <motion.tr
                    key={patient.conversation_id || index}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleOpenCard(patient)}
                  >
                    <td className="px-3 py-3 text-gray-600 font-medium text-sm whitespace-nowrap">
                      {(currentPage - 1) * itemsPerPage + getIndex(filteredPatients, patient, true)}
                    </td>
                    {/* <td className="px-3 py-3 whitespace-nowrap">
                      <span className="font-medium text-gray-900 text-sm">
                        {toCamelCase(patient.name || "No Data Found")}
                      </span>
                    </td> */}
                    <td className="px-3 py-3 min-w-[150px] max-w-[150px]">
                      <span className="font-medium text-gray-900 text-sm block truncate" title={toCamelCase(patient.name || "No Data Found")}>
                        {toCamelCase(patient.name || "No Data Found")}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {/* {patient.phone?.replace("whatsapp:", "+") || "No Data Found"} */}
                      {patient.phone ? `+${patient.phone.replace("whatsapp:", "").replace(/^\+/, "")}` : "No Data Found"}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200 whitespace-nowrap">
                        {toCamelCase(patient.disease || "No Data Found")}
                      </span>
                    </td>
                     <td className="px-3 py-3">
                      {patient.photo_url ? (
                        <div className="flex items-center justify-center">
                          <img 
                            src={patient.photo_url} 
                            alt="Lead asset" 
                            className="w-10 h-10 object-cover rounded-md border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-10 h-10 items-center justify-center bg-gray-100 rounded-md border border-gray-200">
                            <FileImage className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-md border border-gray-200">
                          <FileImage className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {patient.visit_date
                        ? new Date(patient.visit_date).toLocaleDateString("en-GB").replace(/\//g, "-")
                        : "No Data Found"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {patient.visit_time ? new Date(`1970-01-01T${patient.visit_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true}) : "No Data Found"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {toCamelCase(patient.location || "No Data Found")}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {toCamelCase(patient.relation || "No Data Found")}
                    </td>
                    <td className="px-3 py-3">
                      <RoleBadge
                        role={
                          patient.confirmation ||
                          patient.reminder_type ||
                          "No Data Found"
                        }
                        variant="filled"
                        roleStyles={confirmationStyles}
                        fallback={fallback}
                      />
                    </td>
                    {/* <td className="px-3 py-2 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCard(patient);
                        }}
                        className="px-2 py-1 text-xs"
                      >
                        View
                      </Button>
                    </td> */}
                  </motion.tr>
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

      {/* Patient Card Modal */}
      <PatientCard
        patient={selectedPatient}
        isOpen={isCardOpen}
        onClose={handleCloseCard}
      />
    </div>
  );
};

export default Patients;