import React, { useEffect, useRef, useState, useMemo } from "react";
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
  ChevronDown,
  ChevronUp,
  Phone,
  Megaphone,
  RefreshCw,
  Info,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

/* ─── Helpers ───────────────────────────────────────────────────────────── */

/**
 * Parse CSV / plain-text content and return an array of phone number strings.
 * Accepts:
 *  - CSV with a "phone" / "mobile" / "number" / "contact" column header
 *  - CSV with no header — treats every non-empty cell as a potential number
 *  - Plain text with one number per line
 */
function parsePhoneNumbers(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Try to detect a header row
  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const phoneColIdx = header.findIndex((h) =>
    /phone|mobile|number|contact|tel|whatsapp/.test(h)
  );

  let numbers = [];

  if (phoneColIdx !== -1) {
    // Has a recognised header — skip header row
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const val = cols[phoneColIdx];
      if (val) numbers.push(val);
    }
  } else {
    // No recognised header — grab first column of every row (or plain text)
    for (const line of lines) {
      // Take first comma-separated value
      const val = line.split(",")[0].trim().replace(/^"|"$/g, "");
      if (val) numbers.push(val);
    }
  }

  // Normalise & deduplicate
  const seen = new Set();
  const result = [];
  for (const raw of numbers) {
    // Remove spaces, dashes, parens; keep leading +
    const n = raw.replace(/[\s\-().]/g, "");
    if (!n) continue;
    // Basic sanity: must have 7–15 digits
    const digits = n.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) continue;
    if (seen.has(digits)) continue;
    seen.add(digits);
    // Keep original + prefix if present, else keep as-is
    result.push(n.startsWith("+") ? n : n);
  }
  return result;
}

function statusBadge(status) {
  const map = {
    APPROVED:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING:   "bg-amber-50 text-amber-700 border-amber-200",
    REJECTED:  "bg-red-50 text-red-600 border-red-200",
    PAUSED:    "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${map[status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
      {status}
    </span>
  );
}

function campaignStatusBadge(status) {
  const map = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    running:   "bg-blue-50 text-blue-700 border-blue-200",
    failed:    "bg-red-50 text-red-600 border-red-200",
    queued:    "bg-amber-50 text-amber-700 border-amber-200",
  };
  const key = (status ?? "").toLowerCase();
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${map[key] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
      {status ?? "—"}
    </span>
  );
}

