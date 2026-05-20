import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../store/dashboardSlice";
import {
  MessageSquare, Send, CheckCircle, Eye, XCircle,
  LayoutTemplate, Smartphone, Loader2, AlertCircle,
  Wifi, ArrowRight, TrendingUp, RefreshCw,
} from "lucide-react";
import Card from "../components/ui/Card";
import { FaWhatsapp } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

/* -------------------------------------------------------------------------- */
/*                                 STAT CARD                                  */
/* -------------------------------------------------------------------------- */

const COLORS = {
  green:   { bg: "bg-green-100",   text: "text-green-600",   border: "border-green-200"   },
  blue:    { bg: "bg-blue-100",    text: "text-blue-600",    border: "border-blue-200"    },
  purple:  { bg: "bg-purple-100",  text: "text-purple-600",  border: "border-purple-200"  },
  red:     { bg: "bg-red-100",     text: "text-red-600",     border: "border-red-200"     },
  orange:  { bg: "bg-orange-100",  text: "text-orange-600",  border: "border-orange-200"  },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200" },
};

const StatCard = ({ icon: Icon, label, value, color = "green", sub }) => {
  const c = COLORS[color];
  return (
    <Card className={`p-5 border ${c.border} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <h2 className="text-3xl font-bold mt-1 text-gray-800">{value?.toLocaleString()}</h2>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`${c.bg} p-3 rounded-2xl`}>
          <Icon className={c.text} size={24} />
        </div>
      </div>
    </Card>
  );
};

/* -------------------------------------------------------------------------- */
/*                          CUSTOM TOOLTIP FOR CHART                         */
/* -------------------------------------------------------------------------- */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <p className="text-green-600 font-bold text-lg">{payload[0].value} messages</p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                DASHBOARD                                   */
/* -------------------------------------------------------------------------- */

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Loader2 className="animate-spin text-green-600" size={35} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-gray-800">Loading Dashboard...</h2>
          <p className="text-gray-500 mt-1">Fetching WhatsApp analytics</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="p-10">
        <Card className="p-8 border border-red-200 bg-red-50">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-2xl">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-700">Dashboard Error</h2>
              <p className="text-red-600 mt-2">{error}</p>
              <button
                onClick={() => dispatch(fetchDashboard())}
                className="mt-5 px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all inline-flex items-center gap-2"
              >
                <RefreshCw size={15} /> Retry
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Empty ── */
  if (!data) {
    return (
      <div className="p-10">
        <Card className="p-10 text-center text-gray-500">No dashboard data found.</Card>
      </div>
    );
  }

  /* ── No Org ── */
  if (data.status === "no_org") {
    return (
      <div className="p-10">
        <Card className="p-10 border border-yellow-200 bg-yellow-50 text-center">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
            <Wifi className="text-yellow-700" size={35} />
          </div>
          <h2 className="text-2xl font-bold text-yellow-800 mt-5">No Organization Found</h2>
          <p className="mt-3 text-yellow-700 max-w-md mx-auto">
            Please create your organization before accessing the dashboard.
          </p>
          <button
            onClick={() => navigate("/setup")}
            className="mt-6 px-6 py-3 rounded-2xl bg-yellow-600 text-white hover:bg-yellow-700 transition-all inline-flex items-center gap-2"
          >
            Create Organization <ArrowRight size={16} />
          </button>
        </Card>
      </div>
    );
  }

  /* ── Not Connected ── */
  if (data.status === "not_connected") {
    return (
      <div className="p-10">
        <Card className="p-10 border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <FaWhatsapp className="text-green-600" size={38} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mt-5">Connect WhatsApp Business</h2>
              <p className="mt-3 text-gray-600 max-w-xl leading-relaxed">
                Connect your WhatsApp Business account to start sending template messages,
                manage conversations, broadcast campaigns, analytics, and automation directly
                from JMS Meta CRM.
              </p>
              <div className="mt-5 space-y-2 text-sm text-gray-600">
                {["Real-time WhatsApp messaging", "Template & campaign management", "Delivery & read analytics"].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" /> {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/setup")}
                className="mt-7 px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all inline-flex items-center gap-2"
              >
                <FaWhatsapp size={18} /> Connect WhatsApp
              </button>
            </div>
            <div className="hidden lg:block">
              <div className="w-72 h-72 rounded-full bg-green-100 flex items-center justify-center">
                <Smartphone className="text-green-600" size={120} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Connected ── */
  const { totals = {}, waba = {}, template_stats = [], daily_stats = [] } = data;

  // Compute delivery & read rates
  const deliveryRate = totals.messages
    ? ((totals.delivered / totals.messages) * 100).toFixed(1)
    : 0;
  const readRate = totals.delivered
    ? ((totals.read / totals.delivered) * 100).toFixed(1)
    : 0;

  // Format daily_stats for recharts: [{day, count}] → [{name, messages}]
  const chartData = [...daily_stats]
    .reverse()
    .map((d) => ({
      name: new Date(d.day).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      messages: d.count,
    }));

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">JMS Meta CRM</h1>
          <p className="text-gray-500 mt-2 text-lg">WhatsApp Business Analytics Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(fetchDashboard())}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-gray-500"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <div className="bg-green-100 text-green-700 px-5 py-3 rounded-2xl font-semibold flex items-center gap-2">
            <CheckCircle size={18} /> Connected
          </div>
        </div>
      </div>

      {/* WABA Card */}
      <Card className="p-7 border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center text-white">
              <FaWhatsapp size={30} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{waba.waba_name || "WhatsApp Business"}</h2>
              <p className="text-green-700 mt-1">{waba.phone_number || "No Number"}</p>
              <p className="text-xs text-gray-500 mt-2 break-all">WABA ID: {waba.waba_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-800">{deliveryRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Delivery Rate</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{readRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Read Rate</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl">
              <CheckCircle size={16} /> Active
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Send}          label="Messages"      value={totals.messages}      color="green"   />
        <StatCard icon={CheckCircle}   label="Delivered"     value={totals.delivered}     color="emerald" sub={`${deliveryRate}% rate`} />
        <StatCard icon={Eye}           label="Read"          value={totals.read}          color="blue"    sub={`${readRate}% of delivered`} />
        <StatCard icon={XCircle}       label="Failed"        value={totals.failed}        color="red"     />
        <StatCard icon={LayoutTemplate} label="Templates"   value={totals.templates}     color="purple"  />
        <StatCard icon={MessageSquare} label="Conversations" value={totals.conversations} color="orange"  />
      </div>

      {/* Daily Messages Chart */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Daily Messages</h2>
              <p className="text-sm text-gray-500 mt-1">Last 7 days activity</p>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp size={16} /> Last 7 Days
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0fdf4" }} />
              <Bar dataKey="messages" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Template Stats */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Top Templates</h2>
            <p className="text-sm text-gray-500 mt-1">Most used WhatsApp templates</p>
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm font-medium text-gray-600">
            {template_stats.length} Templates
          </div>
        </div>

        {template_stats.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
              <LayoutTemplate className="text-gray-400" size={35} />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mt-5">No Templates Yet</h3>
            <p className="text-gray-500 mt-2">Templates will appear here after sending messages.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Max sent count for progress bars */}
            {(() => {
              const maxSent = Math.max(...template_stats.map((t) => t.sent), 1);
              return template_stats.map((t, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-2xl px-5 py-4 hover:border-green-300 hover:bg-green-50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-2.5 rounded-xl">
                        <LayoutTemplate size={18} className="text-green-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {t.template_name || "Unknown Template"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">WhatsApp Template</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">{t.sent?.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Messages</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${(t.sent / maxSent) * 100}%` }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;