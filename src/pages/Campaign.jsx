import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  fetchApprovedTemplates,
  fetchCampaigns,
  sendCampaign,
  clearSendResult,
  setCampaignStats,
  clearCampaignStats,
} from "../store/campaignSlice";

import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  X,
  Phone,
  Megaphone,
  RefreshCw,
  Info,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  Users,
  Clock3,
  Image,
  Film,
  Download,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Globe,
  Copy,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import TemplateAnalyticsModal from "../components/TemplateAnalyticsModal";

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */

function parsePhoneNumbers(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0)
    return { valid: [], duplicates: 0, invalid: 0, contacts: [], headers: [] };

  const parseCSVLine = (line) => {
    const res = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        res.push(current.trim().replace(/^"|"$/g, "").trim());
        current = "";
      } else {
        current += char;
      }
    }
    res.push(current.trim().replace(/^"|"$/g, "").trim());
    return res;
  };

  const rawHeaders = parseCSVLine(lines[0]);
  const lowerHeaders = rawHeaders.map((h) => h.toLowerCase());

  let phoneColIdx = lowerHeaders.findIndex((h) =>
    /phone|mobile|number|contact|tel|whatsapp/.test(h)
  );

  let hasHeaderRow = phoneColIdx !== -1;
  if (!hasHeaderRow) {
    phoneColIdx = 0;
  }

  const startRow = hasHeaderRow ? 1 : 0;
  const seen = new Set();
  const validNumbers = [];
  const validContacts = [];
  let duplicates = 0;
  let invalid = 0;

  for (let i = startRow; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const rawVal = cols[phoneColIdx] || "";
    if (!rawVal) continue;

    const n = rawVal.replace(/[\s\-().]/g, "");
    const digits = n.replace(/\D/g, "");

    if (digits.length < 7 || digits.length > 15) {
      invalid++;
      continue;
    }
    if (seen.has(digits)) {
      duplicates++;
      continue;
    }

    seen.add(digits);
    validNumbers.push(n);

    const rowData = {};
    rawHeaders.forEach((h, colIdx) => {
      rowData[h] = cols[colIdx] || "";
      rowData[h.toLowerCase()] = cols[colIdx] || "";
    });

    validContacts.push({
      phone: n,
      cols: cols,
      data: rowData,
    });
  }

  return {
    valid: validNumbers,
    contacts: validContacts,
    headers: hasHeaderRow ? rawHeaders : ["phone"],
    duplicates,
    invalid,
  };
}

function statusBadge(status) {
  const map = {
    APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    PENDING: "bg-amber-50 text-amber-700 border border-amber-200/80",
    REJECTED: "bg-red-50 text-red-700 border border-red-200/80",
    PAUSED: "bg-slate-100 text-[#64748B] border border-slate-200",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
        map[status] || "bg-slate-100 text-[#64748B] border border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

function campaignStatusBadge(status) {
  const map = {
    completed: {
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      dot: "bg-emerald-500",
    },
    running: {
      cls: "bg-sky-50 text-[#0EA5E9] border-sky-200/80",
      dot: "bg-[#0EA5E9]",
    },
    failed: {
      cls: "bg-red-50 text-red-700 border-red-200/80",
      dot: "bg-red-500",
    },
    queued: {
      cls: "bg-amber-50 text-amber-700 border-amber-200/80",
      dot: "bg-amber-500",
    },
  };

  const key = (status || "").toLowerCase();
  const cfg = map[key] || {
    cls: "bg-slate-100 text-[#64748B] border-slate-200",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status || "—"}
    </span>
  );
}

function getRenderedTextWithVars(rawText, vars = {}) {
  if (!rawText) return "";
  let result = rawText;
  Object.keys(vars || {}).forEach((key) => {
    if (vars[key]) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), vars[key]);
    }
  });
  return result;
}

function renderWhatsAppFormattedText(text) {
  if (!text) return null;
  const parts = String(text).split(/(\*[^*\n\r]+?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      const boldContent = part.slice(1, -1);
      return (
        <strong key={index} className="font-bold text-[#172033]">
          {boldContent}
        </strong>
      );
    }
    return part;
  });
}

/* ─────────────────────────────────────────────────────────────
   Template Card
───────────────────────────────────────────────────────────── */

