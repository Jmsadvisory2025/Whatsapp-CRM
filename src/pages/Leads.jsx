import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConfirmedLeads,
  convertToPatient,
  updateLeadAction,
} from "../store/leadsSlice";
import { motion } from "framer-motion";
import SearchInput from "../components/ui/SearchInput";
import { getIndex, toCamelCase } from "../hooks/utils";
import ExportCSVButton from "../components/ui/ExportCSVButton"; // Import reusable component
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";

const Leads = () => {
  const dispatch = useDispatch();
  const { leads, isLoading, error } = useSelector((state) => state.leads);
  const [searchQuery, setSearchQuery] = useState("");
  const [leadList, setLeadList] = useState(leads); // Initialize with fetched leads
  const [editLead, setEditLead] = useState(null);
  const [editForm, setEditForm] = useState({ status: "", reminder_note: "" });

  useEffect(() => {
    dispatch(fetchConfirmedLeads());
  }, [dispatch]);

  useEffect(() => {
    setLeadList(leads); // Update leadList when leads data changes
  }, [leads]);

  const filteredLeads = leadList.filter(
    (lead) =>
      (lead.patient_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (lead.phone?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (lead.disease?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (lead.status?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (lead.reminder_note?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleActionChange = (lead, value) => {
    if (value === "convert") {
      if (window.confirm(`Convert ${lead.patient_name} to patient?`)) {
        dispatch(convertToPatient({ conversation_id: lead.conversation_id })).then(() => {
          window.location.reload(); // Refresh after conversion
        });
      }
    } else {
      setEditLead(lead);
      setEditForm({
        status: value, // Set the selected action as status
        reminder_note: lead.reminder_note || "",
      });
    }
  };

  const handleSaveAction = () => {
    if (editLead) {
      const actionMap = {
        "in 3 days": "in_3_days",
        "in 7 days": "in_7_days",
        "not interested": "not_interested",
      };
      const action = actionMap[editForm.status.toLowerCase()];
      dispatch(
        updateLeadAction({
          conversation_id: editLead.conversation_id,
          action,
          reminder_note: editForm.reminder_note || undefined, // Send only if provided
        })
      ).then(() => {
        window.location.reload(); // Refresh after update
      });
      setEditLead(null);
      setEditForm({ status: "", reminder_note: "" });
    }
  };

  const handleCancel = () => {
    setEditLead(null);
    setEditForm({ status: "", reminder_note: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <div className="text-center py-10"><LoaderDemo   /></div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

  // CSV export data and headers for Leads
  const csvData = filteredLeads; // Use filtered leads for export
  const csvHeaders = [
    { label: "#", key: "index" }, // Custom index (handled in data transformation)
    { label: "Name", key: "patient_name" },
    { label: "Phone", key: "phone" },
    { label: "Diseases", key: "disease" },
    { label: "Assigned To", key: "assigned_to.name" }, // Nested object access
    { label: "Location", key: "location" },
    { label: "Status", key: "status" },
    { label: "Visit Date", key: "visit_date" },
    { label: "Visit Time", key: "visit_time" },
    { label: "Reminder Note", key: "reminder_note" },
  ];

  // Transform data to include index and handle nested fields
  const transformedCsvData = filteredLeads.map((lead, index) => ({
    index: getIndex(filteredLeads, lead, true),
    patient_name: toCamelCase(lead.patient_name) || "No Data Found",
    phone: lead.phone?.replace("whatsapp:", "") || "No Data Found",
    disease: toCamelCase(lead.disease) || "No Data Found",
    "assigned_to.name": lead.assigned_to?.name || "Not Assigned",
    location: lead.location || "Not Specified",
    status: lead.status || "No Data Found",
    visit_date: lead.visit_date || "Not Scheduled",
    visit_time: lead.visit_time || "Not Scheduled",
    reminder_note: lead.reminder_note || "No Data Found",
  }));

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Lead Management</h1>
        {/* Use reusable ExportCSVButton with transformed data */}
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
              <p className="text-gray-600 font-medium text-lg">No Data Found</p>
              <p className="text-gray-500 text-sm mt-1">
                No leads match the current search criteria. Try adjusting your
                search or adding new leads.
              </p>
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
                <th className="p-4 font-semibold">Assigned To</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Visit Date</th>
                <th className="p-4 font-semibold">Visit Time</th>
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
                    {toCamelCase(lead.disease) || "No Data Found"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {lead.assigned_to?.name || "Not Assigned"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {lead.location || "Not Specified"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {editLead?.conversation_id === lead.conversation_id
                      ? editForm.status || lead.status || "No Data Found"
                      : lead.status || "No Data Found"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {lead.visit_date || "Not Scheduled"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {lead.visit_time || "Not Scheduled"}
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
                  <td className="p-4 flex flex-col items-center gap-2">
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
                      <select
                        className="border rounded-lg px-3 py-2 text-sm bg-surface"
                        onChange={(e) => handleActionChange(lead, e.target.value)}
                        defaultValue=""
                      >
                        <option value="">Select</option>
                        <option value="convert">Convert to Patient</option>
                        <option value="in 3 days">in 3 days</option>
                        <option value="in 7 days">in 7 days</option>
                        <option value="not interested">Not Interested</option>
                      </select>
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