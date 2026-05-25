import React, { useEffect, useState, useRef } from "react";
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
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Constants ─────────────────────────────────────────────────────────────────

const AVAILABLE_FIELDS = [
  { key: "name",     label: "Name",     icon: "👤" },
  { key: "phone",    label: "Phone",    icon: "📱" },
  { key: "email",    label: "Email",    icon: "📧" },
  { key: "service",  label: "Service",  icon: "🔧" },
  { key: "location", label: "Location", icon: "📍" },
  { key: "budget",   label: "Budget",   icon: "💰" },
];

const FILE_TYPE_LABEL = { txt: "TXT", pdf: "PDF", manual: "Text" };
const FILE_TYPE_COLOR = {
  txt:    "bg-blue-50 text-blue-700 border-blue-200",
  pdf:    "bg-red-50  text-red-700  border-red-200",
  manual: "bg-gray-50 text-gray-700 border-gray-200",
};

// ── Sub-components ────────────────────────────────────────────────────────────

/** Animated ON/OFF toggle */
const PowerToggle = ({ value, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!value)}
    disabled={disabled}
    className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-50 ${
      value ? "bg-emerald-500" : "bg-gray-300"
    }`}
  >
    <motion.span
      layout
      animate={{ x: value ? 28 : 4 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
    />
  </button>
);

/** Stat card used in the overview row */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center gap-3 p-4 rounded-xl border ${color} bg-white`}>
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xl font-bold text-gray-900">{value ?? "—"}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

