import React, { useEffect, useState } from "react";
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
  Eye,
  Info,
  Pencil,
  MessageSquare,
  ChevronDown,
  Minus,
  Image,
  Film,
  BarChart3,
  Globe,
  Phone,
  Copy,
  Search,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import TemplateAnalyticsModal from "../components/TemplateAnalyticsModal";

/* -------------------------------------------------------------------------- */
/* STATUS & CATEGORY CONFIG                                                   */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG = {
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
    dot: "bg-emerald-500",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/80",
    dot: "bg-amber-500",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200/80",
    dot: "bg-red-500",
  },
  PAUSED: {
    label: "Paused",
    icon: PauseCircle,
    bg: "bg-slate-100",
    text: "text-[#64748B]",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

const getStatus = (key) =>
  STATUS_CONFIG[key] ?? {
    label: key ?? "Unknown",
    icon: Info,
    bg: "bg-slate-100",
    text: "text-[#64748B]",
    border: "border-slate-200",
    dot: "bg-slate-400",
  };

const CATEGORY_COLORS = {
  MARKETING: {
    bg: "bg-purple-50",
    text: "text-[#8B5CF6]",
    border: "border-purple-200/70",
  },
  UTILITY: {
    bg: "bg-blue-50",
    text: "text-[#165DFF]",
    border: "border-blue-200/70",
  },
  AUTHENTICATION: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200/70",
  },
};

const getCategoryStyle = (cat) =>
  CATEGORY_COLORS[cat] ?? {
    bg: "bg-slate-100",
    text: "text-[#64748B]",
    border: "border-slate-200",
  };

const FILTER_TABS = [
  { key: "ALL", label: "All" },
  { key: "APPROVED", label: "Approved", dot: "bg-emerald-500" },
  { key: "PENDING", label: "Pending", dot: "bg-amber-500" },
  { key: "REJECTED", label: "Rejected", dot: "bg-red-500" },
];

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
/* STATUS BADGE                                                               */
/* -------------------------------------------------------------------------- */

