import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { BiSolidTrashAlt } from "react-icons/bi";
import { MdEdit } from "react-icons/md";
import RoleBadge from "../components/ui/RoleBadge";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeamMembers,
  deleteTeamMember,
  updateTeamMember,
} from "../store/teamSlice";
import SearchInput from "../components/ui/SearchInput";
import { getIndex, toCamelCase } from "../hooks/utils";

import { RiHospitalLine } from "react-icons/ri";
import { Building2, Mail, Globe, User, FileSearch, Stethoscope } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";

const Team = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { members, isLoading, error } = useSelector((state) => state.team);
  const [editMember, setEditMember] = React.useState(null);
  const [editForm, setEditForm] = React.useState({
    full_name: "",
    new_email: "",
    role: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchTeamMembers());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      dispatch(deleteTeamMember(id)).then(() => {
        window.location.reload(); // Refresh to reflect the updated list
      });
    }
  };

  const handleEditClick = (member) => {
    setEditMember(member);
    setEditForm({
      full_name: member.full_name || "",
      new_email: member.email || "", // Initialize with current email
      role: member.role || "",
    });
  };

  const handleSaveUpdate = () => {
    if (editMember) {
      dispatch(
        updateTeamMember({
          id: editMember.id,
          full_name: editForm.full_name,
          new_email: editForm.new_email, // Ensure new_email is sent
          role: editForm.role,
        })
      ).then((response) => {
        console.log("Update action response:", response); // Debug response
        setEditMember(null);
        setEditForm({ full_name: "", new_email: "", role: "" });
        window.location.reload(); // Refresh to reflect the updated member
      });
    }
  };

  const handleCancel = () => {
    setEditMember(null);
    setEditForm({ full_name: "", new_email: "", role: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const filteredMembers = members.filter(
    (member) =>
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading)
    return (
      <div className="text-center py-10">
        <LoaderDemo />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-10 mt-20 px-4 text-center max-w-xl mx-auto bg-red-50 border border-red-400 rounded-xl shadow-sm">
        <div className="flex text-red-800 text-xl font-medium">
          <Stethoscope color="black" size={35} className="animate-bounce" /> {error}
        </div>
      </div>
    );

  return (
    <div className="container mx-auto bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          Organization & Team Management
        </h1>
        <Button
          onClick={() => navigate("/addMember")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
        >
          + Add Member
        </Button>
      </div>
      <Card className="mb-6 p-6 bg-white rounded-xl shadow-md border border-gray-200">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Building2 className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Organization Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  Dr. Shah's  Superspeciality Eye Hospital
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a
                  href="mailto:drshaheyehospitals@gmail.com"
                  className="text-lg font-semibold text-blue-600 hover:underline break-all"
                >
                  drshaheyehospitals@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Globe className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Website</p>
                <a
                  href="https://shaheyehospitals.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  shaheyehospitals.com
                </a>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <User className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Owner Name</p>
                <p className="text-lg font-semibold text-gray-900">Sapan Shah</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <SearchInput
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <p className="text-sm text-gray-500">
            Showing {filteredMembers.length} of {members.length} members
          </p>
        </div>
        <div className="p-4">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr className="border-b border-gray-200">
                <th className="p-3 text-sm font-semibold uppercase tracking-wider">#</th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider">
                  Name
                </th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider">
                  Email
                </th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider">
                  Role
                </th>
                <th className="p-3 text-sm font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center">
                    <EmptyState
                      icon={FileSearch}
                      title="No Data Found"
                      description="No team members available. Add a new member to get started or adjust your search."
                    />
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="p-3 text-gray-800 font-medium">
                      {getIndex(filteredMembers, member, true)}
                    </td>
                    <td className="p-3 text-gray-800 font-medium">
                      {editMember?.id === member.id ? (
                        <input
                          type="text"
                          name="full_name"
                          value={editForm.full_name}
                          onChange={handleInputChange}
                          className="border rounded-lg px-2 py-1 text-sm w-full"
                        />
                      ) : (
                        toCamelCase(member.full_name)
                      )}
                    </td>
                    <td className="p-3 text-gray-600">
                      {editMember?.id === member.id ? (
                        <input
                          type="email"
                          name="new_email"
                          value={editForm.new_email}
                          onChange={handleInputChange}
                          className="border rounded-lg px-2 py-1 text-sm w-full"
                        />
                      ) : (
                        member.email
                      )}
                    </td>
                    <td className="p-3 text-gray-600">
                      {editMember?.id === member.id ? (
                        <select
                          name="role"
                          value={editForm.role}
                          onChange={handleInputChange}
                          className="border rounded-lg px-2 py-1 text-sm w-full"
                        >
                          <option value="sales">Sales</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <RoleBadge role={member.role} />
                      )}
                    </td>
                    <td className="p-3 flex space-x-2">
                      {editMember?.id === member.id ? (
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
                        <>
                          <BiSolidTrashAlt
                            size={20}
                            className="text-red-800 cursor-pointer transition-colors duration-200"
                            onClick={() => handleDelete(member.id)}
                          />
                          <MdEdit
                            size={20}
                            className="text-blue-500 cursor-pointer transition-colors duration-200"
                            onClick={() => handleEditClick(member)}
                          />
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Team;