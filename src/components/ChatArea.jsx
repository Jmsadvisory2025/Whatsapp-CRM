import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendDirectMessage, fetchConversationMessages, setSelectedCustomer } from "../store/whatsappSlice";
import { fetchApprovedTemplates } from "../store/campaignSlice";
import { fetchTemplates } from "../store/templateSlice";
import {
  Send,
  ArrowLeft,
  Loader2,
  MessageCircle,
  Check,
  CheckCheck,
  ExternalLink,
  ImageIcon,
  Paperclip,
  PhoneCall,
  X,
  Film,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import bgImage from "../assets/images/whatsapp/bg.png";

/* ─── Helpers ──────────────────────────────────────────────── */

const formatTime = (ts) => {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getISTDateKey = (ts) => {
  if (!ts) return "Unknown";
  return new Date(ts).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
};

const formatDateLabel = (ts) => {
  if (!ts) return "";
  const date = new Date(ts);
  const now = new Date();

  const dateKey = getISTDateKey(date);
  const todayKey = getISTDateKey(now);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = getISTDateKey(yesterday);

  if (dateKey === todayKey) return "Today";
  if (dateKey === yesterdayKey) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const stripPlus = (str) => String(str ?? "").replace(/^\+/, "");

const isRealName = (name, phone) => {
  if (!name) return false;
  const s = stripPlus(String(phone ?? ""));
  if (name === phone || name === s) return false;
  if (/^\d+$/.test(name)) return false;
  return true;
};

const getDisplayName = (name, phone) =>
  isRealName(name, phone) ? name : `+${stripPlus(phone)}`;

const getInitials = (name, phone) => {
  if (isRealName(name, phone)) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.trim().slice(0, 2).toUpperCase();
  }
  return stripPlus(phone).slice(-2);
};

// Detect if a string is a URL
const isUrl = (str) => {
  if (!str) return false;
  return /^https?:\/\//i.test(str.trim());
};

const isImageUrl = (url) => {
  if (!url) return false;
  if (/\.(mp4|mov|webm|ogg|avi|wmv|mkv)(\?.*)?$/i.test(url)) return false;
  if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)(\?.*)?$/i.test(url)) return false;
  return (
    /\.(jpg|jpeg|png|gif|webp|jfif|bmp|svg)(\?.*)?$/i.test(url) ||
    url.includes("blob.core.windows.net/assets") ||
    url.includes("blob.core.windows.net/media") ||
    url.startsWith("blob:")
  );
};

const isVideoUrl = (url) => {
  if (!url) return false;
  return /\.(mp4|mov|webm|ogg|avi|wmv|mkv)(\?.*)?$/i.test(url);
};

const isAudioUrl = (url) => {
  if (!url) return false;
  return /\.(mp3|ogg|wav|m4a|aac|amr)(\?.*)?$/i.test(url);
};

const isDocumentUrl = (url) => {
  if (!url) return false;
  return /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)(\?.*)?$/i.test(url);
};

const isMapsUrl = (url) => /maps\.google\.com|google\.com\/maps/i.test(url ?? "");
const isWhatsAppUrl = (url) => /wa\.me/i.test(url ?? "");

const flattenMessages = (messages) => {
  const items = [];
  messages.forEach((row) => {
    const rawStatus = String(
      row.status ||
      row.bot_status ||
      row.delivery_status ||
      row.message_status ||
      ""
    ).toLowerCase().trim();

    if (row.user_msg !== null && row.user_timestamp) {
      items.push({
        id: `${row.id}-user`,
        rowId: row.id,
        side: "user",
        text: row.user_msg,
        ts: row.user_timestamp,
        status: "read",
        rawRow: row,
      });
    }
    if (row.bot_msg !== null && row.bot_timestamp) {
      items.push({
        id: `${row.id}-bot`,
        rowId: row.id,
        side: "bot",
        text: row.bot_msg,
        ts: row.bot_timestamp,
        status: rawStatus,
        rawRow: row,
      });
    }
    if (row.bot_msg !== null && !row.bot_timestamp) {
      items.push({
        id: `${row.id}-bot`,
        rowId: row.id,
        side: "bot",
        text: row.bot_msg,
        ts: row.user_timestamp ?? "",
        status: rawStatus,
        rawRow: row,
      });
    }
  });
  items.sort((a, b) => new Date(a.ts) - new Date(b.ts));
  return items;
};

const groupByDate = (items) => {
  const groups = [];
  let currentDate = null;
  items.forEach((item) => {
    const dayKey = item.ts ? getISTDateKey(item.ts) : "Unknown";
    if (dayKey !== currentDate) {
      currentDate = dayKey;
      groups.push({ dateTs: item.ts, items: [] });
    }
    groups[groups.length - 1].items.push(item);
  });
  return groups;
};

/* ─── Sub-components ───────────────────────────────────────── */

const MessageContent = ({ text, isBot, rawRow }) => {
  const approvedTemplates = useSelector((s) => s.campaign?.approvedTemplates || []);
  const allTemplates = useSelector((s) => s.templates?.list || []);

  // Merge: allTemplates take precedence for the latest updated text & media
  const templateList = React.useMemo(() => {
    const map = new Map();
    (approvedTemplates || []).forEach((t) => {
      const key = (t.name || t.template_name || "").toLowerCase();
      if (key) map.set(key, t);
    });
    (allTemplates || []).forEach((t) => {
      const key = (t.name || t.template_name || "").toLowerCase();
      if (key) map.set(key, t);
    });
    return Array.from(map.values());
  }, [approvedTemplates, allTemplates]);

  if (!text) return null;
  let trimmed = text.trim();

  // Clean Azure Blob URLs by removing SAS token/query string
  trimmed = trimmed.replace(
    /(https:\/\/[a-zA-Z0-9-]+\.blob\.core\.windows\.net[^\s\?]*)\?[^\s]*/g,
    "$1"
  );

  // Template Check
  let templateName = null;
  const templateMatch = trimmed.match(/^\[?Template:\s*(.+?)\]?$/i);

  if (templateMatch) {
    templateName = templateMatch[1].trim();
  } else if (isBot) {
    const exactMatch = templateList.find(
      (t) =>
        (t.name || "").toLowerCase() === trimmed.toLowerCase() ||
        (t.template_name || "").toLowerCase() === trimmed.toLowerCase()
    );
    if (exactMatch) {
      templateName = exactMatch.name || exactMatch.template_name;
    }
  }

  if (templateName) {
    const template = templateList.find(
      (t) =>
        (t.name || "").toLowerCase() === templateName.toLowerCase() ||
        (t.template_name || "").toLowerCase() === templateName.toLowerCase()
    );

    if (template) {
      const bodyComp = template.components?.find((c) => c.type === "BODY");
      let bodyText = bodyComp?.text || template.body_text || template.body || "";

      const headerComp = template.components?.find((c) => c.type === "HEADER");
      let headerText = headerComp?.text || template.header_text || template.header || "";
      const headerType = headerComp?.format || template.header_type || "";

      const footerComp = template.components?.find((c) => c.type === "FOOTER");
      const footerText = footerComp?.text || template.footer_text || template.footer || "";

      const buttonsComp = template.components?.find((c) => c.type === "BUTTONS");
      const buttons = buttonsComp?.buttons || template.buttons || [];

      // Extract actual sent variables and media from rawRow if present
      let sentVariables = {};
      let actualMediaUrl = null;

      if (rawRow) {
        if (rawRow.variables) {
          try {
            sentVariables = typeof rawRow.variables === "string"
              ? JSON.parse(rawRow.variables)
              : rawRow.variables;
          } catch (e) {
            sentVariables = rawRow.variables || {};
          }
        } else if (rawRow.template_variables) {
          try {
            sentVariables = typeof rawRow.template_variables === "string"
              ? JSON.parse(rawRow.template_variables)
              : rawRow.template_variables;
          } catch (e) {
            sentVariables = rawRow.template_variables || {};
          }
        }

        actualMediaUrl =
          rawRow.media_url ||
          rawRow.media ||
          rawRow.file_url ||
          rawRow.image_url ||
          rawRow.document_url ||
          rawRow.header_media_url ||
          sentVariables?.media_url ||
          null;
      }

      // Replace variables {{1}}, {{2}} with actual sent values
      if (sentVariables && Object.keys(sentVariables).length > 0) {
        Object.keys(sentVariables).forEach((key) => {
          const val = String(sentVariables[key] ?? "");
          if (val && key !== "media_url") {
            const rgx = new RegExp(`\\{\\{${key}\\}\\}`, "g");
            bodyText = bodyText.replace(rgx, val);
            headerText = headerText.replace(rgx, val);
          }
        });
      }

      const formatTemplateText = (t) => {
        let formatted = t
          .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
          .replace(/_(.*?)_/g, "<em>$1</em>")
          .replace(/~(.*?)~/g, "<del>$1</del>")
          .replace(/```(.*?)```/gs, "<code>$1</code>");
        return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
      };

      return (
        <div className="flex flex-col gap-2 w-full max-w-[300px]">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-blue-200/60">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100/80 text-[#165DFF] text-[10px] font-semibold tracking-wide uppercase">
              Template
            </span>
            <span className="text-[10px] font-mono text-[#64748B] truncate max-w-[160px]">
              {templateName}
            </span>
          </div>

          {/* Actual Sent Media Header or Placeholder */}
          {actualMediaUrl ? (
            <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 max-h-48">
              {headerType === "IMAGE" || isImageUrl(actualMediaUrl) ? (
                <img
                  src={actualMediaUrl}
                  alt="Template Header Media"
                  className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => window.open(actualMediaUrl, "_blank")}
                />
              ) : headerType === "VIDEO" || isVideoUrl(actualMediaUrl) ? (
                <video
                  src={actualMediaUrl}
                  controls
                  playsInline
                  className="w-full max-h-48 bg-black"
                />
              ) : (
                <div
                  onClick={() => window.open(actualMediaUrl, "_blank")}
                  className="flex items-center gap-2 p-2.5 bg-white hover:bg-slate-50 cursor-pointer text-xs font-semibold text-[#165DFF]"
                >
                  <FileText size={18} className="text-red-500" />
                  <span className="truncate flex-1">View Document</span>
                  <ExternalLink size={12} className="text-slate-400" />
                </div>
              )}
            </div>
          ) : ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerType) ? (
            <div className="bg-slate-100 rounded-xl h-24 flex flex-col items-center justify-center border border-slate-200/80 text-[#94A3B8] overflow-hidden">
              {headerType === "IMAGE" && <ImageIcon size={24} />}
              {headerType === "VIDEO" && <Film size={24} />}
              {headerType === "DOCUMENT" && <FileText size={24} />}
              <span className="text-[10px] font-semibold mt-1 uppercase text-[#64748B]">
                {headerType} Header
              </span>
            </div>
          ) : null}

          {headerText && (
            <div className="font-semibold text-xs text-[#172033]">
              {formatTemplateText(headerText)}
            </div>
          )}
          <div className="whitespace-pre-wrap text-xs leading-relaxed text-[#172033]">
            {formatTemplateText(bodyText)}
          </div>
          {footerText && (
            <div className="text-[11px] text-[#64748B] mt-0.5">
              {formatTemplateText(footerText)}
            </div>
          )}

          {buttons?.length > 0 && (
            <div className="mt-1 flex flex-col gap-1 pt-2 border-t border-blue-200/60">
              {buttons.map((btn, i) => (
                <div
                  key={i}
                  className="text-center py-1.5 px-3 bg-white hover:bg-blue-50/50 rounded-xl text-[#165DFF] border border-blue-200/70 font-semibold text-[11px] shadow-2xs transition-colors"
                >
                  {btn.text}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="whitespace-pre-wrap text-xs leading-relaxed italic text-[#165DFF] font-medium">
          Template: {templateName}
        </div>
      );
    }
  }

  // Unsupported message fallback
  if (trimmed.startsWith("[unsupported]")) {
    return (
      <div className="text-xs italic text-[#64748B]">
        Unsupported message or action from WhatsApp App
      </div>
    );
  }

  // Reaction message fallback
  if (trimmed.startsWith("[reaction]")) {
    try {
      const jsonStr = trimmed.substring(10).trim();
      const reactionData = JSON.parse(jsonStr);
      const emoji = reactionData.emoji || "👍";
      return (
        <div className="text-xs italic flex items-center gap-1.5 text-[#64748B]">
          <span>Reacted with</span>
          <span className="text-sm not-italic">{emoji}</span>
        </div>
      );
    } catch (e) {
      return <div className="text-xs italic text-[#64748B]">Reacted to a message</div>;
    }
  }

  // Edit message fallback
  if (trimmed.startsWith("[edit]")) {
    try {
      const jsonStr = trimmed.substring(6).trim();
      const editData = JSON.parse(jsonStr);
      const newText = editData.message?.text?.body || "Edited a message";
      return (
        <div className="flex flex-col gap-0.5">
          <div className="text-[10px] italic flex items-center gap-1 text-[#64748B]">
            <span>✏️ Edited</span>
          </div>
          <div className="whitespace-pre-wrap text-xs leading-relaxed text-[#172033]">
            {newText}
          </div>
        </div>
      );
    } catch (e) {
      return <div className="text-xs italic text-[#64748B]">✏️ Edited a message</div>;
    }
  }

  // Strip prefixes like [IMAGE] or [DOCUMENT] to extract the clean URL
  const prefixMatch = trimmed.match(/^\[(IMAGE|DOCUMENT|VIDEO|AUDIO|STICKER)\]\s+(https?:\/\/\S+)/i);
  if (prefixMatch) {
    trimmed = prefixMatch[2];
  }

  // Image URL
  if (isUrl(trimmed) && isImageUrl(trimmed)) {
    return (
      <a
        href={trimmed}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="block overflow-hidden rounded-xl relative group cursor-pointer"
        title="Click to view or download"
      >
        <img
          src={trimmed}
          alt="media"
          className="max-w-full rounded-xl object-cover transition-opacity group-hover:opacity-90"
          style={{ maxHeight: "220px", minWidth: "160px" }}
          onError={(e) => {
            e.target.style.display = "none";
            if (e.target.nextElementSibling) {
              e.target.nextElementSibling.style.display = "flex";
            }
          }}
        />
        <div
          className="hidden items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#64748B]"
          style={{ display: "none" }}
        >
          <ImageIcon size={14} />
          <span>Image</span>
        </div>
      </a>
    );
  }

  // Video URL
  if (isUrl(trimmed) && isVideoUrl(trimmed)) {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-black">
        <video
          src={trimmed}
          controls
          className="max-w-full rounded-xl"
          style={{ maxHeight: "250px", minWidth: "200px" }}
        />
      </div>
    );
  }

  // Audio URL
  if (isUrl(trimmed) && isAudioUrl(trimmed)) {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-2">
        <audio
          src={trimmed}
          controls
          className="max-w-[220px] md:max-w-[280px]"
          style={{ height: "38px" }}
        />
      </div>
    );
  }

  // Document URL
  if (isUrl(trimmed) && isDocumentUrl(trimmed)) {
    const filename = trimmed.split("/").pop().split("?")[0] || "Document";
    return (
      <a
        href={trimmed}
        target="_blank"
        rel="noopener noreferrer"
        download
        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors ${
          isBot
            ? "bg-white/80 border-emerald-200 hover:bg-white"
            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
        }`}
      >
        <div
          className={`p-2 rounded-lg ${
            isBot ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-[#165DFF]"
          }`}
        >
          <Paperclip size={16} />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <span className="text-xs font-semibold truncate text-[#172033]">{filename}</span>
          <span className="text-[10px] text-[#64748B]">Document</span>
        </div>
      </a>
    );
  }

  // Maps link
  if (isUrl(trimmed) && isMapsUrl(trimmed)) {
    const label = trimmed.replace(/^📍\s*/, "");
    return (
      <a
        href={label}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-medium underline underline-offset-2 text-[#165DFF]"
      >
        📍 Open in Google Maps
        <ExternalLink size={11} />
      </a>
    );
  }

  // WhatsApp link
  if (isUrl(trimmed) && isWhatsAppUrl(trimmed)) {
    return (
      <a
        href={trimmed}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-medium underline underline-offset-2 text-[#165DFF]"
      >
        <PhoneCall size={14} /> Inquiry on this number
        <ExternalLink size={11} />
      </a>
    );
  }

  // Plain URL
  if (isUrl(trimmed)) {
    return (
      <a
        href={trimmed}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-medium underline underline-offset-2 break-all text-[#165DFF]"
      >
        {trimmed}
        <ExternalLink size={11} className="flex-shrink-0" />
      </a>
    );
  }

  // Text with inline URL detection
  const parts = trimmed.split(/(https?:\/\/\S+)/g);

  const formatText = (t) => {
    if (!t) return "";
    let formatted = t
      .replace(/\*([^\*]+?)\*/g, "<strong>$1</strong>")
      .replace(/_([^_]+?)_/g, "<em>$1</em>")
      .replace(/~([^~]+?)~/g, "<del>$1</del>")
      .replace(/```([\s\S]*?)```/g, "<code>$1</code>");
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  if (parts.length > 1) {
    return (
      <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-xs sm:text-[13px] leading-relaxed text-[#172033]">
        {parts.map((part, i) =>
          /^https?:\/\//.test(part) ? (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 text-[#165DFF] font-medium break-all [overflow-wrap:anywhere]"
            >
              {part}
            </a>
          ) : (
            <span key={i}>{formatText(part)}</span>
          )
        )}
      </p>
    );
  }

  return (
    <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-xs sm:text-[13px] leading-relaxed text-[#172033]">
      {formatText(text)}
    </p>
  );
};

/* ─── Dynamic WhatsApp Tick Status ──────────────────────────── */
const renderMessageTick = (status, isOverlay = false) => {
  const st = String(status || "").toLowerCase().trim();

  // 1. Double Blue Tick: when read by customer
  if (st === "read") {
    return (
      <CheckCheck
        size={isOverlay ? 12 : 13}
        strokeWidth={2.2}
        className={isOverlay ? "text-[#38BDF8]" : "text-[#165DFF]"}
        title="Read"
      />
    );
  }

  // 2. Double Grey Tick: when delivered to customer phone
  if (st === "delivered") {
    return (
      <CheckCheck
        size={isOverlay ? 12 : 13}
        strokeWidth={2}
        className={isOverlay ? "text-white/80" : "text-[#94A3B8]"}
        title="Delivered"
      />
    );
  }

  // 3. Single Grey Tick: when sent / pending or default fallback
  return (
    <Check
      size={isOverlay ? 12 : 13}
      strokeWidth={2.2}
      className={isOverlay ? "text-white/80" : "text-[#94A3B8]"}
      title={st === "sent" ? "Sent" : "Sent"}
    />
  );
};

/* ─── Main Component ───────────────────────────────────────── */

const ChatArea = ({ onBack }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchApprovedTemplates());
    dispatch(fetchTemplates());
  }, [dispatch]);

  const { selectedCustomer, messages, isLoadingMessages, messagesError } = useSelector(
    (s) => s.whatsapp
  );

  const is24hWindowOpen = React.useMemo(() => {
    const flatItems = flattenMessages(messages || []);
    if (flatItems.length === 0) return false;
    let lastUserTs = null;
    for (let i = flatItems.length - 1; i >= 0; i--) {
      if (flatItems[i].side !== "bot") {
        lastUserTs = flatItems[i].ts;
        break;
      }
    }
    if (!lastUserTs) return false;

    const lastUserMs = new Date(lastUserTs).getTime();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    return Date.now() - lastUserMs < twentyFourHoursMs;
  }, [messages]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const textToSend = input.trim();
    setIsSending(true);
    try {
      await dispatch(
        sendDirectMessage({
          conversation_id: selectedCustomer.conversation_id,
          message: textToSend,
        })
      ).unwrap();
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "36px";
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "36px";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  /* ── No selection ── */
  if (!selectedCustomer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-[#FAFAFC] font-sans">
        <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center mb-3.5 shadow-xs">
          <MessageCircle size={24} className="text-[#165DFF]" />
        </div>
        <p className="text-sm font-semibold text-[#172033]">Select a conversation</p>
        <p className="text-xs text-[#64748B] mt-1 max-w-xs leading-relaxed">
          Choose a contact from the left sidebar to view and reply to messages
        </p>
      </div>
    );
  }

  const name = selectedCustomer.customer_name || selectedCustomer.name;
  const phone = selectedCustomer.customer_phone || selectedCustomer.phone;
  const hasRealCustomerName = isRealName(name, phone);
  const displayName = getDisplayName(name, phone);
  const initials = getInitials(name, phone);
  const cleanPhone = stripPlus(phone);
  const rawStatus = (selectedCustomer.status || "").toLowerCase();
  const isLead = rawStatus === "lead" || rawStatus === "confirmed";

  const flatItems = flattenMessages(messages);
  const grouped = groupByDate(flatItems);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white font-sans text-[#172033]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 flex-shrink-0 bg-white border-b border-slate-200/80">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 text-[#64748B] transition-colors -ml-1 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#165DFF] flex items-center justify-center text-xs font-semibold select-none flex-shrink-0">
            {initials}
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-[#172033] leading-tight truncate">
                {displayName}
              </span>
              {selectedCustomer.status && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex-shrink-0 ${
                    isLead
                      ? "bg-sky-50 text-[#0EA5E9] border-sky-200/70"
                      : "bg-purple-50 text-[#8B5CF6] border-purple-200/70"
                  }`}
                >
                  {isLead ? "Lead" : "Prospect"}
                </span>
              )}
            </div>

            <div className="text-[11px] leading-tight mt-0.5 flex items-center gap-1.5 flex-wrap text-[#64748B]">
              {hasRealCustomerName && (
                <>
                  <span>+{cleanPhone}</span>
                  <span className="text-slate-300">•</span>
                </>
              )}
              {selectedCustomer.created_at ? (
                <span>
                  Added{" "}
                  {new Date(selectedCustomer.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              ) : (
                <span>WhatsApp Contact</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* 24h Window Status Pill */}
          <span
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
              is24hWindowOpen
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                : "bg-amber-50 text-amber-700 border-amber-200/80"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                is24hWindowOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            {is24hWindowOpen ? "24h Window Active" : "24h Window Closed"}
          </span>

          <button
            onClick={() => {
              dispatch(setSelectedCustomer(null));
              onBack?.();
            }}
            className="p-1.5 rounded-xl text-[#64748B] hover:bg-slate-100 hover:text-[#172033] transition-colors cursor-pointer"
            title="Close chat"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-[#F8FAFC]"
        style={{
          backgroundImage: `radial-gradient(#E2E8F0 0.85px, transparent 0.85px)`,
          backgroundSize: "18px 18px",
        }}
      >
        {/* Error */}
        {messagesError && (
          <div className="flex justify-center mb-3">
            <span className="text-xs text-red-600 bg-white border border-red-100 px-3 py-1 rounded-full shadow-xs">
              Failed to load messages
            </span>
          </div>
        )}

        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 size={20} className="animate-spin text-[#165DFF]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center mt-4">
            <span className="text-xs font-medium text-[#64748B] bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
              No messages yet
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {grouped.map((group, gi) => (
              <div key={gi} className="mb-4 last:mb-0">
                {/* Date pill */}
                <div className="flex justify-center my-3.5">
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full shadow-2xs bg-white text-[#64748B] border border-slate-200/80">
                    {formatDateLabel(group.dateTs)}
                  </span>
                </div>

                {/* Bubbles */}
                <div className="space-y-2.5">
                  {group.items.map((item) => {
                    const isBot = item.side === "bot";
                    const isImg = isUrl(item.text?.trim()) && isImageUrl(item.text?.trim());

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`flex ${isBot ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`relative max-w-[78%] md:max-w-[62%] rounded-2xl border shadow-xs ${
                            isImg ? "p-1.5" : "px-3.5 pt-2.5 pb-2"
                          } ${
                            isBot
                              ? "bg-[#EFF6FF] border-blue-200/80 rounded-tr-xs"
                              : "bg-white border-slate-200/90 rounded-tl-xs"
                          }`}
                        >
                          {/* Content */}
                          {isImg ? (
                            <div className="relative">
                              <MessageContent text={item.text} isBot={isBot} rawRow={item.rawRow} />
                              {/* Time overlay on image */}
                              <div
                                className="absolute bottom-1.5 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                                style={{ background: "rgba(0,0,0,0.42)" }}
                              >
                                <span className="text-[10px] text-white tabular-nums">
                                  {formatTime(item.ts)}
                                </span>
                                {isBot && renderMessageTick(item.status, true)}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-[#172033] break-words [overflow-wrap:anywhere] min-w-0">
                                <MessageContent text={item.text} isBot={isBot} rawRow={item.rawRow} />
                              </div>
                              {/* Time + tick */}
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[10px] tabular-nums text-[#64748B]">
                                  {formatTime(item.ts)}
                                </span>
                                {isBot && renderMessageTick(item.status, false)}
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </AnimatePresence>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Bar ── */}
      <div className="flex-shrink-0 px-4 py-3 flex flex-col gap-2 bg-white border-t border-slate-200/80">
        {!is24hWindowOpen && (
          <div className="w-full text-center text-xs text-amber-700 bg-amber-50/90 py-2 px-3 rounded-xl border border-amber-200/80 font-medium">
            ⚠️ 24-hour window has closed. You cannot send manual messages until the customer replies.
          </div>
        )}
        <div className="flex items-end gap-2.5 w-full">
          <div
            className={`flex-1 rounded-xl bg-slate-50/80 focus-within:bg-white border border-[#E5E7EB] focus-within:border-[#165DFF] focus-within:ring-2 focus-within:ring-[#165DFF]/10 flex items-end px-3.5 py-1 transition-all ${
              !is24hWindowOpen ? "opacity-60 bg-slate-100" : ""
            }`}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder={is24hWindowOpen ? "Type a message..." : "Window closed"}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isSending || !is24hWindowOpen}
              className="flex-1 resize-none bg-transparent text-xs sm:text-[13px] text-[#172033] placeholder-[#94A3B8] focus:outline-none leading-5 disabled:opacity-50 py-1.5 disabled:cursor-not-allowed"
              style={{
                minHeight: "34px",
                maxHeight: "120px",
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={isSending || !input.trim() || !is24hWindowOpen}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-white bg-[#165DFF] hover:bg-[#1247CC] shadow-xs shadow-blue-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
          >
            {isSending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={15} className="translate-x-[1px]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