/* ─── Template Card ─────────────────────────────────────────────────────── */
function TemplateCard({ template, selected, onSelect }) {
  const [expanded, setExpanded] = useState(false);

  // Extract body text from components
  const bodyComp = template.components?.find((c) => c.type === "BODY");
  const headerComp = template.components?.find((c) => c.type === "HEADER");
  const footerComp = template.components?.find((c) => c.type === "FOOTER");
  const bodyText = bodyComp?.text ?? template.body ?? "";
  const headerText = headerComp?.text ?? template.header ?? "";
  const footerText = footerComp?.text ?? template.footer ?? "";

  // Detect template variables like {{1}}, {{2}}
  const vars = [...new Set((bodyText + headerText).match(/\{\{\d+\}\}/g) ?? [])].sort();

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border-2 transition-all duration-150 p-4 ${
        selected
          ? "border-[#00a884] bg-[#e7faf0] shadow-md"
          : "border-gray-200 bg-white hover:border-[#00a884]/40 hover:shadow-sm"
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-gray-800 truncate">{template.name}</span>
            {statusBadge(template.status)}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] text-gray-400 uppercase font-medium">{template.language ?? template.language_code}</span>
            {template.category && (
              <span className="text-[10px] text-gray-400">• {template.category}</span>
            )}
            {vars.length > 0 && (
              <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                {vars.length} variable{vars.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {selected && <CheckCircle2 size={18} className="text-[#00a884]" />}
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((p) => !p); }}
            className="p-1 rounded hover:bg-gray-100 text-gray-400"
          >
            {expanded ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Preview */}
      {expanded && (
        <div
          className="mt-3 p-3 rounded-lg text-[12px] text-gray-700 whitespace-pre-wrap leading-relaxed"
          style={{ background: "#f0f2f5", borderLeft: "3px solid #00a884" }}
        >
          {headerText && <div className="font-semibold mb-1">{headerText}</div>}
          <div>{bodyText || <span className="text-gray-400 italic">No body text</span>}</div>
          {footerText && <div className="text-gray-400 mt-1 text-[11px]">{footerText}</div>}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */

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

  // ── Local state ──────────────────────────────────────────────────────────
  const [tab, setTab] = useState("new"); // "new" | "history"
  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState([]); // parsed list
  const [fileName, setFileName] = useState(null);
  const [rawCSVError, setRawCSVError] = useState(null);
  const [templateVars, setTemplateVars] = useState({}); // { "1": "value", "2": "value" }
  const [templateSearch, setTemplateSearch] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    dispatch(fetchApprovedTemplates());
    dispatch(fetchCampaigns());
  }, [dispatch]);

  // Auto-clear success toast after 6s
  useEffect(() => {
    if (sendSuccess) {
      const t = setTimeout(() => dispatch(clearSendResult()), 6000);
      return () => clearTimeout(t);
    }
  }, [sendSuccess, dispatch]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const selectedTemplate = approvedTemplates.find((t) => t.id === selectedTemplateId);

  const bodyText =
    selectedTemplate?.components?.find((c) => c.type === "BODY")?.text ??
    selectedTemplate?.body ?? "";
  const headerText =
    selectedTemplate?.components?.find((c) => c.type === "HEADER")?.text ??
    selectedTemplate?.header ?? "";

  const templateVarKeys = useMemo(() => {
    return [...new Set((bodyText + headerText).match(/\{\{\d+\}\}/g) ?? [])]
      .map((v) => v.replace(/[{}]/g, ""))
      .sort((a, b) => Number(a) - Number(b));
  }, [bodyText, headerText]);

  const filteredTemplates = useMemo(() => {
    if (!templateSearch.trim()) return approvedTemplates;
    const q = templateSearch.toLowerCase();
    return approvedTemplates.filter(
      (t) => t.name?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q)
    );
  }, [approvedTemplates, templateSearch]);

  const canSend =
    campaignName.trim() &&
    selectedTemplateId &&
    phoneNumbers.length > 0 &&
    !isSending;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFileUpload = (file) => {
    if (!file) return;
    setRawCSVError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parsePhoneNumbers(text);
      if (parsed.length === 0) {
setRawCSVError("No valid phone numbers found. CSV should contain a 'phone' column or each line should contain one number.");        setPhoneNumbers([]);
        setFileName(null);
      } else {
        setPhoneNumbers(parsed);
        setFileName(file.name);
      }
    };
    reader.onerror = () => setRawCSVError("Error reading file.");
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSend = async () => {
    if (!canSend) return;

    const variables = {};
    templateVarKeys.forEach((k) => {
      variables[k] = templateVars[k] ?? "";
    });

    dispatch(
      sendCampaign({
        name: campaignName.trim(),
        template_id: selectedTemplateId,
        phone_numbers: phoneNumbers,
        variables: templateVarKeys.length > 0 ? variables : undefined,
      })
    );
  };

  const handleReset = () => {
    setCampaignName("");
    setSelectedTemplateId(null);
    setPhoneNumbers([]);
    setFileName(null);
    setRawCSVError(null);
    setTemplateVars({});
    setTemplateSearch("");
    dispatch(clearSendResult());
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00a884] flex items-center justify-center shadow-sm">
            <Megaphone size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-gray-800 leading-tight">Campaign</h1>
            <p className="text-[12px] text-gray-500">  Upload CSV → Select Template → Send through Meta API</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
          {["new", "history"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-[13px] font-medium transition-colors ${
                tab === t
                  ? "bg-[#00a884] text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t === "new" ? "New Campaign" : "History"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Toast: success ── */}
      {sendSuccess && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-medium shadow-sm">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span>
            Campaign <strong>"{sendSuccess.name || campaignName}"</strong> sent successfully!{" "}
            {sendSuccess.total_sent && `(${sendSuccess.total_sent} numbers)`}
          </span>
          <button onClick={() => dispatch(clearSendResult())} className="ml-auto hover:opacity-70">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Toast: error ── */}
      {sendError && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium shadow-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{sendError}</span>
          <button onClick={() => dispatch(clearSendResult())} className="ml-auto hover:opacity-70">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB: NEW CAMPAIGN
      ════════════════════════════════════════════════════════════ */}
      {tab === "new" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left Column: CSV + Campaign Name ── */}
          <div className="flex flex-col gap-5">

            {/* Campaign Name */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <label className="block text-[12px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Diwali Offer 2025, New Leads Follow-up..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#00a884] transition-colors"
              />
            </div>

            {/* CSV Upload */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">
                  CSV Upload *
                </label>
                {phoneNumbers.length > 0 && (
                  <button
                    onClick={() => { setPhoneNumbers([]); setFileName(null); fileInputRef.current.value = ""; }}
                    className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 font-medium"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                )}
              </div>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 px-4 cursor-pointer transition-all ${
                  phoneNumbers.length > 0
                    ? "border-[#00a884] bg-[#f0faf7]"
                    : "border-gray-200 hover:border-[#00a884]/60 bg-gray-50 hover:bg-[#f9fffe]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />

                {phoneNumbers.length > 0 ? (
                  <>
                    <CheckCircle2 size={32} className="text-[#00a884] mb-2" />
                    <p className="text-[13px] font-semibold text-[#00a884]">{fileName}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">
                      <strong>{phoneNumbers.length}</strong> valid phone numbers parsed
                    </p>
                  </>
                ) : (
                  <>
                    <Upload size={28} className="text-gray-300 mb-2" />
                    <p className="text-[13px] font-medium text-gray-600">  Drop CSV here or click to upload</p>
                    <p className="text-[11px] text-gray-400 mt-1">  Supported: .csv, .txt — phone column or one number per line</p>
                  </>
                )}
              </div>

              {rawCSVError && (
                <div className="mt-2 flex items-start gap-2 text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  {rawCSVError}
                </div>
              )}

              {/* Parsed numbers preview */}
              {phoneNumbers.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Preview (first 10)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {phoneNumbers.slice(0, 10).map((n, i) => (
                      <span key={i} className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-mono">
                        <Phone size={9} /> {n}
                      </span>
                    ))}
                    {phoneNumbers.length > 10 && (
                      <span className="text-[11px] text-gray-400 italic self-center">
                        +{phoneNumbers.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* CSV format hint */}
              <div className="mt-3 flex items-start gap-2 text-[11px] text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <Info size={13} className="mt-0.5 flex-shrink-0" />
               <div>
  <strong>CSV Format:</strong> Header row should contain a <code>phone</code> / <code>mobile</code> / <code>number</code> column.
  
</div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Template Selection + Variables + Send ── */}
          <div className="flex flex-col gap-5">

            {/* Template Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">
                  Approved Template *
                </label>
                <button
                  onClick={() => dispatch(fetchApprovedTemplates())}
                  disabled={isFetchingTemplates}
                  className="flex items-center gap-1 text-[11px] text-[#00a884] hover:opacity-80 font-medium"
                >
                  <RefreshCw size={12} className={isFetchingTemplates ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {/* Search */}
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Template search karo..."
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] focus:outline-none focus:border-[#00a884] mb-3 transition-colors"
              />

              {isFetchingTemplates ? (
                <div className="flex items-center justify-center py-10 text-gray-400">
                  <Loader2 size={22} className="animate-spin" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-gray-400 gap-2">
                  <FileText size={28} className="opacity-30" />
                  <p className="text-[12px]">No approved templates found</p>
                  <p className="text-[11px] text-gray-400"> Go to Templates page and get templates approved from Meta</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-0.5">
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

            {/* Template Variables (if any) */}
            {selectedTemplate && templateVarKeys.length > 0 && (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
                <label className="block text-[12px] font-bold text-amber-700 uppercase tracking-wider mb-3">
                  Template Variables
                </label>
                <p className="text-[11px] text-gray-500 mb-3">
  This template contains variables. Same values will be sent to every recipient — for dynamic data configure it from backend.
                </p>
                <div className="flex flex-col gap-2">
                  {templateVarKeys.map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-[12px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded min-w-[44px] text-center">
                        {`{{${k}}}`}
                      </span>
                      <input
                        type="text"
                        placeholder={`Variable ${k} value...`}
                        value={templateVars[k] ?? ""}
                        onChange={(e) => setTemplateVars((prev) => ({ ...prev, [k]: e.target.value }))}
                        className="flex-1 px-3 py-1.5 text-[12px] rounded-lg border border-gray-200 focus:outline-none focus:border-[#00a884] transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary + Send */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-[12px] font-bold text-gray-600 uppercase tracking-wider mb-3">Campaign Summary</p>

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-500">Campaign Name</span>
                  <span className="font-medium text-gray-800 truncate max-w-[160px]">
                    {campaignName || <span className="text-gray-300 italic">—</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-500">Template</span>
                  <span className="font-medium text-gray-800 truncate max-w-[160px]">
                    {selectedTemplate?.name || <span className="text-gray-300 italic">—</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-500">Recipients</span>
                  <span className={`font-bold ${phoneNumbers.length > 0 ? "text-[#00a884]" : "text-gray-300"}`}>
                    {phoneNumbers.length > 0 ? `${phoneNumbers.length} numbers` : "—"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X size={14} /> Reset
                </button>

                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: canSend ? "#00a884" : "#9ca3af" }}
                >
                  {isSending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Campaign ({phoneNumbers.length})
                    </>
                  )}
                </button>
              </div>

              {!canSend && !isSending && (
                <p className="text-[11px] text-gray-400 mt-2 text-center">
                  {!campaignName.trim()
  ? "Please enter campaign name"
  : !selectedTemplateId
  ? "Please select a template"
  : phoneNumbers.length === 0
  ? "Please upload CSV"
  : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB: HISTORY
      ════════════════════════════════════════════════════════════ */}
      {tab === "history" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <span className="text-[13px] font-semibold text-gray-700">Past Campaigns</span>
            <button
              onClick={() => dispatch(fetchCampaigns())}
              disabled={isFetchingCampaigns}
              className="flex items-center gap-1 text-[12px] text-[#00a884] hover:opacity-80 font-medium"
            >
              <RefreshCw size={13} className={isFetchingCampaigns ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {isFetchingCampaigns ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-gray-400">
              <Megaphone size={36} className="opacity-20" />
              <p className="text-[13px]">No campaigns yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-semibold">Name</th>
                    <th className="px-5 py-3 text-left font-semibold">Template</th>
                    <th className="px-5 py-3 text-center font-semibold">Sent</th>
                    <th className="px-5 py-3 text-center font-semibold">Status</th>
                    <th className="px-5 py-3 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{c.name}</td>
                      <td className="px-5 py-3 text-gray-600">{c.template_name ?? c.template ?? "—"}</td>
                      <td className="px-5 py-3 text-center text-gray-700 font-mono">
                        {c.total_sent ?? c.recipient_count ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-center">{campaignStatusBadge(c.status)}</td>
                      <td className="px-5 py-3 text-gray-500">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Campaign;
