import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import DiseasesSort from "../components/ui/DiseasesSort";
import { filterByDisease } from "../utils/diseaseFilter";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProspects,
  convertProspectToLead,
  resetAction,
  updateProspect,
  setProspectsError,
  clearProspectsError,
} from "../store/prospectsSlice";
import { motion } from "framer-motion";
import { getIndex, toCamelCase } from "../hooks/utils";
import ExportCSVButton from "../components/ui/ExportCSVButton"; // Import reusable component
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";
import EmptyState from "../components/ui/EmptyState";
import { FileSearch, Stethoscope } from "lucide-react";

const Prospects = () => {
  const dispatch = useDispatch();
  const { prospects, isLoading, error } = useSelector((state) => state.prospects);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [editProspect, setEditProspect] = useState(null);
  const [editForm, setEditForm] = useState({ patient_name: "", disease: "" });
  const [rowErrors, setRowErrors] = useState({}); // Track errors per prospect by conversation_id
  const [selectedDisease, setSelectedDisease] = useState("all");

  useEffect(() => {
    dispatch(fetchProspects());
  }, [dispatch]);

  const handleActionChange = (prospect, value) => {
    setSelectedProspect(prospect);
    setSelectedAction(value);

    if (value === "convert") {
      // Validate required fields before setting action
      const isValid = prospect.patient_name && prospect.phone && prospect.disease;
      if (!isValid) {
        setRowErrors((prev) => ({
          ...prev,
          [prospect.conversation_id]: "Name, Phone, and Diseases fields are required",
        }));
        setSelectedAction("");
        return;
      } else {
        setRowErrors((prev) => ({
          ...prev,
          [prospect.conversation_id]: null,
        }));
      }
    }
  };

  const handleUpdate = () => {
    if (selectedProspect && selectedAction === "convert") {
      dispatch(
        convertProspectToLead({
          conversation_id: selectedProspect.conversation_id,
          phone: selectedProspect.phone,
          patient_name: selectedProspect.patient_name,
          disease: selectedProspect.disease,
        })
      );
    }
    setSelectedProspect(null);
    setSelectedAction("");
    setRowErrors((prev) => ({
      ...prev,
      [selectedProspect?.conversation_id]: null,
    }));
  };

  const handleCancel = () => {
    dispatch(resetAction());
    setSelectedProspect(null);
    setSelectedAction("");
    setEditProspect(null);
    setEditForm({ patient_name: "", disease: "" });
    setRowErrors((prev) => ({
      ...prev,
      [selectedProspect?.conversation_id]: null,
    }));
  };

  const handleEditClick = (prospect) => {
    setEditProspect(prospect);
    setEditForm({
      patient_name: prospect.patient_name || "",
      disease: prospect.disease || "",
    });
  };

  const handleSaveUpdate = () => {
    if (editProspect) {
      dispatch(
        updateProspect({
          conversation_id: editProspect.conversation_id,
          patient_name: editForm.patient_name,
          disease: editForm.disease,
        })
      ).then(() => {
        // Refresh the page after successful update
        window.location.reload();
      });
      setEditProspect(null);
      setEditForm({ patient_name: "", disease: "" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <div className="text-center py-10"><LoaderDemo/></div>;
  if (error)
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-10 mt-20 px-4 text-center max-w-xl mx-auto bg-red-50 border border-red-200 rounded-xl shadow-sm">
       <div className="flex text-red-700 gap-3 text-xl font-medium"><Stethoscope color="black" size={35} className="animate-bounce"/> {error}</div>
{/* 
        <div className="flex flex-wrap justify-center gap-4">
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
  // Filter prospects based on selected disease
  const filteredProspects = filterByDisease(prospects, selectedDisease);

  // CSV export data and headers for Prospects
  const csvData = filteredProspects; // Use the Redux prospects state
  const csvHeaders = [
    { label: "#", key: "index" }, // Custom index (handled in data transformation)
    { label: "Name", key: "patient_name" },
    { label: "Phone", key: "phone" },
    { label: "Diseases", key: "disease" },
    { label: "Assigned To", key: "assigned_to.name" }, // Nested object access
    { label: "Contact Date", key: "contact_date" },
    { label: "Relation", key: "relation" },
    { label: "Visiting Location", key: "location" },
  ];

  // Transform data to include index and handle nested fields
  const transformedCsvData = filteredProspects.map((prospect, index) => ({
    index: index + 1,
    patient_name: prospect.patient_name || "Not Available",
    phone: `'${prospect.phone?.replace("whatsapp:", "") || "-"}`,
    disease: prospect.disease || "Not Available",
    "assigned_to.name": prospect.assigned_to?.name || "Not Available",
    contact_date: prospect.contact_date
      ? new Date(prospect.contact_date).toLocaleDateString()
      : "Not Available",
    relation: prospect.relation || "Not Available",
    location: prospect.location || "Not Available",
  }));

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Prospect Management</h1>
        {/* Use reusable ExportCSVButton with transformed data */}
        <ExportCSVButton
          data={transformedCsvData}
          headers={csvHeaders}
          filename="prospects.csv"
        />
      </div>
      <div className="  gap-4 py-4 ">
        <div className="flex-1 min-w-[200px] max-w-md">
          {/* Search functionality can be added here if needed */}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Disease:</span>
          <DiseasesSort 
            selectedDisease={selectedDisease} 
            onDiseaseChange={setSelectedDisease} 
            className="min-w-[200px]"
          />
        </div>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm text-left">
          <thead className="bg-gray-50 text-text-secondary">
            <tr>
              <th className="p-4 font-semibold">#</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Phone</th>
              <th className="p-4 font-semibold">Diseases</th>
              <th className="p-4 font-semibold">Assigned To</th>
              <th className="p-4 font-semibold">Contact Date</th>
              <th className="p-4 font-semibold">Relation</th>
              <th className="p-4 font-semibold">Visiting Location</th>
              <th className="p-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProspects.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-6 text-center">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-md">
                    {/* <p className="text-gray-600 font-medium text-lg">No Data Found</p>
                    <p className="text-gray-500 text-sm mt-1"> */}
                      {/* No prospects available. Please check back later or add new prospects. */}
                      <EmptyState
                      title={"No Data Found"}
                      description={"No prospects available. Please check back later or add new prospects."}
                      icon={FileSearch}
                      />
                    {/* </p> */}
                  </div>
                </td>
              </tr>
            ) : (
              filteredProspects.map((prospect, index) => (
                <motion.tr
                  key={index}
                  className="border-b last:border-0 hover:bg-gray-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="p-4 font-medium text-text-primary">
                    {getIndex(filteredProspects, prospect, false)}
                  </td>
                  <td className="p-4 font-medium text-text-primary">
                    {editProspect?.conversation_id === prospect.conversation_id ? (
                      <input
                        type="text"
                        name="patient_name"
                        value={editForm.patient_name}
                        onChange={handleInputChange}
                        className="border rounded-lg px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      toCamelCase(prospect.patient_name || "Not Available")
                    )}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {prospect.phone
                      ? prospect.phone.replace("whatsapp:", "")
                      : "Not Available"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {editProspect?.conversation_id === prospect.conversation_id ? (
                      <input
                        type="text"
                        name="disease"
                        value={editForm.disease}
                        onChange={handleInputChange}
                        className="border rounded-lg px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      toCamelCase(prospect.disease || "Not Available")
                    )}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {prospect.assigned_to?.name || "Not Available"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {prospect.contact_date
                      ? new Date(prospect.contact_date).toLocaleDateString()
                      : "Not Available"}
                  </td>
                  <td className="p-4 text-text-secondary">{prospect.relation || "Not Available"}</td>
                  <td className="p-4 text-text-secondary">{prospect.location || "Not Available"}</td>
                  <td className="p-4 flex items-center gap-2">
                    {editProspect?.conversation_id === prospect.conversation_id ? (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSaveUpdate}
                          className="px-3 py-1 text-sm"
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCancel}
                          className="px-3 py-1 text-sm"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(prospect)}
                        className="px-2 py-1 text-sm"
                      >
                        ✏️
                      </Button>
                    )}
                    <select
                      className="border rounded-lg px-3 py-2 text-sm bg-surface"
                      value={
                        selectedProspect?.conversation_id === prospect.conversation_id
                          ? selectedAction
                          : ""
                      }
                      onChange={(e) => handleActionChange(prospect, e.target.value)}
                    >
                      <option value="">select</option>
                      <option value="convert">Convert to Lead</option>
                    </select>
                    {selectedProspect?.conversation_id === prospect.conversation_id && selectedAction && (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleUpdate}
                          className="px-3 py-1 text-sm"
                        >
                          Update
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCancel}
                          className="px-3 py-1 text-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    {rowErrors[prospect.conversation_id] && (
                      <span className="text-red-600 text-xs mt-1">
                        {rowErrors[prospect.conversation_id]}
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default Prospects;