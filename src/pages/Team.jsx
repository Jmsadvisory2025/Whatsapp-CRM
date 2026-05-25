import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BiSolidTrashAlt } from "react-icons/bi";
import { MdEdit } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa6";
import {
  Building2, Mail, Globe, User, FileSearch,
  Stethoscope, Link, MessageCircle, Phone,
  CheckCircle2, UserPlus, Search, Shield,
  ChevronRight, Wifi, WifiOff,
} from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import RoleBadge from "../components/ui/RoleBadge";
import SearchInput from "../components/ui/SearchInput";
import EmptyState from "../components/ui/EmptyState";
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";

import { fetchTeamMembers, deleteTeamMember, updateTeamMember } from "../store/teamSlice";
import { getIndex, toCamelCase } from "../hooks/utils";

/* ── InfoRow ─────────────────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value, isLink, isEmail }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5 uppercase tracking-wide">{label}</p>
        {isEmail ? (
          <a href={`mailto:${value}`} className="text-sm font-semibold text-blue-600 hover:underline break-all">{value}</a>
        ) : isLink ? (
          <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-600 hover:underline break-all">
            {value.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <p className="text-sm font-semibold text-gray-900 break-words">{value}</p>
        )}
      </div>
    </div>
  );
};

/* ── StatBadge ───────────────────────────────────────────── */
const StatBadge = ({ label, value, color = "blue" }) => {
  const colors = {
    blue:  "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    gray:  "bg-gray-50 text-gray-600 border-gray-100",
  };
  return (
    <div className={`flex flex-col items-center justify-center px-5 py-3 rounded-xl border ${colors[color]}`}>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs font-medium mt-0.5 opacity-80">{label}</span>
    </div>
  );
};

