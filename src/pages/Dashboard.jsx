import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  MessageSquare, CheckCheck, Eye, AlertCircle,
  Users, TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff,
  Calendar as CalendarIcon, Activity, Zap, BarChart2, Building2, Info
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { isTechProvider, canViewClients } from "../store/authUtils";
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/* ─── Helpers ───────────────────────────────────────────────── */
const token = () => localStorage.getItem("accessToken");

const fmt = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0);

const pct = (num, den) =>
  den > 0 ? ((num / den) * 100).toFixed(1) + "%" : "—";

/* ─── Brand Color Palette (referencing SignIn / SignUp) ─────── */
const C = {
  blue: "#165DFF",      // Primary brand electric blue
  blueHover: "#1247CC",
  navy: "#172033",      // Primary heading dark navy
  slate: "#64748B",     // Secondary text slate
  muted: "#94A3B8",
  sky: "#0EA5E9",       // Sky blue (Leads / Dispatcher)
  cyan: "#38BDF8",
  whatsapp: "#25D366",  // WhatsApp green
  emerald: "#10B981",   // Active / Delivered green
  indigo: "#6366F1",    // Indigo accent
  purple: "#8B5CF6",    // Purple accent
  amber: "#F59E0B",     // Amber accent
  red: "#EF4444",       // Danger red
};

/* ─── Premium Portal Floating Tooltip Helper ────────────────── */
const InfoTooltip = ({ text }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  const handleMouseEnter = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  return (
    <span
      ref={btnRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center ml-1.5 text-slate-400 hover:text-[#165DFF] cursor-help transition-colors select-none"
    >
      <Info size={13} />
      {open &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: "translate(-50%, 0)",
              zIndex: 999999,
            }}
            className="w-52 p-2.5 bg-[#172033]/95 backdrop-blur-xs text-white text-[11px] leading-relaxed font-normal rounded-xl shadow-2xl border border-slate-700/50 pointer-events-none text-center shadow-slate-900/20"
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-[#172033]/95" />
            {text}
          </div>,
          document.body
        )}
    </span>
  );
};

/* ─── Reusable SaaS KPI Stat Card ───────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, color, bgTint, borderTint, trend, onClick, tooltip }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl p-3.5 sm:p-4 lg:p-4 border border-slate-200/80 shadow-sm shadow-blue-500/[0.03] flex flex-col justify-between h-full flex-1 min-w-[130px] shrink transition-all duration-200 ${
      onClick
        ? "cursor-pointer hover:border-[#165DFF]/35 hover:shadow-md hover:shadow-blue-500/[0.06] hover:-translate-y-0.5"
        : ""
    }`}
  >
    <div className="flex items-center justify-between mb-3.5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border"
        style={{
          backgroundColor: bgTint || `${color}12`,
          borderColor: borderTint || `${color}24`,
        }}
      >
        <Icon size={17} style={{ color }} strokeWidth={2.2} />
      </div>
      {trend !== undefined && (
        <span
          className="text-[11px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg border"
          style={
            trend >= 0
              ? { background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }
              : { background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }
          }
        >
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight truncate leading-none">
        {value}
      </p>
      <div className="flex items-center mt-2">
        <p className="text-xs font-medium text-[#64748B] truncate">{label}</p>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      {sub && <p className="text-[11px] text-[#94A3B8] mt-1 truncate">{sub}</p>}
    </div>
  </div>
);

/* ─── Section Header ────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, sub, color, bgTint, borderTint, rightBadge }) => (
  <div className="flex items-center justify-between gap-3 mb-4">
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border"
        style={{
          backgroundColor: bgTint || `${color}12`,
          borderColor: borderTint || `${color}24`,
        }}
      >
        <Icon size={15} style={{ color }} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-[#172033] tracking-tight leading-snug truncate">
          {title}
        </h3>
        {sub && <p className="text-[11px] text-[#64748B] leading-tight mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
    {rightBadge && <div className="flex-shrink-0">{rightBadge}</div>}
  </div>
);

/* ─── Custom Chart Tooltip ──────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-lg shadow-blue-500/10 px-3.5 py-2.5 text-xs">
      <p className="font-semibold text-[#172033] mb-1.5 border-b border-slate-100 pb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3 mb-1 last:mb-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.stroke }} />
            <span className="text-[#64748B] font-medium">{p.name}:</span>
          </div>
          <span className="font-bold text-[#172033]">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Empty Chart State ─────────────────────────────────────── */
