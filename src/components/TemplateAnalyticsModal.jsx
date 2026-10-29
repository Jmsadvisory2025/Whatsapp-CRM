import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  AlertCircle,
  Loader2,
  BarChart3,
  Send,
  CheckCircle2,
  Eye,
  MousePointerClick,
  Receipt,
} from "lucide-react";
import { useSelector } from "react-redux";

const TemplateAnalyticsModal = ({ template, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const token =
    useSelector((state) => state.auth?.accessToken) ||
    localStorage.getItem("accessToken");
  const wabaId = useSelector((state) => state.metaConnect?.wabaId);
  const metaToken = import.meta.env.VITE_META_ACCESS_TOKEN;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      try {
        const queryParams = new URLSearchParams();
        if (wabaId) queryParams.append("waba_id", wabaId);
        if (metaToken) queryParams.append("access_token", metaToken);

        if (template.template_id) {
          queryParams.append("template_id", template.template_id);
        } else {
          queryParams.append(
            "template_name",
            template.template_name || template.name
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/api/templates/analytics/?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Failed to fetch analytics");
          setErrorDetails(result.details || null);
          return;
        }

        setData(result.data);
      } catch (err) {
        setError(err.message || "Network or server error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [template, wabaId, metaToken, token, API_BASE_URL]);

  let stats = {
    sent: 0,
    delivered: 0,
    read: 0,
    replied: 0,
    clicked: 0,
    amount_spent: 0,
  };
  let buttonBreakdown = {};
  let startDate = null;
  let endDate = null;

  if (data?.template_analytics?.data?.[0]?.data_points) {
    const points = data.template_analytics.data[0].data_points;
    points.forEach((pt) => {
      if (pt.start) {
        const ptStart = new Date(pt.start * 1000);
        if (!startDate || ptStart < startDate) startDate = ptStart;
      }
      if (pt.end) {
        const ptEnd = new Date(pt.end * 1000);
        if (!endDate || ptEnd > endDate) endDate = ptEnd;
      }

      stats.sent += pt.sent || 0;
      stats.delivered += pt.delivered || 0;
      stats.read += pt.read || 0;
      stats.replied += pt.replied || 0;

      if (Array.isArray(pt.clicked)) {
        pt.clicked.forEach((c) => {
          const count = c.count || 0;
          stats.clicked += count;

          const label =
            c.button_content ||
            (c.type === "url_button"
              ? "Visit Website"
              : c.type === "phone_number_button"
                ? "Call Phone"
                : c.type || "Button");
          const key = `${c.type || "button"}:${label}`;
          if (!buttonBreakdown[key]) {
            buttonBreakdown[key] = {
              type: c.type || "button",
              label,
              count: 0,
            };
          }
          buttonBreakdown[key].count += count;
        });
      }

      if (Array.isArray(pt.cost)) {
        pt.cost.forEach((c) => {
          if (c.type === "amount_spent") {
            stats.amount_spent += c.value || 0;
          }
        });
      }
    });

    const today = new Date();
    if (endDate && endDate > today) {
      endDate = today;
    }
  }

  const buttonClicksList = Object.values(buttonBreakdown).filter(
    (b) => b.count > 0
  );

  const costPerDelivered =
    stats.delivered > 0
      ? (stats.amount_spent / stats.delivered).toFixed(2)
      : "0.00";
  const costPerClick =
    stats.clicked > 0
      ? (stats.amount_spent / stats.clicked).toFixed(2)
      : "0.00";

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <BarChart3 size={16} className="text-[#165DFF]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#172033]">
                Template Analytics
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5 font-mono truncate">
                {template?.template_name || template?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          {loading ? (
            <div className="py-14 flex flex-col items-center justify-center">
              <Loader2 size={24} className="animate-spin text-[#165DFF] mb-3" />
              <p className="text-xs text-[#64748B]">
                Fetching analytics from Meta...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  size={16}
                  className="text-red-500 mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-red-700">
                    Error fetching analytics
                  </p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>

                  {errorDetails && (
                    <div className="mt-3 p-3 bg-white/80 rounded-xl border border-red-100">
                      <p className="text-[11px] font-semibold text-red-800 mb-1">
                        Details from Meta:
                      </p>
                      <ul className="text-[11px] text-red-700 space-y-0.5">
                        {errorDetails.type && (
                          <li>
                            <span className="font-semibold">Type:</span>{" "}
                            {errorDetails.type}
                          </li>
                        )}
                        {errorDetails.code && (
                          <li>
                            <span className="font-semibold">Code:</span>{" "}
                            {errorDetails.code}
                          </li>
                        )}
                        {errorDetails.fbtrace_id && (
                          <li>
                            <span className="font-semibold">Trace ID:</span>{" "}
                            {errorDetails.fbtrace_id}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 text-xs text-[#172033] flex items-start gap-2.5">
                <BarChart3
                  size={15}
                  className="text-[#165DFF] mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-[#64748B] leading-relaxed">
                    Analytics are fetched directly from Meta Graph API. Metrics
                    may take a short time to update after sending.
                  </p>
                  {startDate && endDate && (
                    <p className="mt-1.5 font-semibold bg-white text-[#165DFF] border border-blue-100 inline-block px-2 py-0.5 rounded-md text-[11px]">
                      Date Range: {formatDate(startDate)} —{" "}
                      {formatDate(endDate)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FAFAFC] rounded-xl p-4 border border-slate-200/80 flex flex-col items-center text-center">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-2">
                    <Send size={15} className="text-[#165DFF]" />
                  </div>
                  <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    Sent
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#172033] mt-0.5 tabular-nums">
                    {stats.sent}
                  </p>
                </div>

                <div className="bg-[#FAFAFC] rounded-xl p-4 border border-slate-200/80 flex flex-col items-center text-center">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-2">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                  </div>
                  <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    Delivered
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#172033] mt-0.5 tabular-nums">
                    {stats.delivered}
                  </p>
                </div>

                <div className="bg-[#FAFAFC] rounded-xl p-4 border border-slate-200/80 flex flex-col items-center text-center">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-2">
                    <Eye size={15} className="text-[#8B5CF6]" />
                  </div>
                  <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    Read
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#172033] mt-0.5 tabular-nums">
                    {stats.read}
                  </p>
                </div>

                <div className="bg-[#FAFAFC] rounded-xl p-4 border border-slate-200/80 flex flex-col items-center text-center">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-2">
                    <MousePointerClick size={15} className="text-amber-600" />
                  </div>
                  <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    Clicked
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#172033] mt-0.5 tabular-nums">
                    {stats.clicked}
                  </p>
                </div>
              </div>

              {/* Button Click Breakdown */}
              {buttonClicksList.length > 0 && (
                <div className="p-3.5 border border-amber-200/80 rounded-xl bg-amber-50/40 space-y-2.5">
                  <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MousePointerClick size={13} /> Button Clicks Breakdown
                  </h4>
                  <div className="space-y-2">
                    {buttonClicksList.map((btn, idx) => {
                      const pctVal =
                        stats.clicked > 0
                          ? Math.round((btn.count / stats.clicked) * 100)
                          : 0;
                      const typeLabel =
                        btn.type === "quick_reply_button"
                          ? "Quick Reply"
                          : btn.type === "url_button"
                            ? "URL"
                            : btn.type === "phone_number_button"
                              ? "Phone"
                              : "Button";
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-xl p-2.5 border border-amber-100 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold text-[#172033] truncate">
                                {btn.label}
                              </span>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
                                {typeLabel}
                              </span>
                            </div>
                            <span className="font-bold text-amber-900 shrink-0 tabular-nums">
                              {btn.count}{" "}
                              <span className="text-[11px] font-normal text-[#64748B]">
                                ({pctVal}%)
                              </span>
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-amber-100/70 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all duration-300"
                              style={{ width: `${pctVal}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cost Insights */}
              {stats.sent > 0 && (
                <div className="p-3.5 border border-emerald-200/80 rounded-xl bg-emerald-50/40 space-y-2">
                  <h4 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt size={13} /> Cost Insights
                  </h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-700">Amount Spent</span>
                    <span className="font-bold text-emerald-900 tabular-nums">
                      ₹{stats.amount_spent.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-700">Cost per Delivered</span>
                    <span className="font-semibold text-emerald-900 tabular-nums">
                      ₹{costPerDelivered}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-700">Cost per Click</span>
                    <span className="font-semibold text-emerald-900 tabular-nums">
                      ₹{costPerClick}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TemplateAnalyticsModal;
