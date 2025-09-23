import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import RoleBadge from "../components/ui/RoleBadge";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatients } from "../store/patientsSlice";
import { motion } from "framer-motion";
import useErrorRedirect from "../hooks/useErrorRedirect";
import { getIndex, toCamelCase } from "../hooks/utils";
import SearchInput from "../components/ui/SearchInput"; // Import SearchInput
import ExportCSVButton from "../components/ui/ExportCSVButton"; // Import reusable component
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";
import EmptyState from "../components/ui/EmptyState";
import { FileSearch, Stethoscope } from "lucide-react";

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
  const { patients, isLoading, error, errorStatus } = useSelector(
    (state) => state.patients
  );
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  useErrorRedirect();

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  // Filter patients based on confirmation status and search query
  const filteredPatients = patients.filter((patient) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "confirmed" && patient.confirmation === "confirmed") ||
      (filter === "cancelled" && patient.confirmation === "cancelled");
    const matchesSearch =
      (patient.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (patient.phone?.replace("whatsapp:", "")?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (patient.disease?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (patient.visited_location?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );
    return matchesFilter && matchesSearch;
  });

  if (isLoading) return <div className="text-center py-10"><LoaderDemo   /></div>;
 
    if (error && !errorStatus)
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

  // CSV export data and headers for Patients
  const csvData = filteredPatients; // Use filtered patients for export
  const csvHeaders = [
    { label: "#", key: "index" }, // Custom index (handled in data transformation)
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

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-text-primary">
          Patient Management
        </h1>
        {/* Use reusable ExportCSVButton with transformed data */}
        <ExportCSVButton
          data={transformedCsvData}
          headers={csvHeaders}
          filename="patients.csv"
        />
      </div>
      <Card className="overflow-x-auto">
        <div className="flex align-items-center gap-3 mb-4">
          <SearchInput
            className="max-w-lg"
            placeholder="Search by name, phone number, disease or location......."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* <Button
            variant={filter === "all" ? "primary" : "secondary"}
            onClick={() => setFilter("all")}
          >
            All Patients
          </Button>
          <Button
            variant={filter === "confirmed" ? "primary" : "secondary"}
            onClick={() => setFilter("confirmed")}
          >
            Visited Patients
          </Button>
          <Button
            variant={filter === "cancelled" ? "primary" : "secondary"}
            onClick={() => setFilter("cancelled")}
          >
            Not Visited Patients
          </Button> */}
        </div>
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="bg-gray-50 text-text-secondary">
            <tr>
              <th className="p-4 font-semibold">#</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Phone</th>
              <th className="p-4 font-semibold">Disease</th>
              <th className="p-4 font-semibold">Visit Date</th>
              <th className="p-4 font-semibold">Visit Time</th>
              <th className="p-4 font-semibold">Visited Location</th>
              <th className="p-4 font-semibold">Relation</th>
              {/* <th className="p-4 font-semibold">Confirmation</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center">
                  <EmptyState
                  description={"No patients match the current filter. Try adjusting the filter or adding new patient records."}
                  title={"No Records Found"}
                  icon={FileSearch}
                  
                  />
                  {/* <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-md">
                    <p className="text-gray-600 font-medium text-lg">
                      No Records Found
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      No patients match the current filter. Try adjusting the
                      filter or adding new patient records.
                    </p>
                  </div> */}
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient, index) => (
                <motion.tr
                  key={index}
                  className={`border-b last:border-0 hover:bg-gray-50 ${
                    patient.name === "Emily Davis" ? "bg-blue-50" : ""
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="p-4 text-text-secondary">
                    {getIndex(filteredPatients, patient, true)}
                  </td>
                  <td className="p-4 font-medium text-text-primary">
                    {toCamelCase(patient.name || "No Data Found")}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {patient.phone.replace("whatsapp:", "") || "No Data Found"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {toCamelCase(patient.disease || "No Data Found")}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {patient.visit_date
                      ? new Date(patient.visit_date).toLocaleDateString()
                      : "No Data Found"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {patient.visit_time || "No Data Found"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {toCamelCase(patient.location || "No Data Found")}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {toCamelCase(patient.relation || "No Data Found")}
                  </td>
                  {/* <td className="p-4">
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
                  </td> */}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default Patients;