function EmptyChart({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-[#94A3B8] gap-2.5 bg-slate-50/60 rounded-xl border border-dashed border-slate-200/80">
      <BarChart2 size={24} className="text-[#165DFF]/40" />
      <p className="text-xs font-medium text-[#64748B]">{label}</p>
    </div>
  );
}

/* ─── Main Dashboard ────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("ownerEmail") || "";
  const isTp = isTechProvider(userEmail);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isTp) {
        // 1. Tech Provider Path
        const tk = localStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${tk}` };

        const pDashboard = fetch(`${API_BASE}api/industry/dashboard/`, { headers })
          .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); });
          
        const pCustomers = fetch(`${API_BASE}api/industry/customers/?page_size=200`, { headers })
          .then(res => res.ok ? res.json() : null)
          .catch(e => { console.error("Failed to fetch accurate TP leads count", e); return null; });
          
        const pClients = fetch(`${API_BASE}api/techprovider/clients/`, { headers })
          .then(res => res.ok ? res.json() : null)
          .catch(e => { console.error("Failed to fetch TP clients count", e); return null; });

        const [json, lpJson, clientJson] = await Promise.all([pDashboard, pCustomers, pClients]);

        let realLeadCount = undefined;
        let realProspectCount = undefined;
        let realTotalCustomers = json.total_customers;
        let realCustomersByDay = {};
        
        if (lpJson) {
          realLeadCount = lpJson.lead_count;
          realProspectCount = lpJson.prospect_count;
          realTotalCustomers = lpJson.total_count !== undefined ? lpJson.total_count : json.total_customers;
          json.rawCustomers = lpJson.results || [];
          (lpJson.results || []).forEach(c => {
            if (c.created_at) {
              const dStr = c.created_at.split('T')[0];
              realCustomersByDay[dStr] = (realCustomersByDay[dStr] || 0) + 1;
            }
          });
        }

        let realTotalClients = undefined;
        let realClientsByDay = {};
        if (clientJson) {
          realTotalClients = clientJson.summary?.total;
          (clientJson.clients || []).forEach(c => {
            if (c.created_at) {
              const dStr = c.created_at.split('T')[0];
              realClientsByDay[dStr] = (realClientsByDay[dStr] || 0) + 1;
            }
          });
        }

        setData({
          status: "connected",
          totals: {
            messages: json.total_messages,
            delivered: 0,
            read: 0,
            failed: 0,
            templates: 0,
            conversations: json.total_conversations,
          },
          daily_stats: json.messages_last_7_days.map((d) => ({
            day: d.date,
            count: d.count,
          })),
          template_stats: [],
          summary: {
            total_customers: realTotalCustomers,
            active_today: json.active_today,
            new_today: json.new_today,
            conversations_by_status: json.conversations_by_status,
            leads: realLeadCount,
            prospects: realProspectCount,
            total_clients: realTotalClients,
          },
          realCustomersByDay: realCustomersByDay,
          realClientsByDay: realClientsByDay,
          rawCustomers: json.rawCustomers,
        });
      } else {
        // 2. Normal Client Path
        const tk = token();
        const headers = { Authorization: `Bearer ${tk}` };

        const pAnalytics = fetch(`${API_BASE}api/analytics/`, { headers })
          .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); });
          
        const pCustomers = fetch(`${API_BASE}api/customer/?page_size=200`, { headers })
          .then(res => res.ok ? res.json() : null)
          .catch(e => { console.error("Failed to fetch real customer dates", e); return null; });

        const [json, lpJson] = await Promise.all([pAnalytics, pCustomers]);

        if (json.client_summary) {
          json.summary = json.client_summary;
        }

        let realCustomersByDay = {};
        const todayLocalYMD = () => {
          const now = new Date();
          return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        };
        const todayStr = todayLocalYMD();
        let computedNewToday = 0;

        if (lpJson) {
          json.rawCustomers = lpJson.results || [];
          (lpJson.results || []).forEach(c => {
            if (c.created_at) {
              const dStr = c.created_at.split('T')[0];
              realCustomersByDay[dStr] = (realCustomersByDay[dStr] || 0) + 1;
              const cd = new Date(c.created_at);
              const cLocalStr = `${cd.getFullYear()}-${String(cd.getMonth() + 1).padStart(2, "0")}-${String(cd.getDate()).padStart(2, "0")}`;
              if (cLocalStr === todayStr || dStr === todayStr) {
                computedNewToday += 1;
              }
            }
          });
        }
        json.realCustomersByDay = realCustomersByDay;

        if (!json.summary) json.summary = {};
        if (json.summary.new_today === undefined) {
          json.summary.new_today = json.new_today !== undefined ? json.new_today : computedNewToday;
        }
        if (json.summary.active_today === undefined && json.active_today !== undefined) {
          json.summary.active_today = json.active_today;
        }

        setData(json);
      }
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [isTp]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  /* ── Loading skeleton ─────────────────────────────────────── */
  if (loading && !data) {
    return <LoaderDemo />;
  }

  /* ── Not connected / no org ───────────────────────────────── */
  if (data?.status === "not_connected" || data?.status === "no_org") {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[65vh] gap-4 bg-[#FAFAFC] font-sans">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shadow-sm">
          <WifiOff size={28} className="text-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-[#172033] tracking-tight">WhatsApp Not Connected</h2>
        <p className="text-xs text-[#64748B] text-center max-w-sm leading-relaxed">
          {data?.status === "no_org"
            ? "No organisation found. Complete setup first to view analytics."
            : "Connect your WABA account to start visualizing your message analytics."}
        </p>
      </div>
    );
  }

  /* ── Error state ──────────────────────────────────────────── */
  if (error && !data) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[65vh] gap-4 bg-[#FAFAFC] font-sans">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-[#172033] tracking-tight">Failed to Load Analytics</h2>
        <p className="text-xs text-[#64748B]">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-1 px-4 py-2 bg-[#165DFF] hover:bg-[#1247CC] text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={13} />
          Try Again
        </button>
      </div>
    );
  }

  const { totals = {}, daily_stats = [], waba = {}, summary = {} } = data || {};

  /* ── Derived data ─────────────────────────────────────────── */
  const totalDelivered = (totals.delivered || 0) + (totals.read || 0);
  const deliveryRate = pct(totalDelivered, totals.messages);
  const readRate = pct(totals.read, totals.messages);
  const deliveryPctNum = totals.messages > 0 ? Math.min(100, (totalDelivered / totals.messages) * 100) : 0;
  const readPctNum = totals.messages > 0 ? Math.min(100, ((totals.read || 0) / totals.messages) * 100) : 0;

  // Ensure stats are sorted chronologically (oldest to newest) for left-to-right chart rendering
  const chronologicalStats = [...daily_stats].sort((a, b) => new Date(a.day) - new Date(b.day));

  const hasRealCustomerData = chronologicalStats.some(d =>
    d.customers !== undefined || d.new_customers !== undefined || d.customer_count !== undefined || d.active_customers !== undefined
  );

  let fakeDailyCounts = [];
  if (!hasRealCustomerData && summary.total_customers) {
    let remaining = summary.total_customers;
    const days = chronologicalStats.length || 7;
    fakeDailyCounts = new Array(days).fill(0);

    for (let i = days - 1; i >= 0 && remaining > 0; i--) {
      fakeDailyCounts[i] = 1;
      remaining--;
    }
    if (remaining > 0 && days > 0) {
      fakeDailyCounts[days - 1] += remaining;
    }
  }

  const chartDailyRaw = chronologicalStats.map((d, index) => {
    let dailyMsg = d.count || d.messages || 0;

    let dailyCust = 0;
    if (data.realCustomersByDay && Object.keys(data.realCustomersByDay).length > 0) {
      const dStr = d.day ? d.day.split('T')[0] : "";
      dailyCust = data.realCustomersByDay[dStr] || 0;
    } else {
      const realCust = d.customers || d.new_customers || d.customer_count || d.active_customers;
      dailyCust = realCust !== undefined ? realCust : (fakeDailyCounts[index] || 0);
    }

    let dailyClients = 0;
    if (data.realClientsByDay && Object.keys(data.realClientsByDay).length > 0) {
      const dStr = d.day ? d.day.split('T')[0] : "";
      dailyClients = data.realClientsByDay[dStr] || 0;
    }

    return {
      date: d.day
        ? new Date(d.day).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
        : "—",
      Messages: dailyMsg,
      Customers: dailyCust,
      Clients: dailyClients,
    };
  });

  return (
    <div className="p-5 sm:p-6 lg:p-7 space-y-5 bg-[#FAFAFC] min-h-screen w-full font-sans text-[#172033]">

      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3.5 min-h-[56px] border-b border-[#E5E7EB]/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight leading-tight">
            Dashboard
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-normal flex items-center gap-1.5">
            Monitor conversations, contacts, and campaign performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {waba?.status && (
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                waba.status === "connected"
                  ? "bg-emerald-50/90 text-emerald-700 border-emerald-200/80"
                  : "bg-amber-50/90 text-amber-700 border-amber-200/80"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  waba.status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span className="uppercase tracking-wider text-[10px]">{waba.status}</span>
            </span>
          )}

          {lastUpdated && (
            <span className="hidden sm:inline-block text-[11px] font-normal text-[#94A3B8]">
              Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="h-9 flex items-center gap-1.5 text-xs font-semibold px-3.5 bg-white border border-[#E5E7EB] rounded-xl text-[#172033] hover:border-[#165DFF]/40 hover:text-[#165DFF] hover:bg-blue-50/30 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[#165DFF]" : "text-[#64748B]"} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── KPI Stat Cards ──────────────────────────────────── */}
      <div className="flex flex-row flex-nowrap w-full gap-2.5 sm:gap-3 lg:gap-3.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {summary.total_clients !== undefined && isTp && canViewClients(userEmail) && (
          <StatCard
            icon={Building2}
            label="Total Clients"
            value={fmt(summary.total_clients)}
            color={C.blue}
            bgTint="#EFF6FF"
            borderTint="#DBEAFE"
            onClick={() => navigate("/clients")}
            tooltip="Total clients associated with your Tech Provider account."
          />
        )}
        {totals.messages !== undefined && (
          <StatCard
            icon={MessageSquare}
            label="Total Messages"
            value={fmt(totals.messages)}
            color={C.blue}
            bgTint="#EFF6FF"
            borderTint="#DBEAFE"
            onClick={() => navigate("/inbox")}
            tooltip="Total messages sent across all conversations."
          />
        )}
        {summary.total_customers !== undefined && (
          <StatCard
            icon={Users}
            label="Total Customers"
            value={fmt(summary.total_customers)}
            color={C.indigo}
            bgTint="#EEF2FF"
            borderTint="#E0E7FF"
            onClick={() => navigate("/customers")}
            tooltip="Total unique customers registered in the CRM."
          />
        )}
        {summary.active_today !== undefined && (
          <StatCard
            icon={Activity}
            label="Active Today"
            value={fmt(summary.active_today)}
            color={C.emerald}
            bgTint="#ECFDF5"
            borderTint="#D1FAE5"
            onClick={() => navigate("/inbox")}
            tooltip="Customers who messaged or had activity today."
          />
        )}
        {summary.new_today !== undefined && (
          <StatCard
            icon={Users}
            label="New Today"
            value={fmt(summary.new_today)}
            color={C.amber}
            bgTint="#FFFBEB"
            borderTint="#FEF3C7"
            onClick={() => navigate("/customers")}
            tooltip="New customers added into the system today."
          />
        )}
        {summary.leads !== undefined && (
          <StatCard
            icon={Users}
            label="Leads"
            value={fmt(summary.leads)}
            color={C.sky}
            bgTint="#F0F9FF"
            borderTint="#E0F2FE"
            onClick={() => navigate("/customers")}
            tooltip="Potential customers currently marked as Leads."
          />
        )}
        {summary.prospects !== undefined && (
          <StatCard
            icon={Users}
            label="Prospects"
            value={fmt(summary.prospects)}
            color={C.purple}
            bgTint="#F5F3FF"
            borderTint="#EDE9FE"
            onClick={() => navigate("/customers")}
            tooltip="Customers currently categorized as Prospects."
          />
        )}
      </div>

      {/* ── Row 1: Messages Chart & Acquisition Calendar ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Messages Over Time (8 cols on lg) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-blue-500/[0.03] flex flex-col h-full lg:col-span-8">
          <SectionHeader
            icon={Activity}
            title="Messages Over Time"
            sub="Last 7 days volume"
            color={C.blue}
            bgTint="#EFF6FF"
            borderTint="#DBEAFE"
            rightBadge={
              <span className="text-[11px] font-medium text-[#165DFF] bg-blue-50/80 border border-blue-100 px-2.5 py-0.5 rounded-lg">
                7 Days
              </span>
            }
          />
          {chartDailyRaw.length > 0 ? (
            <div className="mt-2 flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height={255}>
                <AreaChart data={chartDailyRaw} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.blue} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={C.blue} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748B", fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis
                    width={45}
                    tick={{ fontSize: 11, fill: "#64748B", fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1).replace(/\.0$/, "")}k` : val)}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: C.blue, strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Messages"
                    stroke={C.blue}
                    strokeWidth={2.2}
                    fill="url(#blueGrad)"
                    dot={{ r: 3, fill: C.blue, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: C.blue, stroke: "#FFFFFF", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="No message data yet" />
          )}
        </div>

        {/* ── Acquisition Calendar (4 cols on lg) ──────── */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-blue-500/[0.03] flex flex-col h-full lg:col-span-4">
          <SectionHeader
            icon={CalendarIcon}
            title="Calendar"
            sub="Daily customer additions"
            color={C.blue}
            bgTint="#EFF6FF"
            borderTint="#DBEAFE"
          />

          <style>{`
            .custom-calendar-wrapper {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            .custom-calendar-wrapper .react-calendar {
              border: none;
              width: 100%;
              font-family: inherit;
              background: transparent;
            }
            .custom-calendar-wrapper .react-calendar__navigation {
              margin-bottom: 0.85rem;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 2px;
              height: 34px;
            }
            .custom-calendar-wrapper .react-calendar__navigation button {
              color: #172033;
              font-weight: 600;
              border-radius: 10px;
              width: 30px;
              height: 30px;
              min-width: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0;
              font-size: 1rem;
              transition: all 0.15s ease-in-out;
              background: #F8FAFC;
              border: 1px solid #E5E7EB;
            }
            .custom-calendar-wrapper .react-calendar__navigation button:hover:not(:disabled) {
              background-color: #EFF6FF;
              border-color: #BFDBFE;
              color: #165DFF;
            }
            .custom-calendar-wrapper .react-calendar__navigation__prev2-button,
            .custom-calendar-wrapper .react-calendar__navigation__next2-button {
              display: none !important;
            }
            .custom-calendar-wrapper .react-calendar__navigation__label {
              font-family: inherit;
              font-weight: 700 !important;
              font-size: 0.85rem !important;
              pointer-events: none;
              color: #172033;
              white-space: nowrap;
              flex-grow: 1;
              text-align: center;
              background: transparent !important;
              border: none !important;
            }
            .custom-calendar-wrapper .react-calendar__month-view__weekdays {
              font-weight: 600;
              text-transform: uppercase;
              font-size: 0.65rem;
              letter-spacing: 0.04em;
              color: #64748B;
              margin-bottom: 6px;
            }
            .custom-calendar-wrapper .react-calendar__month-view__weekdays__weekday abbr {
              text-decoration: none;
            }
            .custom-calendar-wrapper .react-calendar__month-view__weekdays__weekday:first-child abbr,
            .custom-calendar-wrapper .react-calendar__month-view__weekdays__weekday:last-child abbr {
              color: #EF4444;
            }
            .custom-calendar-wrapper .react-calendar__month-view__days__day {
              position: relative !important;
              overflow: visible !important;
            }
            .custom-calendar-wrapper .react-calendar__month-view__days__day--neighboringMonth {
              color: #CBD5E1 !important;
            }
            .custom-calendar-wrapper .react-calendar__tile {
              position: relative !important;
              overflow: visible !important;
              padding: 3px;
              font-weight: 500;
              color: #172033;
              background: transparent;
              font-size: 0.75rem;
              display: flex;
              flex-direction: column;
              align-items: center;
              border: none !important;
              height: 38px;
            }
            .custom-calendar-wrapper .react-calendar__tile abbr {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              border-radius: 8px;
              transition: all 0.15s ease;
            }
            .custom-calendar-wrapper .has-data-tile abbr {
              background: #EFF6FF;
              color: #165DFF;
              font-weight: 600;
              box-shadow: inset 0 0 0 1px #BFDBFE;
            }
            .custom-calendar-wrapper .react-calendar__tile:hover abbr {
              background-color: #F1F5F9;
              color: #172033;
            }
            .custom-calendar-wrapper .react-calendar__tile--now abbr {
              background: #165DFF !important;
              color: #FFFFFF !important;
              font-weight: 600 !important;
              box-shadow: 0 3px 8px rgba(22, 93, 255, 0.25) !important;
              border: none !important;
            }
            .custom-calendar-wrapper .react-calendar__tile--active {
              background: transparent !important;
            }
          `}</style>

          <div className="custom-calendar-wrapper flex-1">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              onActiveStartDateChange={({ activeStartDate }) => setCalendarViewDate(activeStartDate)}
              calendarType="gregory"
              className="border-none w-full !font-sans text-xs"
              tileClassName={({ date, view, activeStartDate }) => {
                if (view !== "month") return null;
                if (date.getMonth() !== activeStartDate.getMonth()) return null;
                const getLocalYMD = (d) => {
                  const yy = d.getFullYear();
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const dd = String(d.getDate()).padStart(2, "0");
                  return `${yy}-${mm}-${dd}`;
                };
                const dateStr = getLocalYMD(date);
                const hasData = data?.rawCustomers?.some(
                  (c) => c.created_at && getLocalYMD(new Date(c.created_at)) === dateStr
                );
                return hasData ? "has-data-tile" : null;
              }}
              tileContent={({ date, view, activeStartDate }) => {
                if (view !== "month") return null;
                if (date.getMonth() !== activeStartDate.getMonth()) return null;

                const getLocalYMD = (d) => {
                  const yy = d.getFullYear();
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const dd = String(d.getDate()).padStart(2, "0");
                  return `${yy}-${mm}-${dd}`;
                };
                const dateStr = getLocalYMD(date);
                const customersOnDate =
                  data?.rawCustomers?.filter((c) => {
                    if (!c.created_at) return false;
                    return getLocalYMD(new Date(c.created_at)) === dateStr;
                  }) || [];

                if (customersOnDate.length === 0) return null;

                const leadsOnDate = customersOnDate.filter((c) => {
                  const s = c.status?.toLowerCase();
                  return s === "lead" || s === "confirmed";
                }).length;
                const prospectsOnDate = customersOnDate.filter(
                  (c) => c.status?.toLowerCase() === "prospect"
                ).length;
                const totalOnDate = customersOnDate.length;

                return (
                  <div className="absolute inset-0 group flex justify-center w-full h-full pointer-events-auto">
                    {/* Badge overlapping top-right */}
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#165DFF] text-white rounded-full flex items-center justify-center text-[9px] font-bold border-[1.5px] border-white shadow-xs z-10">
                      {totalOnDate}
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 mb-1 w-40 p-2.5 bg-white/95 backdrop-blur-md border border-slate-200 text-[#172033] rounded-xl shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:-translate-y-1 pointer-events-none">
                      <p className="font-semibold text-[11px] mb-1.5 border-b border-slate-100 pb-1 text-center text-[#172033]">
                        {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-[#64748B] font-medium">Total Added</span>
                        <span className="font-bold text-[#172033] text-xs">{totalOnDate}</span>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-[#0EA5E9] font-medium">Leads</span>
                        <span className="font-bold text-[#0EA5E9] text-xs">{leadsOnDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-[#8B5CF6] font-medium">Prospects</span>
                        <span className="font-bold text-[#8B5CF6] text-xs">{prospectsOnDate}</span>
                      </div>

                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-white/95"></div>
                    </div>
                  </div>
                );
              }}
            />

            {/* Active days & Total Footer */}
            {(() => {
              const activeYear = calendarViewDate.getFullYear();
              const activeMonth = calendarViewDate.getMonth();

              const monthlyCustomers =
                data?.rawCustomers?.filter((c) => {
                  if (!c.created_at) return false;
                  const d = new Date(c.created_at);
                  return d.getFullYear() === activeYear && d.getMonth() === activeMonth;
                }) || [];

              const monthlyTotalAdded = monthlyCustomers.length;
              const monthlyActiveDays = new Set(
                monthlyCustomers.map((c) => {
                  const d = new Date(c.created_at);
                  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                })
              ).size;

              return (
                <div className="flex justify-between items-center text-[11px] text-[#64748B] font-medium mt-auto pt-3 border-t border-slate-100">
                  <span>
                    Active Days: <strong className="text-[#172033] font-semibold">{monthlyActiveDays}</strong>
                  </span>
                  <span>
                    Total Added: <strong className="text-[#172033] font-semibold">{monthlyTotalAdded}</strong>
                  </span>
                </div>
              );
            })()}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-2.5 text-[11px] font-medium text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-100 border border-[#165DFF]" />
                Added
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#165DFF]" />
                Today
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Customers Over Time ──────────────────────── */}
      <div className="grid grid-cols-1 gap-5">
        {/* Customers Over Time */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-blue-500/[0.03] flex flex-col h-full">
          <SectionHeader
            icon={Users}
            title="Customers Over Time"
            sub="Last 7 days customer growth"
            color={C.indigo}
            bgTint="#EEF2FF"
            borderTint="#E0E7FF"
            rightBadge={
              <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                Growth
              </span>
            }
          />
          {chartDailyRaw.length > 0 ? (
            <div className="mt-2 flex-1 min-h-[240px]">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartDailyRaw} margin={{ top: 10, right: 12, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.indigo} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={C.indigo} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748B", fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748B", fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    dx={-6}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: C.indigo, strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Customers"
                    stroke={C.indigo}
                    strokeWidth={2.2}
                    fill="url(#indigoGrad)"
                    dot={{ r: 3, fill: C.indigo, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: C.indigo, stroke: "#FFFFFF", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="No customer data yet" />
          )}
        </div>
      </div>

      {/* ── Delivery Health ──────────────────────────────────── */}
      {(totals.delivered > 0 || totals.read > 0) && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm shadow-blue-500/[0.03]">
          <SectionHeader
            icon={Zap}
            title="Delivery Health"
            sub="Message delivery & engagement funnel"
            color={C.emerald}
            bgTint="#ECFDF5"
            borderTint="#D1FAE5"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            {[
              {
                label: "Delivery Rate",
                value: deliveryRate,
                pctNum: deliveryPctNum,
                num: totalDelivered,
                color: C.emerald,
                bgTint: "bg-emerald-50/50",
                borderTint: "border-emerald-100/80",
                iconBg: "#ECFDF5",
                iconBorder: "#A7F3D0",
                barColor: "bg-emerald-500",
                icon: CheckCheck,
                tooltip:
                  "Percentage of sent messages that successfully reached the customer's phone (Double Tick).",
              },
              {
                label: "Read Rate",
                value: readRate,
                pctNum: readPctNum,
                num: totals.read,
                color: C.blue,
                bgTint: "bg-blue-50/50",
                borderTint: "border-blue-100/80",
                iconBg: "#EFF6FF",
                iconBorder: "#BFDBFE",
                barColor: "bg-[#165DFF]",
                icon: Eye,
                tooltip:
                  "Percentage of sent messages that were actually opened and read by the customer (Blue Tick).",
              },
            ].map(({ label, value, pctNum, num, color, bgTint, borderTint, iconBg, iconBorder, barColor, icon: Icon, tooltip }) => (
              <div
                key={label}
                className={`flex flex-col justify-between p-4 sm:p-5 rounded-2xl ${bgTint} border ${borderTint} transition-all`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs flex-shrink-0"
                      style={{ backgroundColor: iconBg, borderColor: iconBorder }}
                    >
                      <Icon size={18} style={{ color }} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-xs font-semibold text-[#172033]">{label}</p>
                        {tooltip && (
                          <span 
                            title={tooltip}
                            className="inline-flex items-center ml-1.5 text-slate-400 hover:text-[#165DFF] cursor-help transition-colors"
                          >
                            <Info size={13} />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-normal text-[#64748B] mt-0.5">
                        {fmt(num)} messages
                      </p>
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color }}>
                    {value}
                  </p>
                </div>

                {/* Subtle SaaS Progress Bar */}
                <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden mt-3.5 border border-slate-200/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${pctNum}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
