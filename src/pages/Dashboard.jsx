import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  MessageSquare, CheckCheck, Eye, AlertCircle, Layout,
  Users, TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff,
  Calendar, Activity, Zap, BarChart2, PieChart as PieIcon,
} from "lucide-react";
import { isTechProvider } from "../store/authUtils";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
// const BOT_API  = import.meta.env.VITE_BOT_API_URL;

/* ─── Helpers ───────────────────────────────────────────────── */
const token = () => localStorage.getItem("accessToken");

const fmt = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0);

const pct = (num, den) =>
  den > 0 ? ((num / den) * 100).toFixed(1) + "%" : "—";

/* ─── Color palette ─────────────────────────────────────────── */
const C = {
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  teal: "#14b8a6",
  slate: "#64748b",
  indigo: "#6366f1",
};

/* ─── Reusable stat card ────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div
    className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col gap-3"
    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
  >
    <div className="flex items-center justify-between">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: `${color}18` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      {trend !== undefined && (
        <span
          className="text-xs font-medium flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={
            trend >= 0
              ? { background: "#dcfce7", color: "#15803d" }
              : { background: "#fee2e2", color: "#dc2626" }
          }
        >
          {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

/* ─── Section header ────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, sub, color }) => (
  <div className="flex items-center gap-2 mb-4">
    <div
      className="w-7 h-7 rounded-md flex items-center justify-center"
      style={{ background: `${color}18` }}
    >
      <Icon size={14} style={{ color }} />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

/* ─── Custom tooltip ────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ─── Empty state ────────────────────────────────────────────── */
function EmptyChart({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
      <BarChart2 size={28} className="opacity-30" />
      <p className="text-xs">{label}</p>
    </div>
  );
}