/* ── Main ────────────────────────────────────────────────── */
const Team = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const { members, isLoading, error } = useSelector((s) => s.team);
  const {
    organization, org_email, org_website, owner_name, owner_email, role,
    waba_status, waba_name, waba_id, phone_number, phone_number_id,
  } = useSelector((s) => s.auth);

  const [editMember, setEditMember] = useState(null);
  const [editForm,   setEditForm]   = useState({ full_name: "", new_email: "", role: "" });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { dispatch(fetchTeamMembers()); }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this member?"))
      dispatch(deleteTeamMember(id)).then(() => window.location.reload());
  };
  const handleEditClick = (member) => {
    setEditMember(member);
    setEditForm({ full_name: member.full_name || "", new_email: member.email || "", role: member.role || "" });
  };
  const handleSaveUpdate = () => {
    if (!editMember) return;
    dispatch(updateTeamMember({ id: editMember.id, ...editForm }))
      .then(() => { setEditMember(null); setEditForm({ full_name: "", new_email: "", role: "" }); window.location.reload(); });
  };
  const handleCancel = () => { setEditMember(null); setEditForm({ full_name: "", new_email: "", role: "" }); };
  const handleInputChange = (e) => { const { name, value } = e.target; setEditForm((p) => ({ ...p, [name]: value })); };

  const filteredMembers = members.filter((m) =>
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const wabaConnected = waba_status === "connected";

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><LoaderDemo /></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 mt-20 px-6 text-center max-w-md mx-auto bg-red-50 border border-red-200 rounded-2xl">
      <Stethoscope className="text-red-400 animate-bounce" size={36} />
      <p className="text-red-700 font-medium">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/80 p-6 space-y-6">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Team & Organisation</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your workspace, members and integrations</p>
        </div>
        <button
          onClick={() => navigate("/addMember")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-blue-200 transition-all"
        >
          <UserPlus size={16} /> Add Member
        </button>
      </div>

      {/* ── ORG CARD ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* card header strip */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/60 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Organisation Profile</h2>
              <p className="text-xs text-gray-400">Auto-filled from your signup details</p>
            </div>
          </div>
          {/* mini stats */}
          <div className="hidden sm:flex gap-3">
            <StatBadge label="Members" value={members.length} color="blue" />
            <StatBadge label="WhatsApp" value={wabaConnected ? "Live" : "Off"} color={wabaConnected ? "green" : "gray"} />
          </div>
        </div>

        {organization ? (
          <div className="p-6 space-y-6">
            {/* org + owner grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* left */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Organisation</p>
                <InfoRow icon={Building2} label="Name"    value={organization} />
                <InfoRow icon={Mail}      label="Email"   value={org_email}   isEmail />
                <InfoRow icon={Globe}     label="Website" value={org_website} isLink  />
              </div>
              {/* right */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Owner</p>
                <InfoRow icon={User} label="Name"  value={owner_name}  />
                <InfoRow icon={Mail} label="Email" value={owner_email} isEmail />
                {role && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">Your Role</p>
                      <RoleBadge role={role} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── WABA SECTION ── */}
            <div className={`rounded-xl border p-5 ${wabaConnected ? "border-green-100 bg-green-50/40" : "border-gray-100 bg-gray-50/60"}`}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${wabaConnected ? "bg-green-500" : "bg-gray-200"}`}>
                    <FaWhatsapp className={`text-lg ${wabaConnected ? "text-white" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-800">WhatsApp Business</h3>
                      {wabaConnected
                        ? <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full"><Wifi size={11} /> Connected</span>
                        : <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full"><WifiOff size={11} /> Not connected</span>
                      }
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {wabaConnected ? `${waba_name || "WABA"} · ${phone_number || ""}` : "Connect to start sending WhatsApp messages"}
                    </p>
                  </div>
                </div>

                {!wabaConnected && (
                  <button
                    onClick={() => navigate("/setup")}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm shadow-green-200"
                  >
                    Connect <ChevronRight size={15} />
                  </button>
                )}
              </div>

              {wabaConnected && (
                <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-green-100">
                  <InfoRow icon={Building2} label="WABA Name"      value={waba_name}        />
                  <InfoRow icon={Phone}     label="Business Phone" value={phone_number}      />
                  <InfoRow icon={Link}      label="WABA ID"        value={waba_id}           />
                  <InfoRow icon={Link}      label="Phone Number ID" value={phone_number_id}  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-8 text-gray-400">
            <LoaderDemo />
            <span className="text-sm">Loading organisation details…</span>
          </div>
        )}
      </div>

      {/* ── TEAM MEMBERS CARD ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* table header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <h2 className="text-sm font-bold text-gray-800">Team Members</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{members.length}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* inline search */}
            <div className="relative flex-1 sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, role…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
              {filteredMembers.length}/{members.length}
            </span>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {["#", "Name", "Email", "Role", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <EmptyState icon={FileSearch} title="No members found" description="No team members match your search." />
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, index) => (
                  <tr key={member.id ?? index} className="hover:bg-blue-50/30 transition-colors group">
                    {/* index */}
                    <td className="px-5 py-3.5 text-xs font-bold text-gray-400">
                      {getIndex(filteredMembers, member, true)}
                    </td>
                    {/* name */}
                    <td className="px-5 py-3.5">
                      {editMember?.id === member.id ? (
                        <input type="text" name="full_name" value={editForm.full_name} onChange={handleInputChange}
                          className="border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-100" />
                      ) : (
                        <span className="text-sm font-semibold text-gray-800">{toCamelCase(member.full_name)}</span>
                      )}
                    </td>
                    {/* email */}
                    <td className="px-5 py-3.5">
                      {editMember?.id === member.id ? (
                        <input type="email" name="new_email" value={editForm.new_email} onChange={handleInputChange}
                          className="border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-100" />
                      ) : (
                        <span className="text-sm text-gray-500">{member.email}</span>
                      )}
                    </td>
                    {/* role */}
                    <td className="px-5 py-3.5">
                      {editMember?.id === member.id ? (
                        <select name="role" value={editForm.role} onChange={handleInputChange}
                          className="border border-blue-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100">
                          <option value="sales">Sales</option>
                          <option value="manager">Manager</option>
                        </select>
                      ) : (
                        <RoleBadge role={member.role} />
                      )}
                    </td>
                    {/* actions */}
                    <td className="px-5 py-3.5">
                      {editMember?.id === member.id ? (
                        <div className="flex items-center gap-2">
                          <button onClick={handleSaveUpdate}
                            className="text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            Save
                          </button>
                          <button onClick={handleCancel}
                            className="text-xs font-semibold px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(member)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 text-blue-500 transition-colors">
                            <MdEdit size={16} />
                          </button>
                          <button onClick={() => handleDelete(member.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 text-red-400 transition-colors">
                            <BiSolidTrashAlt size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Team;