const StatusBadge = ({ status }) => {
  const cfg = getStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* WHATSAPP PREVIEW                                                           */
/* -------------------------------------------------------------------------- */

const formatWhatsAppText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <strong key={idx} className="font-bold">
          {part.slice(1, -1)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
};

const WhatsAppPreview = ({ template }) => {
  return (
    <div
      className="rounded-2xl border border-slate-200/80 bg-[#F8FAFC] overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(#CBD5E1 0.75px, transparent 0.75px)`,
        backgroundSize: "18px 18px",
      }}
    >
      <div className="p-4 space-y-2">
        {template.header_type === "TEXT" && template.header_text && (
          <div className="bg-white rounded-2xl px-3.5 py-2.5 border border-slate-200/80 shadow-2xs max-w-[90%]">
            <p className="text-xs font-bold text-[#172033]">
              {formatWhatsAppText(template.header_text)}
            </p>
          </div>
        )}

        {["IMAGE", "VIDEO", "DOCUMENT"].includes(template.header_type) && (
          <div className="bg-slate-100 rounded-2xl h-32 flex flex-col items-center justify-center border border-slate-200/80 shadow-2xs max-w-[90%] text-[#94A3B8] overflow-hidden relative">
            {template.header_type === "IMAGE" &&
            template.example_media instanceof File ? (
              <img
                src={URL.createObjectURL(template.example_media)}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            ) : (
              <>
                {template.header_type === "IMAGE" && <Image size={28} />}
                {template.header_type === "VIDEO" && <Film size={28} />}
                {template.header_type === "DOCUMENT" && <FileText size={28} />}
                <span className="text-[11px] font-semibold mt-1.5">
                  {template.header_type}
                </span>
              </>
            )}
          </div>
        )}

        <div className="bg-[#EFF6FF] rounded-2xl rounded-br-sm px-3.5 py-3 border border-blue-200/70 shadow-2xs max-w-[90%]">
          {template.body_text ? (
            <p className="text-xs text-[#172033] whitespace-pre-wrap leading-relaxed">
              {formatWhatsAppText(template.body_text)}
            </p>
          ) : (
            <p className="text-xs text-[#94A3B8] italic">No body text</p>
          )}

          {template.footer_text && (
            <p className="text-[11px] text-[#64748B] mt-2.5 border-t border-blue-200/60 pt-1.5">
              {formatWhatsAppText(template.footer_text)}
            </p>
          )}
        </div>

        {template.buttons?.length > 0 && (
          <div className="space-y-1.5 max-w-[90%]">
            {template.buttons.map((btn, i) => (
              <div
                key={i}
                className="bg-white rounded-xl py-2 px-3 text-center border border-blue-200/70 shadow-2xs flex items-center justify-center gap-1.5 text-[#165DFF]"
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
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* TEMPLATE FORM (shared by Create & Edit modals)                             */
/* -------------------------------------------------------------------------- */

const TemplateForm = ({
  form,
  onChange,
  onFileChange,
  onButtonAdd,
  onButtonRemove,
  onButtonChange,
  disabled,
  isEditMode = false,
}) => {
  const isAuth = form.category === "AUTHENTICATION";

  const handleCategoryChange = (val) => {
    onChange("category", val);
    if (val === "AUTHENTICATION") {
      onChange("header_type", "");
      onChange("header_text", "");
      onChange(
        "body_text",
        "{{1}} is your verification code. For your security, do not share this code."
      );
      onChange("footer_text", "Expires in 10 minutes.");
      onChange("buttons", [
        {
          type: "OTP",
          otp_type: "COPY_CODE",
          text: "Copy Code",
        },
      ]);
    } else {
      if (
        form.body_text ===
        "{{1}} is your verification code. For your security, do not share this code."
      ) {
        onChange("body_text", "");
      }
      if (form.footer_text === "Expires in 10 minutes.") {
        onChange("footer_text", "");
      }
      if (form.buttons?.some((b) => b.type === "OTP")) {
        onChange("buttons", []);
      }
    }
  };

  const handleFormatBold = (e, field) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const selectedText = val.substring(start, end);

      const newText =
        val.substring(0, start) + `*${selectedText}*` + val.substring(end);
      onChange(field, newText);

      setTimeout(() => {
        target.focus();
        if (start === end) {
          target.setSelectionRange(start + 1, start + 1);
        } else {
          target.setSelectionRange(start + 1, end + 1);
        }
      }, 0);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-slate-50/70 focus:bg-white text-xs text-[#172033] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 transition-all disabled:bg-slate-100 disabled:text-[#94A3B8]";

  const labelCls =
    "block text-[11px] font-semibold text-[#64748B] mb-1.5 uppercase tracking-wider";

  return (
    <div className="space-y-4">
      {!isEditMode && (
        <>
          {/* Name */}
          <div>
            <label className={labelCls}>
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              disabled={disabled}
              placeholder="e.g. otp_verification"
              className={inputCls}
            />
            <p className="text-[11px] text-[#94A3B8] mt-1">
              Lowercase letters, numbers, and underscores only.
            </p>
          </div>

          {/* Category + Language */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className={labelCls}>
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={disabled}
                  className={`${inputCls} appearance-none pr-8`}
                >
                  <option value="MARKETING">Marketing</option>
                  <option value="UTILITY">Utility</option>
                  <option value="AUTHENTICATION">Authentication</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Language <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.language}
                  onChange={(e) => onChange("language", e.target.value)}
                  disabled={disabled}
                  className={`${inputCls} appearance-none pr-8`}
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Authentication Alert */}
      {isAuth && (
        <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800">
          ⚠️ <strong>Authentication Template:</strong> Meta allows only OTP body
          text. Headers, footers, and custom marketing buttons are prohibited.
        </div>
      )}

      {/* Header */}
      {!isAuth && (
        <div>
          <label className={labelCls}>Header (Optional)</label>
          <div className="relative mb-2">
            <select
              value={form.header_type}
              onChange={(e) => onChange("header_type", e.target.value)}
              disabled={disabled}
              className={`${inputCls} appearance-none pr-8`}
            >
              <option value="">None</option>
              <option value="TEXT">Text</option>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="DOCUMENT">Document</option>
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
            />
          </div>

          {form.header_type === "TEXT" && (
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={form.header_text}
                  onChange={(e) => onChange("header_text", e.target.value)}
                  onKeyDown={(e) => handleFormatBold(e, "header_text")}
                  disabled={disabled}
                  placeholder="Header text…"
                  className={`${inputCls} ${
                    (form.header_text || "").length > 60
                      ? "border-red-500 focus:border-red-500 bg-red-50/20"
                      : ""
                  }`}
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px]">
                <span className="text-[#94A3B8]">Press Ctrl+B to bold selected text.</span>
                <span
                  className={`font-semibold ${
                    (form.header_text || "").length > 60
                      ? "text-red-500 font-bold"
                      : (form.header_text || "").length >= 50
                      ? "text-amber-500"
                      : "text-[#94A3B8]"
                  }`}
                >
                  {(form.header_text || "").length}/60
                </span>
              </div>
              {(form.header_text || "").length > 60 && (
                <p className="text-[11px] font-medium text-red-500 mt-0.5">
                  Header text cannot exceed 60 characters (including spaces).
                </p>
              )}
            </div>
          )}

          {["IMAGE", "VIDEO", "DOCUMENT"].includes(form.header_type) && (
            <div className="mt-2">
              <label className={labelCls}>
                Sample {form.header_type.toLowerCase()}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                onChange={(e) => onFileChange && onFileChange(e.target.files[0])}
                disabled={disabled}
                accept={
                  form.header_type === "IMAGE"
                    ? "image/jpeg, image/png"
                    : form.header_type === "VIDEO"
                      ? "video/mp4"
                      : "application/pdf"
                }
                className="w-full px-3 py-1.5 rounded-xl border border-[#E5E7EB] text-xs text-[#172033] bg-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#165DFF] hover:file:bg-blue-100 disabled:opacity-50"
              />
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Meta requires a sample file for review. Max size: 16MB.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Body <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {!isAuth && (
              <span
                className={`text-[10px] font-semibold ${
                  (form.body_text || "").length > 1024
                    ? "text-red-500 font-bold"
                    : (form.body_text || "").length >= 950
                    ? "text-amber-500"
                    : "text-[#94A3B8]"
                }`}
              >
                {(form.body_text || "").length}/1024
              </span>
            )}
            {isAuth && (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Fixed Meta Preset
              </span>
            )}
          </div>
        </div>
        <textarea
          value={
            isAuth
              ? "{{1}} is your verification code. For your security, do not share this code."
              : form.body_text
          }
          onChange={(e) => !isAuth && onChange("body_text", e.target.value)}
          onKeyDown={(e) => !isAuth && handleFormatBold(e, "body_text")}
          disabled={disabled || isAuth}
          readOnly={isAuth}
          rows={4}
          placeholder="Hi {{1}}, your order {{2}} has been confirmed!"
          className={`${inputCls} resize-none ${
            isAuth ? "bg-slate-100 text-[#64748B] cursor-not-allowed select-none" : ""
          } ${
            !isAuth && (form.body_text || "").length > 1024
              ? "border-red-500 focus:border-red-500 bg-red-50/20"
              : ""
          }`}
        />
        {(form.body_text || "").length > 1024 && !isAuth && (
          <p className="text-[11px] font-medium text-red-500 mt-1">
            Body text cannot exceed 1024 characters (including spaces).
          </p>
        )}
        <div className="flex justify-between mt-1">
          <p className="text-[10px] text-[#94A3B8]">
            {isAuth ? (
              <span className="text-amber-700">
                🔒 Meta rules require standard fixed OTP text.
              </span>
            ) : (
              <>
                Use{" "}
                <code className="bg-slate-100 px-1 rounded text-[#172033]">
                  {"{{1}}"}
                </code>
                ,{" "}
                <code className="bg-slate-100 px-1 rounded text-[#172033]">
                  {"{{2}}"}
                </code>
                … for dynamic variables.
              </>
            )}
          </p>
          {!isAuth && (
            <p className="text-[10px] text-[#94A3B8]">Ctrl+B for bold</p>
          )}
        </div>
      </div>

      {/* Footer */}
      {!isAuth && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              Footer (Optional)
            </label>
            <span
              className={`text-[10px] font-semibold ${
                (form.footer_text || "").length > 60
                  ? "text-red-500 font-bold"
                  : (form.footer_text || "").length >= 50
                  ? "text-amber-500"
                  : "text-[#94A3B8]"
              }`}
            >
              {(form.footer_text || "").length}/60
            </span>
          </div>
          <input
            type="text"
            value={form.footer_text}
            onChange={(e) => onChange("footer_text", e.target.value)}
            disabled={disabled}
            placeholder="Reply STOP to unsubscribe"
            className={`${inputCls} ${
              (form.footer_text || "").length > 60
                ? "border-red-500 focus:border-red-500 bg-red-50/20"
                : ""
            }`}
          />
          {(form.footer_text || "").length > 60 && (
            <p className="text-[11px] font-medium text-red-500 mt-1">
              Footer text cannot exceed 60 characters (including spaces).
            </p>
          )}
        </div>
      )}

      {/* Buttons */}
      {!isAuth &&
        (() => {
          const totalCount = form.buttons.length;
          const qrCount = form.buttons.filter(
            (b) => b.type === "QUICK_REPLY"
          ).length;
          const urlCount = form.buttons.filter((b) => b.type === "URL").length;
          const phoneCount = form.buttons.filter(
            (b) => b.type === "PHONE_NUMBER"
          ).length;

          const canAddQuickReply = totalCount < 10 && qrCount < 10;
          const canAddUrl = totalCount < 10 && urlCount < 2;
          const canAddPhone = totalCount < 10 && phoneCount < 1;

          return (
            <div>
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    Buttons (Optional — {totalCount}/10)
                  </label>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">
                    Max 2 Website, 1 Phone, up to 10 Quick Replies.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {canAddQuickReply && (
                    <button
                      type="button"
                      onClick={() => onButtonAdd("QUICK_REPLY")}
                      disabled={disabled}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 text-[11px] font-semibold rounded-lg text-[#172033] transition cursor-pointer"
                    >
                      + Quick Reply
                    </button>
                  )}
                  {canAddUrl && (
                    <button
                      type="button"
                      onClick={() => onButtonAdd("URL")}
                      disabled={disabled}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[11px] font-semibold rounded-lg text-[#165DFF] transition cursor-pointer"
                    >
                      + Website
                    </button>
                  )}
                  {canAddPhone && (
                    <button
                      type="button"
                      onClick={() => onButtonAdd("PHONE_NUMBER")}
                      disabled={disabled}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-semibold rounded-lg text-emerald-700 transition cursor-pointer"
                    >
                      + Call Phone
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                {form.buttons.map((btn, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50/80 rounded-xl border border-[#E5E7EB] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#64748B] uppercase flex items-center gap-1">
                        {btn.type === "URL" ? (
                          <>
                            <Globe size={12} className="text-[#165DFF]" /> Visit
                            Website
                          </>
                        ) : btn.type === "PHONE_NUMBER" ? (
                          <>
                            <Phone size={12} className="text-emerald-600" /> Call
                            Phone
                          </>
                        ) : (
                          "💬 Quick Reply"
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => onButtonRemove(i)}
                        disabled={disabled}
                        className="p-1 text-[#94A3B8] hover:text-red-500 rounded transition cursor-pointer"
                      >
                        <Minus size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          value={btn.text}
                          onChange={(e) =>
                            onButtonChange(i, "text", e.target.value)
                          }
                          disabled={disabled}
                          placeholder={
                            btn.type === "QUICK_REPLY"
                              ? "Button text (max 40 chars)"
                              : "Button text (e.g. Visit Us)"
                          }
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs bg-white text-[#172033] focus:outline-none ${
                            btn.type === "QUICK_REPLY" && (btn.text || "").length > 40
                              ? "border-red-500 focus:border-red-500 bg-red-50/20"
                              : "border-[#E5E7EB] focus:border-[#165DFF]"
                          }`}
                        />
                        {btn.type === "QUICK_REPLY" && (
                          <div className="flex items-center justify-between mt-1 text-[10px]">
                            <span
                              className={`font-semibold ${
                                (btn.text || "").length > 40
                                  ? "text-red-500 font-bold"
                                  : "text-[#94A3B8]"
                              }`}
                            >
                              {(btn.text || "").length}/40
                            </span>
                            {(btn.text || "").length > 40 && (
                              <span className="text-red-500 font-medium">
                                Max 40 characters
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {btn.type === "URL" && (
                        <input
                          type="url"
                          value={btn.url || ""}
                          onChange={(e) =>
                            onButtonChange(i, "url", e.target.value)
                          }
                          disabled={disabled}
                          placeholder="https://example.com"
                          className="w-full px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs bg-white text-[#172033] focus:outline-none focus:border-[#165DFF]"
                        />
                      )}

                      {btn.type === "PHONE_NUMBER" && (
                        <input
                          type="tel"
                          value={btn.phone_number || ""}
                          onChange={(e) =>
                            onButtonChange(i, "phone_number", e.target.value)
                          }
                          disabled={disabled}
                          placeholder="+919876543210"
                          className="w-full px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-xs bg-white text-[#172033] focus:outline-none focus:border-[#165DFF]"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {form.buttons.length === 0 && (
                <p className="text-xs text-[#94A3B8]">No buttons added.</p>
              )}
            </div>
          );
        })()}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* CREATE TEMPLATE MODAL                                                      */
/* -------------------------------------------------------------------------- */

const CreateTemplateModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { isCreating, createSuccess, createError } = useSelector(
    (s) => s.templates
  );

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [exampleMedia, setExampleMedia] = useState(null);
  const [localError, setLocalError] = useState("");

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

  const handleButtonAdd = (type = "QUICK_REPLY") => {
    setForm((prev) => ({
      ...prev,
      buttons: [
        ...prev.buttons,
        {
          type,
          text: "",
          ...(type === "URL" ? { url: "" } : {}),
          ...(type === "PHONE_NUMBER" ? { phone_number: "" } : {}),
        },
      ],
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

    // Length Validations (Including spaces)
    if (form.header_type === "TEXT" && (form.header_text || "").length > 60) {
      return setLocalError("Header text cannot exceed 60 characters (including spaces).");
    }

    if ((form.body_text || "").length > 1024) {
      return setLocalError("Body text cannot exceed 1024 characters (including spaces).");
    }

    if ((form.footer_text || "").length > 60) {
      return setLocalError("Footer text cannot exceed 60 characters (including spaces).");
    }

    if (
      ["IMAGE", "VIDEO", "DOCUMENT"].includes(form.header_type) &&
      !exampleMedia
    ) {
      return setLocalError("A sample file is required for media headers.");
    }

    if (form.buttons?.length > 0) {
      if (form.buttons.length > 10) {
        return setLocalError("Meta allows a maximum of 10 buttons.");
      }
      for (const btn of form.buttons) {
        if (!btn.text?.trim()) {
          return setLocalError("Please enter text for all buttons.");
        }
        if (btn.type === "QUICK_REPLY" && (btn.text || "").length > 40) {
          return setLocalError("Quick Reply button text cannot exceed 40 characters (including spaces).");
        }
        if (btn.type === "URL" && !btn.url?.trim()) {
          return setLocalError("Please enter a URL for the website button.");
        }
        if (btn.type === "PHONE_NUMBER" && !btn.phone_number?.trim()) {
          return setLocalError(
            "Please enter a phone number for the call button."
          );
        }
      }
    }

    const finalName = form.name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

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

  const previewTemplate = {
    header_type: form.header_type,
    header_text: form.header_text,
    body_text: form.body_text,
    footer_text: form.footer_text,
    buttons: form.buttons,
    example_media: exampleMedia,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative z-10 w-full max-w-3xl bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Plus size={16} className="text-[#165DFF]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172033]">New Template</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Submit WhatsApp template to Meta for review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-5 sm:p-6 overflow-y-auto">
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

            <div className="p-5 sm:p-6 bg-[#FAFAFC]">
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                Live Preview
              </p>
              <WhatsAppPreview template={previewTemplate} />

              {form.body_text && (
                <div className="mt-4 bg-white rounded-xl border border-slate-200/80 p-3.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-[#64748B]">
                    Variables detected
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#165DFF] border border-blue-100">
                    {(form.body_text.match(/\{\{\d+\}\}/g) || []).length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mx-6 my-2 bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 shrink-0">
            <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-600">{errorMsg}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-white shrink-0">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="flex-1 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#172033] text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="flex-1 py-2.5 rounded-xl bg-[#165DFF] hover:bg-[#1247CC] text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isCreating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
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
/* EDIT TEMPLATE MODAL                                                        */
/* -------------------------------------------------------------------------- */

const EditTemplateModal = ({ template, onClose }) => {
  const dispatch = useDispatch();
  const { isUpdatingId, updateSuccess, updateError } = useSelector(
    (s) => s.templates
  );

  const isUpdating = isUpdatingId === template.id;

  const [form, setForm] = useState({
    header_type: template.header_type || "",
    header_text: template.header_text || "",
    body_text: template.body_text || "",
    footer_text: template.footer_text || "",
    buttons: template.buttons || [],
  });
  const [exampleMedia, setExampleMedia] = useState(null);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (updateSuccess) {
      dispatch(clearUpdateSuccess());
      onClose();
    }
  }, [updateSuccess, dispatch, onClose]);

  const handleChange = (field, value) => {
    setLocalError("");
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (
        field === "header_type" &&
        !["IMAGE", "VIDEO", "DOCUMENT"].includes(value)
      ) {
        setExampleMedia(null);
      }
      return updated;
    });
  };

  const handleButtonAdd = (type = "QUICK_REPLY") => {
    setForm((prev) => ({
      ...prev,
      buttons: [
        ...prev.buttons,
        {
          type,
          text: "",
          ...(type === "URL" ? { url: "" } : {}),
          ...(type === "PHONE_NUMBER" ? { phone_number: "" } : {}),
        },
      ],
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

    // Length Validations (Including spaces)
    if (form.header_type === "TEXT" && (form.header_text || "").length > 60) {
      return setLocalError("Header text cannot exceed 60 characters (including spaces).");
    }

    if ((form.body_text || "").length > 1024) {
      return setLocalError("Body text cannot exceed 1024 characters (including spaces).");
    }

    if ((form.footer_text || "").length > 60) {
      return setLocalError("Footer text cannot exceed 60 characters (including spaces).");
    }

    const isMedia = ["IMAGE", "VIDEO", "DOCUMENT"].includes(form.header_type);
    if (isMedia && !exampleMedia && template.header_type !== form.header_type) {
      return setLocalError(
        `Please choose a sample ${form.header_type.toLowerCase()} file for Meta review.`
      );
    }

    if (form.buttons?.length > 0) {
      if (form.buttons.length > 10) {
        return setLocalError("Meta allows a maximum of 10 buttons.");
      }
      for (const btn of form.buttons) {
        if (!btn.text?.trim()) {
          return setLocalError("Please enter text for all buttons.");
        }
        if (btn.type === "QUICK_REPLY" && (btn.text || "").length > 40) {
          return setLocalError("Quick Reply button text cannot exceed 40 characters (including spaces).");
        }
        if (btn.type === "URL" && !btn.url?.trim()) {
          return setLocalError("Please enter a URL for the website button.");
        }
        if (btn.type === "PHONE_NUMBER" && !btn.phone_number?.trim()) {
          return setLocalError(
            "Please enter a phone number for the call button."
          );
        }
      }
    }

    const varCount = (form.body_text.match(/\{\{\d+\}\}/g) || []).length;

    if (exampleMedia) {
      const formData = new FormData();
      formData.append("header_type", form.header_type);
      formData.append("header_text", form.header_text || "");
      formData.append("body_text", form.body_text);
      formData.append("footer_text", form.footer_text || "");
      formData.append("buttons", JSON.stringify(form.buttons || []));
      formData.append("variables_count", varCount);
      formData.append("example_media", exampleMedia);

      dispatch(
        updateTemplate({
          id: template.id,
          payload: formData,
        })
      );
    } else {
      dispatch(
        updateTemplate({
          id: template.id,
          payload: { ...form, variables_count: varCount },
        })
      );
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative z-10 w-full max-w-3xl bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Pencil size={15} className="text-[#165DFF]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172033]">
                Edit Template
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5 font-mono">
                {template.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={template.status} />
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition ml-1 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Locked note */}
        <div className="mx-6 mt-4 bg-amber-50/80 border border-amber-200/80 rounded-xl px-3.5 py-2.5 flex items-start gap-2 shrink-0">
          <Info size={14} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            Template name, category, and language cannot be changed after
            submission. Only body, header, footer, and buttons are editable.
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">
                    Template Name
                  </label>
                  <div className="px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-slate-100/70 text-xs text-[#64748B] font-mono">
                    {template.name}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">
                      Category
                    </label>
                    <div
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold ${getCategoryStyle(template.category).bg} ${getCategoryStyle(template.category).text} ${getCategoryStyle(template.category).border}`}
                    >
                      {template.category}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1 uppercase tracking-wider">
                      Language
                    </label>
                    <div className="px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-slate-100/70 text-xs text-[#64748B] uppercase font-medium">
                      {template.language}
                    </div>
                  </div>
                </div>
              </div>

              <TemplateForm
                form={form}
                onChange={handleChange}
                onFileChange={setExampleMedia}
                onButtonAdd={handleButtonAdd}
                onButtonRemove={handleButtonRemove}
                onButtonChange={handleButtonChange}
                disabled={isUpdating}
                isEditMode={true}
              />
            </div>

            <div className="p-5 sm:p-6 bg-[#FAFAFC]">
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                Live Preview
              </p>
              <WhatsAppPreview template={previewTemplate} />
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mx-6 my-2 bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 shrink-0">
            <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-600">{errorMsg}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-white shrink-0">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#172033] text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="flex-1 py-2.5 rounded-xl bg-[#165DFF] hover:bg-[#1247CC] text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isUpdating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
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
/* PREVIEW MODAL                                                              */
/* -------------------------------------------------------------------------- */

const PreviewModal = ({ template, onClose, onEdit }) => {
  const catStyle = getCategoryStyle(template.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <MessageSquare size={16} className="text-[#165DFF]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#172033] truncate">
                {template.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold uppercase ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                >
                  {template.category}
                </span>
                <span className="text-[11px] font-medium text-[#64748B] uppercase">
                  {template.language}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#172033] hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            <WhatsAppPreview template={template} />
          </div>

          <div className="px-5 pb-5 grid grid-cols-2 gap-3">
            <div className="bg-[#FAFAFC] rounded-xl p-3.5 border border-slate-200/80">
              <p className="text-[11px] font-medium text-[#64748B]">Status</p>
              <div className="mt-1.5">
                <StatusBadge status={template.status} />
              </div>
            </div>
            <div className="bg-[#FAFAFC] rounded-xl p-3.5 border border-slate-200/80">
              <p className="text-[11px] font-medium text-[#64748B]">
                Variables
              </p>
              <p className="text-base font-bold text-[#172033] mt-1">
                {template.variables_count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 px-5 py-4 border-t border-slate-100 bg-white shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#172033] text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>
          {template.category !== "AUTHENTICATION" ? (
            <button
              onClick={() => {
                onClose();
                onEdit(template);
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#165DFF] hover:bg-[#1247CC] text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer"
            >
              Edit Template
            </button>
          ) : (
            <div className="flex-1 py-2.5 text-center text-xs text-[#64748B] bg-slate-100 rounded-xl border border-[#E5E7EB]">
              🔒 Fixed Meta Preset
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* TEMPLATE ROW                                                               */
/* -------------------------------------------------------------------------- */

const TableRow = ({
  template,
  idx,
  onPreview,
  onEdit,
  onAnalytics,
  onDelete,
  isDeletingId,
}) => {
  const isDeleting = isDeletingId === template.id;
  const catStyle = getCategoryStyle(template.category);

  const [featureClicks, setFeatureClicks] = useState(() => {
    return parseInt(localStorage.getItem("template_feature_clicks") || "0", 10);
  });

  const isFeatureNew = (releaseDateString, daysToKeep = 7) => {
    const releaseDate = new Date(releaseDateString);
    const expiryDate = new Date(releaseDate);
    expiryDate.setDate(expiryDate.getDate() + daysToKeep);
    return new Date() < expiryDate;
  };

  const showAnalyticsPing =
    isFeatureNew("2026-10-09") && idx === 0 && featureClicks < 4;

  const handleAnalyticsClick = () => {
    const current = parseInt(
      localStorage.getItem("template_feature_clicks") || "0",
      10
    );
    if (current < 4) {
      localStorage.setItem("template_feature_clicks", (current + 1).toString());
      setFeatureClicks(current + 1);
    }
    onAnalytics(template);
  };

  return (
    <tr className="hover:bg-blue-50/30 transition-colors">
      <td className="px-4 py-3.5 text-xs font-medium text-[#94A3B8] tabular-nums">
        {idx + 1}
      </td>

      <td className="px-4 py-3.5 overflow-hidden">
        <div className="min-w-0">
          <p
            className="text-xs font-semibold text-[#172033] truncate"
            title={template.name}
          >
            {template.name}
          </p>
          <p
            className="text-[11px] text-[#94A3B8] mt-0.5 font-mono truncate"
            title={template.template_id || "No Meta ID"}
          >
            {template.template_id || "No Meta ID"}
          </p>
        </div>
      </td>

      <td className="px-4 py-3.5">
        <span
          className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
        >
          {template.category}
        </span>
      </td>

      <td className="px-4 py-3.5">
        <span className="text-xs font-medium text-[#64748B] uppercase">
          {template.language}
        </span>
      </td>

      <td className="px-4 py-3.5">
        <StatusBadge status={template.status} />
      </td>

      <td className="px-4 py-3.5 overflow-hidden">
        <p
          className="text-xs text-[#64748B] truncate"
          title={template.body_text || ""}
        >
          {template.body_text || "—"}
        </p>
      </td>

      <td className="px-4 py-3.5 text-center">
        <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200/70 rounded-md text-[11px] font-semibold text-[#172033] tabular-nums">
          {template.variables_count || 0}
        </span>
      </td>

      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onPreview(template)}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-[#64748B] hover:text-[#165DFF] transition cursor-pointer"
            title="Preview"
          >
            <Eye size={14} />
          </button>

          <button
            onClick={handleAnalyticsClick}
            className="relative p-1.5 rounded-lg hover:bg-indigo-50 text-[#64748B] hover:text-indigo-600 transition cursor-pointer"
            title="Analytics"
          >
            <BarChart3 size={14} />
            {showAnalyticsPing && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            )}
          </button>

          {template.category !== "AUTHENTICATION" && (
            <button
              onClick={() => onEdit(template)}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-[#64748B] hover:text-[#165DFF] transition cursor-pointer"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
          )}

          <button
            onClick={() => onDelete(template.id)}
            disabled={isDeleting}
            className="p-1.5 rounded-lg hover:bg-red-50 text-[#64748B] hover:text-red-600 transition disabled:opacity-50 cursor-pointer"
            title="Delete"
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN TEMPLATES PAGE                                                        */
/* -------------------------------------------------------------------------- */

const Templates = () => {
  const dispatch = useDispatch();

  const {
    list,
    isLoading,
    isDeletingId,
    isSyncingId,
    isSyncingAll,
    syncAllResult,
    error,
  } = useSelector((s) => s.templates);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [editTemplate, setEditTemplate] = useState(null);
  const [analyticsTemplate, setAnalyticsTemplate] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const statusFiltered =
    activeFilter === "ALL"
      ? list
      : list.filter((t) => t.status === activeFilter);

  const filtered = search.trim()
    ? statusFiltered.filter((t) => {
        const q = search.toLowerCase();
        return (
          (t.name || "").toLowerCase().includes(q) ||
          (t.body_text || "").toLowerCase().includes(q) ||
          (t.category || "").toLowerCase().includes(q)
        );
      })
    : statusFiltered;

  return (
    <div className="min-h-screen w-full bg-[#FAFAFC] p-5 sm:p-6 lg:p-7 space-y-5 font-sans text-[#172033]">
      {/* ── PAGE HEADER (Exact same size/height as Dashboard, Leads & Prospects, and WhatsApp) ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3.5 min-h-[56px] border-b border-[#E5E7EB]/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172033] leading-tight">
            Message Templates
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-normal">
            Create, manage, and track your WhatsApp message templates.
          </p>
        </div>

        {/* Right Toolbar: Status Segmented Tabs + Sync All + New Template */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Status Segmented Tabs */}
          <div className="h-9 flex items-center bg-white p-1 rounded-xl border border-[#E5E7EB] shadow-2xs">
            {FILTER_TABS.map((tab) => {
              const active = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`h-full flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-[#165DFF] text-white shadow-xs shadow-blue-500/20"
                      : "text-[#64748B] hover:text-[#172033] hover:bg-slate-50"
                  }`}
                >
                  {tab.dot && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        active ? "bg-white" : tab.dot
                      }`}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Sync All */}
          <button
            onClick={() => dispatch(syncAllTemplates())}
            disabled={isSyncingAll}
            className="h-9 flex items-center gap-1.5 text-xs font-semibold px-3.5 bg-white border border-[#E5E7EB] rounded-xl text-[#172033] hover:border-[#165DFF]/40 hover:text-[#165DFF] hover:bg-blue-50/30 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {isSyncingAll ? (
              <Loader2 size={13} className="animate-spin text-[#165DFF]" />
            ) : (
              <RefreshCw size={13} className="text-[#64748B]" />
            )}
            <span>Sync All</span>
          </button>

          {/* New Template */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-9 flex items-center gap-1.5 text-xs font-semibold px-3.5 bg-[#165DFF] hover:bg-[#1247CC] border border-[#165DFF] text-white rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* ── SYNC-ALL RESULT BANNER ── */}
      <AnimatePresence>
        {syncAllResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-800">
                Sync complete —{" "}
                <strong>{syncAllResult.synced_from_meta}</strong> from Meta,{" "}
                <strong>{syncAllResult.updated_locally}</strong> updated,{" "}
                <strong>{syncAllResult.created_locally}</strong> new.
              </p>
            </div>
            <button
              onClick={() => dispatch(clearSyncAllResult())}
              className="text-emerald-500 hover:text-emerald-700 cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ERROR ── */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-700">
              Something went wrong
            </p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => dispatch(clearError())}
            className="text-red-400 hover:text-red-600 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── MAIN TABLE CARD (Search bar at top-left matching Leads & WhatsApp) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-blue-500/[0.03] overflow-hidden">
        {/* Top Search Header inside Card */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />
            <input
              type="text"
              placeholder="Search template name or body..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50/80 focus:bg-white rounded-xl border border-[#E5E7EB] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 text-[#172033] placeholder:text-[#94A3B8] outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172033] cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="font-semibold text-[#172033]">Templates</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#165DFF] border border-blue-100 tabular-nums">
              {filtered.length}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={24} className="animate-spin text-[#165DFF]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-center mx-auto">
              <FileText size={22} className="text-[#165DFF]/60" />
            </div>
            <h3 className="text-sm font-bold text-[#172033] mt-3">
              No templates found
            </h3>
            <p className="text-xs text-[#64748B] mt-1">
              {search
                ? "Try adjusting your search query"
                : "Create your first WhatsApp template to get started"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[820px]">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  {[
                    { label: "#", width: "w-[5%]" },
                    { label: "Name", width: "w-[22%]" },
                    { label: "Category", width: "w-[13%]" },
                    { label: "Language", width: "w-[9%]" },
                    { label: "Status", width: "w-[13%]" },
                    { label: "Body Preview", width: "w-[22%]" },
                    { label: "Vars", width: "w-[6%] text-center" },
                    { label: "Actions", width: "w-[10%] text-right" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      className={`${col.width} px-4 py-3.5 text-left text-[11px] font-semibold text-[#64748B] uppercase tracking-wider truncate`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t, i) => (
                  <TableRow
                    key={t.id}
                    template={t}
                    idx={i}
                    onPreview={setPreviewTemplate}
                    onEdit={setEditTemplate}
                    onAnalytics={setAnalyticsTemplate}
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

      {/* ── MODALS ── */}
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

export default Templates;
