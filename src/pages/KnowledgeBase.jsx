import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChatbotConfig,
  saveChatbotConfig,
  fetchKBDocuments,
  uploadKBDocument,
  deleteKBDocument,
  toggleKBDocument,
  fetchChatbotStats,
  clearUploadSuccess,
  clearConfigSaved,
  clearErrors,
} from "../store/knowledgeBaseSlice";

import {
  Bot,
  Upload,
  FileText,
  Trash2,
  Plus,
  X,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Users,
  TrendingUp,
  MessageSquare,
  UserCheck,
  Eye,
  EyeOff,
  Info,
  Sparkles,
  ShieldCheck,
  Search,
  RefreshCw,
  Database,
  Brain,
  Settings2,
  ChevronRight,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────── */

const AVAILABLE_FIELDS = [
  { key: "name", label: "Name", icon: "👤" },
  { key: "phone", label: "Phone", icon: "📱" },
  { key: "email", label: "Email", icon: "📧" },
  { key: "service", label: "Service", icon: "🛠️" },
  { key: "location", label: "Location", icon: "📍" },
  { key: "budget", label: "Budget", icon: "💰" },
];

const FILE_TYPE_LABEL = {
  txt: "TXT",
  pdf: "PDF",
  manual: "TEXT",
};

const FILE_TYPE_COLOR = {
  txt: "bg-sky-50 text-sky-700 border-sky-200",
  pdf: "bg-rose-50 text-rose-700 border-rose-200",
  manual: "bg-gray-100 text-gray-700 border-gray-200",
};

/* ─────────────────────────────────────────────────────────────
   Animated Toggle
───────────────────────────────────────────────────────────── */

const PowerToggle = ({ value, onChange, disabled }) => {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`relative w-[58px] h-[32px] rounded-full transition-all duration-300 shadow-inner ${
        value
          ? "bg-emerald-500"
          : "bg-gray-300"
      }`}
    >
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
        }}
        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
        style={{
          left: value ? "28px" : "4px",
        }}
      />
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────────────────────── */

