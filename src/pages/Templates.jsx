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
  Plus, RefreshCw, Trash2, CheckCircle2, XCircle, Clock,
  PauseCircle, X, AlertCircle, Loader2, FileText, RotateCcw,
  Eye, Info, Pencil, ChevronDown, MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  APPROVED: { label: "Approved", icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  PENDING:  { label: "Pending",  icon: Clock,         bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-400"  },
  REJECTED: { label: "Rejected", icon: XCircle,       bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200",    dot: "bg-red-500"    },
  PAUSED:   { label: "Paused",   icon: PauseCircle,   bg: "bg-gray-50",    text: "text-gray-600",   border: "border-gray-200",   dot: "bg-gray-400"   },
};

const getStatus = (key) =>
  STATUS_CONFIG[key] ?? { label: key ?? "Unknown", icon: Info, bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200", dot: "bg-gray-400" };

const CATEGORY_COLORS = {
  MARKETING:      { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  UTILITY:        { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  AUTHENTICATION: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
};
const getCategoryStyle = (cat) =>
  CATEGORY_COLORS[cat] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" };

const FILTER_TABS = ["ALL", "APPROVED", "PENDING", "REJECTED", "PAUSED"];

const EMPTY_FORM = {
  name: "", category: "UTILITY", language: "en",
  header_type: "", header_text: "", body_text: "", footer_text: "", buttons: [],
};

// ── StatusBadge ───────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = getStatus(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ── WhatsApp Preview Bubble ───────────────────────────────────────────────────

const WhatsAppPreview = ({ template }) => (
  <div className="rounded-xl overflow-hidden border border-gray-100" style={{ background: "#e5ddd5" }}>
    <div className="p-4 space-y-1.5">
      {template.header_type === "TEXT" && template.header_text && (
        <div className="bg-white rounded-xl px-3 py-2.5 shadow-sm max-w-[88%]">
          <p className="text-xs font-bold text-gray-900">{template.header_text}</p>
        </div>
      )}
      {template.header_type && template.header_type !== "TEXT" && (
        <div className="bg-white rounded-xl px-3 py-2.5 shadow-sm max-w-[88%] flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <FileText size={14} className="text-gray-400" />
          </div>
          <p className="text-[11px] text-gray-400 uppercase font-semibold">{template.header_type} header</p>
        </div>
      )}

      <div className="bg-white rounded-xl px-3 py-2.5 shadow-sm max-w-[88%]">
        {template.body_text ? (
          <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">{template.body_text}</p>
        ) : (
          <p className="text-xs text-gray-400 italic">No body text</p>
        )}
        {template.footer_text && (
          <p className="text-[10px] text-gray-400 mt-1.5 border-t border-gray-100 pt-1">{template.footer_text}</p>
        )}
        <p className="text-[9px] text-gray-300 text-right mt-1.5">12:00 ✓✓</p>
      </div>

      {template.buttons?.length > 0 && (
        <div className="space-y-1 max-w-[88%]">
          {template.buttons.map((btn, i) => (
            <div key={i} className="bg-white rounded-xl px-3 py-2 shadow-sm text-center">
              <span className="text-xs font-medium text-blue-500">{btn.text || btn.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ── Preview Modal ─────────────────────────────────────────────────────────────

const PreviewModal = ({ template, onClose, onEdit }) => {
  const catStyle = getCategoryStyle(template.category);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <MessageSquare size={15} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">{template.name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                  {template.category}
                </span>
                <span className="text-[10px] text-gray-400 font-mono uppercase">{template.language}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Preview area */}
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">WhatsApp Preview</p>
          <WhatsAppPreview template={template} />
        </div>

        {/* Meta info */}
        <div className="px-5 pb-4 grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-gray-400 font-medium">Status</p>
            <div className="mt-1"><StatusBadge status={template.status} /></div>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-gray-400 font-medium">Variables</p>
            <p className="text-sm font-bold text-gray-700 mt-0.5">{template.variables_count ?? 0}</p>
          </div>
          {template.template_id && (
            <div className="col-span-2 bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-400 font-medium">Meta ID</p>
              <p className="text-[11px] font-mono text-gray-600 mt-0.5 truncate">{template.template_id}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/60">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => { onClose(); onEdit(template); }}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            <Pencil size={13} /> Edit
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Template Form (shared by Create + Edit) ───────────────────────────────────

const TemplateForm = ({ initial = EMPTY_FORM, isEdit = false, onSubmit, onClose, isSubmitting, submitError }) => {
  const [form, setForm] = useState(initial);
  const [buttonInput, setButtonInput] = useState("");
  const [errors, setErrors] = useState({});

  const set = (key, val) => { setForm((f) => ({ ...f, [key]: val })); setErrors((e) => ({ ...e, [key]: undefined })); };

  const addButton = () => {
    const text = buttonInput.trim();
    if (!text || form.buttons.length >= 3) return;
    setForm((f) => ({ ...f, buttons: [...f.buttons, { type: "QUICK_REPLY", text }] }));
    setButtonInput("");
  };
  const removeButton = (i) => setForm((f) => ({ ...f, buttons: f.buttons.filter((_, idx) => idx !== i) }));

  const validate = () => {
    const e = {};
    if (!isEdit && !form.name.trim()) e.name = "Template name is required";
    if (!form.body_text.trim())       e.body_text = "Body text is required";
    if (form.header_type === "TEXT" && !form.header_text.trim()) e.header_text = "Header text required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">{isEdit ? "Edit Template" : "Create Template"}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit ? "Updates CRM fields · Re-submit to Meta for content changes" : "Submitted to Meta for review · Use {{1}} for variables"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <AnimatePresence>
            {submitError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">{submitError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name + Language */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Template Name {!isEdit && <span className="text-red-500">*</span>}
              </label>
              {isEdit ? (
                <div className="w-full text-sm px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-400 select-none">
                  {form.name} <span className="text-[10px]">(read-only)</span>
                </div>
              ) : (
                <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. order_confirmation"
                  className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`} />
              )}
              {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
              {!isEdit && <p className="text-[10px] text-gray-400 mt-1">Lowercase, underscores only</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Language</label>
              <select value={form.language} onChange={(e) => set("language", e.target.value)}
                disabled={isEdit}
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors appearance-none disabled:opacity-60">
                <option value="en">English (en)</option>
                <option value="en_US">English US (en_US)</option>
                <option value="en_GB">English UK (en_GB)</option>
                <option value="hi">Hindi (hi)</option>
                <option value="gu">Gujarati (gu)</option>
                <option value="mr">Marathi (mr)</option>
                <option value="ta">Tamil (ta)</option>
                <option value="te">Telugu (te)</option>
                <option value="ar">Arabic (ar)</option>
                <option value="es">Spanish (es)</option>
                <option value="pt_BR">Portuguese BR (pt_BR)</option>
                <option value="fr">French (fr)</option>
                <option value="de">German (de)</option>
                <option value="id">Indonesian (id)</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {["UTILITY", "MARKETING", "AUTHENTICATION"].map((cat) => {
                const s = getCategoryStyle(cat);
                return (
                  <button key={cat} type="button" onClick={() => !isEdit && set("category", cat)} disabled={isEdit}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all disabled:cursor-not-allowed ${form.category === cat ? `${s.bg} ${s.text} ${s.border} ring-2 ring-offset-1 ring-current` : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Header */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Header <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {["", "TEXT", "IMAGE", "VIDEO", "DOCUMENT"].map((ht) => (
                <button key={ht || "NONE"} type="button" onClick={() => set("header_type", ht)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.header_type === ht ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}>
                  {ht || "None"}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {form.header_type === "TEXT" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <input type="text" value={form.header_text} onChange={(e) => set("header_text", e.target.value)}
                    placeholder="Header text (max 60 chars)" maxLength={60}
                    className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors ${errors.header_text ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`} />
                  {errors.header_text && <p className="text-[11px] text-red-600 mt-1">{errors.header_text}</p>}
                </motion.div>
              )}
              {form.header_type && form.header_type !== "TEXT" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    {form.header_type} media URL will be provided at send-time.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Body Text <span className="text-red-500">*</span></label>
            <textarea value={form.body_text} onChange={(e) => set("body_text", e.target.value)}
              placeholder={"Hello {{1}}, your order {{2}} has been confirmed."} rows={4}
              className={`w-full text-sm px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors resize-none ${errors.body_text ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`} />
            <div className="flex items-center justify-between mt-1">
              {errors.body_text ? <p className="text-[11px] text-red-600">{errors.body_text}</p> : <p className="text-[10px] text-gray-400">Use {"{{1}}"}, {"{{2}}"} … for variables</p>}
              <p className="text-[10px] text-gray-400">{form.body_text.length}/1024</p>
            </div>
          </div>

          {/* Footer */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Footer <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" value={form.footer_text} onChange={(e) => set("footer_text", e.target.value)}
              placeholder="e.g. Reply STOP to unsubscribe" maxLength={60}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors" />
          </div>

          {/* Buttons */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Quick Reply Buttons <span className="text-gray-400 font-normal">(optional · max 3)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={buttonInput} onChange={(e) => setButtonInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addButton()} placeholder="Button label…" maxLength={25}
                disabled={form.buttons.length >= 3}
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-40 transition-colors" />
              <button type="button" onClick={addButton} disabled={!buttonInput.trim() || form.buttons.length >= 3}
                className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors">
                Add
              </button>
            </div>
            {form.buttons.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {form.buttons.map((btn, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-xs font-medium text-blue-700">{btn.text}</span>
                    <button type="button" onClick={() => removeButton(i)} className="text-blue-400 hover:text-red-500 transition-colors"><X size={11} strokeWidth={3} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
          <button onClick={onClose} disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-60 transition-colors">
            {isSubmitting ? <><Loader2 size={14} className="animate-spin" />{isEdit ? "Saving…" : "Submitting…"}</> : isEdit ? <><Pencil size={14} />Save Changes</> : <><FileText size={14} />Create & Submit to Meta</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

const DeleteConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Trash2 size={18} className="text-red-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Delete Template?</h3>
          <p className="text-xs text-gray-500 mt-0.5">This will remove it from Meta too. Cannot be undone.</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
      </div>
    </motion.div>
  </div>
);

// ── Table Row ─────────────────────────────────────────────────────────────────

const TableRow = ({ template, idx, onPreview, onEdit, onSync, onDelete, isDeletingId, isSyncingId }) => {
  const isDeleting = isDeletingId === template.id;
  const isSyncing  = isSyncingId  === template.id;
  const catStyle   = getCategoryStyle(template.category);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, delay: idx * 0.03 }}
      className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors group"
    >
      {/* # */}
      <td className="pl-4 pr-2 py-3 text-center">
        <span className="text-[11px] text-gray-400 font-mono">{idx + 1}</span>
      </td>

      {/* Name */}
      <td className="px-3 py-3 max-w-[180px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-gray-900 truncate">{template.name}</span>
          {template.template_id && (
            <span className="text-[10px] font-mono text-gray-400 truncate">ID: {template.template_id}</span>
          )}
        </div>
      </td>

      {/* Category */}
      <td className="px-3 py-3">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
          {template.category}
        </span>
      </td>

      {/* Language */}
      <td className="px-3 py-3">
        <span className="text-xs font-mono text-gray-600 uppercase">{template.language}</span>
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <StatusBadge status={template.status} />
      </td>

      {/* Body preview */}
      <td className="px-3 py-3 max-w-[220px]">
        <p className="text-xs text-gray-500 truncate">
          {template.body_text || <span className="italic text-gray-300">—</span>}
        </p>
      </td>

      {/* Variables */}
      <td className="px-3 py-3 text-center">
        {template.variables_count > 0 ? (
          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
            {template.variables_count}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-3 py-3 pr-4">
        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          {/* Preview */}
          <button onClick={() => onPreview(template)} title="Preview"
            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
            <Eye size={14} />
          </button>

          {/* Edit */}
          <button onClick={() => onEdit(template)} title="Edit"
            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Pencil size={14} />
          </button>

          {/* Sync */}
          <button onClick={() => onSync(template.id)} disabled={isSyncing || isDeleting} title="Sync from Meta"
            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40">
            {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
          </button>

          {/* Delete */}
          <button onClick={() => onDelete(template.id)} disabled={isDeleting || isSyncing} title="Delete"
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40">
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const Templates = () => {
  const dispatch = useDispatch();
  const {
    list, count, isLoading,
    isCreating, isUpdatingId, isDeletingId, isSyncingId, isSyncingAll,
    createSuccess, updateSuccess, syncAllResult,
    error, createError, updateError,
  } = useSelector((s) => s.templates);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTemplate, setEditTemplate]       = useState(null);   // template object or null
  const [previewTemplate, setPreviewTemplate] = useState(null);   // template object or null
  const [activeFilter, setActiveFilter]       = useState("ALL");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMsg, setToastMsg]               = useState(null);

  useEffect(() => { dispatch(fetchTemplates()); }, [dispatch]);

  useEffect(() => {
    if (createSuccess) {
      setShowCreateModal(false);
      dispatch(fetchTemplates());
      showToast("Template submitted to Meta for review ✓", "success");
      dispatch(clearCreateSuccess());
    }
  }, [createSuccess, dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      setEditTemplate(null);
      showToast("Template updated ✓", "success");
      dispatch(clearUpdateSuccess());
    }
  }, [updateSuccess, dispatch]);

  useEffect(() => {
    if (syncAllResult) {
      const { synced_from_meta, updated_locally, created_locally } = syncAllResult;
      const parts = [`Synced ${synced_from_meta} from Meta`];
      if (created_locally) parts.push(`${created_locally} created`);
      if (updated_locally) parts.push(`${updated_locally} updated`);
      showToast(parts.join(" · "), "info");
      dispatch(clearSyncAllResult());
    }
  }, [syncAllResult, dispatch]);

  const showToast = useCallback((msg, type = "info") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 4000);
  }, []);

  const handleCreate = (formData) => dispatch(createTemplate(formData));

  const handleEditSubmit = (formData) => {
    const payload = {
      header_type:     formData.header_type,
      header_text:     formData.header_text,
      body_text:       formData.body_text,
      footer_text:     formData.footer_text,
      buttons:         formData.buttons,
    };
    dispatch(updateTemplate({ id: editTemplate.id, payload }));
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;
    dispatch(deleteTemplate(deleteConfirmId)).then((res) => {
      if (!res.error) showToast("Template deleted.", "info");
    });
    setDeleteConfirmId(null);
  };

  const handleSync = (id) => {
    dispatch(syncTemplate(id)).then((res) => {
      if (res.payload?.synced) showToast(`Status updated: ${res.payload.status}`, "success");
    });
  };

  const filtered = activeFilter === "ALL" ? list : list.filter((t) => t.status === activeFilter);
  const counts = list.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-5">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {count} template{count !== 1 ? "s" : ""} · Submit for Meta review before sending
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => dispatch(syncAllTemplates())} disabled={isSyncingAll || isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm">
            {isSyncingAll ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Sync All
          </button>
          <button onClick={() => { dispatch(clearCreateSuccess()); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-sm">
            <Plus size={16} /> New Template
          </button>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="flex-1 text-sm text-red-700">{error}</p>
            <button onClick={() => dispatch(clearError())} className="text-red-400 hover:text-red-600"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter tabs ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab;
          const tabCount = tab === "ALL" ? list.length : (counts[tab] || 0);
          return (
            <button key={tab} onClick={() => setActiveFilter(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isActive ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
              {tab}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {tabCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      {isLoading && list.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gray-300" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <FileText size={40} strokeWidth={1.2} className="opacity-30" />
          <p className="text-sm font-medium">
            {activeFilter === "ALL" ? "No templates yet" : `No ${activeFilter.toLowerCase()} templates`}
          </p>
          {activeFilter === "ALL" && (
            <button onClick={() => setShowCreateModal(true)}
              className="mt-2 text-sm text-gray-900 font-semibold underline underline-offset-2">
              Create your first template →
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="pl-4 pr-2 py-2.5 text-center w-8">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">#</span>
                  </th>
                  <th className="px-3 py-2.5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Name</span>
                  </th>
                  <th className="px-3 py-2.5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Category</span>
                  </th>
                  <th className="px-3 py-2.5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Language</span>
                  </th>
                  <th className="px-3 py-2.5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</span>
                  </th>
                  <th className="px-3 py-2.5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Body Preview</span>
                  </th>
                  <th className="px-3 py-2.5 text-center">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Vars</span>
                  </th>
                  <th className="px-3 py-2.5 pr-4">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((t, i) => (
                    <TableRow
                      key={t.id}
                      template={t}
                      idx={i}
                      onPreview={setPreviewTemplate}
                      onEdit={setEditTemplate}
                      onSync={handleSync}
                      onDelete={setDeleteConfirmId}
                      isDeletingId={isDeletingId}
                      isSyncingId={isSyncingId}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
              Showing {filtered.length} of {list.length} template{list.length !== 1 ? "s" : ""}
            </p>
            <p className="text-[11px] text-gray-400">Click <Eye size={10} className="inline" /> to preview · <Pencil size={10} className="inline" /> to edit</p>
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <TemplateForm
            key="create"
            isEdit={false}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreate}
            isSubmitting={isCreating}
            submitError={createError}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editTemplate && (
          <TemplateForm
            key="edit"
            isEdit={true}
            initial={{
              name:        editTemplate.name,
              category:    editTemplate.category,
              language:    editTemplate.language,
              header_type: editTemplate.header_type || "",
              header_text: editTemplate.header_text || "",
              body_text:   editTemplate.body_text   || "",
              footer_text: editTemplate.footer_text || "",
              buttons:     editTemplate.buttons     || [],
            }}
            onClose={() => setEditTemplate(null)}
            onSubmit={handleEditSubmit}
            isSubmitting={isUpdatingId === editTemplate.id}
            submitError={updateError}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewTemplate && (
          <PreviewModal
            key="preview"
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            onEdit={(t) => { setPreviewTemplate(null); setEditTemplate(t); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmId && (
          <DeleteConfirmModal key="delete" onConfirm={handleDeleteConfirm} onCancel={() => setDeleteConfirmId(null)} />
        )}
      </AnimatePresence>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white"
            style={{ background: toastMsg.type === "success" ? "#059669" : "#1f2937" }}
          >
            {toastMsg.type === "success" ? <CheckCircle2 size={16} /> : <Info size={16} />}
            {toastMsg.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Templates;