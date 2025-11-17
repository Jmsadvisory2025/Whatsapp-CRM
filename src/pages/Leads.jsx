import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import DiseasesSort from "../components/ui/DiseasesSort";
import LocationsSort from "../components/ui/LocationsSort";
import { filterByDisease } from "../utils/diseaseFilter";
import { filterByLocation } from "../utils/locationFilter";
import LeadCard from "../components/LeadCard";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConfirmedLeads,
  convertToPatient,
  updateLeadAction,
  updateLeadActionWithReminder,
} from "../store/leadsSlice";
import { motion } from "framer-motion";
import SearchInput from "../components/ui/SearchInput";
import { getIndex, toCamelCase } from "../hooks/utils";
import ExportCSVButton from "../components/ui/ExportCSVButton";
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";
import { MdEdit } from "react-icons/md";
import EmptyState from "../components/ui/EmptyState";
import { FileSearch, Stethoscope, UserCheck, Activity, Calendar, FileImage } from "lucide-react";
import SimplePagination from "../components/ui/SimplePagination";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Leads = () => {
  const dispatch = useDispatch();
  const { leads, pagination, isLoading, error } = useSelector((state) => state.leads);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDisease, setSelectedDisease] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [editLead, setEditLead] = useState(null);
  const [editForm, setEditForm] = useState({
    disease: "",
    visit_date: "",
    visit_time: "",
    relation: "",
    status: "",
    reminder_note: "",
  });
  // State to track action and reminder note for each lead
  const [actionStates, setActionStates] = useState({});
  // State for lead card modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadCard, setShowLeadCard] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100; // Fixed to 100 as per API

  useEffect(() => {
    dispatch(fetchConfirmedLeads());
  }, [dispatch]);

  const filteredLeads = leads.filter(
    (lead) =>
      (lead.patient_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (lead.phone?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (lead.disease?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (lead.status?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (lead.reminder_note?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      )
  ).filter(
    (lead) => filterByDisease([lead], selectedDisease).length > 0
  ).filter(
    (lead) => filterByLocation([lead], selectedLocation).length > 0
  );

  // Filter today's leads
  const todaysLeads = filteredLeads.filter(lead => {
    if (lead.visit_date && lead.visit_date !== "-") {
      try {
        const leadDate = new Date(lead.visit_date).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        return leadDate === today;
      } catch (error) {
        return false;
      }
    }
    return false;
  });

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

  const handleEditClick = (lead) => {
    setEditLead(lead);
    setEditForm({
      disease: lead.disease || "",
      visit_date: lead.visit_date || "",
      visit_time: lead.visit_time || "",
      relation: lead.relation || "",
      status: lead.status || "",
      reminder_note: lead.reminder_note || "",
    });
  };

  const handleSaveAction = () => {
    if (editLead) {
      const payload = {
        conversation_id: editLead.conversation_id,
        phone: editLead.phone,
        disease: editForm.disease,
        visit_date: editForm.visit_date,
        visit_time: editForm.visit_time,
        relation: editForm.relation,
        status: editForm.status,
        reminder_date: null,
        reminder_type: null,
        reminder_note: editForm.reminder_note || undefined,
      };
      dispatch(updateLeadAction(payload)).then(() => {
        // Refetch the current page data instead of full reload
        dispatch(fetchConfirmedLeads(pagination.next || pagination.previous ? 
          (currentPage === 1 ? undefined : `${API_BASE_URL}/api/v1/leads/confirmed/?page=${currentPage}`) 
          : undefined));
      });
      setEditLead(null);
      setEditForm({
        disease: "",
        visit_date: "",
        visit_time: "",
        relation: "",
        status: "",
        reminder_note: "",
      });
    }
  };

  const handleCancel = () => {
    setEditLead(null);
    setEditForm({
      disease: "",
      visit_date: "",
      visit_time: "",
      relation: "",
      status: "",
      reminder_note: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleActionChange = (lead, value) => {
    if (value === "convert") {
      if (window.confirm(`Convert ${lead.patient_name} to patient?`)) {
        dispatch(
          convertToPatient({ conversation_id: lead.conversation_id })
        ).then(() => {
          // Refetch the current page data instead of full reload
          dispatch(fetchConfirmedLeads(pagination.next || pagination.previous ? 
            (currentPage === 1 ? undefined : `${API_BASE_URL}/api/v1/leads/confirmed/?page=${currentPage}`) 
            : undefined));
        });
      }
      return;
    }

    // Update action state for the specific lead
    setActionStates((prev) => ({
      ...prev,
      [lead.conversation_id]: {
        action: value,
        reminder_note: prev[lead.conversation_id]?.reminder_note || "",
      },
    }));
  };

  const handleReminderNoteChange = (e, conversation_id) => {
    const { value } = e.target;
    setActionStates((prev) => ({
      ...prev,
      [conversation_id]: {
        ...prev[conversation_id],
        reminder_note: value,
      },
    }));
  };

  const handleSubmitAction = (lead) => {
    const actionState = actionStates[lead.conversation_id];
    if (actionState && actionState.action) {
      let actionValue = "";
      switch (actionState.action) {
        case "in 3 days":
          actionValue = "in_3_days";
          break;
        case "in 7 days":
          actionValue = "in_7_days";
          break;
        case "in 15 days":
          actionValue = "in_15_days";
          break;
        case "in 1 month":
          actionValue = "in_1_month";
          break;
        case "not interested":
          actionValue = "not_interested";
          break;
        default:
          return;
      }

      const payload = {
        conversation_id: lead.conversation_id,
        action: actionValue,
        reminder_note: actionState.reminder_note || undefined,
      };
      dispatch(updateLeadActionWithReminder(payload)).then(() => {
        // Refetch the current page data instead of full reload
        dispatch(fetchConfirmedLeads(pagination.next || pagination.previous ? 
          (currentPage === 1 ? undefined : `${API_BASE_URL}/api/v1/leads/confirmed/?page=${currentPage}`) 
          : undefined));
      });
      // Clear the action state after submission
      setActionStates((prev) => {
        const newStates = { ...prev };
        delete newStates[lead.conversation_id];
        return newStates;
      });
    }
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setShowLeadCard(true);
  };

  const handleCloseLeadCard = () => {
    setShowLeadCard(false);
    setSelectedLead(null);
  };

  // CSV export data and headers for Leads
  const csvHeaders = [
    { label: "#", key: "index" },
    { label: "Name", key: "patient_name" },
    { label: "Phone", key: "phone" },
    { label: "Diseases", key: "disease" },
    { label: "Assigned To", key: "assigned_to.name" },
    { label: "Location", key: "location" },
    { label: "Status", key: "status" },
    { label: "Visit Date", key: "visit_date" },
    { label: "Visit Time", key: "visit_time" },
    { label: "Relation", key: "relation" },
    { label: "Reminder Note", key: "reminder_note" },
  ];

  const transformedCsvData = filteredLeads.map((lead, index) => ({
    index: getIndex(filteredLeads, lead, true),
    patient_name: toCamelCase(lead.patient_name) || "-",
    phone: `'${lead.phone?.replace("whatsapp:", "") || "-"}`,
    disease: toCamelCase(lead.disease) || "-",
    "assigned_to.name": lead.assigned_to?.name || "-",
    location: lead.location || "-",
    status: lead.status || "-",
    visit_date: lead.visit_date ? lead.visit_date : "-",
    visit_time: lead.visit_time ? lead.visit_time : "-",
    relation: lead.relation || "-",
    reminder_note: lead.reminder_note || "-",
  }));

  if (isLoading)
    return (
      <div className="text-center py-10">
        <LoaderDemo />
      </div>
    );
  if (error)
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lead Management</h1>
              <p className="text-sm text-gray-600 mt-0.5">Track and manage patient leads</p>
            </div>
          </div>

          {/* Stats and Export */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">{pagination.count}</span>
              <span className="text-sm text-gray-600">Total Leads</span>
            </div>
            {/* <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">{todaysLeads.length}</span>
              <span className="text-sm text-gray-600">Today's Leads</span>
            </div> */}
            <ExportCSVButton
              data={transformedCsvData}
              headers={csvHeaders}
              filename="leads.csv"
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
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[50px]">#</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[150px]">Name</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[130px]">Phone</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[140px]">Disease</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[80px]">Assets</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[130px]">Assigned To</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">Location</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[110px]">Status</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">Visit Date</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">Visit Time</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">Relation</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[150px]">Reminder Note</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[220px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="13" className="p-8">
                    <EmptyState
                      title="No Leads Found"
                      description="No leads match your current filters."
                      icon={FileSearch}
                    />
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, index) => (
                  <motion.tr
                    key={lead.conversation_id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => {
                      // Don't trigger card if clicking on action buttons/inputs or if lead is being edited
                      if (e.target.closest('.action-column') || editLead?.conversation_id === lead.conversation_id) return;
                      handleLeadClick(lead);
                    }}
                  >
                    <td className="px-3 py-3 text-gray-600 font-medium text-sm whitespace-nowrap">
                      {(currentPage - 1) * itemsPerPage + getIndex(filteredLeads, lead, true)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="font-medium text-gray-900 text-sm">
                        {toCamelCase(lead.patient_name) || "No Data Found"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {lead.phone?.replace("whatsapp:", "") || "No Data Found"}
                    </td>
                    <td className="px-3 py-3">
                      {editLead?.conversation_id === lead.conversation_id ? (
                        <input
                          type="text"
                          name="disease"
                          value={editForm.disease}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[120px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200 whitespace-nowrap">
                          {toCamelCase(lead.disease) || "No Data Found"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {lead.photo_url ? (
                        <div className="flex items-center justify-center">
                          <img 
                            src={lead.photo_url} 
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
                      {lead.assigned_to?.name || "Not Assigned"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                      {lead.location || "Not Specified"}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm">
                      {editLead?.conversation_id === lead.conversation_id ? (
                        <input
                          type="text"
                          name="status"
                          value={editForm.status}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[90px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full whitespace-nowrap">
                          {lead.status || "No Data Found"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm">
                      {editLead?.conversation_id === lead.conversation_id ? (
                        <input
                          type="date"
                          name="visit_date"
                          value={editForm.visit_date}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[110px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span className="whitespace-nowrap">{lead.visit_date || "Not Scheduled"}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm">
                      {editLead?.conversation_id === lead.conversation_id ? (
                        <input
                          type="time"
                          name="visit_time"
                          value={editForm.visit_time}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[110px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span className="whitespace-nowrap">{lead.visit_time || "Not Scheduled"}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm">
                      {editLead?.conversation_id === lead.conversation_id ? (
                        <input
                          type="text"
                          name="relation"
                          value={editForm.relation}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[110px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span className="whitespace-nowrap">{lead.relation || "Not Specified"}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-sm max-w-[150px]">
                      {editLead?.conversation_id === lead.conversation_id ? (
                        <input
                          type="text"
                          name="reminder_note"
                          value={editForm.reminder_note}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[110px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span className="truncate block">{lead.reminder_note || "-"}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1 flex-wrap action-column">
                        {editLead?.conversation_id === lead.conversation_id ? (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveAction();
                              }}
                              className="px-2 py-1 text-xs"
                            >
                              Save
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel();
                              }}
                              className="px-2 py-1 text-xs"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(lead);
                              }}
                              className="px-2 py-1 text-xs"
                            >
                              ✏️
                            </Button>
                            <div className="flex items-center gap-1">
                              <select
                                className="border border-gray-300 rounded px-2 py-1 text-xs bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleActionChange(lead, e.target.value);
                                }}
                                value={
                                  actionStates[lead.conversation_id]?.action || ""
                                }
                              >
                                <option value="">Select</option>
                                <option value="convert">Convert</option>
                                <option value="in 3 days">3 days</option>
                                <option value="in 7 days">7 days</option>
                                <option value="in 15 days">15 days</option>
                                <option value="in 1 month">1 month</option>
                                <option value="not interested">Not Interested</option>
                              </select>
                              {actionStates[lead.conversation_id]?.action &&
                                actionStates[lead.conversation_id].action !==
                                  "convert" && (
                                  <>
                                    <input
                                      type="text"
                                      value={
                                        actionStates[lead.conversation_id]
                                          ?.reminder_note || ""
                                      }
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleReminderNoteChange(
                                          e,
                                          lead.conversation_id
                                        );
                                      }}
                                      className="border border-gray-300 rounded px-2 py-1 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Note"
                                    />
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubmitAction(lead);
                                      }}
                                      className="px-2 py-1 text-xs"
                                    >
                                      Submit
                                    </Button>
                                  </>
                                )}
                            </div>
                          </>
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

      {/* Lead Card Component */}
      <LeadCard
        lead={selectedLead}
        isOpen={showLeadCard}
        onClose={handleCloseLeadCard}
        onEdit={handleEditClick}
      />
    </div>
  );
};

export default Leads;