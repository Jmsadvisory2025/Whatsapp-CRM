// src/pages/Team.jsx
// Modern Minimal Team + Meta WhatsApp Status UI

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Building2,
  Mail,
  Globe,
  User,
  Shield,
  Wifi,
  WifiOff,
  Phone,
  Search,
  Plus,
  AlertCircle,
  RefreshCw,
  BadgeCheck,
  Layers3,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa6";

import { MdEdit } from "react-icons/md";

import { BiSolidTrashAlt } from "react-icons/bi";

import axios from "axios";

import RoleBadge from "../components/ui/RoleBadge";

import EmptyState from "../components/ui/EmptyState";

import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";

import {
  fetchTeamMembers,
  deleteTeamMember,
  updateTeamMember,
} from "../store/teamSlice";

import { fetchWABAStatus } from "../store/metaConnectSlice";

import { toCamelCase } from "../hooks/utils";

/* ─────────────────────────────────────────────
   API
───────────────────────────────────────────── */

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL,
  withCredentials: true,
});

/* ─────────────────────────────────────────────
   INFO ITEM
───────────────────────────────────────────── */

const InfoItem = ({
  icon: Icon,
  label,
  value,
  isEmail,
  isLink,
}) => {
  if (!value) return null;

  return (
    <div className="flex items-start gap-4">

      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>

      <div className="min-w-0 pt-0.5">

        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">
          {label}
        </p>

        {isEmail ? (
          <a
            href={`mailto:${value}`}
            className="text-sm text-gray-700 hover:text-blue-600 break-all transition-colors"
          >
            {value}
          </a>
        ) : isLink ? (
          <a
            href={
              value.startsWith("http")
                ? value
                : `https://${value}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-700 hover:text-blue-600 break-all transition-colors"
          >
            {value.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <p className="text-sm text-gray-800 break-all">
            {value}
          </p>
        )}

      </div>

    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */

const Team = () => {

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { members, isLoading, error } =
    useSelector((s) => s.team);

  const {
    organization,
    org_email,
    org_website,
    owner_name,
    owner_email,
    role,
  } = useSelector((s) => s.auth);

  /* ───────────────────────── */

  const [searchQuery, setSearchQuery] =
    useState("");

  const [editForm, setEditForm] =
    useState({
      full_name: "",
      new_email: "",
      role: "",
    });

  const {
    wabaStatus,
    wabaId,
    wabaName,
    phoneNumber,
    phoneNumberId,
    isLoadingStatus: metaLoading
  } = useSelector((s) => s.metaConnect);

  /* ───────────────────────── */

  useEffect(() => {

    dispatch(fetchTeamMembers());
    dispatch(fetchWABAStatus());

  }, [dispatch]);

  const isWhatsAppConnected = wabaStatus === "connected" || (wabaId && phoneNumberId);

  /* ───────────────────────── */

  const filteredMembers = useMemo(() => {

    return members.filter((m) => {

      const q =
        searchQuery.toLowerCase();

      return (
        m.full_name
          ?.toLowerCase()
          .includes(q) ||

        m.email
          ?.toLowerCase()
          .includes(q) ||

        m.role
          ?.toLowerCase()
          .includes(q)
      );

    });

  }, [members, searchQuery]);

  /* ───────────────────────── */

  const handleDelete = (id) => {

    if (
      window.confirm(
        "Delete this member?"
      )
    ) {

      dispatch(
        deleteTeamMember(id)
      );

    }

  };

  const handleEditClick = (
    member
  ) => {

    setEditMember(member);

    setEditForm({
      full_name:
        member.full_name || "",
      new_email:
        member.email || "",
      role:
        member.role || "",
    });

  };

  const handleInputChange = (
    e
  ) => {

    const { name, value } =
      e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleCancel = () => {

    setEditMember(null);

  };

  const handleSaveUpdate =
    async () => {

      if (!editMember) return;

      await dispatch(
        updateTeamMember({
          id: editMember.id,
          ...editForm,
        })
      );

      setEditMember(null);

    };

  /* ───────────────────────── */

  if (isLoading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderDemo />
      </div>
    );

  }

  if (error) {

    return (
      <div className="p-6">

        <div className="max-w-md mx-auto bg-red-50 border border-red-100 rounded-3xl p-6 text-center">

          <AlertCircle className="mx-auto text-red-500 mb-3" />

          <p className="text-sm text-red-700 font-medium">
            {error}
          </p>

        </div>

      </div>
    );

  }

  /* ───────────────────────── */

  return (

    <div className="min-h-screen bg-[#f7f8fa] p-4 md:p-6 space-y-5">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Team
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage organisation & team access
          </p>

        </div>

        <button
          onClick={() =>
            navigate("/addMember")
          }
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-medium px-4 py-2.5 rounded-2xl transition-all"
        >

          <Plus size={15} />

          Add Member

        </button>

      </div>

      {/* TOP SECTION: WHATSAPP */}

      <div className="bg-white border border-gray-200/60 rounded-[2rem] p-8 shadow-sm">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 shadow-sm flex items-center justify-center shrink-0">
              <FaWhatsapp className="text-[#25D366] text-2xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Account Information
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Meta Information
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
            {isWhatsAppConnected ? (
              <>
                <Wifi size={15} className="text-green-500" />
                <span className="text-sm font-bold text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={15} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-500">Not Connected</span>
              </>
            )}
          </div>
        </div>

        {/* LOADING STATE */}
        {metaLoading ? (
          <div className="py-16 flex justify-center">
            <RefreshCw size={24} className="animate-spin text-gray-400" />
          </div>
        ) : isWhatsAppConnected ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
            <InfoItem icon={Building2} label="WABA Name" value={wabaName} />
            <InfoItem icon={Shield} label="WABA ID" value={wabaId} />
            <InfoItem icon={Phone} label="Phone Number" value={phoneNumber} />
            <InfoItem icon={Phone} label="Phone Number ID" value={phoneNumberId} />
          </div>
        ) : (
           <div className="py-10 flex justify-center">
              <p className="text-gray-500 text-sm">No WhatsApp Business Account connected.</p>
           </div>
        )}

        {/* ACTIONS */}
        <div className="mt-10 pt-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-end gap-4">
          <button
            onClick={() => dispatch(fetchWABAStatus())}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-6 py-3 rounded-2xl transition-all shadow-sm"
          >
            <RefreshCw size={14} />
            Refresh Status
          </button>
          
          {!metaLoading && (
            !isWhatsAppConnected ? (
              <button
                onClick={() => navigate("/setup")}
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold px-8 py-3 rounded-2xl transition-all shadow-sm"
              >
                Connect WhatsApp
              </button>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto bg-gray-100 text-gray-400 font-semibold text-sm px-8 py-3 rounded-2xl cursor-not-allowed"
              >
                Connected
              </button>
            )
          )}
        </div>

      </div>

      {/* TEAM */}

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">

        {/* TOP */}

        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>

            <h2 className="text-sm font-semibold text-gray-900">
              Team Members
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              {filteredMembers.length} members
            </p>

          </div>

          <div className="relative w-full md:w-72">

            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-4 focus:ring-gray-100"
            />

          </div>

        </div>

      </div>
      {/* MEMBERS LIST */}

      <div className="divide-y divide-gray-100">

        {filteredMembers.length > 0 ? (

          filteredMembers.map((member) => (

            <div
              key={member.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-all"
            >

              {/* LEFT */}

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">

                  <User className="w-5 h-5 text-gray-600" />

                </div>

                <div>

                  <h3 className="text-sm font-semibold text-gray-900">
                    {member.full_name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {member.email}
                  </p>

                </div>

              </div>

              {/* RIGHT */}

              <div className="flex items-center gap-3">

                <RoleBadge role={member.role} />

                <button
                  onClick={() =>
                    handleDelete(member.id)
                  }
                  className="w-9 h-9 rounded-xl border border-red-100 hover:bg-red-50 flex items-center justify-center transition-all"
                >

                  <BiSolidTrashAlt className="text-red-500" />

                </button>

              </div>

            </div>

          ))

        ) : (

          <div className="p-10">

            <EmptyState
              title="No team members found"
              subtitle="Add members or try another search."
            />

          </div>

        )}

      </div>
    </div>

  );

};

export default Team;