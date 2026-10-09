import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, AlertCircle, Loader2, BarChart3, Send, CheckCircle2, Eye, MousePointerClick, Receipt } from "lucide-react";
import { useSelector } from "react-redux";

const TemplateAnalyticsModal = ({ template, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  
  const token = useSelector((state) => state.auth?.accessToken) || localStorage.getItem("accessToken");
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

        // Use template_id if available, otherwise fallback to name
        if (template.template_id) {
          queryParams.append("template_id", template.template_id);
        } else {
          queryParams.append("template_name", template.template_name || template.name);
        }

        const response = await fetch(`${API_BASE_URL}/api/templates/analytics/?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

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

  let stats = { sent: 0, delivered: 0, read: 0, clicked: 0, amount_spent: 0 };
  let startDate = null;
  let endDate = null;
  
  if (data?.template_analytics?.data?.[0]?.data_points) {
    const points = data.template_analytics.data[0].data_points;
    points.forEach(pt => {
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
      
      if (Array.isArray(pt.clicked)) {
        pt.clicked.forEach(c => {
          if (c.type === "url_button") {
            stats.clicked += c.count || 0;
          }
        });
      }

      if (Array.isArray(pt.cost)) {
        pt.cost.forEach(c => {
          if (c.type === "amount_spent") {
            stats.amount_spent += c.value || 0;
          }
        });
      }
    });

    // Meta often returns the end boundary as midnight of the next day (exclusive).
    // If the end date is in the future, we cap it to today so it makes sense to the user.
    const today = new Date();
    if (endDate && endDate > today) {
      endDate = today;
    }
  }

  // Calculate aggregate costs
  const costPerDelivered = stats.delivered > 0 ? (stats.amount_spent / stats.delivered).toFixed(2) : "0.00";
  const costPerClick = stats.clicked > 0 ? (stats.amount_spent / stats.clicked).toFixed(2) : "0.00";

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <BarChart3 size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Template Analytics</h2>
              <p className="text-xs text-gray-500 mt-0.5 font-mono">{template?.template_name || template?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin text-indigo-600 mb-4" />
              <p className="text-sm text-gray-500">Fetching analytics from Meta...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-800">Error fetching analytics</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  
                  {errorDetails && (
                    <div className="mt-4 p-3 bg-white/60 rounded-xl border border-red-100">
                      <p className="text-xs font-semibold text-red-800 mb-1">Details from Meta:</p>
                      <ul className="text-xs text-red-700 space-y-1">
                        {errorDetails.type && <li><span className="font-semibold">Type:</span> {errorDetails.type}</li>}
                        {errorDetails.code && <li><span className="font-semibold">Code:</span> {errorDetails.code}</li>}
                        {errorDetails.fbtrace_id && <li><span className="font-semibold">Trace ID:</span> {errorDetails.fbtrace_id}</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-800 flex items-start gap-3">
                <BarChart3 size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p>
                    Analytics are fetched directly from Meta Graph API. Metrics may take some time to update after sending.
                  </p>
                  {startDate && endDate && (
                    <p className="mt-1.5 font-semibold bg-indigo-100/50 inline-block px-2 py-1 rounded-md text-xs">
                      Date Range: {formatDate(startDate)} — {formatDate(endDate)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Send size={20} className="text-blue-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sent</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.sent}</p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivered</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.delivered}</p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                    <Eye size={20} className="text-purple-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Read</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.read}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                    <MousePointerClick size={20} className="text-amber-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Clicked</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.clicked}</p>
                </div>
              </div>

              {/* Cost Insights */}
              {stats.sent > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {/* Cost Insights */}
                  <div className="p-4 border border-gray-100 rounded-2xl bg-emerald-50/50 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                      <Receipt size={14} /> Cost Insights
                    </h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-700">Amount Spent</span>
                      <span className="font-bold text-emerald-900">₹{stats.amount_spent.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-700">Cost per Delivered</span>
                      <span className="font-semibold text-emerald-900">₹{costPerDelivered}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-700">Cost per Click</span>
                      <span className="font-semibold text-emerald-900">₹{costPerClick}</span>
                    </div>
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
