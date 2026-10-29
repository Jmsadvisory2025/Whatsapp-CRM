// src/pages/TechProviderClients.jsx
// Route: /clients  (inside HomeResolver children in App.jsx)
// Sidebar: shown only when isTechProvider(email) is true

import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { canViewClients } from "../store/authUtils";
import {
  Building2,
  Wifi,
  WifiOff,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Users,
  Globe,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  BadgeCheck,
  AlertTriangle,
  Star,
  Zap,
  FileText,
  X,
  MessageSquare,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Module-level session cache so navigating back to /clients is instant
let cachedClientsData = null;

// ─── Static meta ─────────────────────────────────────────────────────────────

const CRM_STATUS = {
  active: { label: "Active", color: "#15803d", bg: "#ecfdf5", border: "#a7f3d0", icon: CheckCircle2 },
  pending: { label: "Pending", color: "#b45309", bg: "#fffbeb", border: "#fde68a", icon: Clock },
  suspended: { label: "Suspended", color: "#b91c1c", bg: "#fef2f2", border: "#fecaca", icon: XCircle },
};

const QUALITY = {
  GREEN: { color: "#15803d", bg: "#ecfdf5", label: "High" },
  YELLOW: { color: "#b45309", bg: "#fffbeb", label: "Medium" },
  RED: { color: "#b91c1c", bg: "#fef2f2", label: "Low" },
};

const REVIEW_STATUS = {
  APPROVED: { color: "#15803d", label: "Approved" },
  PENDING: { color: "#b45309", label: "Under Review" },
  REJECTED: { color: "#b91c1c", label: "Rejected" },
};

const PHONE_STATUS_COLOR = {
  CONNECTED: "#15803d",
  FLAGGED: "#b45309",
  RESTRICTED: "#b91c1c",
};

const ROLE_STYLE = {
  owner: { color: "#165DFF", bg: "#EFF6FF" },
  manager: { color: "#0369a1", bg: "#e0f2fe" },
  sales: { color: "#065f46", bg: "#d1fae5" },
};

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// ─── Small reusable components ────────────────────────────────────────────────

function Chip({ color, bg, icon: Icon, label }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 9px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        color,
        background: bg,
      }}
    >
      {Icon && <Icon size={11} strokeWidth={2.3} />}
      {label}
    </span>
  );
}

function StatusBadge({ status }) {
  const m = CRM_STATUS[status] || CRM_STATUS.pending;
  return <Chip color={m.color} bg={m.bg} icon={m.icon} label={m.label} />;
}

function WABABadge({ connected }) {
  return connected ? (
    <Chip color="#15803d" bg="#ecfdf5" icon={Wifi} label="WABA Connected" />
  ) : (
    <Chip color="#64748B" bg="#f1f5f9" icon={WifiOff} label="Not Connected" />
  );
}

function QualityBadge({ rating }) {
  if (!rating) return null;
  const q = QUALITY[rating] || { color: "#64748B", bg: "#f1f5f9", label: rating };
  return <Chip color={q.color} bg={q.bg} icon={Star} label={`${q.label} Quality`} />;
}

function MetaStatusBadge({ client }) {
  const { meta_status, meta_account_review_status, meta_ban_state } = client;

  if (!meta_status || meta_status === "skipped" || meta_status === "no_waba")
    return null;
  if (meta_status === "error" || meta_status === "no_token")
    return <Chip color="#b91c1c" bg="#fef2f2" icon={AlertTriangle} label="Meta Error" />;

  if (meta_ban_state && meta_ban_state !== "NONE") {
    return (
      <Chip
        color="#b91c1c"
        bg="#fef2f2"
        icon={AlertTriangle}
        label={`Banned: ${meta_ban_state}`}
      />
    );
  }

  const rs = REVIEW_STATUS[meta_account_review_status];
  if (rs) return <Chip color={rs.color} bg="#f8fafc" icon={BadgeCheck} label={rs.label} />;

  return <Chip color="#15803d" bg="#ecfdf5" icon={Zap} label="Meta OK" />;
}

function RoleBadge({ role }) {
  const s = ROLE_STYLE[role] || { color: "#334155", bg: "#f1f5f9" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "capitalize",
        color: s.color,
        background: s.bg,
      }}
    >
      {role}
    </span>
  );
}

function InfoRow({ icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1 mb-0.5">
        {icon} {label}
      </div>
      <div className="text-xs font-semibold text-[#172033] break-words">{value}</div>
    </div>
  );
}

