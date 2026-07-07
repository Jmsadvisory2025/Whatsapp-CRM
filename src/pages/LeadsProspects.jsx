import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  User,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock3,
  Search,
  Loader2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Card from "../components/ui/Card";
import { isTechProvider } from "../store/authUtils";
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";


const API = import.meta.env.VITE_API_BASE_URL;
// const BOT_API = import.meta.env.VITE_BOT_API_URL;

const LeadsProspects = () => {
  const navigate = useNavigate();
  const [globalCounts, setGlobalCounts] = useState({ all: 0, lead: 0, prospect: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab, search, page]);

  // const fetchData = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const token = localStorage.getItem("accessToken");

  //     const res = await axios.get(`${API}/api/leads-prospects/`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //       params: {
  //         tab: activeTab,
  //         search,
  //         page,
  //         page_size: 20,
  //       },
  //     });

  //     setData(res.data.results || []);
  //     setCount(res.data.count || 0);
  //   } catch (err) {
  //     setError(
  //       err.response?.data?.error ||
  //         err.response?.data?.detail ||
  //         "Failed to load data"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const userEmail = localStorage.getItem("ownerEmail") || "";
  const isTp = isTechProvider(userEmail);

  // const fetchData = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const token = localStorage.getItem("accessToken");

  //     let res;
  //     if (isTp) {
  //       // ── TechProvider: all customers across all clients ────────────────
  //       res = await axios.get(`${BOT_API}api/industry/customers/`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //         params: {
  //           search,
  //           page,
  //           page_size: 20,
  //         },
  //       });
  //       // Map to same shape LeadsProspects expects
  //       const mapped = (res.data.results || []).map((c) => ({
  //         id:              c.id,
  //         name:            c.name,
  //         phone:           c.phone,
  //         status:          "Prospect",
  //         chatbot_stage:   null,
  //         message_count:   c.total_messages,
  //         last_chat:       c.last_seen,
  //         conversation_id: null, // TP customers — view disabled
  //       }));
  //       setData(mapped);
  //       setCount(res.data.count || 0);
  //     } else {
  //       // ── Normal org: existing API ──────────────────────────────────────
  //       res = await axios.get(`${API}/api/leads-prospects/`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //         params: { tab: activeTab, search, page, page_size: 20 },
  //       });
  //       setData(res.data.results || []);
  //       setCount(res.data.count || 0);
  //     }
  //   } catch (err) {
  //     setError(err.response?.data?.error || err.response?.data?.detail || "Failed to load data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      let res;

      if (isTp) {
        res = await axios.get(`${API}api/industry/customers/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search,
            page,
            page_size: 20,
            ...(activeTab !== "all" && { status: activeTab }),
          },
        });

        // Backend હવે આ fields return કરે છે
        setGlobalCounts({
          all: res.data.total_count || 0,
          lead: res.data.lead_count || 0,
          prospect: res.data.prospect_count || 0,
        });

        const mapped = (res.data.results || []).map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          status: c.status || "prospect",
          chatbot_stage: null,
          message_count: c.total_messages,
          last_chat: c.last_seen,
          conversation_id: null,
          bot_source: c.bot_source || "unknown",

        }));
        setData(mapped);
        setCount(res.data.count || 0);  // filtered count for pagination

      } else {
        // ── Normal user: existing leads-prospects API ──────────────────
        res = await axios.get(`${API}/api/leads-prospects/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { tab: activeTab, search, page, page_size: 20 },
        });

        setGlobalCounts({
          all: res.data.total_count || 0,
          lead: res.data.lead_count || 0,
          prospect: res.data.prospect_count || 0,
        });

        setData(res.data.results || []);
        setCount(res.data.count || 0);
      }

    } catch (err) {
      setError(err.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };
  const totalPages = Math.ceil(count / 20);

  // const displayData = activeTab === "all"
  // ? data
  // : data.filter((item) => item.status === activeTab);

  const displayData = isTp
    ? data
    : activeTab === "all"
      ? data
      : data.filter((item) => item.status === activeTab);
  /* -------------------------------------------------------------------------- */
  /*                                   LOADING                                  */
  /* -------------------------------------------------------------------------- */

  if (isInitialLoad) {
    return <LoaderDemo />;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    ERROR                                   */
  /* -------------------------------------------------------------------------- */

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-6">

        <Card className="bg-white border border-red-100 rounded-[28px] shadow-sm">

          <div className="p-6 flex items-start gap-4">

            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="text-red-500" size={24} />
            </div>

            <div>

              <h2 className="text-xl font-bold text-gray-800">
                Something went wrong
              </h2>

              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {error}
              </p>

              <button
                onClick={fetchData}
                className="
                  mt-5 px-5 py-3 rounded-2xl
                  bg-red-500 hover:bg-red-600
                  text-white text-sm font-medium
                  transition-all
                "
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
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-6 space-y-6">

      {/* ---------------------------------------------------------------------- */}
      {/* HEADER */}
      {/* ---------------------------------------------------------------------- */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-800">
            Leads & Prospects
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            WhatsApp conversation customers & pipeline
          </p>

        </div>

        <button
          onClick={fetchData}
          className="
            w-12 h-12 rounded-2xl
            bg-white border border-gray-200
            hover:bg-gray-50
            flex items-center justify-center
            transition-all shadow-sm
          "
        >
          <RefreshCw size={18} className="text-gray-600" />
        </button>

      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* FILTERS */}
      {/* ---------------------------------------------------------------------- */}

      <Card className="bg-white border border-gray-100 rounded-[28px] shadow-sm overflow-hidden">

        <div className="p-5">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

            {/* Tabs */}

            <div className="flex items-center gap-2 overflow-auto scrollbar-hide">

              <button onClick={() => { setActiveTab("all"); setPage(1); }}
                className={`px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === "all" ? "bg-green-600 text-white shadow-lg shadow-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                All ({globalCounts.all})
              </button>

              <button onClick={() => { setActiveTab("lead"); setPage(1); }}
                className={`px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${activeTab === "lead" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                <CheckCircle2 size={15} />
                Leads ({globalCounts.lead})
              </button>

              <button onClick={() => { setActiveTab("prospect"); setPage(1); }}
                className={`px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${activeTab === "prospect" ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                <Clock3 size={15} />
                Prospects ({globalCounts.prospect})
              </button>
            </div>

            {/* Search */}

            <div className="relative w-full xl:w-96">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search customer or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="
                  w-full pl-11 pr-4 py-3
                  bg-gray-50 border border-gray-200
                  rounded-2xl
                  text-sm text-gray-700
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:ring-2 focus:ring-green-500
                  focus:border-transparent
                  transition-all
                "
              />

            </div>

          </div>

        </div>

      </Card>

      {/* ---------------------------------------------------------------------- */}
      {/* TABLE */}
      {/* ---------------------------------------------------------------------- */}

      <Card className="bg-white border border-gray-100 rounded-[30px] shadow-sm overflow-hidden">

        {/* ------------------------------------------------------------------ */}
        {/* DESKTOP TABLE */}
        {/* ------------------------------------------------------------------ */}

        <div className="hidden xl:block overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50 border-b border-gray-100">

              <tr>

                {(
                  isTp
                    ? [
                      "Customer",
                      "Phone",
                      "Bot",
                      "Status",
                      "Last Chat",
                    ]
                    : [
                      "Customer",
                      "Phone",
                      "Status",
                      "Stage",
                      "Last Chat",
                    ]
                ).map((head, i) => (
                  <th
                    key={i}
                    className={`
                      px-6 py-5
                      text-xs font-semibold uppercase tracking-wide
                      text-gray-400
                      ${head === "Action" ? "text-center" : "text-left"}
                    `}
                  >
                    {head}
                  </th>

                ))}

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {displayData.length === 0 ? (


                <tr>

                  <td colSpan="7" className="py-24 text-center">

                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto">
                      <User size={36} className="text-gray-300" />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700 mt-5">
                      No records found
                    </h3>

                    <p className="text-sm text-gray-400 mt-2">
                      Try changing search or filters
                    </p>

                  </td>

                </tr>

              ) : (

                displayData.map((item) => (

                  // <tr
                  //   key={item.id}
                  //   onClick={() =>
                  //     navigate(`/leads/${item.conversation_id}`)
                  //   }
                  //   className="
                  //     hover:bg-green-50/40
                  //     transition-all duration-200
                  //     cursor-pointer
                  //   "
                  // >
                  <tr
                    key={item.id}
                    className="transition-all duration-200 hover:bg-gray-50/50 cursor-default"
                  >

                    {/* Customer */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                          <User
                            size={18}
                            className="text-green-600"
                          />
                        </div>

                        <div>

                          <p className="text-sm font-semibold text-gray-800">
                            {item.name || "Unknown"}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            Customer ID : {item.id}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Phone */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2 text-sm text-gray-600">

                        <Phone size={14} />

                        {item.phone}

                      </div>

                    </td>
                    {/* Bot Source */}
                    {isTp && (
                      <td className="px-6 py-5">
                        {{
                          industry: <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">Industry Bot</span>,
                          jms: <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">JMS Bot</span>,
                          whatsapp: <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Meta Bot</span>,
                        }[item.bot_source] || <span className="text-xs text-gray-400">—</span>}
                      </td>
                    )}

                    {/* Status */}

                    <td className="px-6 py-5">

                      {item.status === "lead" ? (

                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                          <CheckCircle2 size={13} />
                          Lead
                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold">
                          <Clock3 size={13} />
                          Prospect
                        </span>

                      )}

                    </td>

                    {/* Stage */}
                    {!isTp && (
                      <td className="px-6 py-5">

                        <span className="text-sm text-gray-600 capitalize">
                          {item.chatbot_stage || "N/A"}
                        </span>

                      </td>
                    )}

                    {/* Last Chat */}

                    <td className="px-6 py-5">

                      <span className="text-sm text-gray-500">

                        {item.last_chat
                          ? new Date(item.last_chat).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                          : "N/A"}

                      </span>

                    </td>


                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MOBILE CARDS */}
        {/* ------------------------------------------------------------------ */}

        <div className="xl:hidden p-4 space-y-4">

          {displayData.length === 0 ? (

            <div className="py-20 text-center">

              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto">
                <User size={34} className="text-gray-300" />
              </div>

              <h3 className="text-lg font-semibold text-gray-700 mt-5">
                No records found
              </h3>

              <p className="text-sm text-gray-400 mt-2">
                Try changing filters
              </p>

            </div>

          ) : (

            displayData.map((item) => (

              // <div
              //   key={item.id}
              //   onClick={() =>
              //     navigate(`/leads/${item.conversation_id}`)
              //   }
              //   className="
              //     border border-gray-100
              //     rounded-3xl
              //     p-5
              //     hover:border-green-200
              //     hover:bg-green-50/30
              //     transition-all
              //     cursor-pointer
              //   "
              // >
              <div
                key={item.id}
                className="border border-gray-100 rounded-3xl p-5 transition-all cursor-default hover:border-gray-200"
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                      <User
                        size={18}
                        className="text-green-600"
                      />
                    </div>

                    <div>

                      <h3 className="text-sm font-semibold text-gray-800">
                        {item.name || "Unknown"}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Phone size={12} />
                        {item.phone}
                      </div>

                    </div>

                  </div>

                  {item.status === "lead" ? (

                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                      Lead
                    </span>

                  ) : (

                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold">
                      Prospect
                    </span>

                  )}

                </div>

                <div className="grid grid-cols-2 gap-5 mt-6">

                  <div>

                    <p className="text-xs text-gray-400">
                      Stage
                    </p>

                    <p className="text-sm text-gray-700 mt-1 capitalize">
                      {item.chatbot_stage || "N/A"}
                    </p>

                  </div>


                  <div>

                    <p className="text-xs text-gray-400">
                      Last Chat
                    </p>

                    <p className="text-sm text-gray-700 mt-1">

                      {item.last_chat
                        ? new Date(item.last_chat).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                          }
                        )
                        : "N/A"}

                    </p>

                  </div>

                </div>

                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/leads/${item.conversation_id}`);
                  }}
                  className="
                    w-full mt-6 py-3 rounded-2xl
                    bg-green-600 hover:bg-green-700
                    text-white text-sm font-semibold
                    transition-all
                  "
                >
                  View Details
                </button> */}


              </div>

            ))

          )}

        </div>

        {/* ------------------------------------------------------------------ */}
        {/* PAGINATION */}
        {/* ------------------------------------------------------------------ */}

        {count > 20 && (

          <div className="px-5 py-5 border-t border-gray-100 bg-gray-50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <p className="text-sm text-gray-500">

              Showing{" "}
              <span className="font-semibold text-gray-700">
                {(page - 1) * 20 + 1}
              </span>

              -

              <span className="font-semibold text-gray-700">
                {Math.min(page * 20, count)}
              </span>

              {" "}of{" "}

              <span className="font-semibold text-gray-700">
                {count}
              </span>

            </p>

            <div className="flex items-center gap-3">

              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="
                  inline-flex items-center gap-2
                  px-4 py-2.5 rounded-2xl
                  border border-gray-200
                  bg-white
                  text-sm text-gray-700
                  hover:bg-gray-50
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  transition-all
                "
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-sm font-semibold text-gray-700">
                {page} / {totalPages}
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 20 >= count}
                className="
                  inline-flex items-center gap-2
                  px-4 py-2.5 rounded-2xl
                  border border-gray-200
                  bg-white
                  text-sm text-gray-700
                  hover:bg-gray-50
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  transition-all
                "
              >
                Next
                <ChevronRight size={16} />
              </button>

            </div>

          </div>

        )}

      </Card>

    </div>
  );
};

export default LeadsProspects;