const StatCard = ({ icon: Icon, label, value, color }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon size={18} />
        </div>

        <div>
          <h3 className="text-[22px] font-bold text-gray-900 leading-none">
            {value ?? "—"}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Flow Diagram
───────────────────────────────────────────────────────────── */

const FlowDiagram = () => {
  const steps = [
    {
      label: "New Contact",
      bg: "bg-gray-100",
      text: "text-gray-700",
    },
    {
      label: "Prospect",
      bg: "bg-sky-50",
      text: "text-sky-700",
    },
    {
      label: "AI Qualification",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      label: "Lead",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div
            className={`px-4 py-2 rounded-xl text-xs font-semibold border border-white/60 ${step.bg} ${step.text}`}
          >
            {step.label}
          </div>

          {index !== steps.length - 1 && (
            <ChevronRight size={15} className="text-gray-300" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Upload Modal
───────────────────────────────────────────────────────────── */

const UploadModal = ({
  onClose,
  onSubmit,
  isUploading,
  uploadError,
}) => {
  const [mode, setMode] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  const [dragOver, setDragOver] = useState(false);

  const fileRef = useRef(null);

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (mode === "text" && !content.trim()) return;

    if (mode === "file" && !file) return;

    onSubmit({
      title: title.trim(),
      content: mode === "text" ? content : "",
      file: mode === "file" ? file : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center">
                <Upload size={18} className="text-sky-700" />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Add Knowledge Document
                </h2>

                <p className="text-xs text-gray-500 mt-0.5">
                  AI chatbot will learn from this document
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* body */}
        <div className="p-6 space-y-5">
          {/* error */}
          <AnimatePresence>
            {uploadError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-3 rounded-xl border border-red-200 bg-red-50"
              >
                <AlertCircle
                  size={15}
                  className="text-red-600 mt-0.5 flex-shrink-0"
                />

                <p className="text-xs text-red-700">
                  {uploadError}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Document Title *
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pricing FAQ, Company Policies..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 transition-all text-sm"
            />
          </div>

          {/* mode */}
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                key: "text",
                label: "Paste Text",
              },
              {
                key: "file",
                label: "Upload File",
              },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`py-3 rounded-2xl border text-sm font-semibold transition-all ${
                  mode === m.key
                    ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* text mode */}
          {mode === "text" && (
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your FAQ, pricing, product details..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 resize-none transition-all text-sm"
            />
          )}

          {/* file mode */}
          {mode === "file" && (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();

                setDragOver(false);

                const f = e.dataTransfer.files[0];

                if (f) {
                  setFile(f);
                }
              }}
              className={`border-2 border-dashed rounded-3xl p-10 transition-all cursor-pointer ${
                dragOver
                  ? "border-sky-400 bg-sky-50"
                  : "border-gray-200 hover:border-sky-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center mb-3">
                  <Upload size={24} className="text-sky-700" />
                </div>

                {file ? (
                  <>
                    <p className="font-semibold text-gray-800 text-sm">
                      {file.name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-700 text-sm">
                      Drop file here or click to browse
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Supports .txt and .pdf
                    </p>
                  </>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".txt,.pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          )}
        </div>

        {/* footer */}
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={
              isUploading ||
              !title.trim() ||
              (mode === "text" && !content.trim()) ||
              (mode === "file" && !file)
            }
            className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={15} />
                Add Document
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */

const KnowledgeBase = () => {
  const dispatch = useDispatch();

  const {
    config,
    isLoadingConfig,
    isSavingConfig,
    configSaved,
    configError,

    documents,
    isLoadingDocs,
    isUploading,
    isDeletingId,
    isTogglingId,
    uploadError,
    uploadSuccess,
    docsError,

    stats,
  } = useSelector((s) => s.knowledgeBase);

  const [form, setForm] = useState({
    is_active: false,
    welcome_message: "",
    fallback_message: "",
    human_handoff_message: "",
    qualification_fields: [],
    lead_threshold: 2,
  });

  const [configDirty, setConfigDirty] = useState(false);

  const [showUploadModal, setShowUploadModal] =
    useState(false);

  const [deleteConfirmId, setDeleteConfirmId] =
    useState(null);

  const [toast, setToast] = useState(null);

  const [expandedDocId, setExpandedDocId] =
    useState(null);

  const [search, setSearch] = useState("");

  /* load */
  useEffect(() => {
    dispatch(fetchChatbotConfig());
    dispatch(fetchKBDocuments());
    dispatch(fetchChatbotStats());
  }, [dispatch]);

  /* sync */
  useEffect(() => {
    if (config) {
      setForm({
        is_active: config.is_active ?? false,
        welcome_message:
          config.welcome_message ?? "",
        fallback_message:
          config.fallback_message ?? "",
        human_handoff_message:
          config.human_handoff_message ?? "",
        qualification_fields:
          config.qualification_fields ?? [],
        lead_threshold:
          config.lead_threshold ?? 2,
      });

      setConfigDirty(false);
    }
  }, [config]);

  /* toast */
  useEffect(() => {
    if (configSaved) {
      showToast("Configuration saved successfully", "success");
      dispatch(clearConfigSaved());
    }
  }, [configSaved]);

  useEffect(() => {
    if (uploadSuccess) {
      setShowUploadModal(false);

      showToast("Document uploaded successfully", "success");

      dispatch(clearUploadSuccess());
    }
  }, [uploadSuccess]);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  /* form helpers */
  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setConfigDirty(true);
  };

  const toggleQualField = (fieldKey) => {
    const current = form.qualification_fields;

    const next = current.includes(fieldKey)
      ? current.filter((f) => f !== fieldKey)
      : [...current, fieldKey];

    setField("qualification_fields", next);
  };

  const handleSaveConfig = () => {
    dispatch(saveChatbotConfig(form));
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;

    dispatch(deleteKBDocument(deleteConfirmId));

    setDeleteConfirmId(null);
  };

  const filteredDocs = useMemo(() => {
    if (!search.trim()) return documents;

    const q = search.toLowerCase();

    return documents.filter(
      (d) =>
        d.title?.toLowerCase().includes(q) ||
        d.file_name?.toLowerCase().includes(q)
    );
  }, [documents, search]);

  return (
    <div className="min-h-screen bg-[#f6f9fc] p-4 md:p-6">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">

        <div>
          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
              <Bot size={22} className="text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Knowledge Base
              </h1>

              <p className="text-sm text-gray-500 mt-0.5">
                Train your WhatsApp AI assistant with documents & FAQs
              </p>
            </div>
          </div>
        </div>

        {/* toggle */}
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-4">

          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
              Chatbot Status
            </p>

            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  form.is_active
                    ? "bg-emerald-500"
                    : "bg-gray-300"
                }`}
              />

              <span
                className={`text-sm font-bold ${
                  form.is_active
                    ? "text-emerald-600"
                    : "text-gray-400"
                }`}
              >
                {form.is_active ? "LIVE" : "OFFLINE"}
              </span>
            </div>
          </div>

          <PowerToggle
            value={form.is_active}
            disabled={isSavingConfig}
            onChange={(v) => {
              setField("is_active", v);

              dispatch(
                saveChatbotConfig({
                  ...form,
                  is_active: v,
                })
              );
            }}
          />
        </div>
      </div>

      {/* FLOW */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-sky-600" />

          <p className="text-xs uppercase tracking-wider font-bold text-gray-500">
            AI Lead Qualification Flow
          </p>
        </div>

        <FlowDiagram />

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          The chatbot automatically talks with users,
          collects important details, qualifies prospects,
          and converts them into leads.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

        <StatCard
          icon={MessageSquare}
          label="Conversations"
          value={stats?.total_conversations}
          color="bg-sky-100 text-sky-700"
        />

        <StatCard
          icon={Users}
          label="Prospects"
          value={stats?.prospects_in_progress}
          color="bg-blue-100 text-blue-700"
        />

        <StatCard
          icon={TrendingUp}
          label="Converted Leads"
          value={stats?.leads_converted}
          color="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          icon={UserCheck}
          label="Human Handoffs"
          value={stats?.stage_breakdown?.human_handoff}
          color="bg-amber-100 text-amber-700"
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="space-y-5">

          {/* docs header */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100">

              <div className="flex items-center justify-between gap-3 flex-wrap">

                <div>
                  <div className="flex items-center gap-2">
                    <Database
                      size={18}
                      className="text-sky-600"
                    />

                    <h2 className="font-bold text-gray-900">
                      Knowledge Documents
                    </h2>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {documents.length} documents indexed
                    for AI search
                  </p>
                </div>

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-all shadow-sm"
                >
                  <Plus size={15} />
                  Add Document
                </button>
              </div>

              {/* search */}
              <div className="relative mt-4">
                <Search
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search documents..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 text-sm transition-all"
                />
              </div>
            </div>

            {/* docs */}
            <div className="p-4">

              {isLoadingDocs && documents.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2
                    size={26}
                    className="animate-spin text-gray-300"
                  />
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="py-16 flex flex-col items-center text-center">

                  <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
                    <FileText
                      size={30}
                      className="text-gray-300"
                    />
                  </div>

                  <h3 className="font-semibold text-gray-700">
                    No documents found
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Upload FAQs, services, pricing and
                    company details
                  </p>
                </div>
              ) : (
                <div className="space-y-3">

                  <AnimatePresence mode="popLayout">
                    {filteredDocs.map((doc) => {

                      const expanded =
                        expandedDocId === doc.id;

                      const isDeleting =
                        isDeletingId === doc.id;

                      const isToggling =
                        isTogglingId === doc.id;

                      const typeStyle =
                        FILE_TYPE_COLOR[
                          doc.file_type
                        ] || FILE_TYPE_COLOR.manual;

                      return (
                        <motion.div
                          key={doc.id}
                          layout
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                          }}
                          className={`rounded-2xl border bg-white transition-all ${
                            doc.is_active
                              ? "border-gray-200"
                              : "border-gray-100 opacity-60"
                          }`}
                        >
                          <div className="p-4 flex items-start gap-3">

                            <div
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border uppercase ${typeStyle}`}
                            >
                              {FILE_TYPE_LABEL[
                                doc.file_type
                              ] || "DOC"}
                            </div>

                            <div className="flex-1 min-w-0">

                              <div className="flex items-center gap-2">

                                <h3 className="font-semibold text-gray-800 text-sm truncate">
                                  {doc.title}
                                </h3>

                                {doc.is_active && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                    ACTIVE
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-gray-400 mt-1">
                                {doc.chunk_count} chunks
                                {doc.file_name
                                  ? ` • ${doc.file_name}`
                                  : ""}
                              </p>
                            </div>

                            {/* actions */}
                            <div className="flex items-center gap-1">

                              <button
                                onClick={() =>
                                  setExpandedDocId(
                                    expanded
                                      ? null
                                      : doc.id
                                  )
                                }
                                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-all"
                              >
                                {expanded ? (
                                  <EyeOff size={15} />
                                ) : (
                                  <Eye size={15} />
                                )}
                              </button>

                              <button
                                disabled={isToggling}
                                onClick={() =>
                                  dispatch(
                                    toggleKBDocument({
                                      id: doc.id,
                                      is_active:
                                        !doc.is_active,
                                    })
                                  )
                                }
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                  doc.is_active
                                    ? "text-emerald-600 hover:bg-emerald-50"
                                    : "text-gray-400 hover:bg-gray-100"
                                }`}
                              >
                                {isToggling ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : doc.is_active ? (
                                  <ToggleRight size={18} />
                                ) : (
                                  <ToggleLeft size={18} />
                                )}
                              </button>

                              <button
                                disabled={isDeleting}
                                onClick={() =>
                                  setDeleteConfirmId(
                                    doc.id
                                  )
                                }
                                className="w-9 h-9 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center transition-all"
                              >
                                {isDeleting ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={15} />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* preview */}
                          <AnimatePresence>
                            {expanded && (
                              <motion.div
                                initial={{
                                  height: 0,
                                  opacity: 0,
                                }}
                                animate={{
                                  height: "auto",
                                  opacity: 1,
                                }}
                                exit={{
                                  height: 0,
                                  opacity: 0,
                                }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4">
                                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                                      {doc.preview}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

            {/* top */}
            <div className="px-6 py-5 border-b border-gray-100">

              <div className="flex items-center gap-2">
                <Settings2
                  size={18}
                  className="text-sky-600"
                />

                <h2 className="font-bold text-gray-900">
                  Chatbot Configuration
                </h2>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Configure AI responses and lead qualification
              </p>
            </div>

            {/* body */}
            <div className="p-6 space-y-5">

              {/* config error */}
              <AnimatePresence>
                {configError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-2xl border border-red-200 bg-red-50 flex items-start gap-2"
                  >
                    <AlertCircle
                      size={15}
                      className="text-red-600 mt-0.5"
                    />

                    <p className="text-xs text-red-700">
                      {configError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* welcome */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Welcome Message
                </label>

                <textarea
                  rows={3}
                  value={form.welcome_message}
                  onChange={(e) =>
                    setField(
                      "welcome_message",
                      e.target.value
                    )
                  }
                  placeholder="Hello 👋 How can I help you today?"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 resize-none text-sm transition-all"
                />
              </div>

              {/* fallback */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Fallback Message
                </label>

                <textarea
                  rows={3}
                  value={form.fallback_message}
                  onChange={(e) =>
                    setField(
                      "fallback_message",
                      e.target.value
                    )
                  }
                  placeholder="I couldn't find an answer. Let me connect you with our team."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 resize-none text-sm transition-all"
                />
              </div>

              {/* handoff */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Human Handoff Message
                </label>

                <textarea
                  rows={3}
                  value={form.human_handoff_message}
                  onChange={(e) =>
                    setField(
                      "human_handoff_message",
                      e.target.value
                    )
                  }
                  placeholder="Our support team will contact you shortly."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100 resize-none text-sm transition-all"
                />
              </div>

              {/* fields */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck
                    size={15}
                    className="text-sky-600"
                  />

                  <label className="text-xs font-semibold text-gray-700">
                    Lead Qualification Fields
                  </label>
                </div>

                <p className="text-[11px] text-gray-400 mb-3">
                  AI chatbot will collect these fields
                  before converting a prospect into a lead
                </p>

                <div className="grid grid-cols-2 gap-2">

                  {AVAILABLE_FIELDS.map((field) => {

                    const active =
                      form.qualification_fields.includes(
                        field.key
                      );

                    return (
                      <button
                        key={field.key}
                        onClick={() =>
                          toggleQualField(field.key)
                        }
                        className={`flex items-center gap-2 px-3 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                          active
                            ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span>{field.icon}</span>

                        {field.label}

                        {active && (
                          <CheckCircle2
                            size={14}
                            className="ml-auto"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* threshold */}
              <div>

                <label className="block text-xs font-semibold text-gray-700 mb-3">
                  Lead Threshold
                </label>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">

                  <div className="flex items-center justify-between mb-3">

                    <p className="text-sm font-medium text-gray-700">
                      Promote to lead after collecting:
                    </p>

                    <div className="px-3 py-1 rounded-xl bg-sky-600 text-white text-sm font-bold">
                      {form.lead_threshold}
                    </div>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={Math.max(
                      form.qualification_fields.length,
                      1
                    )}
                    value={form.lead_threshold}
                    onChange={(e) =>
                      setField(
                        "lead_threshold",
                        Number(e.target.value)
                      )
                    }
                    className="w-full accent-sky-600"
                  />

                  <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">

                    <Info
                      size={14}
                      className="text-amber-600 mt-0.5 flex-shrink-0"
                    />

                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      {form.qualification_fields.length === 0
                        ? "Please select at least one field."
                        : `AI will convert the contact into a lead after collecting ${form.lead_threshold} fields.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* save */}
              <button
                onClick={handleSaveConfig}
                disabled={!configDirty || isSavingConfig}
                className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {isSavingConfig ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    {configDirty
                      ? "Save Configuration"
                      : "Configuration Saved"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* upload modal */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onSubmit={({ title, content, file }) =>
              dispatch(
                uploadKBDocument({
                  title,
                  content,
                  file,
                })
              )
            }
            isUploading={isUploading}
            uploadError={uploadError}
          />
        )}
      </AnimatePresence>

      {/* delete confirm */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setDeleteConfirmId(null)
              }
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
              }}
              className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                <Trash2
                  size={22}
                  className="text-red-600"
                />
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                Delete Document?
              </h3>

              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                This will permanently remove all indexed
                chunks from the AI knowledge base.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">

                <button
                  onClick={() =>
                    setDeleteConfirmId(null)
                  }
                  className="py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteConfirm}
                  className="py-3 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 20,
            }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2"
            style={{
              background:
                toast.type === "success"
                  ? "#059669"
                  : "#111827",
            }}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <Info size={16} />
            )}

            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeBase;