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

import { toCamelCase } from "../hooks/utils";

/* ─────────────────────────────────────────────
   API
───────────────────────────────────────────── */

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
    <div className="flex items-start gap-3">

      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>

      <div className="min-w-0">

        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
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

  const [webhookStatus, setWebhookStatus] =
    useState(false);

  const [metaStatus, setMetaStatus] =
    useState(null);

  const [metaLoading, setMetaLoading] =
    useState(false);

  const [editMember, setEditMember] =
    useState(null);

  const [editForm, setEditForm] =
    useState({
      full_name: "",
      new_email: "",
      role: "",
    });

  /* ───────────────────────── */

  useEffect(() => {

    dispatch(fetchTeamMembers());

    checkWebhookStatus();

    fetchMetaStatus();

  }, [dispatch]);

  /* ─────────────────────────
     WEBHOOK
  ───────────────────────── */

  const checkWebhookStatus = async () => {

    try {

      const res = await API.get(
        "/api/webhook/health/"
      );

      setWebhookStatus(
        res.data.connected
      );

    } catch {

      setWebhookStatus(false);

    }

  };

  /* ─────────────────────────
     META STATUS
  ───────────────────────── */

  const fetchMetaStatus = async () => {

    try {

      setMetaLoading(true);

      const res = await API.get(
        "/api/meta/account-status/"
      );

      if (res.data.success) {

        setMetaStatus(
          res.data.whatsapp
        );

      }

    } catch (err) {

      console.log(err);

      setMetaStatus(null);

    } finally {

      setMetaLoading(false);

    }

  };

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

      {/* TOP GRID */}

      <div className="grid lg:grid-cols-3 gap-5">

        {/* ORGANISATION */}

        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gray-700" />
            </div>

            <div>

              <h2 className="text-sm font-semibold text-gray-900">
                Organisation
              </h2>

              <p className="text-xs text-gray-400">
                Account information
              </p>

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="space-y-5">

              <InfoItem
                icon={Building2}
                label="Organisation"
                value={organization}
              />

              <InfoItem
                icon={Mail}
                label="Email"
                value={org_email}
                isEmail
              />

              <InfoItem
                icon={Globe}
                label="Website"
                value={org_website}
                isLink
              />

            </div>

            <div className="space-y-5">

              <InfoItem
                icon={User}
                label="Owner"
                value={owner_name}
              />

              <InfoItem
                icon={Mail}
                label="Owner Email"
                value={owner_email}
                isEmail
              />

              <div className="flex items-start gap-3">

                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gray-500" />
                </div>

                <div>

                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Role
                  </p>

                  <RoleBadge role={role} />

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* WHATSAPP */}

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-2xl bg-[#25D366]/10 flex items-center justify-center">
              <FaWhatsapp className="text-[#25D366] text-lg" />
            </div>

            <div>

              <h2 className="text-sm font-semibold text-gray-900">
                WhatsApp
              </h2>

              <p className="text-xs text-gray-400">
                Meta business connection
              </p>

            </div>

          </div>

          {/* STATUS */}

          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-2">

              {metaStatus?.is_connected ? (
                <>
                  <Wifi
                    size={15}
                    className="text-green-500"
                  />

                  <span className="text-sm font-medium text-green-600">
                    Connected
                  </span>
                </>
              ) : (
                <>
                  <WifiOff
                    size={15}
                    className="text-gray-400"
                  />

                  <span className="text-sm font-medium text-gray-500">
                    Not Connected
                  </span>
                </>
              )}

            </div>

            <div
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                webhookStatus
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-500"
              }`}
            >

              {webhookStatus
                ? "Webhook Active"
                : "Webhook Offline"}

            </div>

          </div>

          {/* LOADING */}

          {metaLoading ? (

            <div className="py-10 flex justify-center">

              <RefreshCw
                size={18}
                className="animate-spin text-gray-400"
              />

            </div>

          ) : metaStatus ? (

            <div className="space-y-5">

              <InfoItem
                icon={Building2}
                label="WABA Name"
                value={metaStatus.waba_name}
              />

              <InfoItem
                icon={Shield}
                label="WABA ID"
                value={metaStatus.waba_id}
              />

              <InfoItem
                icon={Phone}
                label="Phone Number"
                value={metaStatus.phone_number}
              />

              <InfoItem
                icon={Phone}
                label="Phone Number ID"
                value={
                  metaStatus.phone_number_id
                }
              />

              <InfoItem
                icon={BadgeCheck}
                label="Verified Name"
                value={
                  metaStatus.verified_name
                }
              />

              {/* GRID */}

              <div className="grid grid-cols-2 gap-3">

                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">

                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                    Quality
                  </p>

                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {
                      metaStatus.quality_rating
                    }
                  </p>

                </div>

                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">

                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                    Messaging Tier
                  </p>

                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {metaStatus.throughput}
                  </p>

                </div>

              </div>

              {/* REVIEW */}

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">

                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  Review Status
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {
                    metaStatus.review_status
                  }
                </p>

              </div>

              {/* VERIFICATION */}

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">

                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  Verification
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {
                    metaStatus.verification_status
                  }
                </p>

              </div>

              {/* NAME STATUS */}

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">

                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  Name Status
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {
                    metaStatus.name_status
                  }
                </p>

              </div>

              {/* PLATFORM */}

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">

                <div>

                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                    Platform
                  </p>

                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {
                      metaStatus.platform_type
                    }
                  </p>

                </div>

                <Layers3
                  size={16}
                  className="text-gray-500"
                />

              </div>

              {/* CURRENCY */}

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">

                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  Currency
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {metaStatus.currency}
                </p>

              </div>

            </div>

          ) : (

            <button
              onClick={() =>
                navigate("/setup")
              }
              className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium py-3 rounded-2xl transition-all"
            >
              Connect WhatsApp
            </button>

          )}

          {/* REFRESH */}

          <button
            onClick={() => {

              checkWebhookStatus();

              fetchMetaStatus();

            }}
            className="w-full mt-5 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-3 rounded-2xl transition-all"
          >

            <RefreshCw size={14} />

            Refresh Status

          </button>

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