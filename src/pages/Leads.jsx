import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
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
import { FileImage, FileSearch, Stethoscope } from "lucide-react";

const Leads = () => {
  const dispatch = useDispatch();
  const { leads, isLoading, error } = useSelector((state) => state.leads);
  const [searchQuery, setSearchQuery] = useState("");
  const [leadList, setLeadList] = useState(leads);
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

  useEffect(() => {
    dispatch(fetchConfirmedLeads());
  }, [dispatch]);

  useEffect(() => {
    setLeadList(leads);
  }, [leads]);

  const filteredLeads = leadList.filter(
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
  );

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
        window.location.reload();
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
          window.location.reload();
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
        window.location.reload();
      });
      // Clear the action state after submission
      setActionStates((prev) => {
        const newStates = { ...prev };
        delete newStates[lead.conversation_id];
        return newStates;
      });
    }
  };

  if (isLoading)
    return (
      <div className="text-center py-10">
        <LoaderDemo />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-10 mt-20 px-4 text-center max-w-xl mx-auto bg-red-50 border border-red-200 rounded-xl shadow-sm">
       <div className="flex text-red-700 gap-3 text-xl font-medium"><Stethoscope color="black" size={35} className="animate-bounce"/> {error}</div>

        {/* <div className="flex flex-wrap justify-center gap-4">
          {/* <Button
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

  // CSV export data and headers for Leads
  const csvData = filteredLeads;
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
    visit_date: lead.visit_date ? lead.visit_date : "-", // Ensure date is present or use "-"
    visit_time: lead.visit_time ? lead.visit_time : "-",
    relation: lead.relation || "-",
    reminder_note: lead.reminder_note || "-",
  }));

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-text-primary">
          Lead Management
        </h1>
        <ExportCSVButton
          data={transformedCsvData}
          headers={csvHeaders}
          filename="leads.csv"
        />
      </div>
      <Card className="overflow-x-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex gap-4">
            <SearchInput
              placeholder="Search leads by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {filteredLeads.length === 0 ? (
          <div className="p-6 text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-md">
              {/* <p className="text-gray-600 font-medium text-lg">No Data Found</p>
              <p className="text-gray-500 text-sm mt-1">
                No leads match the current search criteria. Try adjusting your
                search or adding new leads. */}
              <EmptyState
                title={"No Data Found"}
                description={
                  "No leads match the current search criteria. Try adjusting your search or adding new leads."
                }
                icon={FileSearch}
              />
              {/* </p> */}
            </div>
          </div>
        ) : (
          <table className="w-full min-w-[800px] text-sm text-left">
            <thead className="bg-gray-50 text-text-secondary">
              <tr>
                <th className="p-4 font-semibold">#</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Diseases</th>
                <th className="p-4 font-semibold">Assets</th>
                <th className="p-4 font-semibold">Assigned To</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Visit Date</th>
                <th className="p-4 font-semibold">Visit Time</th>
                <th className="p-4 font-semibold">Relation</th>
                <th className="p-4 font-semibold">Reminder Note</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => (
                <motion.tr
                  key={index}
                  className="border-b last:border-0 hover:bg-gray-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="p-4 text-text-secondary">
                    {getIndex(filteredLeads, lead, true)}
                  </td>
                  <td className="p-4 font-medium text-text-primary">
                    {toCamelCase(lead.patient_name) || "No Data Found"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {lead.phone?.replace("whatsapp:", "") || "No Data Found"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {editLead?.conversation_id === lead.conversation_id ? (
                      <input
                        type="text"
                        name="disease"
                        value={editForm.disease}
                        onChange={handleInputChange}
                        className="border rounded-lg px-2 py-1 text-sm w-full"
                        placeholder="Enter disease"
                      />
                    ) : (
                      toCamelCase(lead.disease) || "No Data Found"
                    )}
                  </td>
                  <td className="p-4 text-text-secondary ">
                    {lead.photo_url ? (
                      <a
                        href={lead.photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <FileImage color="#4d52ff" size={25}/>
                        {/* <span className="text-sm font-medium">View Image</span> */}
                      </a>
                    ) : (
                      <span className="text-gray-500">No Data Found</span>
                    )}
                  </td>

                  <td className="p-4 text-text-secondary">
                    {lead.assigned_to?.name || "Not Assigned"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {lead.location || "Not Specified"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {editLead?.conversation_id === lead.conversation_id ? (
                      <input
                        type="text"
                        name="status"
                        value={editForm.status}
                        onChange={handleInputChange}
                        className="border rounded-lg px-2 py-1 text-sm w-full"
                        placeholder="Enter status"
                      />
                    ) : (
                      lead.status || "No Data Found"
                    )}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {editLead?.conversation_id === lead.conversation_id ? (
                      <input
                        type="date"
                        name="visit_date"
                        value={editForm.visit_date}
                        onChange={handleInputChange}
                        className="border rounded-lg px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      lead.visit_date || "Not Scheduled"
                    )}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {editLead?.conversation_id === lead.conversation_id ? (
                      <input
                        type="time"
                        name="visit_time"
                        value={editForm.visit_time}
                        onChange={handleInputChange}
                        className="border rounded-lg px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      lead.visit_time || "Not Scheduled"
                    )}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {editLead?.conversation_id === lead.conversation_id ? (
                      <input
                        type="text"
                        name="relation"
                        value={editForm.relation}
                        onChange={handleInputChange}
                        className="border rounded-lg px-2 py-1 text-sm w-full"
                        placeholder="Enter relation"
                      />
                    ) : (
                      lead.relation || "Not Specified"
                    )}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {editLead?.conversation_id === lead.conversation_id ? (
                      <input
                        type="text"
                        name="reminder_note"
                        value={editForm.reminder_note}
                        onChange={handleInputChange}
                        className="border rounded-lg px-2 py-1 text-sm w-full"
                        placeholder="Add reminder note"
                      />
                    ) : (
                      lead.reminder_note || "No Data Found"
                    )}
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    {editLead?.conversation_id === lead.conversation_id ? (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSaveAction}
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
                      <>
                        <MdEdit
                          size={20}
                          className="text-blue-500 cursor-pointer transition-colors duration-200"
                          onClick={() => handleEditClick(lead)}
                        />
                        <div className="flex items-center gap-2">
                          <select
                            className="border rounded-lg px-3 py-2 text-sm bg-surface"
                            onChange={(e) =>
                              handleActionChange(lead, e.target.value)
                            }
                            value={
                              actionStates[lead.conversation_id]?.action || ""
                            }
                          >
                            <option value="">Select</option>
                            <option value="convert">Convert to Patient</option>
                            <option value="in 3 days">in 3 days</option>
                            <option value="in 7 days">in 7 days</option>
                            <option value="in 15 days">in 15 days</option>
                            <option value="in 1 month">in 1 month</option>
                            <option value="not interested">
                              Not Interested
                            </option>
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
                                  onChange={(e) =>
                                    handleReminderNoteChange(
                                      e,
                                      lead.conversation_id
                                    )
                                  }
                                  className="border rounded-lg px-2 py-1 text-sm w-32"
                                  placeholder="Reminder note"
                                />
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleSubmitAction(lead)}
                                  className="px-2 py-1 text-sm"
                                >
                                  Submit
                                </Button>
                              </>
                            )}
                        </div>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default Leads;
