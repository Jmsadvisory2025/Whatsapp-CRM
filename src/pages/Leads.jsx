import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LocationsSort from "../components/ui/LocationsSort";
import { filterByLocation } from "../utils/locationFilter";
import LeadCard from "../components/LeadCard";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConfirmedLeads,
  closeLead,
  updateLeadAction,
  updateLeadActionWithReminder,
} from "../store/leadsSlice";
import { motion } from "framer-motion";
import SearchInput from "../components/ui/SearchInput";
import { getIndex, toCamelCase } from "../hooks/utils";
import ExportCSVButton from "../components/ui/ExportCSVButton";
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";
import EmptyState from "../components/ui/EmptyState";
import {
  FileSearch,
  AlertCircle,
  Activity,
  Calendar,
  FileImage,
  Tag,
} from "lucide-react";
import SimplePagination from "../components/ui/SimplePagination";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Leads = () => {
  const dispatch = useDispatch();
  const { leads, pagination, isLoading, error } = useSelector(
    (state) => state.leads
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [editLead, setEditLead] = useState(null);
  const [editForm, setEditForm] = useState({
    interest: "",
    visit_date: "",
    visit_time: "",
    relation: "",
    status: "",
    reminder_note: "",
  });
  const [actionStates, setActionStates] = useState({});
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadCard, setShowLeadCard] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  useEffect(() => {
    dispatch(fetchConfirmedLeads());
  }, [dispatch]);

  // Resolve the display name of a lead (backend may use either field name)
  const getContactName = (lead) =>
    lead.contact_name || lead.patient_name || "";

  const getInterest = (lead) => lead.interest || lead.disease || "";

  const filteredLeads = leads
    .filter((lead) => {
      const q = searchQuery.toLowerCase();
      return (
        (getContactName(lead).toLowerCase() || "").includes(q) ||
        (lead.phone?.toLowerCase() || "").includes(q) ||
        (getInterest(lead).toLowerCase() || "").includes(q) ||
        (lead.status?.toLowerCase() || "").includes(q) ||
        (lead.reminder_note?.toLowerCase() || "").includes(q)
      );
    })
    .filter((lead) => {
      if (selectedInterest === "all") return true;
      return getInterest(lead).toLowerCase() === selectedInterest.toLowerCase();
    })
    .filter((lead) => filterByLocation([lead], selectedLocation).length > 0);

  const todaysLeads = filteredLeads.filter((lead) => {
    if (lead.created_at) {
      try {
        const leadDate = new Date(lead.created_at).toISOString().split("T")[0];
        const today = new Date().toISOString().split("T")[0];
        return leadDate === today;
      } catch {
        return false;
      }
    }
    return false;
  });

  // Unique interests for filter dropdown
  const allInterests = [
    ...new Set(leads.map((l) => getInterest(l)).filter(Boolean)),
  ];

  const handleNextPage = () => {
    if (pagination.next) {
      dispatch(fetchConfirmedLeads(pagination.next));
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      dispatch(fetchConfirmedLeads(pagination.previous));
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  };

  const handleEditClick = (lead) => {
    setEditLead(lead);
    setEditForm({
      interest: getInterest(lead),
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
        interest: editForm.interest,
        visit_date: editForm.visit_date,
        visit_time: editForm.visit_time,
        relation: editForm.relation,
        status: editForm.status,
        reminder_date: null,
        reminder_type: null,
        reminder_note: editForm.reminder_note || undefined,
      };
      dispatch(updateLeadAction(payload)).then(() => {
        dispatch(
          fetchConfirmedLeads(
            pagination.next || pagination.previous
              ? currentPage === 1
                ? undefined
                : `${API_BASE_URL}/api/v1/leads/confirmed/?page=${currentPage}`
              : undefined
          )
        );
      });
      setEditLead(null);
      setEditForm({
        interest: "",
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
      interest: "",
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
    if (value === "closed_won") {
      if (
        window.confirm(
          `Mark "${getContactName(lead)}" as Closed / Won and remove from active leads?`
        )
      ) {
        dispatch(closeLead({ conversation_id: lead.conversation_id })).then(
          () => {
            dispatch(
              fetchConfirmedLeads(
                pagination.next || pagination.previous
                  ? currentPage === 1
                    ? undefined
                    : `${API_BASE_URL}/api/v1/leads/confirmed/?page=${currentPage}`
                  : undefined
              )
            );
          }
        );
      }
      return;
    }

    setActionStates((prev) => ({
      ...prev,
      [lead.conversation_id]: {
        action: value,
        reminder_note: prev[lead.conversation_id]?.reminder_note || "",
      },
    }));
  };

  const handleReminderNoteChange = (e, conversation_id) => {
    setActionStates((prev) => ({
      ...prev,
      [conversation_id]: {
        ...prev[conversation_id],
        reminder_note: e.target.value,
      },
    }));
  };

  const handleSubmitAction = (lead) => {
    const actionState = actionStates[lead.conversation_id];
    if (actionState && actionState.action) {
      const actionMap = {
        "in 3 days": "in_3_days",
        "in 7 days": "in_7_days",
        "in 15 days": "in_15_days",
        "in 1 month": "in_1_month",
        "not interested": "not_interested",
      };
      const actionValue = actionMap[actionState.action];
      if (!actionValue) return;

      dispatch(
        updateLeadActionWithReminder({
          conversation_id: lead.conversation_id,
          action: actionValue,
          reminder_note: actionState.reminder_note || undefined,
        })
      ).then(() => {
        dispatch(
          fetchConfirmedLeads(
            pagination.next || pagination.previous
              ? currentPage === 1
                ? undefined
                : `${API_BASE_URL}/api/v1/leads/confirmed/?page=${currentPage}`
              : undefined
          )
        );
      });
      setActionStates((prev) => {
        const s = { ...prev };
        delete s[lead.conversation_id];
        return s;
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

  // CSV export
  const csvHeaders = [
    { label: "#", key: "index" },
    { label: "Name", key: "contact_name" },
    { label: "Phone", key: "phone" },
    { label: "Interest / Service", key: "interest" },
    { label: "Assigned To", key: "assigned_to" },
    { label: "Location", key: "location" },
    { label: "Status", key: "status" },
    { label: "Follow-up Date", key: "visit_date" },
    { label: "Follow-up Time", key: "visit_time" },
    { label: "Relation", key: "relation" },
    { label: "Reminder Note", key: "reminder_note" },
  ];

  const transformedCsvData = filteredLeads.map((lead) => ({
    index: getIndex(filteredLeads, lead, true),
    contact_name: toCamelCase(getContactName(lead)) || "-",
    phone: `'${lead.phone?.replace("whatsapp:", "") || "-"}`,
    interest: toCamelCase(getInterest(lead)) || "-",
    assigned_to: lead.assigned_to?.name || "-",
    location: lead.location || "-",
    status: lead.status || "-",
    visit_date: lead.visit_date || "-",
    visit_time: lead.visit_time || "-",
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
        <div className="flex text-red-700 gap-3 text-xl font-medium">
          <AlertCircle color="#b91c1c" size={35} className="animate-bounce" />
          {error}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Lead Management
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Contacts with complete chatbot conversations — ready for follow-up
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">
                {pagination.count}
              </span>
              <span className="text-sm text-gray-600">Total Leads</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">
                {todaysLeads.length}
              </span>
              <span className="text-sm text-gray-600">Today's Leads</span>
            </div>
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
        {/* Filters */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4">
            <div className="flex-1 min-w-full lg:min-w-[280px] lg:max-w-md">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Search
              </label>
              <SearchInput
                placeholder="Name, phone, interest, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Interest / Service filter */}
              <div className="min-w-full sm:min-w-[200px]">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Interest / Service
                </label>
                <select
                  value={selectedInterest}
                  onChange={(e) => setSelectedInterest(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Interests</option>
                  {allInterests.map((i) => (
                    <option key={i} value={i}>
                      {toCamelCase(i)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-full sm:min-w-[200px]">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Location
                </label>
                <LocationsSort
                  selectedLocation={selectedLocation}
                  onLocationChange={setSelectedLocation}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[50px]">
                      ID
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[150px] max-w-[150px]">
                      Name
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[130px]">
                      Phone
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[140px]">
                      Interest / Service
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[80px]">
                      Assets
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">
                      Contact Date
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[130px]">
                      Assigned To
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">
                      Location
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[110px]">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">
                      Follow-up Date
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">
                      Follow-up Time
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[120px]">
                      Relation
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[150px]">
                      Reminder Note
                    </th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 text-xs uppercase whitespace-nowrap min-w-[220px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan="14" className="p-8">
                        <EmptyState
                          title="No Leads Found"
                          description="No leads match your current filters."
                          icon={FileSearch}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const isEditing =
                        editLead?.conversation_id === lead.conversation_id;
                      const displayName = toCamelCase(getContactName(lead));
                      const displayInterest = toCamelCase(getInterest(lead));

                      return (
                        <motion.tr
                          key={lead.conversation_id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          onClick={(e) => {
                            if (
                              e.target.closest(".action-column") ||
                              isEditing
                            )
                              return;
                            handleLeadClick(lead);
                          }}
                        >
                          <td className="px-3 py-3 text-gray-600 font-medium text-sm whitespace-nowrap">
                            {(currentPage - 1) * itemsPerPage +
                              getIndex(filteredLeads, lead, true)}
                          </td>

                          {/* Name */}
                          <td className="px-3 py-3 min-w-[150px] max-w-[150px]">
                            <span
                              className="font-medium text-gray-900 text-sm block truncate"
                              title={displayName || "No Data Found"}
                            >
                              {displayName || "No Data Found"}
                            </span>
                          </td>

                          {/* Phone */}
                          <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                            {lead.phone
                              ? `+${lead.phone
                                  .replace("whatsapp:", "")
                                  .replace(/^\+/, "")}`
                              : "No Data Found"}
                          </td>

                          {/* Interest / Service */}
                          <td className="px-3 py-3">
                            {isEditing ? (
                              <input
                                type="text"
                                name="interest"
                                value={editForm.interest}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[120px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200 whitespace-nowrap">
                                {displayInterest || "No Data Found"}
                              </span>
                            )}
                          </td>

                          {/* Assets */}
                          <td className="px-3 py-3">
                            {lead.photo_url ? (
                              <div className="flex items-center justify-center">
                                <img
                                  src={lead.photo_url}
                                  alt="Lead asset"
                                  className="w-10 h-10 object-cover rounded-md border border-gray-200"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
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

                          {/* Contact Date */}
                          <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                            {lead.created_at
                              ? new Date(lead.created_at)
                                  .toLocaleDateString("en-GB")
                                  .replace(/\//g, "-")
                              : "-"}
                          </td>

                          {/* Assigned To */}
                          <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                            {lead.assigned_to?.name || "Not Assigned"}
                          </td>

                          {/* Location */}
                          <td className="px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                            {lead.location || "Not Specified"}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-3 text-gray-600 text-sm">
                            {isEditing ? (
                              <input
                                type="text"
                                name="status"
                                value={editForm.status}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[90px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full whitespace-nowrap">
                                {lead.status || "New"}
                              </span>
                            )}
                          </td>

                          {/* Follow-up Date */}
                          <td className="px-3 py-3 text-gray-600 text-sm">
                            {isEditing ? (
                              <input
                                type="date"
                                name="visit_date"
                                value={editForm.visit_date}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[110px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="whitespace-nowrap">
                                {lead.visit_date
                                  ? new Date(lead.visit_date)
                                      .toLocaleDateString("en-GB")
                                      .replace(/\//g, "-")
                                  : "Not Scheduled"}
                              </span>
                            )}
                          </td>

                          {/* Follow-up Time */}
                          <td className="px-3 py-3 text-gray-600 text-sm">
                            {isEditing ? (
                              <input
                                type="time"
                                name="visit_time"
                                value={editForm.visit_time}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[110px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="whitespace-nowrap">
                                {lead.visit_time || "Not Scheduled"}
                              </span>
                            )}
                          </td>

                          {/* Relation */}
                          <td className="px-3 py-3 text-gray-600 text-sm">
                            {isEditing ? (
                              <input
                                type="text"
                                name="relation"
                                value={editForm.relation}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[110px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="whitespace-nowrap">
                                {lead.relation || "Not Specified"}
                              </span>
                            )}
                          </td>

                          {/* Reminder Note */}
                          <td className="px-3 py-3 text-gray-600 text-sm max-w-[150px]">
                            {isEditing ? (
                              <input
                                type="text"
                                name="reminder_note"
                                value={editForm.reminder_note}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded px-2 py-1 text-xs min-w-[110px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="truncate block">
                                {lead.reminder_note || "-"}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center gap-1 flex-wrap action-column">
                              {isEditing ? (
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
                                      className="border border-gray-300 rounded px-2 py-1 text-xs bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleActionChange(lead, e.target.value);
                                      }}
                                      value={
                                        actionStates[lead.conversation_id]
                                          ?.action || ""
                                      }
                                    >
                                      <option value="">Select</option>
                                      <option value="closed_won">
                                        Closed / Won ✅
                                      </option>
                                      <option value="in 3 days">3 days</option>
                                      <option value="in 7 days">7 days</option>
                                      <option value="in 15 days">15 days</option>
                                      <option value="in 1 month">1 month</option>
                                      <option value="not interested">
                                        Not Interested
                                      </option>
                                    </select>
                                    {actionStates[lead.conversation_id]
                                      ?.action &&
                                      actionStates[lead.conversation_id]
                                        .action !== "closed_won" && (
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
                                            className="border border-gray-300 rounded px-2 py-1 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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