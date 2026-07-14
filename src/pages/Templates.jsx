import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  syncTemplate,
  syncAllTemplates,
  clearCreateSuccess,
  clearUpdateSuccess,
  clearSyncAllResult,
  clearError,
} from "../store/templateSlice";

import {
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  PauseCircle,
  X,
  AlertCircle,
  Loader2,
  FileText,
  RotateCcw,
  Eye,
  Info,
  Pencil,
  MessageSquare,
  ChevronDown,
  PlusCircle,
  Minus,
  Image,
  Film,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

/* -------------------------------------------------------------------------- */
/* STATUS CONFIG                                                                */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG = {
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  PAUSED: {
    label: "Paused",
    icon: PauseCircle,
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
};

const getStatus = (key) =>
  STATUS_CONFIG[key] ?? {
    label: key ?? "Unknown",
    icon: Info,
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
    dot: "bg-gray-400",
  };

const CATEGORY_COLORS = {
  MARKETING: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
  },
  UTILITY: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  AUTHENTICATION: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
};

const getCategoryStyle = (cat) =>
  CATEGORY_COLORS[cat] ?? {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  };

const FILTER_TABS = ["ALL", "APPROVED", "PENDING", "REJECTED", "PAUSED"];

const EMPTY_FORM = {
  name: "",
  category: "UTILITY",
  language: "en",
  header_type: "",
  header_text: "",
  body_text: "",
  footer_text: "",
  buttons: [],
};

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "en_US", label: "English (US)" },
  { value: "hi", label: "Hindi" },
  { value: "gu", label: "Gujarati" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "bn", label: "Bengali" },
  { value: "pa", label: "Punjabi" },
];

/* -------------------------------------------------------------------------- */
/* STATUS BADGE                                                                 */
/* -------------------------------------------------------------------------- */

const StatusBadge = ({ status }) => {
  const cfg = getStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* WHATSAPP PREVIEW                                                             */
/* -------------------------------------------------------------------------- */

const WhatsAppPreview = ({ template }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-[#efeae2] overflow-hidden">
      <div className="p-4 space-y-2">
        {template.header_type === "TEXT" && template.header_text && (
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm max-w-[85%]">
            <p className="text-sm font-bold text-gray-800">{template.header_text}</p>
          </div>
        )}

        {["IMAGE", "VIDEO", "DOCUMENT"].includes(template.header_type) && (
          <div className="bg-gray-200 rounded-2xl h-32 flex flex-col items-center justify-center shadow-sm max-w-[85%] text-gray-400 overflow-hidden relative">
            {template.header_type === "IMAGE" && template.example_media instanceof File ? (
              <img src={URL.createObjectURL(template.example_media)} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <>
                {template.header_type === "IMAGE" && <Image size={32} />}
                {template.header_type === "VIDEO" && <Film size={32} />}
                {template.header_type === "DOCUMENT" && <FileText size={32} />}
                <span className="text-xs font-semibold mt-2">{template.header_type}</span>
              </>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm max-w-[85%]">
          {template.body_text ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {template.body_text}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">No body text</p>
          )}

          {template.footer_text && (
            <p className="text-xs text-gray-400 mt-3 border-t pt-2">{template.footer_text}</p>
          )}
        </div>

        {template.buttons?.length > 0 && (
          <div className="space-y-2 max-w-[85%]">
            {template.buttons.map((btn, i) => (
              <div key={i} className="bg-white rounded-xl py-2 text-center shadow-sm">
                <span className="text-sm font-medium text-blue-600">{btn.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* TEMPLATE FORM (shared by Create & Edit modals)                              */
/* -------------------------------------------------------------------------- */

const TemplateForm = ({ form, onChange, onFileChange, onButtonAdd, onButtonRemove, onButtonChange, disabled }) => {
  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
          Template Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          disabled={disabled}
          placeholder="e.g. order_confirmation"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
        />
        <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers, and underscores only.</p>
      </div>

      {/* Category + Language */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={form.category}
              onChange={(e) => onChange("category", e.target.value)}
              disabled={disabled}
              className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white disabled:bg-gray-50"
            >
              <option value="UTILITY">Utility</option>
              <option value="MARKETING">Marketing</option>
              <option value="AUTHENTICATION">Authentication</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Language <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={form.language}
              onChange={(e) => onChange("language", e.target.value)}
              disabled={disabled}
              className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white disabled:bg-gray-50"
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
          Header (Optional)
        </label>
        <div className="relative mb-2">
          <select
            value={form.header_type}
            onChange={(e) => onChange("header_type", e.target.value)}
            disabled={disabled}
            className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white disabled:bg-gray-50"
          >
            <option value="">None</option>
            <option value="TEXT">Text</option>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
            <option value="DOCUMENT">Document</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {form.header_type === "TEXT" && (
          <input
            type="text"
            value={form.header_text}
            onChange={(e) => onChange("header_text", e.target.value)}
            disabled={disabled}
            placeholder="Header text…"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 disabled:bg-gray-50"
          />
        )}

        {["IMAGE", "VIDEO", "DOCUMENT"].includes(form.header_type) && (
          <div className="mt-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Sample {form.header_type.toLowerCase()} <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              onChange={(e) => onFileChange && onFileChange(e.target.files[0])}
              disabled={disabled}
              accept={
                form.header_type === "IMAGE" ? "image/jpeg, image/png" :
                form.header_type === "VIDEO" ? "video/mp4" :
                "application/pdf"
              }
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
            />
            <p className="text-xs text-gray-400 mt-1">
              Meta requires a sample file for review. Max size: 16MB.
            </p>
          </div>
        )}
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
          Body <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.body_text}
          onChange={(e) => onChange("body_text", e.target.value)}
          disabled={disabled}
          rows={4}
          placeholder="Hi {{1}}, your order {{2}} has been confirmed!"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 resize-none disabled:bg-gray-50"
        />
        <p className="text-xs text-gray-400 mt-1">
          Use <code className="bg-gray-100 px-1 rounded">{"{{1}}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{{2}}"}</code>… for dynamic variables.
        </p>
      </div>

      {/* Footer */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
          Footer (Optional)
        </label>
        <input
          type="text"
          value={form.footer_text}
          onChange={(e) => onChange("footer_text", e.target.value)}
          disabled={disabled}
          placeholder="Reply STOP to unsubscribe"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 disabled:bg-gray-50"
        />
      </div>

      {/* Buttons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Buttons (Optional)
          </label>
          {form.buttons.length < 3 && (
            <button
              type="button"
              onClick={onButtonAdd}
              disabled={disabled}
              className="flex items-center gap-1 text-xs text-green-600 font-medium hover:text-green-700 disabled:opacity-50"
            >
              <PlusCircle size={13} />
              Add Button
            </button>
          )}
        </div>

        <div className="space-y-2">
          {form.buttons.map((btn, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={btn.text}
                onChange={(e) => onButtonChange(i, "text", e.target.value)}
                disabled={disabled}
                placeholder={`Button ${i + 1} label`}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={() => onButtonRemove(i)}
                disabled={disabled}
                className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
              >
                <Minus size={14} />
              </button>
            </div>
          ))}
        </div>

        {form.buttons.length === 0 && (
          <p className="text-xs text-gray-400">No buttons added.</p>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* CREATE TEMPLATE MODAL                                                        */
/* -------------------------------------------------------------------------- */

const CreateTemplateModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { isCreating, createSuccess, createError } = useSelector((s) => s.templates);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [exampleMedia, setExampleMedia] = useState(null);
  const [localError, setLocalError] = useState("");

  // Close automatically on success
  useEffect(() => {
    if (createSuccess) {
      dispatch(fetchTemplates());
      dispatch(clearCreateSuccess());
      onClose();
    }
  }, [createSuccess, dispatch, onClose]);

  const handleChange = (field, value) => {
    setLocalError("");
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleButtonAdd = () => {
    setForm((prev) => ({
      ...prev,
      buttons: [...prev.buttons, { type: "QUICK_REPLY", text: "" }],
    }));
  };

  const handleButtonRemove = (idx) => {
    setForm((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== idx),
    }));
  };

  const handleButtonChange = (idx, field, value) => {
    setForm((prev) => {
      const btns = [...prev.buttons];
      btns[idx] = { ...btns[idx], [field]: value };
      return { ...prev, buttons: btns };
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return setLocalError("Template name is required.");
    if (!form.body_text.trim()) return setLocalError("Body text is required.");
    
    if (["IMAGE", "VIDEO", "DOCUMENT"].includes(form.header_type) && !exampleMedia) {
      return setLocalError("A sample file is required for media headers.");
    }

    // Sanitise name: lowercase + underscores
    const finalName = form.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    
    if (exampleMedia) {
      const formData = new FormData();
      formData.append("name", finalName);
      formData.append("category", form.category);
      formData.append("language", form.language);
      formData.append("header_type", form.header_type);
      formData.append("header_text", form.header_text);
      formData.append("body_text", form.body_text);
      formData.append("footer_text", form.footer_text);
      formData.append("buttons", JSON.stringify(form.buttons));
      formData.append("example_media", exampleMedia);
      
      dispatch(createTemplate(formData));
    } else {
      const payload = {
        ...form,
        name: finalName,
      };
      dispatch(createTemplate(payload));
    }
  };

  const errorMsg = localError || createError;

  // Live preview from form
  const previewTemplate = {
    header_type: form.header_type,
    header_text: form.header_text,
    body_text: form.body_text,
    footer_text: form.footer_text,
    buttons: form.buttons,
    example_media: exampleMedia,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center">
              <Plus size={18} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">New Template</h2>
              <p className="text-xs text-gray-400 mt-0.5">Submit to Meta for review</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body — two-column */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Left: form */}
            <div className="p-6 overflow-y-auto">
              <TemplateForm
                form={form}
                onChange={handleChange}
                onFileChange={setExampleMedia}
                onButtonAdd={handleButtonAdd}
                onButtonRemove={handleButtonRemove}
                onButtonChange={handleButtonChange}
                disabled={isCreating}
              />
            </div>

            {/* Right: live preview */}
            <div className="p-6 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Live Preview
              </p>
              <WhatsAppPreview template={previewTemplate} />

              {form.body_text && (
                <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-400 mb-1">Variables detected</p>
                  <p className="text-xl font-bold text-gray-700">
                    {(form.body_text.match(/\{\{\d+\}\}/g) || []).length}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mx-6 mb-0 mt-0 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 shrink-0">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-gray-100 bg-white shrink-0">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="flex-1 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit to Meta"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* EDIT TEMPLATE MODAL                                                          */
/* -------------------------------------------------------------------------- */

const EditTemplateModal = ({ template, onClose }) => {
  const dispatch = useDispatch();
  const { isUpdatingId, updateSuccess, updateError } = useSelector((s) => s.templates);

  const isUpdating = isUpdatingId === template.id;

  const [form, setForm] = useState({
    header_type: template.header_type || "",
    header_text: template.header_text || "",
    body_text: template.body_text || "",
    footer_text: template.footer_text || "",
    buttons: template.buttons || [],
  });
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (updateSuccess) {
      dispatch(clearUpdateSuccess());
      onClose();
    }
  }, [updateSuccess, dispatch, onClose]);

  const handleChange = (field, value) => {
    setLocalError("");
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleButtonAdd = () => {
    setForm((prev) => ({
      ...prev,
      buttons: [...prev.buttons, { type: "QUICK_REPLY", text: "" }],
    }));
  };

  const handleButtonRemove = (idx) => {
    setForm((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== idx),
    }));
  };

  const handleButtonChange = (idx, field, value) => {
    setForm((prev) => {
      const btns = [...prev.buttons];
      btns[idx] = { ...btns[idx], [field]: value };
      return { ...prev, buttons: btns };
    });
  };

  const handleSave = () => {
    if (!form.body_text.trim()) return setLocalError("Body text is required.");

    const varCount = (form.body_text.match(/\{\{\d+\}\}/g) || []).length;

    dispatch(
      updateTemplate({
        id: template.id,
        payload: { ...form, variables_count: varCount },
      })
    );
  };

  const errorMsg = localError || updateError;

  const previewTemplate = {
    header_type: form.header_type,
    header_text: form.header_text,
    body_text: form.body_text,
    footer_text: form.footer_text,
    buttons: form.buttons,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Pencil size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Edit Template</h2>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{template.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={template.status} />
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition ml-1">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Note about name/category being locked */}
        <div className="mx-6 mt-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 flex items-start gap-2 shrink-0">
          <Info size={14} className="text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-700">
            Template name, category, and language cannot be changed after submission.
            Only body, header, footer, and buttons are editable here.
          </p>
        </div>

        {/* Body — two-column */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Left: editable fields only */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Locked fields shown as read-only */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Category
                  </label>
                  <div className={`px-4 py-2.5 rounded-xl border text-sm font-medium ${getCategoryStyle(template.category).bg} ${getCategoryStyle(template.category).text} ${getCategoryStyle(template.category).border}`}>
                    {template.category}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Language
                  </label>
                  <div className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 uppercase">
                    {template.language}
                  </div>
                </div>
              </div>

              {/* Editable fields */}
              <TemplateForm
                form={form}
                onChange={handleChange}
                onButtonAdd={handleButtonAdd}
                onButtonRemove={handleButtonRemove}
                onButtonChange={handleButtonChange}
                disabled={isUpdating}
              />
            </div>

            {/* Right: live preview */}
            <div className="p-6 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Live Preview
              </p>
              <WhatsAppPreview template={previewTemplate} />
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mx-6 mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 shrink-0">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-gray-100 bg-white shrink-0">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* PREVIEW MODAL                                                                */
/* -------------------------------------------------------------------------- */

const PreviewModal = ({ template, onClose, onEdit }) => {
  const catStyle = getCategoryStyle(template.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center">
              <MessageSquare size={18} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{template.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-1 rounded-full border text-[10px] font-bold uppercase ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                >
                  {template.category}
                </span>
                <span className="text-xs text-gray-400 uppercase">{template.language}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <WhatsAppPreview template={template} />
          </div>

          <div className="px-6 pb-6 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400">Status</p>
              <div className="mt-2">
                <StatusBadge status={template.status} />
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400">Variables</p>
              <p className="text-lg font-bold text-gray-700 mt-1">{template.variables_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(template);
            }}
            className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
          >
            Edit Template
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* TEMPLATE ROW                                                                 */
/* -------------------------------------------------------------------------- */

const TableRow = ({ template, idx, onPreview, onEdit, onSync, onDelete, isDeletingId, isSyncingId }) => {
  const isDeleting = isDeletingId === template.id;
  const isSyncing = isSyncingId === template.id;
  const catStyle = getCategoryStyle(template.category);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-all">
      <td className="px-4 py-4 text-xs text-gray-400">{idx + 1}</td>

      <td className="px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">{template.name}</p>
          <p className="text-xs text-gray-400 mt-1">{template.template_id || "No Meta ID"}</p>
        </div>
      </td>

      <td className="px-4 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
          {template.category}
        </span>
      </td>

      <td className="px-4 py-4">
        <span className="text-sm text-gray-600 uppercase">{template.language}</span>
      </td>

      <td className="px-4 py-4">
        <StatusBadge status={template.status} />
      </td>

      <td className="px-4 py-4 max-w-[260px]">
        <p className="text-sm text-gray-500 truncate">{template.body_text || "—"}</p>
      </td>

      <td className="px-4 py-4 text-center">
        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
          {template.variables_count || 0}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreview(template)}
            className="p-2 rounded-xl hover:bg-green-50 text-gray-500 hover:text-green-600 transition"
            title="Preview"
          >
            <Eye size={15} />
          </button>

          <button
            onClick={() => onEdit(template)}
            className="p-2 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition"
            title="Edit"
          >
            <Pencil size={15} />
          </button>


          <button
            onClick={() => onDelete(template.id)}
            disabled={isDeleting}
            className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition disabled:opacity-50"
            title="Delete"
          >
            {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
        </div>
      </td>
    </tr>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN                                                                         */
/* -------------------------------------------------------------------------- */

const Templates = () => {
  const dispatch = useDispatch();

  const {
    list,
    count,
    isLoading,
    isCreating,
    isUpdatingId,
    isDeletingId,
    isSyncingId,
    isSyncingAll,
    createSuccess,
    updateSuccess,
    syncAllResult,
    error,
  } = useSelector((s) => s.templates);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [editTemplate, setEditTemplate] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const filtered =
    activeFilter === "ALL" ? list : list.filter((t) => t.status === activeFilter);

  return (
    <div className="min-h-screen bg-[#f7f8fc] p-4 lg:p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Manage WhatsApp templates</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(syncAllTemplates())}
            disabled={isSyncingAll}
            className="h-11 px-4 rounded-2xl bg-white border border-gray-200 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
          >
            {isSyncingAll ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Sync All
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="h-11 px-5 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold flex items-center gap-2 transition"
          >
            <Plus size={16} />
            New Template
          </button>
        </div>
      </div>

      {/* SYNC-ALL RESULT BANNER */}
      <AnimatePresence>
        {syncAllResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-green-600" />
              <p className="text-sm text-green-700">
                Sync complete — <strong>{syncAllResult.synced_from_meta}</strong> from Meta,{" "}
                <strong>{syncAllResult.updated_locally}</strong> updated,{" "}
                <strong>{syncAllResult.created_locally}</strong> new.
              </p>
            </div>
            <button onClick={() => dispatch(clearSyncAllResult())} className="text-green-400 hover:text-green-600">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTERS */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${activeFilter === tab
              ? "bg-green-600 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Something went wrong</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <button onClick={() => dispatch(clearError())} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex justify-center">
            <Loader2 size={28} className="animate-spin text-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <FileText size={50} className="mx-auto text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 mt-4">No templates found</h3>
            <p className="text-sm text-gray-500 mt-1">Create your first template</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["ID", "Name", "Category", "Language", "Status", "Body", "Vars", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase ${h === "Vars" ? "text-center" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <TableRow
                    key={t.id}
                    template={t}
                    idx={i}
                    onPreview={setPreviewTemplate}
                    onEdit={setEditTemplate}
                    onSync={(id) => dispatch(syncTemplate(id))}
                    onDelete={(id) => dispatch(deleteTemplate(id))}
                    isDeletingId={isDeletingId}
                    isSyncingId={isSyncingId}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTemplateModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editTemplate && (
          <EditTemplateModal
            template={editTemplate}
            onClose={() => setEditTemplate(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewTemplate && (
          <PreviewModal
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            onEdit={(t) => {
              setPreviewTemplate(null);
              setEditTemplate(t);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Templates;