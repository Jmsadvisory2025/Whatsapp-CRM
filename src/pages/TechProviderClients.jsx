// src/pages/TechProviderClients.jsx
// Route: /clients  (inside HomeResolver children in App.jsx)
// Sidebar: shown only when isTechProvider(email) is true

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { isTechProvider } from "../store/authUtils";
import {
  Building2, Wifi, WifiOff, Search, RefreshCw,
  ChevronDown, ChevronUp, Users, Globe, Mail,
  Phone, Calendar, CheckCircle2, Clock, XCircle,
  Shield, BadgeCheck, AlertTriangle, Star, Zap,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Static meta ─────────────────────────────────────────────────────────────

const CRM_STATUS = {
  active:    { label: "Active",    color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 },
  pending:   { label: "Pending",   color: "#d97706", bg: "#fef3c7", icon: Clock        },
  suspended: { label: "Suspended", color: "#dc2626", bg: "#fee2e2", icon: XCircle      },
};

const QUALITY = {
  GREEN:  { color: "#16a34a", bg: "#dcfce7", label: "High"   },
  YELLOW: { color: "#d97706", bg: "#fef3c7", label: "Medium" },
  RED:    { color: "#dc2626", bg: "#fee2e2", label: "Low"    },
};

const REVIEW_STATUS = {
  APPROVED:  { color: "#16a34a", label: "Approved"  },
  PENDING:   { color: "#d97706", label: "Under Review" },
  REJECTED:  { color: "#dc2626", label: "Rejected"  },
};

const PHONE_STATUS_COLOR = {
  CONNECTED:  "#16a34a",
  FLAGGED:    "#d97706",
  RESTRICTED: "#dc2626",
};

const ROLE_STYLE = {
  owner:   { color: "#6d28d9", bg: "#ede9fe" },
  manager: { color: "#0369a1", bg: "#e0f2fe" },
  sales:   { color: "#065f46", bg: "#d1fae5" },
};

const fmt = (iso) => new Date(iso).toLocaleDateString("en-IN", {
  day: "2-digit", month: "short", year: "numeric",
});

// ─── Small reusable components ────────────────────────────────────────────────

function Chip({ color, bg, icon: Icon, label }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600,
      color, background: bg,
    }}>
      {Icon && <Icon size={11} strokeWidth={2.5} />}
      {label}
    </span>
  );
}

function StatusBadge({ status }) {
  const m = CRM_STATUS[status] || CRM_STATUS.pending;
  return <Chip color={m.color} bg={m.bg} icon={m.icon} label={m.label} />;
}

function WABABadge({ connected }) {
  return connected
    ? <Chip color="#15803d" bg="#dcfce7" icon={Wifi}    label="WABA Connected" />
    : <Chip color="#6b7280" bg="#f3f4f6" icon={WifiOff} label="Not Connected"  />;
}

function QualityBadge({ rating }) {
  if (!rating) return null;
  const q = QUALITY[rating] || { color: "#6b7280", bg: "#f3f4f6", label: rating };
  return <Chip color={q.color} bg={q.bg} icon={Star} label={`${q.label} Quality`} />;
}

function MetaStatusBadge({ client }) {
  const { meta_status, meta_account_review_status, meta_ban_state, meta_phone_status } = client;

  if (!meta_status || meta_status === "skipped" || meta_status === "no_waba")
    return null;
  if (meta_status === "error" || meta_status === "no_token")
    return <Chip color="#dc2626" bg="#fee2e2" icon={AlertTriangle} label="Meta Error" />;

  // Ban state takes priority
  if (meta_ban_state && meta_ban_state !== "NONE") {
    return <Chip color="#dc2626" bg="#fee2e2" icon={AlertTriangle} label={`Banned: ${meta_ban_state}`} />;
  }

  const rs = REVIEW_STATUS[meta_account_review_status];
  if (rs) return <Chip color={rs.color} bg="#f3f4f6" icon={BadgeCheck} label={rs.label} />;

  return <Chip color="#16a34a" bg="#dcfce7" icon={Zap} label="Meta OK" />;
}

function RoleBadge({ role }) {
  const s = ROLE_STYLE[role] || { color: "#374151", bg: "#f3f4f6" };
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 6,
      fontSize: 11, fontWeight: 600, textTransform: "capitalize",
      color: s.color, background: s.bg,
    }}>{role}</span>
  );
}

