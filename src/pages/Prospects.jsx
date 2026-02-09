import React, { useEffect, useState, useRef } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SearchInput from "../components/ui/SearchInput";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProspects,
  convertProspectToLead,
  resetAction,
  updateProspect,
  setProspectsError,
  clearProspectsError,
  searchProspects,
} from "../store/prospectsSlice";
import { motion } from "framer-motion";
import { getIndex, toCamelCase } from "../hooks/utils";
import ExportCSVButton from "../components/ui/ExportCSVButton";
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";
import EmptyState from "../components/ui/EmptyState";
import { FileSearch, Stethoscope, UserCheck, Activity, Calendar, MapPin, Phone, User, Pencil, Check, X } from "lucide-react";
import SimplePagination from "../components/ui/SimplePagination";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Prospects = () => {
  const dispatch = useDispatch();
  const { prospects, pagination, isLoading, error, isSearching } = useSelector((state) => state.prospects);
  console.log(pagination);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [editProspect, setEditProspect] = useState(null);
  const [editForm, setEditForm] = useState({ patient_name: "", disease: "", notes: "" });
  const [rowErrors, setRowErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100; // Fixed to 100 as per API

  useEffect(() => {
    dispatch(fetchProspects());
    
    // Cleanup function to clear timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [dispatch]);
  
  const handleActionChange = (prospect, value) => {
    setSelectedProspect(prospect);
    setSelectedAction(value);

    if (value === "convert") {
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
    setEditForm({ patient_name: "", disease: "", notes: "" });
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
      notes: prospect.notes || "",
    });
  };

  const handleSaveUpdate = () => {
    if (editProspect) {
      dispatch(
        updateProspect({
          conversation_id: editProspect.conversation_id,
          patient_name: editForm.patient_name,
          disease: editForm.disease,
          notes: editForm.notes,
        })
      ).then(() => {
        // Refetch the current page data instead of full reload
        dispatch(fetchProspects(pagination.next || pagination.previous ?
          (currentPage === 1 ? undefined : `${API_BASE_URL}/api/v1/leads/prospects/?page=${currentPage}`)
          : undefined));
      });
      setEditProspect(null);
      setEditForm({ patient_name: "", disease: "", notes: "" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle next page using API's next URL
  const handleNextPage = () => {
    if (pagination.next) {
      dispatch(fetchProspects(pagination.next));
      setCurrentPage(prev => prev + 1);
    }
  };

  // Handle previous page using API's previous URL
  const handlePreviousPage = () => {
    if (pagination.previous) {
      dispatch(fetchProspects(pagination.previous));
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  };

  if (isLoading && !isSearching) return <div className="text-center py-10"><LoaderDemo/></div>;
  if (error)
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-10 mt-20 px-4 text-center max-w-xl mx-auto bg-red-50 border border-red-200 rounded-xl shadow-sm">
       <div className="flex text-red-700 gap-3 text-xl font-medium"><Stethoscope color="#b91c1c" size={35} className="animate-bounce"/> {error}</div>
      </div>
    );

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Use prospects from API search or regular fetch
  const filteredProspects = prospects;

  // Filter today's prospects
  const todaysProspects = filteredProspects.filter(prospect => {
    if (prospect.contact_date && prospect.contact_date !== "-") {
      try {
        const prospectDate = new Date(prospect.contact_date).toISOString().split('T')[0];
        return prospectDate === getTodayDate();
      } catch (error) {
        return false;
      }
    }
    return false;
  });

  const csvHeaders = [
    { label: "#", key: "index" },
    { label: "Name", key: "patient_name" },
    { label: "Phone", key: "phone" },
    { label: "Diseases", key: "disease" },
    { label: "Assigned To", key: "assigned_to.name" },
    { label: "Contact Date", key: "contact_date" },
    { label: "Relation", key: "relation" },
    { label: "Visiting Location", key: "location" },
  ];

  const transformedCsvData = filteredProspects.map((prospect, index) => ({
    index: index + 1,
    patient_name: prospect.patient_name || "Not Available",
    phone: `'${prospect.phone?.replace("whatsapp:", "") || "-"}`,
    disease: prospect.disease || "Not Available",
    "assigned_to.name": typeof prospect.assigned_to === 'object' && prospect.assigned_to !== null
      ? prospect.assigned_to.name || "Not Available"
      : prospect.assigned_to || "Not Available",
    contact_date: prospect.contact_date
      ? new Date(prospect.contact_date).toLocaleDateString()
      : "Not Available",
    relation: prospect.relation || "Not Available",
    location: prospect.location || "Not Available",
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            {/* <div className="p-3 bg-blue-600 rounded-lg shadow-md">
              <UserCheck className="h-6 w-6 text-white" />
            </div> */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Prospect Management</h1>
              <p className="text-sm text-gray-600 mt-0.5">Track and manage patient prospects</p>
            </div>
          </div>

          {/* Stats and Export */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">{pagination.count}</span>
              <span className="text-sm text-gray-600">Total Prospects</span>
            </div>
            {!isSearching && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-gray-900">{todaysProspects.length}</span>
                <span className="text-sm text-gray-600">Today's Prospects</span>
              </div>
            )}
            <ExportCSVButton
              data={transformedCsvData}
              headers={csvHeaders}
              filename="prospects.csv"
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
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  
                  // Clear previous timeout
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }
                  
                  // Clear search if input is empty
                  if (value === "") {
                    dispatch(fetchProspects());
                    setCurrentPage(1);
                  } else {
                    // Perform search with debounce (500ms delay)
                    searchTimeoutRef.current = setTimeout(() => {
                      dispatch(searchProspects(value));
                    }, 500);
                  }
                }}
              />
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
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[140px]">Disease</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[130px]">Assigned To</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">Contact Date</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">Relation</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">Location</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">Notes</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[200px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
              {filteredProspects.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8">
                    <EmptyState
                      title="No Prospects Found"
                      description="No prospects match your current filters."
                      icon={FileSearch}
                    />
                  </td>
                </tr>
              ) : (
                filteredProspects.map((prospect, index) => (
                  <motion.tr
                    key={prospect.conversation_id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="px-3 py-3 text-gray-600 font-medium text-sm whitespace-nowrap">
                      {(currentPage - 1) * itemsPerPage + getIndex(filteredProspects, prospect, false)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {editProspect?.conversation_id === prospect.conversation_id ? (
                        <input
                          type="text"
                          name="patient_name"
                          value={editForm.patient_name}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span className="font-medium text-gray-900 text-sm">
                          {toCamelCase(prospect.patient_name || prospect.customer_name || "Not Available")}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {prospect.phone ? prospect.phone.replace("whatsapp:", "") : "Not Available"}
                    </td>
                    <td className="px-3 py-3">
                      {editProspect?.conversation_id === prospect.conversation_id ? (
                        <input
                          type="text"
                          name="disease"
                          value={editForm.disease}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200 whitespace-nowrap">
                          {toCamelCase(prospect.disease || "Not Available")}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {typeof prospect.assigned_to === 'object' && prospect.assigned_to !== null
                        ? prospect.assigned_to.name || "Not Available"
                        : prospect.assigned_to || "Not Available"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {prospect.contact_date
                        ? new Date(prospect.contact_date).toLocaleDateString()
                        : "Not Available"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">{prospect.relation || "Not Available"}</td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">{prospect.location || "Not Available"}</td>
                    <td className="px-3 py-3">
                      {editProspect?.conversation_id === prospect.conversation_id ? (
                        <input
                          type="text"
                          name="notes"
                          value={editForm.notes}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span className="text-gray-600 text-sm whitespace-nowrap">
                          {prospect.notes || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {editProspect?.conversation_id === prospect.conversation_id ? (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleSaveUpdate}
                              className="px-2 py-1 text-xs"
                            >
                              Save
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleCancel}
                              className="px-2 py-1 text-xs"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(prospect)}
                            className="px-2 py-1 text-xs"
                          >
                            ✏️
                          </Button>
                        )}
                        <select
                          className="border border-gray-300 rounded px-2 py-1 text-xs bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                          value={
                            selectedProspect?.conversation_id === prospect.conversation_id
                              ? selectedAction
                              : ""
                          }
                          onChange={(e) => handleActionChange(prospect, e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="convert">Convert to Lead</option>
                        </select>
                        {selectedProspect?.conversation_id === prospect.conversation_id && selectedAction && (
                          <div className="flex gap-1 w-full mt-1">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleUpdate}
                              className="flex-1 px-2 py-1 text-xs"
                            >
                              Update
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleCancel}
                              className="flex-1 px-2 py-1 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        {rowErrors[prospect.conversation_id] && (
                          <div className="w-full mt-1 text-xs text-red-600 text-center">
                            {rowErrors[prospect.conversation_id]}
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
            </div>
          </div>
        </div>
        
        {/* Simple Pagination Component */}
        {!isSearching && (
          <SimplePagination
            next={pagination.next}
            previous={pagination.previous}
            onNext={handleNextPage}
            onPrevious={handlePreviousPage}
            totalItems={pagination.count}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
        )}
      </Card>
    </div>
  );
};

export default Prospects;