/** Flow diagram: new contact → prospect → (chatbot) → lead */
const FlowDiagram = () => (
  <div className="flex items-center gap-0 flex-wrap">
    {[
      { label: "New Contact",  color: "bg-gray-100  border-gray-300  text-gray-700",  dot: "bg-gray-400"    },
      { label: "→ Prospect",   color: "bg-blue-50   border-blue-300  text-blue-700",   dot: "bg-blue-400"    },
      { label: "🤖 Chatbot Qualifies", color: "bg-amber-50  border-amber-300 text-amber-700",  dot: "bg-amber-400"   },
      { label: "→ Lead ✓",    color: "bg-emerald-50 border-emerald-300 text-emerald-700", dot: "bg-emerald-500" },
    ].map((step, i) => (
      <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold mr-1 mb-1 ${step.color}`}>
        <span className={`w-2 h-2 rounded-full ${step.dot}`} />
        {step.label}
      </div>
    ))}
  </div>
);

// ── Upload Modal ──────────────────────────────────────────────────────────────

const UploadModal = ({ onClose, onSubmit, isUploading, uploadError }) => {
  const [mode, setMode]       = useState("text");   // "text" | "file"
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [file, setFile]       = useState(null);
  const fileRef               = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setMode("file"); }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (mode === "file" && !file) return;
    if (mode === "text" && !content.trim()) return;
    onSubmit({ title: title.trim(), content: mode === "text" ? content : "", file: mode === "file" ? file : null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Add Knowledge Base Document</h2>
            <p className="text-xs text-gray-500 mt-0.5">Chatbot will use this to answer user questions</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Error */}
          <AnimatePresence>
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">{uploadError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Document Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Services FAQ, Pricing Info, Company Overview"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
            />
          </div>

          {/* Mode switch */}
          <div className="flex gap-2">
            {[{ key: "text", label: "Paste Text" }, { key: "file", label: "Upload File (.txt / .pdf)" }].map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  mode === m.key ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Text mode */}
          {mode === "text" && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"Paste your knowledge base content here…\n\nE.g. FAQ answers, product info, pricing, policies, etc."}
              rows={7}
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-colors"
            />
          )}

          {/* File mode */}
          {mode === "file" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
                dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Upload size={28} className="text-gray-300" />
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">Drop file here or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">.txt or .pdf supported</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept=".txt,.pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
          <button onClick={onClose} disabled={isUploading} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading || !title.trim() || (mode === "text" && !content.trim()) || (mode === "file" && !file)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isUploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Upload size={14} /> Add Document</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const KnowledgeBase = () => {
  const dispatch = useDispatch();
  const {
    config, isLoadingConfig, isSavingConfig, configError, configSaved,
    documents, isLoadingDocs, isUploading, isDeletingId, isTogglingId, uploadError, uploadSuccess, docsError,
    stats, isLoadingStats,
  } = useSelector((s) => s.knowledgeBase);

  // Local config form state (synced from redux on load)
  const [form, setForm] = useState({
    is_active:             false,
    welcome_message:       "",
    fallback_message:      "",
    human_handoff_message: "",
    qualification_fields:  [],
    lead_threshold:        2,
  });
  const [configDirty, setConfigDirty]     = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedDocId, setExpandedDocId]   = useState(null);

  // ── Load on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchChatbotConfig());
    dispatch(fetchKBDocuments());
    dispatch(fetchChatbotStats());
  }, [dispatch]);

  // ── Sync config into form ─────────────────────────────────────────────────
  useEffect(() => {
    if (config) {
      setForm({
        is_active:             config.is_active             ?? false,
        welcome_message:       config.welcome_message        ?? "",
        fallback_message:      config.fallback_message       ?? "",
        human_handoff_message: config.human_handoff_message  ?? "",
        qualification_fields:  config.qualification_fields   ?? [],
        lead_threshold:        config.lead_threshold         ?? 2,
      });
      setConfigDirty(false);
    }
  }, [config]);

  // ── Toasts ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (configSaved) {
      showToast("Chatbot config saved ✓", "success");
      dispatch(clearConfigSaved());
    }
  }, [configSaved]);

  useEffect(() => {
    if (uploadSuccess) {
      setShowUploadModal(false);
      showToast("Document added & indexed ✓", "success");
      dispatch(clearUploadSuccess());
    }
  }, [uploadSuccess]);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Form helpers ──────────────────────────────────────────────────────────
  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setConfigDirty(true);
  };

  const toggleQualField = (fieldKey) => {
    const current = form.qualification_fields;
    const next = current.includes(fieldKey)
      ? current.filter((f) => f !== fieldKey)
      : [...current, fieldKey];
    setField("qualification_fields", next);
  };

  const handleSaveConfig = () => dispatch(saveChatbotConfig(form));

  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;
    dispatch(deleteKBDocument(deleteConfirmId));
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 pb-10">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot size={22} className="text-gray-700" />
            <h1 className="text-xl font-bold text-gray-900">Chatbot & Knowledge Base</h1>
          </div>
          <p className="text-sm text-gray-500">
            Auto-qualify WhatsApp leads with a knowledge-powered chatbot
          </p>
        </div>

        {/* Live toggle */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <span className="text-sm font-semibold text-gray-700">Chatbot</span>
          <PowerToggle
            value={form.is_active}
            onChange={(val) => {
              setField("is_active", val);
              // Auto-save the toggle immediately
              dispatch(saveChatbotConfig({ ...form, is_active: val }));
            }}
            disabled={isSavingConfig || isLoadingConfig}
          />
          <span className={`text-xs font-bold ${form.is_active ? "text-emerald-600" : "text-gray-400"}`}>
            {form.is_active ? "LIVE" : "OFF"}
          </span>
        </div>
      </div>

      {/* ── Flow diagram ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">How it works</p>
        <FlowDiagram />
        <p className="text-xs text-gray-400 mt-3">
          Every new WhatsApp contact starts as a <strong>Prospect</strong>. Once the chatbot
          collects enough qualifying info, the contact auto-promotes to <strong>Lead</strong>.
        </p>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={MessageSquare} label="Total Conversations" value={stats?.total_conversations}    color="border-gray-200 text-gray-600" />
        <StatCard icon={Users}         label="Prospects In Progress" value={stats?.prospects_in_progress} color="border-blue-200 text-blue-600" />
        <StatCard icon={TrendingUp}    label="Converted to Leads"   value={stats?.leads_converted}       color="border-emerald-200 text-emerald-600" />
        <StatCard icon={UserCheck}     label="Human Handoffs"       value={stats?.stage_breakdown?.human_handoff} color="border-amber-200 text-amber-600" />
      </div>

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── LEFT: Knowledge Base Documents ─────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Knowledge Base</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {documents.length} document{documents.length !== 1 ? "s" : ""} · Bot searches these to answer questions
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Plus size={15} /> Add Doc
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {docsError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700"
              >
                <AlertCircle size={13} className="flex-shrink-0" /> {docsError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Document list */}
          {isLoadingDocs && documents.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-300" />
            </div>
          ) : documents.length === 0 ? (
            <div
              onClick={() => setShowUploadModal(true)}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <FileText size={32} className="text-gray-200" />
              <p className="text-sm font-medium text-gray-500">No documents yet</p>
              <p className="text-xs text-gray-400">Add FAQs, pricing, services info for the chatbot</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {documents.map((doc) => {
                  const isDeleting = isDeletingId === doc.id;
                  const isToggling = isTogglingId === doc.id;
                  const isExpanded = expandedDocId === doc.id;
                  const typeStyle  = FILE_TYPE_COLOR[doc.file_type] || FILE_TYPE_COLOR.manual;

                  return (
                    <motion.div
                      key={doc.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      className={`bg-white rounded-xl border transition-colors ${
                        doc.is_active ? "border-gray-200" : "border-gray-100 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3 p-3.5">
                        {/* File type badge */}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase flex-shrink-0 ${typeStyle}`}>
                          {FILE_TYPE_LABEL[doc.file_type] || "DOC"}
                        </span>

                        {/* Title + chunk count */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{doc.title}</p>
                          <p className="text-[11px] text-gray-400">
                            {doc.chunk_count} chunk{doc.chunk_count !== 1 ? "s" : ""}
                            {doc.file_name ? ` · ${doc.file_name}` : ""}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Preview toggle */}
                          <button
                            onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            title="Preview"
                          >
                            {isExpanded ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>

                          {/* Active toggle */}
                          <button
                            onClick={() => dispatch(toggleKBDocument({ id: doc.id, is_active: !doc.is_active }))}
                            disabled={isToggling}
                            className={`p-1.5 rounded-lg transition-colors ${
                              doc.is_active
                                ? "text-emerald-500 hover:bg-emerald-50"
                                : "text-gray-300 hover:bg-gray-100"
                            }`}
                            title={doc.is_active ? "Disable" : "Enable"}
                          >
                            {isToggling ? <Loader2 size={13} className="animate-spin" /> : (
                              doc.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(doc.id)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        </div>
                      </div>

                      {/* Preview */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3.5 pb-3.5">
                              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                {doc.preview}
                              </p>
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

        {/* ── RIGHT: Chatbot Config ───────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <h2 className="font-bold text-gray-900">Chatbot Configuration</h2>
            <p className="text-xs text-gray-500 mt-0.5">Define what info to collect before promoting to Lead</p>
          </div>

          {isLoadingConfig ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-300" />
            </div>
          ) : (
            <div className="space-y-5">

              {/* Config error */}
              <AnimatePresence>
                {configError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700"
                  >
                    <AlertCircle size={13} className="mt-0.5 flex-shrink-0" /> {configError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Welcome message */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Welcome Message
                </label>
                <textarea
                  value={form.welcome_message}
                  onChange={(e) => setField("welcome_message", e.target.value)}
                  rows={2}
                  placeholder="Hello! 👋 How can I help you today?"
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-colors"
                />
              </div>

              {/* Fallback */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Fallback Message <span className="text-gray-400 font-normal">(when no KB match)</span>
                </label>
                <textarea
                  value={form.fallback_message}
                  onChange={(e) => setField("fallback_message", e.target.value)}
                  rows={2}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-colors"
                />
              </div>

              {/* Human handoff */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Human Handoff Message
                </label>
                <textarea
                  value={form.human_handoff_message}
                  onChange={(e) => setField("human_handoff_message", e.target.value)}
                  rows={2}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-colors"
                />
              </div>

              {/* Qualifying fields */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Qualifying Fields
                </label>
                <p className="text-[11px] text-gray-400 mb-2.5">
                  Bot collects these fields to determine if contact is a Lead
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_FIELDS.map((f) => {
                    const active = form.qualification_fields.includes(f.key);
                    return (
                      <button
                        key={f.key}
                        onClick={() => toggleQualField(f.key)}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                          active
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <span>{f.icon}</span>
                        {f.label}
                        {active && <CheckCircle2 size={11} className="ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lead threshold */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Lead Threshold — Promote to Lead after collecting{" "}
                  <span className="text-gray-900 font-bold">{form.lead_threshold}</span> field
                  {form.lead_threshold !== 1 ? "s" : ""}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={Math.max(form.qualification_fields.length, 1)}
                    value={form.lead_threshold}
                    onChange={(e) => setField("lead_threshold", Number(e.target.value))}
                    className="flex-1 accent-gray-900"
                  />
                  <span className="text-sm font-bold text-gray-900 w-6 text-center">
                    {form.lead_threshold}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <Info size={12} className="text-amber-600 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700">
                    {form.qualification_fields.length === 0
                      ? "Select at least one qualifying field above"
                      : `Contact promoted to Lead once ${form.lead_threshold} of ${form.qualification_fields.length} selected fields are collected`}
                  </p>
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSaveConfig}
                disabled={isSavingConfig || !configDirty}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {isSavingConfig ? (
                  <><Loader2 size={15} className="animate-spin" /> Saving…</>
                ) : (
                  <><Save size={15} /> {configDirty ? "Save Config" : "Config Saved"}</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Upload Modal ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onSubmit={({ title, content, file }) =>
              dispatch(uploadKBDocument({ title, content, file }))
            }
            isUploading={isUploading}
            uploadError={uploadError}
          />
        )}
      </AnimatePresence>

      {/* ── Delete confirm ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 size={18} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Delete Document?</h3>
                  <p className="text-xs text-gray-500 mt-0.5">All chunks will be removed. Cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white"
            style={{ background: toast.type === "success" ? "#059669" : "#1f2937" }}
          >
            {toast.type === "success" ? <CheckCircle2 size={16} /> : <Info size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeBase;