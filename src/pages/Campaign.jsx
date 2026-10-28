import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchApprovedTemplates,
  fetchCampaigns,
  sendCampaign,
  clearSendResult,
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

  if (lines.length === 0) return { valid: [], duplicates: 0, invalid: 0, contacts: [], headers: [] };

  // Parse CSV line handling potential quotes
  const parseCSVLine = (line) => {
    const res = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
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

    // Build row data mapping header -> value
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
    APPROVED:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
    REJECTED: "bg-red-50 text-red-700 border border-red-200",
    PAUSED: "bg-gray-100 text-gray-600 border border-gray-200",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-[10px] font-semibold ${map[status] ||
        "bg-gray-100 text-gray-600 border border-gray-200"
        }`}
    >
      {status}
    </span>
  );
}

function campaignStatusBadge(status) {
  const map = {
    completed:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
    running: "bg-sky-50 text-sky-700 border border-sky-200",
    failed: "bg-red-50 text-red-700 border border-red-200",
    queued: "bg-amber-50 text-amber-700 border border-amber-200",
  };

  const key = (status || "").toLowerCase();

  return (
    <span
      className={`px-2 py-1 rounded-full text-[10px] font-semibold ${map[key] ||
        "bg-gray-100 text-gray-600 border border-gray-200"
        }`}
    >
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
  // Splits by *bold text* pattern
  const parts = String(text).split(/(\*[^*\n\r]+?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      const boldContent = part.slice(1, -1);
      return (
        <strong key={index} className="font-bold text-gray-950">
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

  const bodyComp = template.components?.find(
    (c) => c.type === "BODY"
  );

  const headerComp = template.components?.find(
    (c) => c.type === "HEADER"
  );

  const footerComp = template.components?.find(
    (c) => c.type === "FOOTER"
  );

  const bodyText = bodyComp?.text || template.body_text || template.body || "";
  const headerText = headerComp?.text || template.header_text || template.header || "";
  const footerText = footerComp?.text || template.footer_text || template.footer || "";

  const vars = [
    ...new Set(
      (bodyText + headerText).match(/\{\{\d+\}\}/g) || []
    ),
  ];

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden ${selected
          ? "border-emerald-300 bg-emerald-50 shadow-md"
          : "border-gray-200 bg-white hover:border-emerald-200 hover:shadow-sm"
        }`}
    >
      <div className="p-4">
        <div className="flex justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14px] font-semibold text-gray-800 truncate">
                {template.name}
              </h3>

              {statusBadge(template.status)}
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[11px] text-gray-500 uppercase font-medium">
                {template.language || template.language_code}
              </span>

              {template.category && (
                <span className="text-[11px] text-gray-400">
                  • {template.category}
                </span>
              )}

              {vars.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-700">
                  {vars.length} Variables
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            {selected && (
              <CheckCircle2
                size={18}
                className="text-emerald-600 mt-0.5"
              />
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              {expanded ? (
                <EyeOff size={15} className="text-gray-500" />
              ) : (
                <Eye size={15} className="text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4">
            {template.header_type === "TEXT" && headerText && (
              <div className="font-semibold text-gray-700 mb-2">
                {renderWhatsAppFormattedText(headerText)}
              </div>
            )}

            {["IMAGE", "VIDEO", "DOCUMENT"].includes(template.header_type) && (
              <div className="bg-gray-200 rounded-xl h-24 mb-3 flex flex-col items-center justify-center text-gray-400">
                {template.header_type === "IMAGE" && <Image size={24} />}
                {template.header_type === "VIDEO" && <Film size={24} />}
                {template.header_type === "DOCUMENT" && <FileText size={24} />}
                <span className="text-[10px] font-semibold mt-1">{template.header_type}</span>
              </div>
            )}

            <div className="text-[13px] text-gray-600 whitespace-pre-wrap leading-relaxed">
              {renderWhatsAppFormattedText(bodyText || "No body text")}
            </div>

            {footerText && (
              <div className="mt-3 text-[11px] text-gray-400 border-t border-gray-200 pt-2">
                {footerText}
              </div>
            )}

            {Array.isArray(template.buttons) && template.buttons.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-200 space-y-1.5">
                {template.buttons.map((btn, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg py-1.5 px-3 text-center text-xs font-semibold text-blue-600 border border-gray-200 flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    {btn.type === "URL" && <Globe size={12} className="text-blue-500" />}
                    {btn.type === "PHONE_NUMBER" && <Phone size={12} className="text-green-600" />}
                    {(btn.type === "OTP" || btn.otp_type === "COPY_CODE") && (
                      <Copy size={12} className="text-blue-500" />
                    )}
                    <span>
                      {btn.text || (
                        btn.type === "URL"
                          ? "Visit Website"
                          : btn.type === "PHONE_NUMBER"
                          ? "Call Phone"
                          : btn.type === "OTP" || btn.otp_type === "COPY_CODE"
                          ? "Copy Code"
                          : "Quick Reply"
                      )}
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

  const {
    approvedTemplates,
    campaigns,
    isFetchingTemplates,
    isSending,
    isFetchingCampaigns,
    sendSuccess,
    sendError,
  } = useSelector((s) => s.campaign);

  const token = useSelector((s) => s.auth?.accessToken);

  const [tab, setTab] = useState("new");
  const [currentStep, setCurrentStep] = useState(1);
  const [analyticsTemplate, setAnalyticsTemplate] = useState(null);

  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] =
    useState(null);

  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [csvContacts, setCsvContacts] = useState([]); // [{ phone, cols, data }]
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({}); // { [varKey]: columnName }
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

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadCSV = async (campaignId, campaignName) => {
    try {
      setDownloadingId(campaignId);

      const currentToken = token || localStorage.getItem("accessToken");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const resp = await fetch(`${API_BASE_URL}/api/campaigns/${campaignId}/`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      const data = await resp.json();

      if (!resp.ok) {
        alert(`Error: ${data.detail || data.error || resp.statusText}`);
        return;
      }

      if (!data.recipients || data.recipients.length === 0) {
        alert("No recipient data available for this campaign.");
        return;
      }

      const formatStatus = (val) => {
        if (!val) return "Pending";
        const s = String(val).toLowerCase().trim();
        switch (s) {
          case "read":
            return "Read";
          case "delivered":
            return "Delivered";
          case "sent":
            return "Sent";
          case "failed":
            return "Failed";
          case "pending":
            return "Pending";
          default:
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
      };

      const csvRows = [
        ["Phone Number", "Status", "Meta Message ID", "Sent At", "Error Detail"]
      ];

      data.recipients.forEach((r) => {
        const phone = r.phone_number ? `="${r.phone_number}"` : `""`;
        const status = `"${formatStatus(r.status)}"`;
        const metaId = `"${r.meta_message_id || "-"}"`;
        const sentAt = r.sent_at
          ? `"${new Date(r.sent_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}"`
          : `"-"`;
        const errorDetail = r.error_detail
          ? `"${String(r.error_detail).replace(/"/g, '""')}"`
          : `"-"`;

        csvRows.push([phone, status, metaId, sentAt, errorDetail]);
      });

      // UTF-8 BOM ensures Excel cleanly detects columns and encoding
      const csvContent = "\uFEFF" + csvRows.map((e) => e.join(",")).join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const safeName = (campaignName || "Campaign").replace(/[/\\?%*:|"<>]/g, "_");
      link.setAttribute("download", `${safeName}_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download CSV", err);
      alert("Failed to download CSV. See console for details.");
    } finally {
      setDownloadingId(null);
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

    const csvContent = "\uFEFF" + sampleRows.map((e) => e.join(",")).join("\r\n");
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
    dispatch(fetchApprovedTemplates());
    dispatch(fetchCampaigns());
  }, [dispatch]);

  useEffect(() => {
    if (sendSuccess || sendError) {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    if (sendSuccess) {
      // Auto clear form after successful campaign launch
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
    selectedTemplate?.components?.find(
      (c) => c.type === "BODY"
    )?.text || selectedTemplate?.body_text || selectedTemplate?.body || "";

  const headerText =
    selectedTemplate?.components?.find(
      (c) => c.type === "HEADER"
    )?.text || selectedTemplate?.header_text || selectedTemplate?.header || "";

  const footerText =
    selectedTemplate?.components?.find(
      (c) => c.type === "FOOTER"
    )?.text || selectedTemplate?.footer_text || selectedTemplate?.footer || "";

  const templateVarKeys = useMemo(() => {
    return [
      ...new Set(
        (bodyText + headerText).match(/\{\{\d+\}\}/g) || []
      ),
    ]
      .map((v) => v.replace(/[{}]/g, ""))
      .sort((a, b) => Number(a) - Number(b));
  }, [bodyText, headerText]);

  // Combined variables for preview (using 1st contact's mapped data if available)
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
    // ફક્ત AUTHENTICATION કેટેગરી hide કરો, variables વાળા templates allow કરો
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

  const canProceedToStep2 = Boolean(campaignName.trim() && phoneNumbers.length > 0);
  const canProceedToStep3 = Boolean(canProceedToStep2 && selectedTemplateId);

  const canSend =
    canProceedToStep3 &&
    !isSending;

  const renderMediaPreviewBlock = () => {
    if (!selectedTemplate || !["IMAGE", "VIDEO", "DOCUMENT"].includes(selectedTemplate.header_type)) {
      return null;
    }

    if (mediaFile && mediaPreviewUrl) {
      if (selectedTemplate.header_type === "IMAGE") {
        return (
          <div className="mb-2.5 overflow-hidden rounded-xl border border-black/10 bg-black/5">
            <img
              src={mediaPreviewUrl}
              alt="Media header preview"
              className="w-full max-h-60 object-cover"
            />
          </div>
        );
      }
      if (selectedTemplate.header_type === "VIDEO") {
        return (
          <div className="mb-2.5 overflow-hidden rounded-xl border border-black/10 bg-black">
            <video
              src={mediaPreviewUrl}
              controls
              playsInline
              className="w-full max-h-64"
            />
          </div>
        );
      }
      if (selectedTemplate.header_type === "DOCUMENT") {
        return (
          <div className="mb-2.5 flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-emerald-200 text-gray-800 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0 font-bold text-xs uppercase">
              {mediaFile.name?.split('.').pop() || "DOC"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate">{mediaFile.name}</div>
              <div className="text-[10px] text-gray-400">
                {(mediaFile.size / (1024 * 1024)).toFixed(2)} MB • Document
              </div>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="mb-2.5 p-4 rounded-xl bg-black/5 border border-dashed border-gray-300 text-center flex flex-col items-center justify-center gap-1.5 text-gray-500">
        {selectedTemplate.header_type === "IMAGE" && <Image size={24} className="text-gray-400" />}
        {selectedTemplate.header_type === "VIDEO" && <Film size={24} className="text-gray-400" />}
        {selectedTemplate.header_type === "DOCUMENT" && <FileText size={24} className="text-gray-400" />}
        <span className="text-xs font-semibold text-gray-600">[{selectedTemplate.header_type} Header]</span>
        <span className="text-[10px] text-gray-400">Upload media in Step 2 to preview</span>
      </div>
    );
  };

  const renderButtonsPreviewBlock = () => {
    const buttons =
      selectedTemplate?.buttons ||
      selectedTemplate?.components?.find((c) => c.type === "BUTTONS")?.buttons ||
      [];

    if (!Array.isArray(buttons) || buttons.length === 0) return null;

    return (
      <div className="space-y-1.5 mt-3 pt-2 border-t border-emerald-200/50">
        {buttons.map((btn, i) => (
          <div
            key={i}
            className="bg-white rounded-xl py-2 px-3 text-center shadow-sm flex items-center justify-center gap-1.5 text-blue-600 border border-gray-100"
          >
            {btn.type === "URL" && <Globe size={13} className="text-blue-500" />}
            {btn.type === "PHONE_NUMBER" && <Phone size={13} className="text-green-600" />}
            {(btn.type === "OTP" || btn.otp_type === "COPY_CODE") && (
              <Copy size={13} className="text-blue-500" />
            )}
            <span className="text-xs font-semibold">
              {btn.text || (
                btn.type === "URL"
                  ? "Visit Website"
                  : btn.type === "PHONE_NUMBER"
                  ? "Call Phone"
                  : btn.type === "OTP" || btn.otp_type === "COPY_CODE"
                  ? "Copy Code"
                  : "Quick Reply"
              )}
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
        setRawCSVError(
          "No valid phone numbers found inside CSV."
        );

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
        setCsvStats({ duplicates: parsedStats.duplicates, invalid: parsedStats.invalid });

        // Auto-map common column names to variables
        if (headers.length > 0) {
          const autoMap = {};
          const lowerH = headers.map((h) => h.toLowerCase());

          // Find name column
          const nameCol = headers.find((h) =>
            /^(name|full_name|first_name|customer_name|client_name|naam)$/i.test(h)
          ) || headers.find((h) => /name/i.test(h));

          if (nameCol) {
            autoMap["1"] = nameCol;
          }

          // If there are other columns, map by index
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

    // Build per-recipient payload: if template has NO variables, send plain phone numbers
    const hasTemplateVariables = templateVarKeys.length > 0;
    const packagedRecipients = (csvContacts.length > 0 ? csvContacts : phoneNumbers.map(p => ({ phone: p }))).map((c) => {
      if (!hasTemplateVariables) {
        return c.phone;
      }
      const recVars = {};
      templateVarKeys.forEach((k) => {
        const mappedCol = columnMapping[k];
        if (mappedCol && c.data && c.data[mappedCol] !== undefined && c.data[mappedCol] !== "") {
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
    <div ref={topRef} className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-emerald-50/30 p-4 md:p-6">
      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-7">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
            <Megaphone className="text-white" size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              WhatsApp Campaign
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Upload contacts, choose template and send
              campaigns instantly.
            </p>
          </div>
        </div>

        {/* TABS */}

        <div className="bg-white border border-gray-200 rounded-2xl p-1 shadow-sm flex">
          {["new", "history"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t
                  ? "bg-emerald-500 text-white shadow"
                  : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {t === "new"
                ? "New Campaign"
                : "Campaign History"}
            </button>
          ))}
        </div>
      </div>

      {/* SUCCESS */}

      {sendSuccess && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <CheckCircle2
            size={20}
            className="text-emerald-600 mt-0.5"
          />

          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-700">
              Campaign "{sendSuccess.name || campaignName}" completed!
            </p>

            <div className="mt-2 flex items-center gap-3 text-xs font-medium">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md">
                Total: {sendSuccess.total_count ?? 0}
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                Sent: {sendSuccess.sent_count ?? 0}
              </span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md">
                Failed: {sendSuccess.failed_count ?? 0}
              </span>
              {sendSuccess.invalid_numbers_skipped > 0 && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
                  Invalid: {sendSuccess.invalid_numbers_skipped}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => dispatch(clearSendResult())}
            className="text-emerald-600 hover:opacity-70"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ERROR */}

      {sendError && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <AlertCircle
            size={20}
            className="text-red-600 mt-0.5"
          />

          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">
              Failed to send campaign
            </p>

            <p className="text-sm text-red-600 mt-1">
              {sendError}
            </p>
          </div>

          <button
            onClick={() => dispatch(clearSendResult())}
            className="text-red-600 hover:opacity-70"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* NEW CAMPAIGN */}

      {tab === "new" && (
        <div className="space-y-6">
          {/* STEPPER PROGRESS BAR */}
          <div className="bg-white border border-gray-200/80 rounded-3xl p-3 md:p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                { id: 1, title: "Campaign Details & Audience", short: "1. Campaign & Contacts", desc: "Name & upload contacts" },
                { id: 2, title: "Select Template", short: "2. Select Template", desc: "Choose Meta template & media" },
                { id: 3, title: "Campaign Summary & Launch", short: "3. Summary & Launch", desc: "Review details & broadcast" },
              ].map((s) => {
                const isCompleted = s.id === 1 ? canProceedToStep2 : s.id === 2 ? canProceedToStep3 : false;
                const isActive = currentStep === s.id;
                const isClickable = s.id === 1 || (s.id === 2 && canProceedToStep2) || (s.id === 3 && canProceedToStep3);

                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => {
                      setCurrentStep(s.id);
                      topRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                      isActive
                        ? "bg-emerald-50 border border-emerald-300 shadow-sm"
                        : isClickable
                        ? "hover:bg-gray-50 border border-transparent cursor-pointer"
                        : "opacity-40 border border-transparent cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                        isActive
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                          : isCompleted
                          ? "bg-emerald-100 text-emerald-700 font-extrabold"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCompleted && !isActive ? <CheckCircle2 size={18} /> : s.id}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-bold truncate ${isActive ? "text-emerald-900" : "text-gray-800"}`}>
                        {s.short}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate mt-0.5">
                        {s.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 1: CAMPAIGN DETAILS & CONTACTS */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* CAMPAIGN NAME */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-7 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={16} className="text-emerald-600" />
                      <h2 className="text-sm font-bold tracking-wide text-gray-700 uppercase flex items-center gap-2">
                        Campaign Details
                        <div className="group relative flex items-center">
                          <Info size={16} className="text-blue-500 cursor-help" />
                          <div className="absolute left-7 top-0 w-72 p-4 bg-white border border-gray-200 text-gray-700 text-xs rounded-2xl shadow-xl z-50 hidden group-hover:block normal-case tracking-normal font-normal leading-relaxed pointer-events-none">
                            <strong className="text-blue-600 text-sm">Meta Frequency Capping</strong><br />
                            <div className="mt-2 text-gray-600">To prevent spam, Meta limits how often you can send Marketing templates to the same user.</div>
                            <div className="mt-3 p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100">
                              <strong>Recommendation:</strong> Maintain a gap of 5-7 days between campaigns for the same contacts to avoid messages being blocked.
                            </div>
                          </div>
                        </div>
                      </h2>
                    </div>

                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Campaign Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. Diwali Mega Offer Campaign..."
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none transition-all text-sm"
                    />

                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      Give your campaign a clear, recognisable name. This will help you track performance and export Excel reports easily in Campaign History.
                    </p>
                  </div>

                  <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2.5">
                    <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Broadcast Best Practice:</strong> Only send approved marketing templates to opted-in users to ensure high delivery rate and avoid account restrictions.
                    </div>
                  </div>
                </div>

                {/* UPLOAD CONTACTS */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-7 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
                          Upload Contacts
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                          CSV or TXT file supported
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadSampleCSV}
                          className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
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
                            className="text-red-500 hover:text-red-600 text-xs font-semibold flex items-center gap-1"
                          >
                            <Trash2 size={13} />
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* DROP / BANNER */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                        phoneNumbers.length > 0
                          ? "border-emerald-300 bg-emerald-50/70 p-4 hover:bg-emerald-100/50"
                          : "border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/40 p-7 text-center flex flex-col items-center justify-center min-h-[150px]"
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
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                              <CheckCircle2 size={22} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-gray-800 text-sm truncate">
                                {fileName}
                              </h3>
                              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                                {phoneNumbers.length.toLocaleString()} valid contacts ready
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl shrink-0 transition">
                            Change File
                          </span>
                        </div>
                      ) : (
                        <>
                          <Upload size={32} className="mx-auto text-gray-300 mb-2" />
                          <h3 className="font-semibold text-gray-700 text-sm">
                            Drop CSV file here
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            or click to browse files
                          </p>
                        </>
                      )}
                    </div>

                    {/* STATS BREAKDOWN */}
                    {phoneNumbers.length > 0 && (
                      <div className="grid grid-cols-3 gap-2.5 mt-3">
                        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 text-center">
                          <div className="text-sm font-extrabold text-emerald-700">
                            {phoneNumbers.length}
                          </div>
                          <div className="text-[10px] font-semibold text-emerald-700 flex items-center justify-center gap-1 mt-0.5">
                            <CheckCircle2 size={11} /> Valid
                          </div>
                        </div>

                        <div
                          className={`rounded-xl p-2.5 text-center border transition-all ${
                            csvStats.duplicates > 0
                              ? "bg-amber-50 border-amber-200"
                              : "bg-gray-50 border-gray-100"
                          }`}
                        >
                          <div
                            className={`text-sm font-extrabold ${
                              csvStats.duplicates > 0 ? "text-amber-700" : "text-gray-400"
                            }`}
                          >
                            {csvStats.duplicates}
                          </div>
                          <div
                            className={`text-[10px] font-semibold flex items-center justify-center gap-1 mt-0.5 ${
                              csvStats.duplicates > 0 ? "text-amber-700" : "text-gray-400"
                            }`}
                          >
                            Duplicates
                          </div>
                        </div>

                        <div
                          className={`rounded-xl p-2.5 text-center border transition-all ${
                            csvStats.invalid > 0
                              ? "bg-red-50 border-red-200"
                              : "bg-gray-50 border-gray-100"
                          }`}
                        >
                          <div
                            className={`text-sm font-extrabold ${
                              csvStats.invalid > 0 ? "text-red-700" : "text-gray-400"
                            }`}
                          >
                            {csvStats.invalid}
                          </div>
                          <div
                            className={`text-[10px] font-semibold flex items-center justify-center gap-1 mt-0.5 ${
                              csvStats.invalid > 0 ? "text-red-700" : "text-gray-400"
                            }`}
                          >
                            Invalid
                          </div>
                        </div>
                      </div>
                    )}

                    {rawCSVError && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 flex gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        {rawCSVError}
                      </div>
                    )}

                    {/* PREVIEW */}
                    {phoneNumbers.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Users size={13} className="text-emerald-600" />
                            <span className="text-xs font-semibold text-gray-700">
                              Preview Contacts
                            </span>
                          </div>
                          {phoneNumbers.length > 5 && (
                            <span className="text-[10px] text-gray-400">
                              Showing 5 of {phoneNumbers.length}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {phoneNumbers.slice(0, 5).map((n, i) => (
                            <div
                              key={i}
                              className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-700 font-mono flex items-center gap-1"
                            >
                              <Phone size={10} />
                              {n}
                            </div>
                          ))}
                          {phoneNumbers.length > 5 && (
                            <div className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-500 font-medium">
                              +{phoneNumbers.length - 5} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="mt-4 bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2.5">
                    <Info size={15} className="text-sky-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-sky-700 leading-relaxed">
                      CSV should contain a <strong>phone</strong> or <strong>mobile</strong> column (10-digit number or with 91).
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 1 ACTION BAR */}
              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-medium text-gray-500">
                  {!campaignName.trim()
                    ? "⚠️ Please enter Campaign Name to continue."
                    : phoneNumbers.length === 0
                    ? "⚠️ Please upload a CSV with contacts to continue."
                    : `✓ Ready to proceed: "${campaignName}" (${phoneNumbers.length.toLocaleString()} contacts)`}
                </div>

                <button
                  type="button"
                  disabled={!canProceedToStep2}
                  onClick={() => {
                    setCurrentStep(2);
                    topRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition w-full sm:w-auto text-sm"
                >
                  Next: Select Template
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT TEMPLATE */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* TEMPLATE LIST */}
                <div className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
                        Select Template
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Choose approved Meta template
                      </p>
                    </div>

                    <button
                      onClick={() => dispatch(fetchApprovedTemplates())}
                      className="text-emerald-600 text-xs font-semibold flex items-center gap-1"
                    >
                      <RefreshCw
                        size={13}
                        className={isFetchingTemplates ? "animate-spin" : ""}
                      />
                      Refresh
                    </button>
                  </div>

                  {/* SEARCH */}
                  <div className="relative mb-4">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      placeholder="Search templates..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none transition-all text-sm"
                    />
                  </div>

                  {/* LIST */}
                  {isFetchingTemplates ? (
                    <div className="py-16 flex justify-center">
                      <Loader2 size={32} className="animate-spin text-emerald-600" />
                    </div>
                  ) : filteredTemplates.length === 0 ? (
                    <div className="py-16 text-center">
                      <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500">No templates found</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                      {filteredTemplates.map((t) => (
                        <TemplateCard
                          key={t.id}
                          template={t}
                          selected={selectedTemplateId === t.id}
                          onSelect={() => {
                            setSelectedTemplateId(t.id);
                            setTemplateVars({});
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* TEMPLATE DETAILS / MEDIA & VARIABLES CONFIG */}
                <div className="lg:col-span-5 space-y-6">
                  {selectedTemplate ? (
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            Selected
                          </span>
                          <h3 className="text-base font-bold text-gray-800 mt-2 truncate">
                            {selectedTemplate.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {selectedTemplate.category} • {selectedTemplate.language}
                          </p>
                        </div>
                      </div>

                      {/* MEDIA UPLOAD */}
                      {["IMAGE", "VIDEO", "DOCUMENT"].includes(selectedTemplate.header_type) && (
                        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
                              <Sparkles size={14} className="text-amber-600" />
                              Header Media ({selectedTemplate.header_type})
                            </span>
                            <div className="text-[11px] text-amber-700">
                              {selectedTemplate.header_type === "IMAGE" ? "Max 5MB" : selectedTemplate.header_type === "VIDEO" ? "Max 16MB" : "Max 100MB"}
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
                                : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/csv"
                            }
                            onChange={(e) => {
                              setMediaError(null);
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const mb = file.size / (1024 * 1024);
                                let limit = 100;
                                if (selectedTemplate.header_type === "IMAGE") limit = 5;
                                if (selectedTemplate.header_type === "VIDEO") limit = 16;
                                if (mb > limit) {
                                  setMediaError(`File is too large. Max is ${limit}MB.`);
                                  setMediaFile(null);
                                  if (mediaInputRef.current) mediaInputRef.current.value = "";
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
                              className="px-3.5 py-2 bg-white border border-amber-300 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-100/50 transition shrink-0"
                            >
                              Choose File
                            </button>

                            <span className="text-xs text-gray-600 truncate flex-1">
                              {mediaFile ? mediaFile.name : "No file selected"}
                            </span>

                            {mediaFile && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMediaFile(null);
                                  setMediaError(null);
                                  if (mediaInputRef.current) mediaInputRef.current.value = "";
                                }}
                                className="text-gray-400 hover:text-red-500 transition"
                              >
                                <X size={15} />
                              </button>
                            )}
                          </div>

                          {mediaError && (
                            <div className="text-red-500 text-xs font-medium flex items-center gap-1">
                              <AlertCircle size={12} />
                              {mediaError}
                            </div>
                          )}
                        </div>
                      )}

                      {/* TEXT VARIABLES & CSV COLUMN MAPPING */}
                      {templateVarKeys.length > 0 && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                              Template Variables & Personalization
                            </label>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {csvHeaders.length > 1
                                ? "✨ Auto-mapped from your CSV columns! Each contact will receive their personalized value."
                                : "Map variables from CSV columns or set a fallback value."}
                            </p>
                          </div>

                          <div className="space-y-3">
                            {templateVarKeys.map((k) => {
                              const mappedCol = columnMapping[k] || "";
                              const sampleContact = csvContacts[0];
                              const sampleVal = mappedCol && sampleContact?.data ? sampleContact.data[mappedCol] : "";

                              return (
                                <div key={k} className="p-3 bg-gray-50/80 rounded-2xl border border-gray-200/80 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-12 py-1 rounded-lg bg-amber-100 border border-amber-200 text-center text-xs font-mono font-bold text-amber-800">
                                        {`{{${k}}}`}
                                      </div>
                                      <span className="text-xs font-semibold text-gray-700">
                                        Variable #{k}
                                      </span>
                                    </div>

                                    {mappedCol && sampleVal && (
                                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                                        Sample: "{sampleVal}"
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {/* CSV Column Picker if CSV has headers */}
                                    {csvHeaders.length > 0 ? (
                                      <div>
                                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
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
                                            className="w-full appearance-none px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                          >
                                            <option value="">-- Fixed Manual Value --</option>
                                            {csvHeaders.map((col) => (
                                              <option key={col} value={col}>
                                                Column: {col}
                                              </option>
                                            ))}
                                          </select>
                                          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                      </div>
                                    ) : null}

                                    {/* Fallback / Manual input */}
                                    <div className={csvHeaders.length > 0 ? "" : "sm:col-span-2"}>
                                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                                        {columnMapping[k] ? "Fallback Value (if CSV cell empty)" : "Fixed Value for all"}
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
                                        placeholder={columnMapping[k] ? "e.g. Valued Customer" : `Value for {{${k}}}`}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                          Message Preview
                        </span>
                        <div className="bg-[#eef8f2] border border-emerald-100 rounded-2xl p-4 text-xs text-gray-800 leading-relaxed shadow-inner">
                          {renderMediaPreviewBlock()}
                          {headerText && (
                            <div className="font-bold text-gray-900 mb-1.5 pb-1 border-b border-emerald-200/50">
                              {renderWhatsAppFormattedText(headerText)}
                            </div>
                          )}
                          <div className="whitespace-pre-wrap">
                            {renderWhatsAppFormattedText(getRenderedTextWithVars(bodyText, previewVars) || "No body text available")}
                          </div>
                          {footerText && (
                            <div className="text-[11px] text-gray-500 mt-2 pt-1 border-t border-emerald-200/40">
                              {footerText}
                            </div>
                          )}
                          {renderButtonsPreviewBlock()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-sm">
                      <Sparkles size={36} className="mx-auto text-emerald-300 mb-3" />
                      <h4 className="text-sm font-bold text-gray-700">
                        No Template Selected
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-[240px] mx-auto">
                        Click on an approved template from the list on the left to configure variables and preview.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 2 ACTION BAR */}
              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    topRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold flex items-center gap-2 transition w-full sm:w-auto justify-center"
                >
                  <ArrowLeft size={16} />
                  Back: Contacts & Details
                </button>

                <div className="text-xs font-medium text-gray-500">
                  {!selectedTemplateId
                    ? "⚠️ Please choose a template from the list."
                    : `✓ Selected: "${selectedTemplate?.name}"`}
                </div>

                <button
                  type="button"
                  disabled={!canProceedToStep3}
                  onClick={() => {
                    setCurrentStep(3);
                    topRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition w-full sm:w-auto text-sm"
                >
                  Next: Summary & Launch
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CAMPAIGN SUMMARY & LAUNCH */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-7 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Clock3 size={18} className="text-emerald-600" />
                  <h2 className="text-sm font-bold tracking-wide text-gray-800 uppercase">
                    Campaign Summary & Final Review
                  </h2>
                </div>

                {/* SUMMARY STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Campaign Name
                    </span>
                    <span className="text-base font-bold text-gray-800 mt-1 truncate" title={campaignName}>
                      {campaignName || "—"}
                    </span>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Selected Template
                    </span>
                    <span className="text-base font-bold text-gray-800 mt-1 truncate" title={selectedTemplate?.name}>
                      {selectedTemplate?.name || "—"}
                    </span>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                      Recipients (Ready to Send)
                    </span>
                    <span className="text-xl font-extrabold text-emerald-700 mt-1">
                      {phoneNumbers.length.toLocaleString()} Contacts
                    </span>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Duplicates Filtered
                    </span>
                    <span className="text-base font-bold text-gray-600 mt-1">
                      {csvStats.duplicates} Contacts
                    </span>
                  </div>
                </div>

                {/* PREVIEW BUBBLE */}
                <div className="mb-6 p-5 rounded-3xl bg-gray-50 border border-gray-200/80">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3">
                    Live WhatsApp Broadcast Preview
                  </span>

                  <div className="max-w-md mx-auto bg-[#dcf8c6] border border-emerald-200 rounded-2xl p-4 shadow-sm text-gray-800 space-y-2">
                    {renderMediaPreviewBlock()}
                    {headerText && (
                      <div className="font-bold text-sm text-gray-900">
                        {renderWhatsAppFormattedText(headerText)}
                      </div>
                    )}
                    <div className="text-xs leading-relaxed whitespace-pre-wrap text-gray-800">
                      {renderWhatsAppFormattedText(getRenderedTextWithVars(bodyText, previewVars))}
                    </div>
                    {footerText && (
                      <div className="text-[11px] text-gray-500 pt-1 border-t border-emerald-100">
                        {footerText}
                      </div>
                    )}
                    {renderButtonsPreviewBlock()}
                    <div className="text-[10px] text-gray-400 text-right">
                      Just now • Delivered
                    </div>
                  </div>
                </div>

                {/* ACTION BAR */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(2);
                        topRef.current?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-5 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm flex items-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      Back to Template
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-5 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm"
                    >
                      Reset All
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto text-sm"
                  >
                    {isSending ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending Broadcast...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Campaign ({phoneNumbers.length.toLocaleString()} Contacts)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HISTORY */}

      {tab === "history" && (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Campaign History
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                View previously sent campaigns
              </p>
            </div>

            <button
              onClick={() =>
                dispatch(fetchCampaigns())
              }
              className="text-emerald-600 text-sm font-semibold flex items-center gap-2"
            >
              <RefreshCw
                size={15}
                className={
                  isFetchingCampaigns
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </div>

          {isFetchingCampaigns ? (
            <div className="py-20 flex justify-center">
              <Loader2
                size={30}
                className="animate-spin text-emerald-600"
              />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-20 text-center">
              <Megaphone
                size={42}
                className="mx-auto text-gray-300 mb-4"
              />

              <p className="text-gray-500">
                No campaigns found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                      Campaign
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                      Template
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-bold uppercase text-gray-500">
                      Sent
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-bold uppercase text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-bold uppercase text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {campaigns.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          {c.name}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {c.template_name ||
                          c.template ||
                          "—"}
                      </td>

                      <td className="px-6 py-4 text-center font-semibold text-gray-700">
                        {c.sent_count ?? c.total_sent ?? c.recipient_count ?? "—"}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {campaignStatusBadge(
                          c.status
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "—"}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setAnalyticsTemplate(c)}
                            className="relative inline-flex items-center justify-center p-2 rounded-full hover:bg-indigo-50 text-indigo-500 hover:text-indigo-600 transition"
                            title="Template Analytics"
                          >
                            <BarChart3 size={18} />
                            {new Date() < new Date('2026-10-17') && (
                              <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                              </span>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDownloadCSV(c.id, c.name)}
                            disabled={downloadingId === c.id}
                            className="inline-flex items-center justify-center p-2 rounded-full hover:bg-emerald-50 text-emerald-600 transition disabled:opacity-50"
                            title="Download Report (CSV)"
                          >
                            {downloadingId === c.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Download size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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