function InfoRow({ icon, label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <div style={{
        fontSize: 11, color: "#9ca3af", fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.06em",
        display: "flex", alignItems: "center", gap: 4, marginBottom: 2,
      }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{
      flex: "1 1 140px", background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: 14, padding: "16px 20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>{value ?? "—"}</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── Client row (expandable) ──────────────────────────────────────────────────

function ClientRow({ client, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (s) => {
    if (s === client.status || updating) return;
    setUpdating(true);
    try { await onStatusChange(client.id, s); }
    finally { setUpdating(false); }
  };

  const phoneColor = PHONE_STATUS_COLOR[client.meta_phone_status] || "#374151";

  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: 14, marginBottom: 12, overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      {/* ── Header ── */}
      <div
        onClick={() => setExpanded(p => !p)}
        style={{
          display: "flex", alignItems: "center",
          padding: "14px 20px", gap: 14, cursor: "pointer",
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 42, height: 42, borderRadius: 11, flexShrink: 0,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: 17,
        }}>
          {client.name.charAt(0).toUpperCase()}
        </div>

        {/* Name + email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 600, color: "#111827",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {client.name}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>
            {client.email}
          </div>
        </div>

        {/* Badge row */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <StatusBadge status={client.status} />
          <WABABadge connected={client.waba_connected} />
          <MetaStatusBadge client={client} />
          {client.meta_quality_rating && <QualityBadge rating={client.meta_quality_rating} />}
          {client.meta_phone_status && client.meta_phone_status !== "CONNECTED" && (
            <Chip
              color={phoneColor} bg="#fef3c7"
              icon={AlertTriangle}
              label={client.meta_phone_status}
            />
          )}
          <span style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
            <Users size={13} /> {client.member_count}
          </span>
        </div>

        {expanded ? <ChevronUp size={17} color="#9ca3af" /> : <ChevronDown size={17} color="#9ca3af" />}
      </div>

      {/* ── Expanded ── */}
      {expanded && (
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "20px 24px", background: "#fafafa" }}>

          {/* ── Meta live info banner ── */}
          {client.meta_status === "error" && (
            <div style={{
              background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10,
              padding: "10px 14px", color: "#dc2626", fontSize: 13, marginBottom: 16,
              display: "flex", gap: 8, alignItems: "center",
            }}>
              <AlertTriangle size={15} />
              Meta fetch error: {client.meta_error}
            </div>
          )}

          {/* ── Info grid ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
            gap: "14px 24px", marginBottom: 20,
          }}>
            <InfoRow icon={<Building2 size={13}/>}  label="Industry"          value={client.industry} />
            <InfoRow icon={<Globe size={13}/>}       label="Website"
              value={client.website
                ? <a href={client.website} target="_blank" rel="noreferrer" style={{color:"#6366f1"}}>{client.website}</a>
                : null}
            />
            <InfoRow icon={<Phone size={13}/>}       label="WABA Phone"        value={client.meta_phone_number || client.phone_number} />
            <InfoRow icon={<BadgeCheck size={13}/>}  label="Verified Name"     value={client.meta_verified_name} />
            <InfoRow icon={<Shield size={13}/>}      label="WABA ID"           value={client.waba_id} />
            <InfoRow icon={<Shield size={13}/>}      label="WABA Name (Meta)"  value={client.meta_waba_name} />
            <InfoRow icon={<Zap size={13}/>}         label="Account Review"
              value={client.meta_account_review_status
                ? (REVIEW_STATUS[client.meta_account_review_status]?.label || client.meta_account_review_status)
                : null}
            />
            <InfoRow icon={<AlertTriangle size={13}/>} label="Ban State"
              value={client.meta_ban_state && client.meta_ban_state !== "NONE" ? client.meta_ban_state : null}
            />
            <InfoRow icon={<Phone size={13}/>}       label="Phone Status"
              value={client.meta_phone_status
                ? <span style={{color: phoneColor, fontWeight:600}}>{client.meta_phone_status}</span>
                : null}
            />
            <InfoRow icon={<Star size={13}/>}        label="Quality Rating"
              value={client.meta_quality_rating
                ? <span style={{color: QUALITY[client.meta_quality_rating]?.color || "#374151", fontWeight:600}}>
                    {QUALITY[client.meta_quality_rating]?.label || client.meta_quality_rating}
                  </span>
                : null}
            />
            <InfoRow icon={<Calendar size={13}/>}    label="Onboarded"         value={fmt(client.created_at)} />
          </div>

          {/* ── CRM Status changer ── */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, color:"#6b7280", fontWeight:500 }}>CRM Status:</span>
            {Object.entries(CRM_STATUS).map(([s, m]) => (
              <button key={s} disabled={updating || client.status === s}
                onClick={e => { e.stopPropagation(); handleStatus(s); }}
                style={{
                  padding:"4px 12px", borderRadius:8,
                  border:`1.5px solid ${client.status === s ? m.color : "#e5e7eb"}`,
                  background: client.status === s ? m.bg : "#fff",
                  color: client.status === s ? m.color : "#6b7280",
                  fontSize:12, fontWeight:600,
                  cursor: updating || client.status === s ? "not-allowed" : "pointer",
                  opacity: updating ? 0.6 : 1, transition:"all 0.15s",
                }}
              >{m.label}</button>
            ))}
          </div>

          {/* ── Members ── */}
          {client.members?.length > 0 && (
            <div>
              <div style={{
                fontSize:13, fontWeight:600, color:"#374151", marginBottom:10,
                display:"flex", alignItems:"center", gap:6,
              }}>
                <Users size={14}/> Team Members ({client.members.length})
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {client.members.map(m => (
                  <div key={m.id} style={{
                    display:"flex", alignItems:"center", gap:12,
                    background:"#fff", border:"1px solid #e5e7eb",
                    borderRadius:10, padding:"9px 13px",
                  }}>
                    <div style={{
                      width:30, height:30, borderRadius:8, background:"#f3f4f6",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontWeight:700, fontSize:13, color:"#374151", flexShrink:0,
                    }}>{m.full_name.charAt(0).toUpperCase()}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{m.full_name}</div>
                      <div style={{ fontSize:12, color:"#9ca3af" }}>{m.email}</div>
                    </div>
                    <RoleBadge role={m.role} />
                    <div style={{ fontSize:11, color:"#9ca3af", whiteSpace:"nowrap" }}>
                      Joined {fmt(m.joined_at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {client.members?.length === 0 && (
            <div style={{ fontSize:13, color:"#9ca3af", fontStyle:"italic" }}>No team members yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TechProviderClients() {
  const token     = localStorage.getItem("accessToken");
  const userEmail = localStorage.getItem("ownerEmail") || localStorage.getItem("orgEmail") || "";

  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search)       params.search = search;
      const res = await axios.get(`${API_BASE_URL}api/techprovider/clients/`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.response?.data?.message || "Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (clientId, newStatus) => {
    await axios.patch(
      `${API_BASE_URL}api/techprovider/clients/${clientId}/`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await load();
  };

  if (!isTechProvider(userEmail)) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60vh", color:"#dc2626", gap:12 }}>
        <XCircle size={48}/><div style={{fontSize:18,fontWeight:600}}>Access Denied</div>
        <div style={{color:"#6b7280"}}>Tech-provider accounts only.</div>
      </div>
    );
  }

  const summary = data?.summary || {};

  return (
    <div style={{ padding:"28px 32px", maxWidth:1100, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <Building2 size={20} color="#6366f1"/>
            <h1 style={{ fontSize:21, fontWeight:700, color:"#111827", margin:0 }}>Client Accounts</h1>
          </div>
          {data && (
            <p style={{ fontSize:13, color:"#6b7280", marginTop:3, marginLeft:29 }}>
              {data.tech_provider} &mdash; {summary.total ?? 0} clients · Live Meta status included
            </p>
          )}
        </div>
        <button onClick={load} disabled={loading} style={{
          display:"flex", alignItems:"center", gap:6,
          padding:"8px 15px", borderRadius:10, border:"1px solid #e5e7eb",
          background:"#fff", color:"#374151", fontSize:13, fontWeight:500,
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
        }}>
          <RefreshCw size={14} style={{animation: loading ? "spin 1s linear infinite" : "none"}}/>
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:22 }}>
        <SummaryCard label="Total"     value={summary.total}     color="#6366f1"/>
        <SummaryCard label="Active"    value={summary.active}    color="#16a34a"/>
        <SummaryCard label="Pending"   value={summary.pending}   color="#d97706"/>
        <SummaryCard label="Suspended" value={summary.suspended} color="#dc2626"/>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:"1 1 240px" }}>
          <Search size={14} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#9ca3af" }}/>
          <input
            type="text" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load()}
            style={{
              width:"100%", padding:"9px 12px 9px 34px", borderRadius:10,
              border:"1px solid #e5e7eb", fontSize:13, color:"#111827",
              outline:"none", boxSizing:"border-box",
            }}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
          padding:"9px 14px", borderRadius:10, border:"1px solid #e5e7eb",
          fontSize:13, color:"#374151", background:"#fff", cursor:"pointer",
        }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign:"center", padding:60, color:"#9ca3af" }}>
          <RefreshCw size={26} style={{ animation:"spin 1s linear infinite", marginBottom:10 }}/>
          <div>Loading clients + Meta status…</div>
        </div>
      )}

      {!loading && error && (
        <div style={{ background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:12, padding:"14px 18px", color:"#dc2626", fontSize:14 }}>
          {error}
        </div>
      )}

      {!loading && !error && !data?.clients?.length && (
        <div style={{ textAlign:"center", padding:60, color:"#9ca3af", border:"2px dashed #e5e7eb", borderRadius:14 }}>
          <Building2 size={34} style={{ marginBottom:10, opacity:0.4 }}/>
          <div style={{ fontSize:15, fontWeight:600 }}>No clients found</div>
          <div style={{ fontSize:13, marginTop:3 }}>
            {search || statusFilter ? "Try adjusting your filters." : "No clients onboarded yet."}
          </div>
        </div>
      )}

      {!loading && !error && data?.clients?.map(c => (
        <ClientRow key={c.id} client={c} onStatusChange={handleStatusChange}/>
      ))}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}