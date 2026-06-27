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
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */

function parsePhoneNumbers(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const header = lines[0]
    .toLowerCase()
    .split(",")
    .map((h) => h.trim());

  const phoneColIdx = header.findIndex((h) =>
    /phone|mobile|number|contact|tel|whatsapp/.test(h)
  );

  let numbers = [];

  if (phoneColIdx !== -1) {
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i]
        .split(",")
        .map((c) => c.trim().replace(/^"|"$/g, ""));

      const val = cols[phoneColIdx];
      if (val) numbers.push(val);
    }
  } else {
    for (const line of lines) {
      const val = line
        .split(",")[0]
        .trim()
        .replace(/^"|"$/g, "");

      if (val) numbers.push(val);
    }
  }

  const seen = new Set();
  const result = [];

  for (const raw of numbers) {
    const n = raw.replace(/[\s\-().]/g, "");
    const digits = n.replace(/\D/g, "");

    if (digits.length < 7 || digits.length > 15) continue;
    if (seen.has(digits)) continue;

    seen.add(digits);
    result.push(n);
  }

  return result;
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
      className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
        map[status] ||
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
      className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
        map[key] ||
        "bg-gray-100 text-gray-600 border border-gray-200"
      }`}
    >
      {status || "—"}
    </span>
  );
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

  const bodyText = bodyComp?.text || template.body || "";
  const headerText = headerComp?.text || template.header || "";
  const footerText = footerComp?.text || template.footer || "";

  const vars = [
    ...new Set(
      (bodyText + headerText).match(/\{\{\d+\}\}/g) || []
    ),
  ];

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden ${
        selected
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
            {headerText && (
              <div className="font-semibold text-gray-700 mb-2">
                {headerText}
              </div>
            )}

            <div className="text-[13px] text-gray-600 whitespace-pre-wrap leading-relaxed">
              {bodyText || "No body text"}
            </div>

            {footerText && (
              <div className="mt-3 text-[11px] text-gray-400">
                {footerText}
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

  const [tab, setTab] = useState("new");

  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] =
    useState(null);

  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [fileName, setFileName] = useState(null);

  const [rawCSVError, setRawCSVError] = useState(null);

  const [templateVars, setTemplateVars] = useState({});

  const [templateSearch, setTemplateSearch] = useState("");

  const fileInputRef = useRef();

  useEffect(() => {
    dispatch(fetchApprovedTemplates());
    dispatch(fetchCampaigns());
  }, [dispatch]);

  useEffect(() => {
    if (sendSuccess) {
      const t = setTimeout(() => {
        dispatch(clearSendResult());
      }, 5000);

      return () => clearTimeout(t);
    }
  }, [sendSuccess, dispatch]);

  const selectedTemplate = approvedTemplates.find(
    (t) => t.id === selectedTemplateId
  );

  const bodyText =
    selectedTemplate?.components?.find(
      (c) => c.type === "BODY"
    )?.text || "";

  const headerText =
    selectedTemplate?.components?.find(
      (c) => c.type === "HEADER"
    )?.text || "";

  const templateVarKeys = useMemo(() => {
    return [
      ...new Set(
        (bodyText + headerText).match(/\{\{\d+\}\}/g) || []
      ),
    ]
      .map((v) => v.replace(/[{}]/g, ""))
      .sort((a, b) => Number(a) - Number(b));
  }, [bodyText, headerText]);

  const filteredTemplates = useMemo(() => {
    if (!templateSearch.trim()) return approvedTemplates;

    const q = templateSearch.toLowerCase();

    return approvedTemplates.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
    );
  }, [approvedTemplates, templateSearch]);

  const canSend =
    campaignName.trim() &&
    selectedTemplateId &&
    phoneNumbers.length > 0 &&
    !isSending;

  /* ───────────────────────────────────────────────────────── */

  const handleFileUpload = (file) => {
    if (!file) return;

    setRawCSVError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;

      const parsed = parsePhoneNumbers(text);

      if (parsed.length === 0) {
        setRawCSVError(
          "No valid phone numbers found inside CSV."
        );

        setPhoneNumbers([]);
        setFileName(null);
      } else {
        setPhoneNumbers(parsed);
        setFileName(file.name);
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

    const variables = {};

    templateVarKeys.forEach((k) => {
      variables[k] = templateVars[k] || "";
    });

    dispatch(
      sendCampaign({
        name: campaignName.trim(),
        template_id: selectedTemplateId,
        phone_numbers: phoneNumbers,
        variables:
          templateVarKeys.length > 0
            ? variables
            : undefined,
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

  /* ───────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-emerald-50/30 p-4 md:p-6">
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
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t
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
              Campaign sent successfully
            </p>

            <p className="text-sm text-emerald-600 mt-1">
              {sendSuccess.name || campaignName}
            </p>
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* LEFT */}

          <div className="space-y-6">
            {/* CAMPAIGN NAME */}

            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles
                  size={16}
                  className="text-emerald-600"
                />

                <h2 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
                  Campaign Details
                </h2>
              </div>

              <label className="text-sm font-medium text-gray-700 block mb-2">
                Campaign Name
              </label>

              <input
                type="text"
                value={campaignName}
                onChange={(e) =>
                  setCampaignName(e.target.value)
                }
                placeholder="Summer Sale Campaign..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none transition-all text-sm"
              />
            </div>

            {/* CSV */}

            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
                    Upload Contacts
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    CSV or TXT file supported
                  </p>
                </div>

                {phoneNumbers.length > 0 && (
                  <button
                    onClick={() => {
                      setPhoneNumbers([]);
                      setFileName(null);
                    }}
                    className="text-red-500 hover:text-red-600 text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 size={13} />
                    Clear
                  </button>
                )}
              </div>

              {/* DROP */}

              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
                  phoneNumbers.length > 0
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(
                      e.target.files?.[0]
                    )
                  }
                />

                {phoneNumbers.length > 0 ? (
                  <>
                    <CheckCircle2
                      size={40}
                      className="mx-auto text-emerald-600 mb-3"
                    />

                    <h3 className="font-semibold text-gray-800">
                      {fileName}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {phoneNumbers.length} numbers
                      parsed successfully
                    </p>
                  </>
                ) : (
                  <>
                    <Upload
                      size={38}
                      className="mx-auto text-gray-300 mb-3"
                    />

                    <h3 className="font-semibold text-gray-700">
                      Drop file here
                    </h3>

                    <p className="text-sm text-gray-400 mt-1">
                      or click to browse files
                    </p>
                  </>
                )}
              </div>

              {rawCSVError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 flex gap-2">
                  <AlertCircle size={16} />
                  {rawCSVError}
                </div>
              )}

              {/* PREVIEW */}

              {phoneNumbers.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users
                      size={15}
                      className="text-emerald-600"
                    />

                    <span className="text-sm font-semibold text-gray-700">
                      Preview Contacts
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {phoneNumbers
                      .slice(0, 10)
                      .map((n, i) => (
                        <div
                          key={i}
                          className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700 font-mono flex items-center gap-1"
                        >
                          <Phone size={11} />
                          {n}
                        </div>
                      ))}

                    {phoneNumbers.length > 10 && (
                      <div className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
                        +{phoneNumbers.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* INFO */}

              <div className="mt-5 bg-sky-50 border border-sky-200 rounded-2xl p-4 flex gap-3">
                <Info
                  size={16}
                  className="text-sky-600 mt-0.5"
                />

                <div className="text-xs text-sky-700 leading-relaxed">
                  CSV should contain a{" "}
                  <strong>phone</strong> or{" "}
                  <strong>mobile</strong> column.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="space-y-6">
            {/* TEMPLATES */}

            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
                    Select Template
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Choose approved Meta template
                  </p>
                </div>

                <button
                  onClick={() =>
                    dispatch(fetchApprovedTemplates())
                  }
                  className="text-emerald-600 text-xs font-semibold flex items-center gap-1"
                >
                  <RefreshCw
                    size={13}
                    className={
                      isFetchingTemplates
                        ? "animate-spin"
                        : ""
                    }
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
                  onChange={(e) =>
                    setTemplateSearch(e.target.value)
                  }
                  placeholder="Search templates..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none transition-all text-sm"
                />
              </div>

              {/* LIST */}

              {isFetchingTemplates ? (
                <div className="py-16 flex justify-center">
                  <Loader2
                    size={28}
                    className="animate-spin text-emerald-600"
                  />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText
                    size={38}
                    className="mx-auto text-gray-300 mb-3"
                  />

                  <p className="text-sm text-gray-500">
                    No templates found
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredTemplates.map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      selected={
                        selectedTemplateId === t.id
                      }
                      onSelect={() => {
                        setSelectedTemplateId(t.id);
                        setTemplateVars({});
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* VARIABLES */}

            {selectedTemplate &&
              templateVarKeys.length > 0 && (
                <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles
                      size={15}
                      className="text-amber-600"
                    />

                    <h2 className="text-sm font-bold tracking-wide text-amber-700 uppercase">
                      Template Variables
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {templateVarKeys.map((k) => (
                      <div
                        key={k}
                        className="flex gap-3"
                      >
                        <div className="min-w-[70px] px-3 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-center text-sm font-mono text-amber-700">
                          {`{{${k}}}`}
                        </div>

                        <input
                          type="text"
                          value={
                            templateVars[k] || ""
                          }
                          onChange={(e) =>
                            setTemplateVars((prev) => ({
                              ...prev,
                              [k]: e.target.value,
                            }))
                          }
                          placeholder={`Enter value for variable ${k}`}
                          className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none transition-all text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* SUMMARY */}

            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Clock3
                  size={16}
                  className="text-emerald-600"
                />

                <h2 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
                  Campaign Summary
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Campaign
                  </span>

                  <span className="text-sm font-semibold text-gray-800">
                    {campaignName || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Template
                  </span>

                  <span className="text-sm font-semibold text-gray-800">
                    {selectedTemplate?.name || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Recipients
                  </span>

                  <span className="text-sm font-bold text-emerald-600">
                    {phoneNumbers.length}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-5 py-3 rounded-2xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
                >
                  Reset
                </button>

                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className="flex-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Campaign
                    </>
                  )}
                </button>
              </div>

              {!canSend && !isSending && (
                <p className="text-xs text-center text-gray-400 mt-4">
                  {!campaignName.trim()
                    ? "Please enter campaign name"
                    : !selectedTemplateId
                    ? "Please select a template"
                    : phoneNumbers.length === 0
                    ? "Please upload CSV file"
                    : ""}
                </p>
              )}
            </div>
          </div>
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
                        {c.total_sent ||
                          c.recipient_count ||
                          "—"}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {campaignStatusBadge(
                          c.status
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {c.created_at
                          ? new Date(
                              c.created_at
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
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