/* ─── Main Dashboard ────────────────────────────────────────── */
export default function Dashboard() {
  const userEmail = localStorage.getItem("ownerEmail") || "";
  const isTp = isTechProvider(userEmail);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isTp) {
        const tk = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}api/industry/dashboard/`, {
          headers: { Authorization: `Bearer ${tk}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

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
          tp_summary: {
            total_customers: json.total_customers,
            active_today: json.active_today,
            new_today: json.new_today,
            conversations_by_status: json.conversations_by_status,
          },
        });
      } else {
        const res = await fetch(`${API_BASE}api/analytics/`, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
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
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-28 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-100 rounded-xl h-64 animate-pulse" />
          <div className="bg-gray-100 rounded-xl h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  /* ── Not connected / no org ───────────────────────────────── */
  if (data?.status === "not_connected" || data?.status === "no_org") {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
          <WifiOff size={28} className="text-amber-500" />
        </div>
        <p className="text-base font-semibold text-gray-700">WhatsApp not connected</p>
        <p className="text-sm text-gray-400 text-center max-w-xs">
          {data?.status === "no_org"
            ? "No organisation found. Complete setup first."
            : "Connect your WABA account to start seeing analytics."}
        </p>
      </div>
    );
  }

  /* ── Error state ──────────────────────────────────────────── */
  if (error && !data) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm text-gray-600">Failed to load analytics: {error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { totals = {}, daily_stats = [], template_stats = [], waba = {} } = data || {};

  /* ── Derived data ─────────────────────────────────────────── */
  const deliveryRate = pct(totals.delivered, totals.messages);
  const readRate = pct(totals.read, totals.messages);
  const failRate = pct(totals.failed, totals.messages);

  const chartDailyRaw = [...daily_stats].reverse().map((d) => ({
    date: d.day
      ? new Date(d.day).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
      : "—",
    Messages: d.count,
  }));

  const pieData = [
    { name: "Delivered", value: totals.delivered || 0, color: C.green },
    { name: "Read", value: totals.read || 0, color: C.blue },
    { name: "Failed", value: totals.failed || 0, color: C.red },
    {
      name: "Other",
      value: Math.max(
        0,
        (totals.messages || 0) - (totals.delivered || 0) - (totals.read || 0) - (totals.failed || 0)
      ),
      color: C.slate,
    },
  ].filter((d) => d.value > 0);

  const templateChart = template_stats.slice(0, 8).map((t) => ({
    name: t.template_name?.length > 18 ? t.template_name.slice(0, 18) + "…" : t.template_name,
    fullName: t.template_name,
    Sent: t.sent,
  }));

  return (
    <div className="p-5 space-y-5 bg-gray-50 min-h-full">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {waba?.waba_name
              ? <><span className="font-medium text-gray-700">{waba.waba_name}</span> · {waba.phone_number}</>
              : "WhatsApp Business Analytics"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {waba?.status && (
            <span
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
              style={
                waba.status === "connected"
                  ? { background: "#dcfce7", color: "#15803d" }
                  : { background: "#fef3c7", color: "#92400e" }
              }
            >
              {waba.status === "connected" ? <Wifi size={11} /> : <WifiOff size={11} />}
              {waba.status}
            </span>
          )}
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={MessageSquare} label="Total Messages"
          value={fmt(totals.messages)} color={C.blue} sub="Outbound sent"
        />
        <StatCard
          icon={Users} label="Conversations"
          value={fmt(totals.conversations)} color={C.teal} sub="Unique contacts"
        />
        <StatCard
          icon={Users} label="Total Customers"
          value={fmt(isTp ? data?.tp_summary?.total_customers : data?.client_summary?.total_customers)} color={C.indigo}
        />
        <StatCard
          icon={Activity} label="Active Today"
          value={fmt(isTp ? data?.tp_summary?.active_today : data?.client_summary?.active_today)} color={C.green}
        />
        {!isTp && (
          <>
            <StatCard
              icon={Users} label="Leads"
              value={fmt(data?.client_summary?.leads)} color={C.teal}
            />
            <StatCard
              icon={Users} label="Prospects"
              value={fmt(data?.client_summary?.prospects)} color={C.purple}
            />
          </>
        )}
      </div>

      {/* ── Charts Row 1 ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Messages Over Time — full width for TP, 2/3 for normal */}
        <div
          className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <SectionHeader
            icon={Activity} title="Messages Over Time"
            sub="Last 7 days outbound volume" color={C.blue}
          />
          {chartDailyRaw.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartDailyRaw} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.blue} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="Messages"
                  stroke={C.blue} strokeWidth={2.5}
                  fill="url(#blueGrad)"
                  dot={{ r: 3, fill: C.blue, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="No message data yet" />
          )}
        </div>

        {/* Delivery Breakdown — normal org only */}
        {pieData.some(d => d.value > 0 && d.name !== "Other") && (
          <div
            className="bg-white rounded-xl p-5 border border-gray-100"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <SectionHeader
              icon={PieIcon} title="Delivery Breakdown"
              sub="Message status distribution" color={C.green}
            />
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData} cx="50%" cy="50%"
                      innerRadius={45} outerRadius={70}
                      paddingAngle={3} dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [
                        `${val} (${pct(val, totals.messages)})`,
                        name,
                      ]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-1">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-gray-600">{d.name}</span>
                      </div>
                      <span className="font-semibold text-gray-700">
                        {fmt(d.value)}{" "}
                        <span className="text-gray-400 font-normal">({pct(d.value, totals.messages)})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyChart label="No delivery data" />
            )}
          </div>
        )}
      </div>

      {/* ── Charts Row 2 ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Template Performance — normal org only */}
        {templateChart?.length > 0 && (
          <div
            className="bg-white rounded-xl p-5 border border-gray-100"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <SectionHeader
              icon={BarChart2} title="Template Performance"
              sub="Top templates by messages sent" color={C.purple}
            />
            {templateChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={templateChart}
                  layout="vertical"
                  margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                  barSize={14}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category" dataKey="name" width={110}
                    tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs">
                          <p className="font-semibold text-gray-700 mb-1">{d?.fullName}</p>
                          <p style={{ color: C.purple }}>Sent: <b>{d?.Sent}</b></p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="Sent" fill={C.purple} radius={[0, 4, 4, 0]}
                    background={{ fill: "#f8fafc", radius: [0, 4, 4, 0] }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="No template usage data" />
            )}
          </div>
        )}

        {/* Daily Summary — both TP and normal */}
        {/* <div
          className="bg-white rounded-xl p-5 border border-gray-100"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <SectionHeader
            icon={Calendar} title="Daily Summary"
            sub="Last 7 days breakdown" color={C.amber}
          />
          {daily_stats.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2">Date</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-3 py-2">Messages</th>
                    <th className="text-right text-xs font-semibold text-gray-500 px-3 py-2">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...daily_stats].reverse().map((d, i) => {
                    const total = daily_stats.reduce((a, r) => a + r.count, 0);
                    const share = total > 0 ? ((d.count / total) * 100).toFixed(1) : "0";
                    return (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 text-gray-700 font-medium">
                          {d.day
                            ? new Date(d.day).toLocaleDateString("en-IN", {
                                weekday: "short", day: "numeric", month: "short",
                              })
                            : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right text-gray-900 font-bold">{fmt(d.count)}</td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${share}%`, background: C.amber }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-8 text-right">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyChart label="No daily data available" />
          )}
        </div> */}
      </div>

      {/* ── Delivery Health — normal org only ────────────────── */}
      {(totals.delivered > 0 || totals.read > 0 || totals.failed > 0) && (
        <div
          className="bg-white rounded-xl p-5 border border-gray-100"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <SectionHeader
            icon={Zap} title="Delivery Health" sub="Message delivery funnel" color={C.teal}
          />
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Delivery Rate", value: deliveryRate, num: totals.delivered, color: C.green, icon: CheckCheck },
              { label: "Read Rate", value: readRate, num: totals.read, color: C.blue, icon: Eye },
              { label: "Failure Rate", value: failRate, num: totals.failed, color: C.red, icon: AlertCircle },
            ].map(({ label, value, num, color, icon: Icon }) => (
              <div key={label} className="text-center p-4 rounded-lg bg-gray-50">
                <div className="flex justify-center mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: `${color}20` }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
                <p className="text-xs text-gray-400">{fmt(num)} messages</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}