// ─── Meta Registration Modal ──────────────────────────────────────────────────

function MetaRegistrationModal({ clientId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `${API_BASE_URL}api/techprovider/clients/${clientId}/meta-registration/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data);
      } catch {
        setError("Documents not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [clientId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-bold flex items-center gap-2 text-[#172033]">
            <FileText className="h-4 w-4 text-[#165DFF]" /> Client Meta Registration Details
          </h2>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#172033] hover:bg-slate-100 p-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto bg-[#FAFAFC] flex-1">
          {loading ? (
            <div className="flex justify-center p-10">
              <RefreshCw size={20} className="animate-spin text-[#165DFF]" />
            </div>
          ) : error ? (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl">
              {error}
            </div>
          ) : !data ? (
            <div className="text-[#64748B] text-xs text-center p-8">No data found.</div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                <h3 className="text-xs font-bold text-[#172033] border-b border-slate-100 pb-2 mb-3">
                  Business Details
                </h3>
                <div className="grid grid-cols-2 gap-3.5">
                  <InfoRow label="Legal Name" value={data.legal_business_name} />
                  <InfoRow label="Display Name" value={data.business_display_name} />
                  <InfoRow label="Type" value={data.business_type} />
                  <InfoRow label="Category" value={data.business_category} />
                  <InfoRow label="GST Number" value={data.gst_number} />
                  <InfoRow label="Dedicated Phone" value={data.dedicated_phone_number} />
                  <div className="col-span-2">
                    <InfoRow label="Description" value={data.business_description} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                <h3 className="text-xs font-bold text-[#172033] border-b border-slate-100 pb-2 mb-3">
                  Online Presence
                </h3>
                <div className="grid grid-cols-2 gap-3.5">
                  <InfoRow
                    label="Website"
                    value={
                      data.official_website ? (
                        <a
                          href={data.official_website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#165DFF] hover:underline"
                        >
                          {data.official_website}
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <InfoRow label="Domain Email" value={data.domain_linked_email} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                <h3 className="text-xs font-bold text-[#172033] border-b border-slate-100 pb-2 mb-3">
                  Facebook / Meta Account
                </h3>
                <div className="grid grid-cols-2 gap-3.5">
                  <InfoRow label="Account Name" value={data.meta_facebook_account} />
                  <InfoRow label="Email" value={data.facebook_email} />
                  <InfoRow label="Password" value={data.facebook_password || "—"} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                <h3 className="text-xs font-bold text-[#172033] border-b border-slate-100 pb-2 mb-3">
                  Billing & Documents
                </h3>
                <div className="grid grid-cols-2 gap-3.5">
                  <InfoRow
                    label="Intl Card Available"
                    value={data.international_card_available ? "Yes" : "No"}
                  />
                  <InfoRow label="Card Number" value={data.international_card_number} />
                  <InfoRow
                    label="Card Image"
                    value={
                      data.international_card_image ? (
                        <a
                          href={`${API_BASE_URL}${data.international_card_image}`}
                          target="_blank"
                          download
                          rel="noreferrer"
                          className="text-[#165DFF] hover:underline font-semibold"
                        >
                          Download / View File
                        </a>
                      ) : (
                        "Not uploaded"
                      )
                    }
                  />
                  <InfoRow
                    label="Business Logo"
                    value={
                      data.business_logo ? (
                        <a
                          href={`${API_BASE_URL}${data.business_logo}`}
                          target="_blank"
                          download
                          rel="noreferrer"
                          className="text-[#165DFF] hover:underline font-semibold"
                        >
                          Download / View File
                        </a>
                      ) : (
                        "Not uploaded"
                      )
                    }
                  />
                  <InfoRow
                    label="Verification Doc"
                    value={
                      data.verification_document ? (
                        <a
                          href={`${API_BASE_URL}${data.verification_document}`}
                          target="_blank"
                          download
                          rel="noreferrer"
                          className="text-[#165DFF] hover:underline font-semibold"
                        >
                          Download / View File
                        </a>
                      ) : (
                        "Not uploaded"
                      )
                    }
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                <h3 className="text-xs font-bold text-[#172033] border-b border-slate-100 pb-2 mb-3">
                  Bot Use Case
                </h3>
                <p className="text-xs text-[#64748B] whitespace-pre-wrap mb-3">
                  {data.bot_use_case_brief || "Not provided"}
                </p>
                <div className="grid grid-cols-2 gap-3.5">
                  <InfoRow
                    label="Flow Diagram / Document"
                    value={
                      data.bot_use_case_document ? (
                        <a
                          href={`${API_BASE_URL}${data.bot_use_case_document}`}
                          target="_blank"
                          download
                          rel="noreferrer"
                          className="text-[#165DFF] hover:underline font-semibold"
                        >
                          Download / View File
                        </a>
                      ) : (
                        "Not uploaded"
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="h-8 px-4 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#172033] rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Client row (expandable) ──────────────────────────────────────────────────

function ClientRow({ client, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleStatus = async (s) => {
    if (s === client.status || updating) return;
    setUpdating(true);
    try {
      await onStatusChange(client.id, s);
    } finally {
      setUpdating(false);
    }
  };

  const phoneColor = PHONE_STATUS_COLOR[client.meta_phone_status] || "#334155";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl mb-3 overflow-hidden shadow-2xs transition-all">
      {/* ── Header ── */}
      <div
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center px-5 py-3.5 gap-3.5 cursor-pointer hover:bg-slate-50/70 transition-colors"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl shrink-0 bg-blue-50 border border-blue-200/70 flex items-center justify-center text-[#165DFF] font-bold text-xs">
          {(client.name || "C").charAt(0).toUpperCase()}
        </div>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-[#172033] truncate">
            {client.name}
          </div>
          <div className="text-[11px] text-[#64748B] truncate mt-0.5">
            {client.email}
          </div>
        </div>

        {/* Badge row */}
        <div className="flex gap-1.5 items-center flex-wrap">
          <StatusBadge status={client.status} />
          <WABABadge connected={client.waba_connected} />
          <MetaStatusBadge client={client} />
          {client.meta_quality_rating && (
            <QualityBadge rating={client.meta_quality_rating} />
          )}
          {client.meta_phone_status && client.meta_phone_status !== "CONNECTED" && (
            <Chip
              color={phoneColor}
              bg="#fffbeb"
              icon={AlertTriangle}
              label={client.meta_phone_status}
            />
          )}
          <span className="text-xs text-[#64748B] flex items-center gap-1 ml-1">
            <Users size={12} /> {client.member_count ?? 0}
          </span>
        </div>

        {expanded ? (
          <ChevronUp size={15} className="text-[#64748B]" />
        ) : (
          <ChevronDown size={15} className="text-[#64748B]" />
        )}
      </div>

      {/* ── Expanded ── */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50 space-y-4">
          {client.meta_status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-red-700 text-xs font-medium flex gap-2 items-center">
              <AlertTriangle size={14} />
              Meta fetch error: {client.meta_error}
            </div>
          )}

          {/* ── Info grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            <InfoRow icon={<Building2 size={12} />} label="Industry" value={client.industry} />
            <InfoRow
              icon={<Globe size={12} />}
              label="Website"
              value={
                client.website ? (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#165DFF] hover:underline"
                  >
                    {client.website}
                  </a>
                ) : null
              }
            />
            <InfoRow
              icon={<Phone size={12} />}
              label="WABA Phone"
              value={client.meta_phone_number || client.phone_number}
            />
            <InfoRow
              icon={<BadgeCheck size={12} />}
              label="Verified Name"
              value={client.meta_verified_name}
            />
            <InfoRow icon={<Shield size={12} />} label="WABA ID" value={client.waba_id} />
            <InfoRow
              icon={<Shield size={12} />}
              label="WABA Name (Meta)"
              value={client.meta_waba_name}
            />
            <InfoRow
              icon={<Zap size={12} />}
              label="Account Review"
              value={
                client.meta_account_review_status
                  ? REVIEW_STATUS[client.meta_account_review_status]?.label ||
                    client.meta_account_review_status
                  : null
              }
            />
            <InfoRow
              icon={<AlertTriangle size={12} />}
              label="Ban State"
              value={
                client.meta_ban_state && client.meta_ban_state !== "NONE"
                  ? client.meta_ban_state
                  : null
              }
            />
            <InfoRow
              icon={<Phone size={12} />}
              label="Phone Status"
              value={
                client.meta_phone_status ? (
                  <span style={{ color: phoneColor, fontWeight: 600 }}>
                    {client.meta_phone_status}
                  </span>
                ) : null
              }
            />
            <InfoRow
              icon={<Star size={12} />}
              label="Quality Rating"
              value={
                client.meta_quality_rating ? (
                  <span
                    style={{
                      color:
                        QUALITY[client.meta_quality_rating]?.color || "#334155",
                      fontWeight: 600,
                    }}
                  >
                    {QUALITY[client.meta_quality_rating]?.label ||
                      client.meta_quality_rating}
                  </span>
                ) : null
              }
            />
            <InfoRow
              icon={<Calendar size={12} />}
              label="Onboarded"
              value={fmt(client.created_at)}
            />
          </div>

          {/* ── Messages Stats Grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-3 border-t border-dashed border-slate-200">
            <InfoRow
              icon={<MessageSquare size={12} />}
              label="Daily Msgs"
              value={client.daily_messages ?? 0}
            />
            <InfoRow
              icon={<MessageSquare size={12} />}
              label="Weekly Msgs"
              value={client.weekly_messages ?? 0}
            />
            <InfoRow
              icon={<MessageSquare size={12} />}
              label="Monthly Msgs"
              value={client.monthly_messages ?? 0}
            />
            <InfoRow
              icon={<MessageSquare size={12} />}
              label="Total Msgs"
              value={client.total_messages ?? 0}
            />
          </div>

          {/* ── CRM Status changer & Documents ── */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#64748B] font-semibold">CRM Status:</span>
              {Object.entries(CRM_STATUS).map(([s, m]) => (
                <button
                  key={s}
                  disabled={updating || client.status === s}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatus(s);
                  }}
                  style={{
                    padding: "4px 11px",
                    borderRadius: 8,
                    border: `1px solid ${client.status === s ? m.color : "#e2e8f0"}`,
                    background: client.status === s ? m.bg : "#fff",
                    color: client.status === s ? m.color : "#64748B",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor:
                      updating || client.status === s ? "not-allowed" : "pointer",
                    opacity: updating ? 0.6 : 1,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-[#165DFF] hover:bg-blue-100/80 rounded-xl text-xs font-semibold transition-colors border border-blue-200/70 cursor-pointer"
            >
              <FileText size={13} />
              View Registration Docs
            </button>
          </div>

          {modalOpen && (
            <MetaRegistrationModal
              clientId={client.id}
              onClose={() => setModalOpen(false)}
            />
          )}

          {/* ── Members ── */}
          {client.members?.length > 0 ? (
            <div>
              <div className="text-xs font-bold text-[#172033] mb-2 flex items-center gap-1.5">
                <Users size={13} className="text-[#165DFF]" /> Team Members (
                {client.members.length})
              </div>
              <div className="space-y-1.5">
                {client.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-xl px-3.5 py-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-[#172033] shrink-0">
                      {(m.full_name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#172033] truncate">
                        {m.full_name}
                      </div>
                      <div className="text-[11px] text-[#64748B] truncate">
                        {m.email}
                      </div>
                    </div>
                    <RoleBadge role={m.role} />
                    <div className="text-[11px] text-[#64748B] whitespace-nowrap">
                      Joined {fmt(m.joined_at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#64748B] italic">No team members yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TechProviderClients() {
  const token = localStorage.getItem("accessToken");
  const userEmail =
    localStorage.getItem("ownerEmail") || localStorage.getItem("orgEmail") || "";

  const [data, setData] = useState(cachedClientsData);
  const [loading, setLoading] = useState(!cachedClientsData);
  const [syncingMeta, setSyncingMeta] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Fast load by default (meta=0 skips slow synchronous Meta Graph API calls per client)
  const load = useCallback(
    async ({ withLiveMeta = false, silent = false } = {}) => {
      if (withLiveMeta) {
        setSyncingMeta(true);
      } else if (!silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const params = {};
        if (!withLiveMeta) {
          params.meta = "0";
        }
        const res = await axios.get(`${API_BASE_URL}api/techprovider/clients/`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        cachedClientsData = res.data;
        setData(res.data);
      } catch (e) {
        if (!silent) {
          setError(
            e?.response?.data?.detail ||
              e?.response?.data?.message ||
              "Failed to load clients."
          );
        }
      } finally {
        setLoading(false);
        setSyncingMeta(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!cachedClientsData) {
      load({ withLiveMeta: false });
    }
  }, [load]);

  const handleStatusChange = async (clientId, newStatus) => {
    await axios.patch(
      `${API_BASE_URL}api/techprovider/clients/${clientId}/`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await load({ withLiveMeta: false, silent: true });
  };

  // Client-side instant filtering (zero server load when typing search or switching status)
  const filteredClients = useMemo(() => {
    const list = data?.clients || [];
    const q = search.trim().toLowerCase();
    return list.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (
        q &&
        !(
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.waba_id?.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      return true;
    });
  }, [data, search, statusFilter]);

  if (!canViewClients(userEmail)) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] flex flex-col items-center justify-center text-red-600 gap-2 font-sans">
        <XCircle size={40} />
        <div className="text-base font-bold text-[#172033]">Access Denied</div>
        <div className="text-xs text-[#64748B]">Tech-provider accounts only.</div>
      </div>
    );
  }

  const summary = data?.summary || {};

  return (
    <div className="min-h-screen w-full bg-[#FAFAFC] p-5 sm:p-6 lg:p-7 space-y-5 font-sans text-[#172033]">
      {/* ── PAGE HEADER (Matches Dashboard, Leads, WhatsApp, Templates, Campaign, Profile) ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3.5 min-h-[56px] border-b border-[#E5E7EB]/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172033] leading-tight">
            Client Accounts
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-normal">
            {data?.tech_provider
              ? `${data.tech_provider} · ${summary.total ?? 0} onboarded client organizations`
              : "Manage onboarded client accounts and WABA status"}
          </p>
        </div>

        {/* Right Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Status Segmented Tabs */}
          <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
            {[
              { key: "", label: "All", count: summary.total ?? 0 },
              { key: "active", label: "Active", count: summary.active ?? 0 },
              { key: "pending", label: "Pending", count: summary.pending ?? 0 },
              { key: "suspended", label: "Suspended", count: summary.suspended ?? 0 },
            ].map((tabItem) => {
              const active = statusFilter === tabItem.key;
              return (
                <button
                  key={tabItem.key}
                  onClick={() => setStatusFilter(tabItem.key)}
                  className={`h-7 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? "bg-[#165DFF] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#172033]"
                  }`}
                >
                  <span>{tabItem.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-white text-[#64748B]"
                    }`}
                  >
                    {tabItem.count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => load({ withLiveMeta: false })}
            disabled={loading || syncingMeta}
            className="h-9 flex items-center gap-1.5 text-xs font-semibold px-3.5 bg-white border border-[#E5E7EB] rounded-xl text-[#172033] hover:border-[#165DFF]/40 hover:text-[#165DFF] hover:bg-blue-50/30 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              size={13}
              className={
                loading ? "animate-spin text-[#165DFF]" : "text-[#64748B]"
              }
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => load({ withLiveMeta: true })}
            disabled={loading || syncingMeta}
            className="h-9 flex items-center gap-1.5 text-xs font-semibold px-3.5 bg-[#165DFF] hover:bg-[#1248CC] text-white rounded-xl transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            title="Fetch live quality rating and review status from Meta Graph API"
          >
            <Zap
              size={13}
              className={syncingMeta ? "animate-pulse" : ""}
            />
            <span>{syncingMeta ? "Syncing Meta…" : "Sync Live Meta"}</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="relative w-full sm:w-80">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            type="text"
            placeholder="Search client by name, email, or WABA ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:bg-white focus:border-[#165DFF] focus:ring-3 focus:ring-[#165DFF]/10 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172033] cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <span className="font-semibold text-[#172033]">Showing</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#165DFF] border border-blue-100 tabular-nums">
            {filteredClients.length}
          </span>
        </div>
      </div>

      {/* ── CLIENT LIST ── */}
      {loading ? (
        <div className="py-20 text-center text-[#64748B]">
          <RefreshCw
            size={22}
            className="animate-spin text-[#165DFF] mx-auto mb-2.5"
          />
          <div className="text-xs font-medium">Loading client accounts…</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3.5 text-red-700 text-xs font-semibold">
          {error}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
          <Building2 size={28} className="mx-auto mb-2 text-[#94A3B8]" />
          <div className="text-xs font-bold text-[#172033]">No clients found</div>
          <div className="text-xs text-[#64748B] mt-1">
            {search || statusFilter
              ? "Try adjusting your search or filter."
              : "No clients onboarded yet."}
          </div>
        </div>
      ) : (
        <div>
          {filteredClients.map((c) => (
            <ClientRow
              key={c.id}
              client={c}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
