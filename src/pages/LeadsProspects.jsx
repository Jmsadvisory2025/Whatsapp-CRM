import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  User, Phone, MessageSquare, CheckCircle, Clock,
  Search, Loader2, AlertCircle, Filter, ArrowRight,
} from "lucide-react";
import Card from "../components/ui/Card";

const API = import.meta.env.VITE_API_BASE_URL;

const LeadsProspects = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  
  // Filters
  const [activeTab, setActiveTab] = useState("all"); // all | leads | prospects
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [activeTab, search, page]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API}/api/leads-prospects/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { tab: activeTab, search, page, page_size: 20 },
      });

      setData(res.data.results || []);
      setCount(res.data.count || 0);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on search
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  // ── Tab counts (you can fetch these separately or compute from data)
  const leadCount = data.filter(d => d.status === "Lead").length;
  const prospectCount = data.filter(d => d.status === "Prospect").length;

  /* ── Loading ── */
  if (loading && page === 1) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-green-600 mx-auto" size={40} />
          <p className="mt-4 text-gray-600">Loading leads & prospects...</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="p-10">
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-red-700">Error</h2>
              <p className="text-red-600 mt-2">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Leads & Prospects</h1>
        <p className="text-gray-500 mt-1">Customers from WhatsApp chatbot conversations</p>
      </div>

      {/* Tabs + Search */}
      <Card className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange("all")}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({count})
            </button>
            <button
              onClick={() => handleTabChange("leads")}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === "leads"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <CheckCircle size={16} /> Leads
            </button>
            <button
              onClick={() => handleTabChange("prospects")}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === "prospects"
                  ? "bg-orange-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Clock size={16} /> Prospects
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent w-full lg:w-80"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stage</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Collected Info</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Messages</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Last Chat</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="text-gray-400">
                      <User size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-medium">No {activeTab} found</p>
                      <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/leads/${item.conversation_id}`)}
                  >
                    {/* Customer Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="text-green-600" size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={14} />
                        <span className="text-sm">{item.phone}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {item.status === "Lead" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          <CheckCircle size={14} /> Lead
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                          <Clock size={14} /> Prospect
                        </span>
                      )}
                    </td>

                    {/* Chatbot Stage */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 capitalize">
                        {item.chatbot_stage || "N/A"}
                      </span>
                    </td>

                    {/* Collected Fields */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {Object.entries(item.collected_fields || {}).map(([key, val]) => (
                          <span
                            key={key}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            title={`${key}: ${val}`}
                          >
                            {key}: {val.length > 15 ? val.slice(0, 15) + "..." : val}
                          </span>
                        ))}
                        {Object.keys(item.collected_fields || {}).length === 0 && (
                          <span className="text-xs text-gray-400">No data yet</span>
                        )}
                      </div>
                    </td>

                    {/* Message Count */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MessageSquare size={14} />
                        <span className="text-sm">{item.message_count}</span>
                      </div>
                    </td>

                    {/* Last Chat */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {item.last_chat
                          ? new Date(item.last_chat).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/leads/${item.conversation_id}`);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
                      >
                        View <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {count > 20 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, count)} of {count}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 20 >= count}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LeadsProspects;