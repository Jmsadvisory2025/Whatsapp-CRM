import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchConfirmedLeads, convertToPatient, updateLead } from "../store/leadsSlice";
import { motion } from "framer-motion";
import SearchInput from "../components/ui/SearchInput";

const Leads = () => {
  const dispatch = useDispatch();
  const { leads, isLoading, error } = useSelector((state) => state.leads);
  const [searchQuery, setSearchQuery] = useState("");
  const [leadList, setLeadList] = useState(leads); // Initialize with fetched leads
  const [editLead, setEditLead] = useState(null);
  const [editForm, setEditForm] = useState({ patient_name: "", disease: "", status: "" });

  useEffect(() => {
    dispatch(fetchConfirmedLeads());
  }, [dispatch]);

  useEffect(() => {
    setLeadList(leads); // Update leadList when leads data changes
  }, [leads]);

  const filteredLeads = leadList.filter(
    (lead) =>
      lead.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.status
        ? lead.status.toLowerCase().includes(searchQuery.toLowerCase())
        : false) ||
      (lead.reminder
        ? lead.reminder.toLowerCase().includes(searchQuery.toLowerCase())
        : false)
  );

  const handleActionChange = (lead, value) => {
    if (value === "convert") {
      if (window.confirm(`Convert ${lead.patient_name} to patient?`)) {
        dispatch(convertToPatient({ conversation_id: lead.conversation_id })).then(() => {
          window.location.reload(); // Refresh after conversion
        });
      }
    } else if (value === "in 3 days") {
      handleUpdateLead(lead, "HOT LEAD");
    } else if (value === "in 7 days") {
      handleUpdateLead(lead, "COLD LEAD");
    } else if (value === "Not Interested") {
      handleUpdateLead(lead, "Not Interested");
    }
  };

  const handleUpdateLead = (lead, newStatus) => {
    setEditLead(lead);
    setEditForm({
      patient_name: lead.patient_name || "",
      disease: lead.disease || "",
      status: newStatus || lead.status || "",
    });
  };

  const handleSaveUpdate = () => {
    if (editLead) {
      dispatch(updateLead({
        conversation_id: editLead.conversation_id,
        patient_name: editForm.patient_name,
        disease: editForm.disease,
        status: editForm.status,
      })).then(() => {
        window.location.reload(); // Refresh after update
      });
      setEditLead(null);
      setEditForm({ patient_name: "", disease: "", status: "" });
    }
  };

  const handleCancel = () => {
    setEditLead(null);
    setEditForm({ patient_name: "", disease: "", status: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-text-primary">
          Lead Management
        </h1>
        <Button>Export</Button>
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
                No leads match the current search criteria. Try adjusting your search or adding new leads.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full min-w-[600px] text-sm text-left">
            <thead className="bg-gray-50 text-text-secondary">
              <tr>
                <th className="p-4 font-semibold">Conversation ID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Diseases</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Reminder</th>
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
                    {editLead?.conversation_id === lead.conversation_id ? (
                      <span>{lead.conversation_id || "No Data Found"}</span>
                    ) : (
                      lead.conversation_id || "No Data Found"
                    )}
                  </td>
                  <td className="p-4 font-medium text-text-primary">
                    {editLead?.conversation_id === lead.conversation_id ? (
                      <input
                        type="text"
                        name="patient_name"
                        value={editForm.patient_name}
                        onChange={handleInputChange}
                        className="border rounded-lg px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      lead.patient_name || "No Data Found"
                    )}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {lead.phone !== "-"
                      ? lead.phone.replace("whatsapp:", "")
                      : "No Data Found"}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {editLead?.conversation_id === lead.conversation_id ? (
                      <input
                        type="text"
                        name="disease"
                        value={editForm.disease}
                        onChange={handleInputChange}
                        className="border rounded-lg px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      lead.disease || "No Data Found"
                    )}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {editLead?.conversation_id === lead.conversation_id ? (
                      <input
                        type="text"
                        name="status"
                        value={editForm.status}
                        onChange={handleInputChange}
                        className="border rounded-lg px-2 py-1 text-sm w-full"
                      />
                    ) : (
                      lead.status || "No Data Found"
                    )}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {lead.reminder || "No Data Found"}
                  </td>
                  <td className="p-4 flex flex-col items-center gap-2">
                    {editLead?.conversation_id === lead.conversation_id ? (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSaveUpdate}
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
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateLead(lead, "")}
                        className="px-2 py-1 text-sm"
                      >
                        ✏️
                      </Button>
                    )}
                    <select
                      className="border rounded-lg px-3 py-2 text-sm bg-surface"
                      onChange={(e) => handleActionChange(lead, e.target.value)}
                      defaultValue=""
                    >
                      <option value="">Select</option>
                      <option value="convert">Convert to Patient</option>
                      <option value="in 3 days">in 3 days</option>
                      <option value="in 7 days">in 7 days</option>
                      <option value="Not Interested">Not Interested</option>
                    </select>
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