function TemplateCard({ template, selected, onSelect }) {
  const [expanded, setExpanded] = useState(false);

  const bodyComp = template.components?.find((c) => c.type === "BODY");
  const headerComp = template.components?.find((c) => c.type === "HEADER");
  const footerComp = template.components?.find((c) => c.type === "FOOTER");

  const bodyText =
    bodyComp?.text || template.body_text || template.body || "";
  const headerText =
    headerComp?.text || template.header_text || template.header || "";
  const footerText =
    footerComp?.text || template.footer_text || template.footer || "";

  const vars = [
    ...new Set((bodyText + headerText).match(/\{\{\d+\}\}/g) || []),
  ];

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border cursor-pointer transition-all duration-150 overflow-hidden ${
        selected
          ? "border-[#165DFF] bg-blue-50/50 shadow-xs shadow-blue-500/10"
          : "border-[#E5E7EB] bg-white hover:border-[#165DFF]/40 hover:bg-slate-50/60"
      }`}
    >
      <div className="p-3.5">
        <div className="flex justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`text-xs font-bold truncate ${
                  selected ? "text-[#165DFF]" : "text-[#172033]"
                }`}
              >
                {template.name}
              </h3>

              {statusBadge(template.status)}
            </div>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[11px] text-[#64748B] uppercase font-medium">
                {template.language || template.language_code}
              </span>

              {template.category && (
                <span className="text-[11px] text-[#94A3B8]">
                  • {template.category}
                </span>
              )}

              {vars.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-[10px] font-semibold text-amber-700">
                  {vars.length} {vars.length === 1 ? "Variable" : "Variables"}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-1.5">
            {selected && (
              <CheckCircle2 size={16} className="text-[#165DFF] mt-0.5" />
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition cursor-pointer"
              title={expanded ? "Hide preview" : "Preview template"}
            >
              {expanded ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 p-3.5">
            {template.header_type === "TEXT" && headerText && (
              <div className="text-xs font-bold text-[#172033] mb-1.5">
                {renderWhatsAppFormattedText(headerText)}
              </div>
            )}

            {["IMAGE", "VIDEO", "DOCUMENT"].includes(template.header_type) && (
              <div className="bg-slate-100 rounded-xl h-20 mb-2.5 flex flex-col items-center justify-center text-[#94A3B8] border border-slate-200/70">
                {template.header_type === "IMAGE" && <Image size={20} />}
                {template.header_type === "VIDEO" && <Film size={20} />}
                {template.header_type === "DOCUMENT" && <FileText size={20} />}
                <span className="text-[10px] font-semibold mt-1">
                  {template.header_type}
                </span>
              </div>
            )}

            <div className="text-xs text-[#172033] whitespace-pre-wrap leading-relaxed">
              {renderWhatsAppFormattedText(bodyText || "No body text")}
            </div>

            {footerText && (
              <div className="mt-2.5 text-[11px] text-[#64748B] border-t border-slate-200/80 pt-2">
                {footerText}
              </div>
            )}

            {Array.isArray(template.buttons) && template.buttons.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1.5">
                {template.buttons.map((btn, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg py-1.5 px-3 text-center text-xs font-semibold text-[#165DFF] border border-blue-200/70 flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    {btn.type === "URL" && (
                      <Globe size={12} className="text-[#165DFF]" />
                    )}
                    {btn.type === "PHONE_NUMBER" && (
                      <Phone size={12} className="text-emerald-600" />
                    )}
                    {(btn.type === "OTP" || btn.otp_type === "COPY_CODE") && (
                      <Copy size={12} className="text-[#165DFF]" />
                    )}
                    <span>
                      {btn.text ||
                        (btn.type === "URL"
                          ? "Visit Website"
                          : btn.type === "PHONE_NUMBER"
                            ? "Call Phone"
                            : btn.type === "OTP" || btn.otp_type === "COPY_CODE"
                              ? "Copy Code"
                              : "Quick Reply")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */

const Campaign = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    approvedTemplates,
    campaigns,
    campaignStatsMap = {},
    isFetchingTemplates,
    isSending,
    isFetchingCampaigns,
    sendSuccess,
    sendError,
  } = useSelector((s) => s.campaign);

  const token = useSelector((s) => s.auth?.accessToken);

  const tab = searchParams.get("tab") === "history" ? "history" : "new";
  const setTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };
  const [currentStep, setCurrentStep] = useState(1);
  const [analyticsTemplate, setAnalyticsTemplate] = useState(null);
  const [historySearch, setHistorySearch] = useState("");

  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [csvContacts, setCsvContacts] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [fileName, setFileName] = useState(null);
  const [csvStats, setCsvStats] = useState({ duplicates: 0, invalid: 0 });

  const [rawCSVError, setRawCSVError] = useState(null);
  const [templateVars, setTemplateVars] = useState({});
  const [templateSearch, setTemplateSearch] = useState("");

  const topRef = useRef(null);
  const fileInputRef = useRef();
  const mediaInputRef = useRef();
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [mediaError, setMediaError] = useState(null);

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(mediaFile);
    setMediaPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [mediaFile]);

  const [failedModalCampaign, setFailedModalCampaign] = useState(null);
  const [exportingCampaignId, setExportingCampaignId] = useState(null);
  const fetchingIdsRef = useRef(new Set());

  const computeRecipientStats = (campaignObj, recipientsList) => {
    let sent = 0;
    let delivered = 0;
    let read = 0;
    let failed = 0;
    const failedRecipients = [];

    if (Array.isArray(recipientsList) && recipientsList.length > 0) {
      recipientsList.forEach((r) => {
        const st = String(r.status || "").toLowerCase().trim();
        const rawErr = String(r.error_detail || "").trim();
        const hasRealError = rawErr !== "" && rawErr !== "-";

        if (st === "read") {
          read += 1;
          delivered += 1;
          sent += 1;
        } else if (st === "delivered") {
          delivered += 1;
          sent += 1;
        } else if (st === "sent") {
          sent += 1;
        } else if (st === "failed" || hasRealError) {
          failed += 1;
          failedRecipients.push({
            phone_number: r.phone_number || "—",
            error_detail: hasRealError ? rawErr : "Delivery failed",
          });
        }
      });

      return {
        sent:
          campaignObj.total_count ??
          campaignObj.recipient_count ??
          recipientsList.length,
        delivered,
        read,
        failed: failedRecipients.length,
        failedRecipients,
      };
    }

    return {
      sent:
        campaignObj.total_count ??
        campaignObj.sent_count ??
        campaignObj.total_sent ??
        campaignObj.recipient_count ??
        0,
      delivered: campaignObj.delivered_count ?? 0,
      read: campaignObj.read_count ?? 0,
      failed: campaignObj.failed_count ?? 0,
      failedRecipients,
    };
  };

  // Load recipient counts once per campaign and cache in Redux so they don't re-fetch on navigation
  useEffect(() => {
    if (tab !== "history" || !Array.isArray(campaigns) || campaigns.length === 0) {
      return;
    }

    const currentToken = token || localStorage.getItem("accessToken");
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    let isCancelled = false;

    const loadMissingCampaignDetails = async () => {
      for (const c of campaigns) {
        if (
          !c?.id ||
          campaignStatsMap[c.id]?.loaded ||
          fetchingIdsRef.current.has(c.id)
        ) {
          continue;
        }

        if (Array.isArray(c.recipients)) {
          const stats = computeRecipientStats(c, c.recipients);
          dispatch(
            setCampaignStats({
              id: c.id,
              stats: { ...stats, recipients: c.recipients, loaded: true, loading: false },
            })
          );
          continue;
        }

        fetchingIdsRef.current.add(c.id);
        dispatch(
          setCampaignStats({
            id: c.id,
            stats: { ...(campaignStatsMap[c.id] || {}), loading: true },
          })
        );

        try {
          const resp = await fetch(`${API_BASE_URL}/api/campaigns/${c.id}/`, {
            headers: { Authorization: `Bearer ${currentToken}` },
          });
          if (resp.ok) {
            const data = await resp.json();
            const recipients = Array.isArray(data.recipients) ? data.recipients : [];
            const stats = computeRecipientStats({ ...c, ...data }, recipients);
            if (!isCancelled) {
              dispatch(
                setCampaignStats({
                  id: c.id,
                  stats: { ...stats, recipients, loaded: true, loading: false },
                })
              );
            }
          } else if (!isCancelled) {
            const fallback = computeRecipientStats(c, []);
            dispatch(
              setCampaignStats({
                id: c.id,
                stats: { ...fallback, loaded: true, loading: false },
              })
            );
          }
        } catch {
          if (!isCancelled) {
            const fallback = computeRecipientStats(c, []);
            dispatch(
              setCampaignStats({
                id: c.id,
                stats: { ...fallback, loaded: true, loading: false },
              })
            );
          }
        } finally {
          fetchingIdsRef.current.delete(c.id);
        }
      }
    };

    loadMissingCampaignDetails();
    return () => {
      isCancelled = true;
    };
  }, [tab, campaigns, token, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenFailedModal = async (campaignObj) => {
    const existing = campaignStatsMap[campaignObj.id];
    if (existing?.loaded) {
      setFailedModalCampaign({
        campaign: campaignObj,
        ...existing,
        loading: false,
      });
      return;
    }

    setFailedModalCampaign({
      campaign: campaignObj,
      failedRecipients: [],
      loading: true,
    });

    try {
      const currentToken = token || localStorage.getItem("accessToken");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const resp = await fetch(
        `${API_BASE_URL}/api/campaigns/${campaignObj.id}/`,
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );
      const data = await resp.json();
      const recipients = Array.isArray(data.recipients) ? data.recipients : [];
      const stats = computeRecipientStats({ ...campaignObj, ...data }, recipients);

      dispatch(
        setCampaignStats({
          id: campaignObj.id,
          stats: { ...stats, recipients, loaded: true, loading: false },
        })
      );

      setFailedModalCampaign({
        campaign: { ...campaignObj, ...data },
        ...stats,
        loading: false,
      });
    } catch {
      const fallback = computeRecipientStats(campaignObj, []);
      setFailedModalCampaign({
        campaign: campaignObj,
        ...fallback,
        loading: false,
      });
    }
  };

  const handleDownloadCampaignReport = async (campaignObj) => {
    if (!campaignObj?.id) return;
    setExportingCampaignId(campaignObj.id);
    try {
      let recipients = campaignStatsMap[campaignObj.id]?.recipients;
      let campaignNameStr = campaignObj.name || "campaign";

      if (!Array.isArray(recipients)) {
        const currentToken = token || localStorage.getItem("accessToken");
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const resp = await fetch(
          `${API_BASE_URL}/api/campaigns/${campaignObj.id}/`,
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          }
        );
        if (!resp.ok) throw new Error("Failed to fetch campaign report");
        const data = await resp.json();
        recipients = Array.isArray(data.recipients) ? data.recipients : [];
        campaignNameStr = data.name || campaignObj.name || "campaign";
        const stats = computeRecipientStats({ ...campaignObj, ...data }, recipients);
        dispatch(
          setCampaignStats({
            id: campaignObj.id,
            stats: { ...stats, recipients, loaded: true, loading: false },
          })
        );
      }

      const headers = [
        "Phone Number",
        "Status",
        "Meta Message ID",
        "Sent At",
        "Error Detail",
      ];
      const rows = recipients.map((r) => [
        `="${r.phone_number || ""}"`,
        `"${
          r.status
            ? r.status.charAt(0).toUpperCase() + r.status.slice(1)
            : "Pending"
        }"`,
        `"${r.meta_message_id || "-"}"`,
        `"${
          r.sent_at
            ? new Date(r.sent_at).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })
            : "-"
        }"`,
        `"${(r.error_detail || "-").replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        "\uFEFF" +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\r\n");
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const safeName = campaignNameStr.replace(/[^a-z0-9_-]/gi, "_");
      link.setAttribute("download", `${safeName}_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert("Error generating CSV report.");
    } finally {
      setExportingCampaignId(null);
    }
  };

  const handleDownloadSampleCSV = () => {
    const sampleRows = [
      ["phone", "name"],
      ["919876543210", "Rahul Sharma"],
      ["919876543211", "Priya Patel"],
      ["9876543212", "Amit Shah"],
      ["+919876543213", "Neha Mehta"],
    ];

    const csvContent =
      "\uFEFF" + sampleRows.map((e) => e.join(",")).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_campaign_contacts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (tab === "history") {
      if (!campaigns || campaigns.length === 0) {
        dispatch(fetchCampaigns());
      }
    } else {
      if (!approvedTemplates || approvedTemplates.length === 0) {
        dispatch(fetchApprovedTemplates());
      }
    }
  }, [dispatch, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sendSuccess || sendError) {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    if (sendSuccess) {
      setCampaignName("");
      setSelectedTemplateId(null);
      setPhoneNumbers([]);
      setCsvContacts([]);
      setCsvHeaders([]);
      setColumnMapping({});
      setFileName(null);
      setRawCSVError(null);
      setTemplateVars({});
      setTemplateSearch("");
      setMediaFile(null);
      setMediaError(null);
      if (mediaInputRef.current) mediaInputRef.current.value = "";
      setCurrentStep(1);

      const t = setTimeout(() => {
        dispatch(clearSendResult());
      }, 5000);

      return () => clearTimeout(t);
    }
  }, [sendSuccess, sendError, dispatch]);

  const selectedTemplate = approvedTemplates.find(
    (t) => t.id === selectedTemplateId
  );

  const bodyText =
    selectedTemplate?.components?.find((c) => c.type === "BODY")?.text ||
    selectedTemplate?.body_text ||
    selectedTemplate?.body ||
    "";

  const headerText =
    selectedTemplate?.components?.find((c) => c.type === "HEADER")?.text ||
    selectedTemplate?.header_text ||
    selectedTemplate?.header ||
    "";

  const footerText =
    selectedTemplate?.components?.find((c) => c.type === "FOOTER")?.text ||
    selectedTemplate?.footer_text ||
    selectedTemplate?.footer ||
    "";

  const templateVarKeys = useMemo(() => {
    return [
      ...new Set((bodyText + headerText).match(/\{\{\d+\}\}/g) || []),
    ]
      .map((v) => v.replace(/[{}]/g, ""))
      .sort((a, b) => Number(a) - Number(b));
  }, [bodyText, headerText]);

  const previewVars = useMemo(() => {
    const res = {};
    const sampleContact = csvContacts[0];
    templateVarKeys.forEach((k) => {
      const mappedCol = columnMapping[k];
      if (mappedCol && sampleContact?.data && sampleContact.data[mappedCol]) {
        res[k] = sampleContact.data[mappedCol];
      } else {
        res[k] = templateVars[k] || `{{${k}}}`;
      }
    });
    return res;
  }, [templateVarKeys, columnMapping, csvContacts, templateVars]);

  const filteredTemplates = useMemo(() => {
    const validTemplates = approvedTemplates.filter(
      (t) => (t.category || "").toUpperCase() !== "AUTHENTICATION"
    );

    if (!templateSearch.trim()) return validTemplates;

    const q = templateSearch.toLowerCase();
    return validTemplates.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
    );
  }, [approvedTemplates, templateSearch]);

  const filteredCampaigns = useMemo(() => {
    if (!historySearch.trim()) return campaigns;
    const q = historySearch.toLowerCase();
    return campaigns.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.template_name || c.template || "").toLowerCase().includes(q) ||
        (c.status || "").toLowerCase().includes(q)
    );
  }, [campaigns, historySearch]);

  const canProceedToStep2 = Boolean(
    campaignName.trim() && phoneNumbers.length > 0
  );
  const canProceedToStep3 = Boolean(canProceedToStep2 && selectedTemplateId);
  const canSend = canProceedToStep3 && !isSending;

  const renderMediaPreviewBlock = () => {
    if (
      !selectedTemplate ||
      !["IMAGE", "VIDEO", "DOCUMENT"].includes(selectedTemplate.header_type)
    ) {
      return null;
    }

    if (mediaFile && mediaPreviewUrl) {
      if (selectedTemplate.header_type === "IMAGE") {
        return (
          <div className="mb-2.5 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100">
            <img
              src={mediaPreviewUrl}
              alt="Media header preview"
              className="w-full max-h-56 object-cover"
            />
          </div>
        );
      }
      if (selectedTemplate.header_type === "VIDEO") {
        return (
          <div className="mb-2.5 overflow-hidden rounded-xl border border-slate-200/80 bg-black">
            <video
              src={mediaPreviewUrl}
              controls
              playsInline
              className="w-full max-h-56"
            />
          </div>
        );
      }
      if (selectedTemplate.header_type === "DOCUMENT") {
        return (
          <div className="mb-2.5 flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-200/70 text-[#172033] shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 font-bold text-[10px] uppercase">
              {mediaFile.name?.split(".").pop() || "DOC"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">{mediaFile.name}</div>
              <div className="text-[10px] text-[#64748B]">
                {(mediaFile.size / (1024 * 1024)).toFixed(2)} MB • Document
              </div>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="mb-2.5 p-4 rounded-xl bg-white/80 border border-dashed border-blue-200 text-center flex flex-col items-center justify-center gap-1 text-[#64748B]">
        {selectedTemplate.header_type === "IMAGE" && (
          <Image size={22} className="text-[#94A3B8]" />
        )}
        {selectedTemplate.header_type === "VIDEO" && (
          <Film size={22} className="text-[#94A3B8]" />
        )}
        {selectedTemplate.header_type === "DOCUMENT" && (
          <FileText size={22} className="text-[#94A3B8]" />
        )}
        <span className="text-xs font-semibold text-[#172033]">
          [{selectedTemplate.header_type} Header]
        </span>
        <span className="text-[10px] text-[#94A3B8]">
          Upload media in Step 2 to preview
        </span>
      </div>
    );
  };

  const renderButtonsPreviewBlock = () => {
    const buttons =
      selectedTemplate?.buttons ||
      selectedTemplate?.components?.find((c) => c.type === "BUTTONS")
        ?.buttons ||
      [];

    if (!Array.isArray(buttons) || buttons.length === 0) return null;

    return (
      <div className="space-y-1.5 mt-2.5 pt-2 border-t border-blue-200/60">
        {buttons.map((btn, i) => (
          <div
            key={i}
            className="bg-white rounded-xl py-2 px-3 text-center shadow-2xs flex items-center justify-center gap-1.5 text-[#165DFF] border border-blue-200/70"
          >
            {btn.type === "URL" && (
              <Globe size={12} className="text-[#165DFF]" />
            )}
            {btn.type === "PHONE_NUMBER" && (
              <Phone size={12} className="text-emerald-600" />
            )}
            {(btn.type === "OTP" || btn.otp_type === "COPY_CODE") && (
              <Copy size={12} className="text-[#165DFF]" />
            )}
            <span className="text-xs font-semibold">
              {btn.text ||
                (btn.type === "URL"
                  ? "Visit Website"
                  : btn.type === "PHONE_NUMBER"
                    ? "Call Phone"
                    : btn.type === "OTP" || btn.otp_type === "COPY_CODE"
                      ? "Copy Code"
                      : "Quick Reply")}
            </span>
          </div>
        ))}
      </div>
    );
  };

  /* ───────────────────────────────────────────────────────── */

  const handleFileUpload = (file) => {
    if (!file) return;

    setRawCSVError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const parsedStats = parsePhoneNumbers(text);

      if (parsedStats.valid.length === 0) {
        setRawCSVError("No valid phone numbers found inside CSV.");
        setPhoneNumbers([]);
        setCsvContacts([]);
        setCsvHeaders([]);
        setColumnMapping({});
        setFileName(null);
        setCsvStats({ duplicates: 0, invalid: 0 });
      } else {
        setPhoneNumbers(parsedStats.valid);
        setCsvContacts(parsedStats.contacts || []);
        const headers = parsedStats.headers || [];
        setCsvHeaders(headers);
        setFileName(file.name);
        setCsvStats({
          duplicates: parsedStats.duplicates,
          invalid: parsedStats.invalid,
        });

        if (headers.length > 0) {
          const autoMap = {};
          const nameCol =
            headers.find((h) =>
              /^(name|full_name|first_name|customer_name|client_name|naam)$/i.test(
                h
              )
            ) || headers.find((h) => /name/i.test(h));

          if (nameCol) {
            autoMap["1"] = nameCol;
          }

          headers.forEach((h, idx) => {
            const key = String(idx + 1);
            if (!autoMap[key] && !/phone|mobile|number|contact/i.test(h)) {
              autoMap[key] = h;
            }
          });

          setColumnMapping((prev) => ({ ...autoMap, ...prev }));
        }
      }
    };

    reader.onerror = () => {
      setRawCSVError("Failed to read file.");
    };

    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSend = () => {
    if (!canSend) return;

    const defaultVariables = {};

    templateVarKeys.forEach((k) => {
      defaultVariables[k] = templateVars[k] || "";
    });

    const isMediaHeader = ["IMAGE", "VIDEO", "DOCUMENT"].includes(
      selectedTemplate?.header_type
    );
    if (isMediaHeader) {
      defaultVariables.media_url = templateVars.media_url || "";
    }

    const hasTemplateVariables = templateVarKeys.length > 0;
    const packagedRecipients = (
      csvContacts.length > 0
        ? csvContacts
        : phoneNumbers.map((p) => ({ phone: p }))
    ).map((c) => {
      if (!hasTemplateVariables) {
        return c.phone;
      }
      const recVars = {};
      templateVarKeys.forEach((k) => {
        const mappedCol = columnMapping[k];
        if (
          mappedCol &&
          c.data &&
          c.data[mappedCol] !== undefined &&
          c.data[mappedCol] !== ""
        ) {
          recVars[k] = c.data[mappedCol];
        } else if (templateVars[k]) {
          recVars[k] = templateVars[k];
        }
      });
      return {
        phone: c.phone,
        vars: recVars,
      };
    });

    let payload;
    if (isMediaHeader && mediaFile) {
      payload = new FormData();
      payload.append("name", campaignName.trim());
      payload.append("template_id", selectedTemplateId);
      payload.append("phone_numbers", JSON.stringify(packagedRecipients));
      payload.append("variables", JSON.stringify(defaultVariables));
      payload.append("media_file", mediaFile);
    } else {
      payload = {
        name: campaignName.trim(),
        template_id: selectedTemplateId,
        phone_numbers: packagedRecipients,
        variables:
          templateVarKeys.length > 0 || isMediaHeader
            ? defaultVariables
            : undefined,
      };
    }

    dispatch(sendCampaign(payload));
  };

  const handleReset = () => {
    setCampaignName("");
    setSelectedTemplateId(null);
    setPhoneNumbers([]);
    setCsvContacts([]);
    setCsvHeaders([]);
    setColumnMapping({});
    setFileName(null);
    setRawCSVError(null);
    setTemplateVars({});
    setTemplateSearch("");
    setMediaFile(null);
    setMediaError(null);
    if (mediaInputRef.current) mediaInputRef.current.value = "";
    setCurrentStep(1);

    dispatch(clearSendResult());
  };

  /* ───────────────────────────────────────────────────────── */

  return (
    <div
      ref={topRef}
      className={`w-full bg-[#FAFAFC] p-5 sm:p-6 lg:p-7 font-sans text-[#172033] ${
        tab === "new"
          ? "min-h-screen lg:h-screen lg:overflow-hidden flex flex-col gap-4"
          : "min-h-screen space-y-5"
      }`}
    >
      {/* ── PAGE HEADER (Exact same size/alignment as Dashboard, Leads, WhatsApp & Templates) ── */}
      <div className="shrink-0 flex items-center justify-between flex-wrap gap-3 pb-3.5 min-h-[56px] border-b border-[#E5E7EB]/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172033] leading-tight">
            {tab === "history" ? "Campaign History" : "Create Campaign"}
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-normal">
            {tab === "history"
              ? "Track campaign delivery, read rates, and messaging performance."
              : "Send WhatsApp campaigns to your target audience using approved templates."}
          </p>
        </div>

        {/* Right Toolbar: Refresh */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => {
              if (tab === "history") {
                fetchingIdsRef.current.clear();
                dispatch(clearCampaignStats());
                dispatch(fetchCampaigns());
              } else {
                dispatch(fetchApprovedTemplates());
              }
            }}
            disabled={isFetchingCampaigns || isFetchingTemplates}
            className="h-9 flex items-center gap-1.5 text-xs font-semibold px-3.5 bg-white border border-[#E5E7EB] rounded-xl text-[#172033] hover:border-[#165DFF]/40 hover:text-[#165DFF] hover:bg-blue-50/30 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              size={13}
              className={
                isFetchingCampaigns || isFetchingTemplates
                  ? "animate-spin text-[#165DFF]"
                  : "text-[#64748B]"
              }
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── SUCCESS BANNER ── */}
      {sendSuccess && (
        <div className="shrink-0 bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start gap-3">
          <CheckCircle2
            size={18}
            className="text-emerald-600 mt-0.5 shrink-0"
          />

          <div className="flex-1">
            <p className="text-xs font-bold text-emerald-800">
              Campaign "{sendSuccess.name || campaignName}" completed!
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <span className="bg-white border border-emerald-200 text-emerald-800 px-2.5 py-0.5 rounded-md">
                Total: {sendSuccess.total_count ?? 0}
              </span>
              <span className="bg-emerald-100/80 text-emerald-800 px-2.5 py-0.5 rounded-md">
                Sent: {sendSuccess.sent_count ?? 0}
              </span>
              <span className="bg-red-100/80 text-red-700 px-2.5 py-0.5 rounded-md">
                Failed: {sendSuccess.failed_count ?? 0}
              </span>
              {sendSuccess.invalid_numbers_skipped > 0 && (
                <span className="bg-amber-100/80 text-amber-800 px-2.5 py-0.5 rounded-md">
                  Invalid: {sendSuccess.invalid_numbers_skipped}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => dispatch(clearSendResult())}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── ERROR BANNER ── */}
      {sendError && (
        <div className="shrink-0 bg-red-50 border border-red-100 rounded-2xl p-3.5 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />

          <div className="flex-1">
            <p className="text-xs font-bold text-red-700">
              Failed to send campaign
            </p>
            <p className="text-xs text-red-600 mt-0.5">{sendError}</p>
          </div>

          <button
            onClick={() => dispatch(clearSendResult())}
            className="text-red-400 hover:text-red-600 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
         NEW CAMPAIGN TAB (Fits viewport cleanly without scrolling)
      ───────────────────────────────────────────────────────── */}
      {tab === "new" && (
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          {/* STEPPER PROGRESS BAR + INLINE ACTION CONTROLS */}
          <div className="shrink-0 bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-sm shadow-blue-500/[0.03] flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
              {[
                {
                  id: 1,
                  short: "1. Campaign & Contacts",
                  desc: "Name & upload CSV audience",
                },
                {
                  id: 2,
                  short: "2. Select Template",
                  desc: "Choose Meta template & media",
                },
                {
                  id: 3,
                  short: "3. Summary & Launch",
                  desc: "Review details & broadcast",
                },
              ].map((s) => {
                const isCompleted =
                  s.id === 1
                    ? canProceedToStep2
                    : s.id === 2
                      ? canProceedToStep3
                      : false;
                const isActive = currentStep === s.id;
                const isClickable =
                  s.id === 1 ||
                  (s.id === 2 && canProceedToStep2) ||
                  (s.id === 3 && canProceedToStep3);

                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => setCurrentStep(s.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-blue-50/70 border border-[#165DFF]/30 shadow-2xs"
                        : isClickable
                          ? "hover:bg-slate-50 border border-transparent cursor-pointer"
                          : "opacity-45 border border-transparent cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        isActive
                          ? "bg-[#165DFF] text-white shadow-sm shadow-blue-500/20"
                          : isCompleted
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-slate-100 text-[#94A3B8]"
                      }`}
                    >
                      {isCompleted && !isActive ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        s.id
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs font-bold truncate ${
                          isActive ? "text-[#165DFF]" : "text-[#172033]"
                        }`}
                      >
                        {s.short}
                      </div>
                      <div className="text-[11px] text-[#64748B] truncate">
                        {s.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* TOP STEP ACTIONS (Always accessible without scrolling) */}
            <div className="flex items-center justify-end gap-2 shrink-0 xl:pl-3 xl:border-l xl:border-slate-100">
              {currentStep === 1 && (
                <button
                  type="button"
                  disabled={!canProceedToStep2}
                  onClick={() => setCurrentStep(2)}
                  className="h-9 px-4 rounded-xl bg-[#165DFF] hover:bg-[#1247CC] text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs cursor-pointer whitespace-nowrap"
                >
                  <span>Next: Select Template</span>
                  <ArrowRight size={13} />
                </button>
              )}

              {currentStep === 2 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="h-9 px-3.5 rounded-xl border border-[#E5E7EB] text-[#172033] hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                  >
                    <ArrowLeft size={13} />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    disabled={!canProceedToStep3}
                    onClick={() => setCurrentStep(3)}
                    className="h-9 px-4 rounded-xl bg-[#165DFF] hover:bg-[#1247CC] text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs cursor-pointer whitespace-nowrap"
                  >
                    <span>Next: Summary & Launch</span>
                    <ArrowRight size={13} />
                  </button>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="h-9 px-3.5 rounded-xl border border-[#E5E7EB] text-[#172033] hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                  >
                    <ArrowLeft size={13} />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="h-9 px-3 rounded-xl border border-[#E5E7EB] text-[#64748B] hover:text-[#172033] hover:bg-slate-50 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend}
                    className="h-9 px-4 rounded-xl bg-[#165DFF] hover:bg-[#1247CC] text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed text-xs cursor-pointer whitespace-nowrap"
                  >
                    {isSending ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>
                          Send Campaign ({phoneNumbers.length.toLocaleString()})
                        </span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* STEP 1: CAMPAIGN DETAILS & CONTACTS */}
          {currentStep === 1 && (
            <div className="flex-1 min-h-0 flex flex-col gap-4">
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch overflow-y-auto lg:overflow-hidden">
                {/* CAMPAIGN NAME */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm shadow-blue-500/[0.03] flex flex-col justify-between overflow-y-auto">
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div>
                        <h2 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                          <span>Campaign Details</span>
                          <div className="group relative flex items-center">
                            <Info
                              size={14}
                              className="text-[#165DFF] cursor-help"
                            />
                            <div className="absolute left-6 top-0 w-72 p-3.5 bg-white border border-slate-200 text-[#172033] text-xs rounded-xl shadow-xl z-50 hidden group-hover:block font-normal leading-relaxed pointer-events-none">
                              <strong className="text-[#165DFF] text-xs">
                                Meta Frequency Capping
                              </strong>
                              <div className="mt-1.5 text-[#64748B]">
                                To prevent spam, Meta limits how often you can
                                send Marketing templates to the same user.
                              </div>
                              <div className="mt-2.5 p-2 bg-blue-50/80 text-[#172033] rounded-lg border border-blue-100 text-[11px]">
                                <strong>Recommendation:</strong> Maintain a gap
                                of 5–7 days between campaigns for the same
                                contacts.
                              </div>
                            </div>
                          </div>
                        </h2>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          Name your broadcast campaign for tracking & reports
                        </p>
                      </div>
                    </div>

                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block mb-1.5">
                      Campaign Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. Diwali Mega Offer Campaign..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-slate-50/70 focus:bg-white focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 outline-none transition-all text-xs text-[#172033] placeholder:text-[#94A3B8]"
                    />

                    <p className="text-[11px] text-[#94A3B8] mt-2 leading-relaxed">
                      Give your campaign a clear, recognisable name. This helps
                      you track performance and export CSV reports in Campaign
                      History.
                    </p>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-800 flex items-start gap-2.5">
                    <Sparkles
                      size={15}
                      className="text-amber-600 shrink-0 mt-0.5"
                    />
                    <div className="leading-relaxed">
                      <strong>Broadcast Best Practice:</strong> Only send
                      approved marketing templates to opted-in users to ensure a
                      high delivery rate.
                    </div>
                  </div>
                </div>

                {/* UPLOAD CONTACTS */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm shadow-blue-500/[0.03] flex flex-col justify-between overflow-y-auto">
                  <div>
                    <div className="flex items-center justify-between mb-3.5 gap-2">
                      <div>
                        <h2 className="text-sm font-bold text-[#172033]">
                          Upload Contacts
                        </h2>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          CSV or TXT file supported
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadSampleCSV}
                          className="text-[#165DFF] bg-blue-50 hover:bg-blue-100/80 border border-blue-200/70 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          title="Download Sample CSV Template"
                        >
                          <Download size={13} />
                          Sample CSV
                        </button>

                        {phoneNumbers.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setPhoneNumbers([]);
                              setFileName(null);
                              setCsvStats({ duplicates: 0, invalid: 0 });
                            }}
                            className="text-red-500 hover:text-red-600 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* DROPZONE */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                        phoneNumbers.length > 0
                          ? "border-emerald-300 bg-emerald-50/50 p-3.5 hover:bg-emerald-50"
                          : "border-[#E5E7EB] bg-slate-50/60 hover:border-[#165DFF]/50 hover:bg-blue-50/30 p-5 text-center flex flex-col items-center justify-center min-h-[120px]"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files?.[0])}
                      />

                      {phoneNumbers.length > 0 ? (
                        <div className="flex items-center justify-between w-full gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                              <CheckCircle2 size={18} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-[#172033] text-xs truncate">
                                {fileName}
                              </h3>
                              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                                {phoneNumbers.length.toLocaleString()} valid
                                contacts ready
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200/80 px-3 py-1.5 rounded-xl shrink-0 transition">
                            Change File
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-2">
                            <Upload size={17} className="text-[#165DFF]" />
                          </div>
                          <h3 className="font-semibold text-[#172033] text-xs">
                            Drop CSV file here
                          </h3>
                          <p className="text-[11px] text-[#94A3B8] mt-0.5">
                            or click to browse from your computer
                          </p>
                        </>
                      )}
                    </div>

                    {/* STATS BREAKDOWN */}
                    {phoneNumbers.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-2.5">
                        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2 text-center">
                          <div className="text-xs font-bold text-emerald-700 tabular-nums">
                            {phoneNumbers.length}
                          </div>
                          <div className="text-[10px] font-semibold text-emerald-700 flex items-center justify-center gap-1">
                            <CheckCircle2 size={10} /> Valid
                          </div>
                        </div>

                        <div
                          className={`rounded-xl p-2 text-center border transition-all ${
                            csvStats.duplicates > 0
                              ? "bg-amber-50 border-amber-200"
                              : "bg-slate-50 border-slate-200/70"
                          }`}
                        >
                          <div
                            className={`text-xs font-bold tabular-nums ${
                              csvStats.duplicates > 0
                                ? "text-amber-700"
                                : "text-[#94A3B8]"
                            }`}
                          >
                            {csvStats.duplicates}
                          </div>
                          <div
                            className={`text-[10px] font-semibold ${
                              csvStats.duplicates > 0
                                ? "text-amber-700"
                                : "text-[#94A3B8]"
                            }`}
                          >
                            Duplicates
                          </div>
                        </div>

                        <div
                          className={`rounded-xl p-2 text-center border transition-all ${
                            csvStats.invalid > 0
                              ? "bg-red-50 border-red-200"
                              : "bg-slate-50 border-slate-200/70"
                          }`}
                        >
                          <div
                            className={`text-xs font-bold tabular-nums ${
                              csvStats.invalid > 0
                                ? "text-red-700"
                                : "text-[#94A3B8]"
                            }`}
                          >
                            {csvStats.invalid}
                          </div>
                          <div
                            className={`text-[10px] font-semibold ${
                              csvStats.invalid > 0
                                ? "text-red-700"
                                : "text-[#94A3B8]"
                            }`}
                          >
                            Invalid
                          </div>
                        </div>
                      </div>
                    )}

                    {rawCSVError && (
                      <div className="mt-2.5 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-600 flex gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        {rawCSVError}
                      </div>
                    )}

                    {/* PREVIEW CONTACTS */}
                    {phoneNumbers.length > 0 && (
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <Users size={12} className="text-[#165DFF]" />
                            <span className="text-[11px] font-semibold text-[#172033]">
                              Preview Contacts
                            </span>
                          </div>
                          {phoneNumbers.length > 5 && (
                            <span className="text-[10px] text-[#94A3B8]">
                              Showing 5 of {phoneNumbers.length}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {phoneNumbers.slice(0, 5).map((n, i) => (
                            <div
                              key={i}
                              className="px-2 py-0.5 bg-slate-100 border border-slate-200/70 rounded-lg text-[11px] text-[#172033] font-mono flex items-center gap-1"
                            >
                              <Phone size={10} className="text-[#165DFF]" />
                              {n}
                            </div>
                          ))}
                          {phoneNumbers.length > 5 && (
                            <div className="px-2 py-0.5 bg-blue-50 text-[#165DFF] border border-blue-100 rounded-lg text-[11px] font-semibold">
                              +{phoneNumbers.length - 5} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="mt-3 bg-blue-50/60 border border-blue-100 rounded-xl p-2.5 flex items-start gap-2">
                    <Info
                      size={13}
                      className="text-[#165DFF] mt-0.5 shrink-0"
                    />
                    <div className="text-[11px] text-[#64748B] leading-relaxed">
                      CSV should contain a{" "}
                      <strong className="text-[#172033]">phone</strong> or{" "}
                      <strong className="text-[#172033]">mobile</strong> column
                      (10-digit number or with country code 91).
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 1 PINNED FOOTER BAR */}
              <div className="shrink-0 bg-white border border-slate-200/80 rounded-2xl px-4 py-3 shadow-sm shadow-blue-500/[0.03] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs font-medium text-[#64748B]">
                  {!campaignName.trim()
                    ? "Please enter a Campaign Name to continue."
                    : phoneNumbers.length === 0
                      ? "Please upload a CSV with contacts to continue."
                      : `✓ Ready to proceed: "${campaignName}" (${phoneNumbers.length.toLocaleString()} contacts)`}
                </div>

                <button
                  type="button"
                  disabled={!canProceedToStep2}
                  onClick={() => setCurrentStep(2)}
                  className="h-9 px-5 rounded-xl bg-[#165DFF] hover:bg-[#1247CC] text-white font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition w-full sm:w-auto text-xs cursor-pointer"
                >
                  Next: Select Template
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT TEMPLATE (Both columns scroll internally, buttons stay visible) */}
          {currentStep === 2 && (
            <div className="flex-1 min-h-0 flex flex-col gap-4">
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                {/* TEMPLATE LIST CARD */}
                <div className="lg:col-span-7 h-full min-h-0 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm shadow-blue-500/[0.03] flex flex-col overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-bold text-[#172033]">
                        Select Template
                      </h2>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Choose an approved Meta template
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#165DFF] border border-blue-100 tabular-nums">
                      {filteredTemplates.length} Available
                    </span>
                  </div>

                  {/* SEARCH */}
                  <div className="shrink-0 relative mb-3">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                    />
                    <input
                      type="text"
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      placeholder="Search approved templates..."
                      className="w-full pl-8 pr-7 py-2 rounded-xl border border-[#E5E7EB] bg-slate-50/80 focus:bg-white focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 outline-none transition-all text-xs text-[#172033] placeholder:text-[#94A3B8]"
                    />
                    {templateSearch && (
                      <button
                        onClick={() => setTemplateSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172033] cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* LIST (Scrolls internally) */}
                  <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
                    {isFetchingTemplates ? (
                      <div className="py-16 flex justify-center">
                        <Loader2
                          size={24}
                          className="animate-spin text-[#165DFF]"
                        />
                      </div>
                    ) : filteredTemplates.length === 0 ? (
                      <div className="py-16 text-center">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-center mx-auto mb-2.5">
                          <FileText size={20} className="text-[#165DFF]/60" />
                        </div>
                        <p className="text-xs font-semibold text-[#172033]">
                          No approved templates found
                        </p>
                      </div>
                    ) : (
                      filteredTemplates.map((t) => (
                        <TemplateCard
                          key={t.id}
                          template={t}
                          selected={selectedTemplateId === t.id}
                          onSelect={() => {
                            setSelectedTemplateId(t.id);
                            setTemplateVars({});
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* TEMPLATE DETAILS / MEDIA & VARIABLES CONFIG (Scrolls internally) */}
                <div className="lg:col-span-5 h-full min-h-0 flex flex-col overflow-hidden">
                  {selectedTemplate ? (
                    <div className="h-full min-h-0 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm shadow-blue-500/[0.03] flex flex-col overflow-hidden">
                      <div className="shrink-0 flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#165DFF] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                            Selected Template
                          </span>
                          <h3 className="text-sm font-bold text-[#172033] mt-1 truncate">
                            {selectedTemplate.name}
                          </h3>
                          <p className="text-[11px] text-[#64748B] mt-0.5 uppercase">
                            {selectedTemplate.category} •{" "}
                            {selectedTemplate.language}
                          </p>
                        </div>
                      </div>

                      {/* INTERNAL SCROLLABLE AREA FOR MEDIA + VARS + PREVIEW */}
                      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3.5">
                        {/* MEDIA UPLOAD */}
                        {["IMAGE", "VIDEO", "DOCUMENT"].includes(
                          selectedTemplate.header_type
                        ) && (
                          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1.5">
                                <Sparkles size={13} className="text-amber-600" />
                                Header Media ({selectedTemplate.header_type})
                              </span>
                              <div className="text-[11px] text-amber-700 font-medium">
                                {selectedTemplate.header_type === "IMAGE"
                                  ? "Max 5MB"
                                  : selectedTemplate.header_type === "VIDEO"
                                    ? "Max 16MB"
                                    : "Max 100MB"}
                              </div>
                            </div>

                            <input
                              type="file"
                              ref={mediaInputRef}
                              className="hidden"
                              accept={
                                selectedTemplate.header_type === "IMAGE"
                                  ? "image/jpeg,image/png"
                                  : selectedTemplate.header_type === "VIDEO"
                                    ? "video/mp4"
                                    : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,application/pdf"
                              }
                              onChange={(e) => {
                                setMediaError(null);
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  const mb = file.size / (1024 * 1024);
                                  let limit = 100;
                                  if (selectedTemplate.header_type === "IMAGE")
                                    limit = 5;
                                  if (selectedTemplate.header_type === "VIDEO")
                                    limit = 16;
                                  if (mb > limit) {
                                    setMediaError(
                                      `File is too large. Max is ${limit}MB.`
                                    );
                                    setMediaFile(null);
                                    if (mediaInputRef.current)
                                      mediaInputRef.current.value = "";
                                  } else {
                                    setMediaFile(file);
                                  }
                                }
                              }}
                            />

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setMediaError(null);
                                  mediaInputRef.current?.click();
                                }}
                                className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 rounded-lg text-xs font-semibold hover:bg-amber-100/50 transition shrink-0 cursor-pointer"
                              >
                                Choose File
                              </button>

                              <span className="text-xs text-[#64748B] truncate flex-1">
                                {mediaFile ? mediaFile.name : "No file selected"}
                              </span>

                              {mediaFile && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMediaFile(null);
                                    setMediaError(null);
                                    if (mediaInputRef.current)
                                      mediaInputRef.current.value = "";
                                  }}
                                  className="text-[#94A3B8] hover:text-red-500 transition cursor-pointer"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>

                            {mediaError && (
                              <div className="text-red-600 text-xs font-medium flex items-center gap-1">
                                <AlertCircle size={12} />
                                {mediaError}
                              </div>
                            )}
                          </div>
                        )}

                        {/* TEXT VARIABLES & CSV COLUMN MAPPING */}
                        {templateVarKeys.length > 0 && (
                          <div className="space-y-2.5">
                            <div>
                              <label className="text-[11px] font-bold text-[#172033] uppercase tracking-wider block">
                                Template Variables & Personalization
                              </label>
                              <p className="text-[11px] text-[#64748B] mt-0.5">
                                {csvHeaders.length > 1
                                  ? "✨ Auto-mapped from your CSV columns! Each contact receives their personalized value."
                                  : "Map variables from CSV columns or set a fallback value."}
                              </p>
                            </div>

                            <div className="space-y-2">
                              {templateVarKeys.map((k) => {
                                const mappedCol = columnMapping[k] || "";
                                const sampleContact = csvContacts[0];
                                const sampleVal =
                                  mappedCol && sampleContact?.data
                                    ? sampleContact.data[mappedCol]
                                    : "";

                                return (
                                  <div
                                    key={k}
                                    className="p-3 bg-slate-50/80 rounded-xl border border-[#E5E7EB] space-y-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/70 text-center text-xs font-mono font-bold text-[#165DFF]">
                                          {`{{${k}}}`}
                                        </div>
                                        <span className="text-xs font-semibold text-[#172033]">
                                          Variable #{k}
                                        </span>
                                      </div>

                                      {mappedCol && sampleVal && (
                                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 font-medium">
                                          Sample: "{sampleVal}"
                                        </span>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {csvHeaders.length > 0 ? (
                                        <div>
                                          <label className="block text-[10px] uppercase font-semibold text-[#64748B] mb-1">
                                            Map to CSV Column
                                          </label>
                                          <div className="relative">
                                            <select
                                              value={columnMapping[k] || ""}
                                              onChange={(e) =>
                                                setColumnMapping((prev) => ({
                                                  ...prev,
                                                  [k]: e.target.value,
                                                }))
                                              }
                                              className="w-full appearance-none px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] text-xs bg-white text-[#172033] focus:outline-none focus:border-[#165DFF]"
                                            >
                                              <option value="">
                                                -- Fixed Manual Value --
                                              </option>
                                              {csvHeaders.map((col) => (
                                                <option key={col} value={col}>
                                                  Column: {col}
                                                </option>
                                              ))}
                                            </select>
                                            <ChevronDown
                                              size={12}
                                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
                                            />
                                          </div>
                                        </div>
                                      ) : null}

                                      <div
                                        className={
                                          csvHeaders.length > 0
                                            ? ""
                                            : "sm:col-span-2"
                                        }
                                      >
                                        <label className="block text-[10px] uppercase font-semibold text-[#64748B] mb-1">
                                          {columnMapping[k]
                                            ? "Fallback Value (if empty)"
                                            : "Fixed Value for all"}
                                        </label>
                                        <input
                                          type="text"
                                          value={templateVars[k] || ""}
                                          onChange={(e) =>
                                            setTemplateVars((prev) => ({
                                              ...prev,
                                              [k]: e.target.value,
                                            }))
                                          }
                                          placeholder={
                                            columnMapping[k]
                                              ? "e.g. Valued Customer"
                                              : `Value for {{${k}}}`
                                          }
                                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-xs text-[#172033] focus:outline-none focus:border-[#165DFF]"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* LIVE MESSAGE PREVIEW */}
                        <div>
                          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
                            Message Preview
                          </span>
                          <div
                            className="rounded-2xl border border-slate-200/80 bg-[#F8FAFC] p-3.5"
                            style={{
                              backgroundImage: `radial-gradient(#CBD5E1 0.75px, transparent 0.75px)`,
                              backgroundSize: "18px 18px",
                            }}
                          >
                            <div className="bg-[#EFF6FF] border border-blue-200/70 rounded-2xl rounded-br-sm p-3.5 text-xs text-[#172033] leading-relaxed shadow-2xs">
                              {renderMediaPreviewBlock()}
                              {headerText && (
                                <div className="font-bold text-[#172033] mb-1.5 pb-1 border-b border-blue-200/60">
                                  {renderWhatsAppFormattedText(headerText)}
                                </div>
                              )}
                              <div className="whitespace-pre-wrap">
                                {renderWhatsAppFormattedText(
                                  getRenderedTextWithVars(bodyText, previewVars) ||
                                    "No body text available"
                                )}
                              </div>
                              {footerText && (
                                <div className="text-[11px] text-[#64748B] mt-2 pt-1.5 border-t border-blue-200/60">
                                  {footerText}
                                </div>
                              )}
                              {renderButtonsPreviewBlock()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full bg-white border border-slate-200/80 rounded-2xl p-10 text-center shadow-sm shadow-blue-500/[0.03] flex flex-col items-center justify-center">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-center mx-auto mb-3">
                        <Sparkles size={20} className="text-[#165DFF]" />
                      </div>
                      <h4 className="text-sm font-bold text-[#172033]">
                        No Template Selected
                      </h4>
                      <p className="text-xs text-[#64748B] mt-1 max-w-[240px] mx-auto leading-relaxed">
                        Click on an approved template from the list on the left
                        to configure variables and preview.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 2 PINNED FOOTER BAR */}
              <div className="shrink-0 bg-white border border-slate-200/80 rounded-2xl px-4 py-3 shadow-sm shadow-blue-500/[0.03] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="h-9 px-4 rounded-xl border border-[#E5E7EB] text-[#172033] hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition w-full sm:w-auto justify-center cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Back: Contacts & Details
                </button>

                <div className="text-xs font-medium text-[#64748B]">
                  {!selectedTemplateId
                    ? "Please choose a template from the list."
                    : `✓ Selected: "${selectedTemplate?.name}"`}
                </div>

                <button
                  type="button"
                  disabled={!canProceedToStep3}
                  onClick={() => setCurrentStep(3)}
                  className="h-9 px-5 rounded-xl bg-[#165DFF] hover:bg-[#1247CC] text-white font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition w-full sm:w-auto text-xs cursor-pointer"
                >
                  Next: Summary & Launch
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CAMPAIGN SUMMARY & LAUNCH (Side-by-side summary + scrollable preview) */}
          {currentStep === 3 && (
            <div className="flex-1 min-h-0 flex flex-col gap-4">
              <div className="flex-1 min-h-0 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm shadow-blue-500/[0.03] grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
                {/* LEFT: SUMMARY DETAILS */}
                <div className="lg:col-span-5 flex flex-col justify-between overflow-y-auto pr-1">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock3 size={16} className="text-[#165DFF]" />
                      <h2 className="text-sm font-bold text-[#172033]">
                        Campaign Summary & Final Review
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-[#FAFAFC] border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                        <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                          Campaign Name
                        </span>
                        <span
                          className="text-xs font-bold text-[#172033] mt-1 truncate"
                          title={campaignName}
                        >
                          {campaignName || "—"}
                        </span>
                      </div>

                      <div className="bg-[#FAFAFC] border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                        <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                          Selected Template
                        </span>
                        <span
                          className="text-xs font-bold text-[#172033] mt-1 truncate"
                          title={selectedTemplate?.name}
                        >
                          {selectedTemplate?.name || "—"}
                        </span>
                      </div>

                      <div className="bg-blue-50/60 border border-blue-200/70 rounded-xl p-3.5 flex flex-col justify-between">
                        <span className="text-[10px] font-semibold text-[#165DFF] uppercase tracking-wider">
                          Recipients (Ready)
                        </span>
                        <span className="text-base font-bold text-[#165DFF] mt-1 tabular-nums">
                          {phoneNumbers.length.toLocaleString()} Contacts
                        </span>
                      </div>

                      <div className="bg-[#FAFAFC] border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
                        <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                          Duplicates Filtered
                        </span>
                        <span className="text-xs font-bold text-[#172033] mt-1 tabular-nums">
                          {csvStats.duplicates} Contacts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-[#172033] flex items-start gap-2.5">
                    <Sparkles
                      size={15}
                      className="text-[#165DFF] shrink-0 mt-0.5"
                    />
                    <div className="leading-relaxed text-[#64748B]">
                      Ready to broadcast{" "}
                      <strong className="text-[#172033]">
                        {selectedTemplate?.name}
                      </strong>{" "}
                      to{" "}
                      <strong className="text-[#165DFF]">
                        {phoneNumbers.length.toLocaleString()} contacts
                      </strong>
                      . Click <strong className="text-[#172033]">Send Campaign</strong>{" "}
                      to launch immediately.
                    </div>
                  </div>
                </div>

                {/* RIGHT: LIVE WHATSAPP PREVIEW (Scrolls internally) */}
                <div
                  className="lg:col-span-7 h-full min-h-0 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-4 flex flex-col overflow-hidden"
                  style={{
                    backgroundImage: `radial-gradient(#CBD5E1 0.75px, transparent 0.75px)`,
                    backgroundSize: "18px 18px",
                  }}
                >
                  <span className="shrink-0 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2.5">
                    Live WhatsApp Broadcast Preview
                  </span>

                  <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex items-start justify-center">
                    <div className="w-full max-w-md bg-[#EFF6FF] border border-blue-200/70 rounded-2xl rounded-br-sm p-4 shadow-2xs text-[#172033] space-y-2">
                      {renderMediaPreviewBlock()}
                      {headerText && (
                        <div className="font-bold text-xs text-[#172033]">
                          {renderWhatsAppFormattedText(headerText)}
                        </div>
                      )}
                      <div className="text-xs leading-relaxed whitespace-pre-wrap text-[#172033]">
                        {renderWhatsAppFormattedText(
                          getRenderedTextWithVars(bodyText, previewVars)
                        )}
                      </div>
                      {footerText && (
                        <div className="text-[11px] text-[#64748B] pt-1.5 border-t border-blue-200/60">
                          {footerText}
                        </div>
                      )}
                      {renderButtonsPreviewBlock()}
                      <div className="text-[10px] text-[#64748B] text-right">
                        Just now • Delivered
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3 PINNED FOOTER BAR */}
              <div className="shrink-0 bg-white border border-slate-200/80 rounded-2xl px-4 py-3 shadow-sm shadow-blue-500/[0.03] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="h-9 px-4 rounded-xl border border-[#E5E7EB] text-[#172033] font-semibold hover:bg-slate-50 transition text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    Back to Template
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="h-9 px-4 rounded-xl border border-[#E5E7EB] text-[#64748B] hover:text-[#172033] font-semibold hover:bg-slate-50 transition text-xs cursor-pointer"
                  >
                    Reset All
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!canSend}
                  className="h-9 px-6 rounded-xl bg-[#165DFF] hover:bg-[#1247CC] text-white font-semibold flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto text-xs cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Sending Broadcast...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Campaign ({phoneNumbers.length.toLocaleString()}{" "}
                      Contacts)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
         CAMPAIGN HISTORY TAB (Matching Leads & Templates Table)
      ───────────────────────────────────────────────────────── */}
      {tab === "history" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-blue-500/[0.03] overflow-hidden">
          {/* Top Search Header inside Card */}
          <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
              <input
                type="text"
                placeholder="Search campaign or template..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50/80 focus:bg-white rounded-xl border border-[#E5E7EB] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 text-[#172033] placeholder:text-[#94A3B8] outline-none transition-all"
              />
              {historySearch && (
                <button
                  onClick={() => setHistorySearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172033] cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <span className="font-semibold text-[#172033]">Campaigns</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#165DFF] border border-blue-100 tabular-nums">
                {filteredCampaigns.length}
              </span>
            </div>
          </div>

          {isFetchingCampaigns ? (
            <div className="py-20 flex justify-center">
              <Loader2 size={24} className="animate-spin text-[#165DFF]" />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-center mx-auto mb-3">
                <Megaphone size={22} className="text-[#165DFF]/60" />
              </div>
              <h3 className="text-sm font-bold text-[#172033]">
                No campaigns found
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                {historySearch
                  ? "Try adjusting your search query"
                  : "Launch your first broadcast campaign to see it here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[920px]">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    {[
                      { label: "Campaign", width: "w-[18%] text-left" },
                      { label: "Template", width: "w-[17%] text-left" },
                      { label: "Sent", width: "w-[8%] text-center" },
                      { label: "Delivered", width: "w-[10%] text-center" },
                      { label: "Read", width: "w-[8%] text-center" },
                      { label: "Failed", width: "w-[11%] text-center" },
                      { label: "Status", width: "w-[10%] text-center" },
                      { label: "Date", width: "w-[9%] text-left" },
                      { label: "Report", width: "w-[9%] text-center" },
                    ].map((col) => (
                      <th
                        key={col.label}
                        className={`${col.width} px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B] truncate`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCampaigns.map((c) => {
                    const stats = campaignStatsMap[c.id];
                    const isLoadingStats = stats?.loading;

                    const sentVal =
                      stats?.sent ??
                      c.total_count ??
                      c.sent_count ??
                      c.total_sent ??
                      c.recipient_count ??
                      0;
                    const deliveredVal =
                      stats?.delivered ?? c.delivered_count ?? 0;
                    const readVal = stats?.read ?? c.read_count ?? 0;

                    // Compute failed count: if detail loaded, use exact failed count;
                    // otherwise use max of c.failed_count or (sent - delivered) when delivered > 0
                    const fallbackFailed = Math.max(
                      c.failed_count ?? 0,
                      deliveredVal > 0 && sentVal > deliveredVal
                        ? sentVal - deliveredVal
                        : 0
                    );
                    const failedVal = stats?.failed ?? fallbackFailed;

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-blue-50/30 transition-colors"
                      >
                        {/* Campaign Name */}
                        <td className="px-4 py-3.5 overflow-hidden">
                          <div
                            className="text-xs font-semibold text-[#172033] truncate"
                            title={c.name}
                          >
                            {c.name}
                          </div>
                        </td>

                        {/* Template Name */}
                        <td className="px-4 py-3.5 overflow-hidden">
                          <div
                            className="text-xs text-[#64748B] font-mono truncate"
                            title={c.template_name || c.template || "—"}
                          >
                            {c.template_name || c.template || "—"}
                          </div>
                        </td>

                        {/* Sent */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200/70 rounded-md text-[11px] font-semibold text-[#172033] tabular-nums">
                            {sentVal}
                          </span>
                        </td>

                        {/* Delivered */}
                        <td className="px-4 py-3.5 text-center">
                          {isLoadingStats ? (
                            <Loader2
                              size={13}
                              className="animate-spin text-[#94A3B8] mx-auto"
                            />
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-emerald-50 border border-emerald-200/70 rounded-md text-[11px] font-semibold text-emerald-700 tabular-nums">
                              {deliveredVal}
                            </span>
                          )}
                        </td>

                        {/* Read */}
                        <td className="px-4 py-3.5 text-center">
                          {isLoadingStats ? (
                            <Loader2
                              size={13}
                              className="animate-spin text-[#94A3B8] mx-auto"
                            />
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-blue-50 border border-blue-200/70 rounded-md text-[11px] font-semibold text-[#165DFF] tabular-nums">
                              {readVal}
                            </span>
                          )}
                        </td>

                        {/* Failed (Clickable if > 0 to view failed numbers & reason) */}
                        <td className="px-4 py-3.5 text-center">
                          {isLoadingStats ? (
                            <Loader2
                              size={13}
                              className="animate-spin text-[#94A3B8] mx-auto"
                            />
                          ) : failedVal > 0 ? (
                            <button
                              type="button"
                              onClick={() => handleOpenFailedModal(c)}
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md text-[11px] font-semibold text-red-700 tabular-nums transition cursor-pointer"
                              title="Click to view failed contacts & failure reasons"
                            >
                              <span>{failedVal}</span>
                              <span className="text-[10px] underline ml-0.5">
                                View
                              </span>
                            </button>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-slate-50 border border-slate-200/60 rounded-md text-[11px] font-medium text-[#94A3B8] tabular-nums">
                              0
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">
                          {campaignStatusBadge(c.status)}
                        </td>

                        {/* Date */}
                        <td
                          className="px-4 py-3.5 text-xs text-[#64748B] whitespace-nowrap truncate"
                          title={
                            c.created_at
                              ? new Date(c.created_at).toLocaleString("en-IN")
                              : ""
                          }
                        >
                          {c.created_at
                            ? new Date(c.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </td>

                        {/* Export Report */}
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleDownloadCampaignReport(c)}
                            disabled={exportingCampaignId === c.id}
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-[#165DFF]/40 rounded-lg text-[11px] font-semibold text-[#172033] hover:text-[#165DFF] transition cursor-pointer disabled:opacity-50"
                            title="Export campaign report as CSV"
                          >
                            {exportingCampaignId === c.id ? (
                              <Loader2
                                size={12}
                                className="animate-spin text-[#165DFF]"
                              />
                            ) : (
                              <Download size={12} />
                            )}
                            <span>Export</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
         CLEAN FAILED CONTACTS POPUP (Only Phone + Reason for that campaign)
      ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {failedModalCampaign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setFailedModalCampaign(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                    <AlertCircle size={16} className="text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-[#172033] truncate">
                      {failedModalCampaign.campaign?.name || "Campaign"}
                    </h2>
                    <p className="text-xs text-red-600 font-medium mt-0.5">
                      Failed Contacts (
                      {failedModalCampaign.failedRecipients?.length ??
                        failedModalCampaign.failed ??
                        0}
                      )
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setFailedModalCampaign(null)}
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Failed List (Phone + Reason Only) */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {failedModalCampaign.loading ? (
                  <div className="py-14 flex flex-col items-center justify-center">
                    <Loader2
                      size={22}
                      className="animate-spin text-[#165DFF] mb-2"
                    />
                    <p className="text-xs text-[#64748B]">
                      Loading failed contacts...
                    </p>
                  </div>
                ) : (failedModalCampaign.failedRecipients || []).length === 0 ? (
                  <div className="py-12 text-center px-4">
                    <p className="text-xs font-semibold text-[#172033]">
                      No failed contact details found
                    </p>
                  </div>
                ) : (
                  <table className="w-full table-fixed">
                    <thead className="bg-slate-50/90 border-b border-slate-100 sticky top-0 z-10">
                      <tr>
                        <th className="w-[12%] px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                          #
                        </th>
                        <th className="w-[33%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                          Phone Number
                        </th>
                        <th className="w-[55%] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                          Failure Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(failedModalCampaign.failedRecipients || []).map(
                        (r, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="px-4 py-3 text-center text-xs font-medium text-[#64748B] tabular-nums">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold text-[#165DFF] font-mono truncate">
                              {r.phone_number || "—"}
                            </td>
                            <td className="px-4 py-3 text-xs text-red-600 font-medium break-words">
                              {r.error_detail || "Delivery failed"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {analyticsTemplate && (
          <TemplateAnalyticsModal
            template={analyticsTemplate}
            onClose={() => setAnalyticsTemplate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Campaign;
