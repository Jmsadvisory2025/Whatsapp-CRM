import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendDirectMessage, fetchConversationMessages, setSelectedCustomer } from "../store/whatsappSlice";
import {
  Send,
  ArrowLeft,
  Loader2,
  MessageCircle,
  CheckCheck,
  ExternalLink,
  ImageIcon,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  PhoneCall,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import bgImage from "../assets/images/whatsapp/bg.png"

/* ─── Helpers ──────────────────────────────────────────────── */

const formatTime = (ts) => {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateLabel = (ts) => {
  const date = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", {
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

// Detect if URL is an image
const isImageUrl = (url) => {
  if (!url) return false;
  return /\.(jpg|jpeg|png|gif|webp|jfif|bmp|svg)(\?.*)?$/i.test(url) ||
    url.includes("blob.core.windows.net/assets") ||
    url.includes("blob.core.windows.net/media");
};

// Detect if URL is a maps link
const isMapsUrl = (url) => /maps\.google\.com|google\.com\/maps/i.test(url ?? "");

// Detect if URL is a whatsapp link
const isWhatsAppUrl = (url) => /wa\.me/i.test(url ?? "");

/*
  Schema per message object:
  {
    id, 
    user_msg, user_timestamp,   ← customer sent (left bubble), can be null
    bot_msg,  bot_timestamp     ← bot sent (right bubble), can be null
  }

  Strategy: From each row, emit up to 2 render items:
    1. user_msg  → LEFT  bubble  (if not null)
    2. bot_msg   → RIGHT bubble  (if not null)
  Sort everything by actual timestamp for correct ordering.
*/

const flattenMessages = (messages) => {
  const items = [];
  messages.forEach((row) => {
    if (row.user_msg !== null && row.user_timestamp) {
      items.push({
        id: `${row.id}-user`,
        rowId: row.id,
        side: "user",
        text: row.user_msg,
        ts: row.user_timestamp,
      });
    }
    if (row.bot_msg !== null && row.bot_timestamp) {
      items.push({
        id: `${row.id}-bot`,
        rowId: row.id,
        side: "bot",
        text: row.bot_msg,
        ts: row.bot_timestamp,
      });
    }
    // Edge: bot_msg with no timestamp (still render it after user)
    if (row.bot_msg !== null && !row.bot_timestamp) {
      items.push({
        id: `${row.id}-bot`,
        rowId: row.id,
        side: "bot",
        text: row.bot_msg,
        ts: row.user_timestamp ?? "",
      });
    }
  });
  // Sort by timestamp
  items.sort((a, b) => new Date(a.ts) - new Date(b.ts));
  return items;
};

const groupByDate = (items) => {
  const groups = [];
  let currentDate = null;
  items.forEach((item) => {
    const dayKey = item.ts ? new Date(item.ts).toDateString() : "Unknown";
    if (dayKey !== currentDate) {
      currentDate = dayKey;
      groups.push({ dateTs: item.ts, items: [] });
    }
    groups[groups.length - 1].items.push(item);
  });
  return groups;
};

/* ─── Sub-components ───────────────────────────────────────── */

// Render message content: image, link, or plain text
const MessageContent = ({ text, isBot }) => {
  if (!text) return null;
  const trimmed = text.trim();

  // Image URL
  if (isUrl(trimmed) && isImageUrl(trimmed)) {
    return (
      <a
        href={trimmed}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="block overflow-hidden rounded-lg relative group cursor-pointer"
        title="Click to view or download"
      >
        <img
          src={trimmed}
          alt="media"
          className="max-w-full rounded-lg object-cover transition-opacity group-hover:opacity-90"
          style={{ maxHeight: "220px", minWidth: "160px" }}
          onError={(e) => {
            e.target.style.display = "none";
            if (e.target.nextElementSibling) {
              e.target.nextElementSibling.style.display = "flex";
            }
          }}
        />
        <div
          className={`hidden items-center gap-2 px-3 py-2 rounded-lg text-xs ${
            isBot ? "text-green-100" : "text-gray-500"
          }`}
          style={{ display: "none" }}
        >
          <ImageIcon size={14} />
          <span>Image</span>
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
        className={`flex items-center gap-1.5 text-xs underline underline-offset-2 text-blue-500`}
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
        className={`flex items-center gap-1.5 text-xs underline underline-offset-2 ${
          isBot ? "text-green-700" : "text-blue-500"
        }`}
      >
        <PhoneCall size={15} /> Inquiry on this number
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
        className={`flex items-center gap-1.5 text-xs underline underline-offset-2 break-all ${
          isBot ? "text-green-100" : "text-blue-500"
        }`}
      >
        {trimmed}
        <ExternalLink size={11} className="flex-shrink-0" />
      </a>
    );
  }

  // Text with inline URL detection (e.g. "📍 https://...")
  const parts = trimmed.split(/(https?:\/\/\S+)/g);
  if (parts.length > 1) {
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {parts.map((part, i) =>
          /^https?:\/\//.test(part) ? (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline underline-offset-2 ${isBot ? "text-green-600" : "text-blue-500"}`}
            >
              {part}
            </a>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </p>
    );
  }

  return <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>;
};

/* ─── Main Component ───────────────────────────────────────── */

const ChatArea = ({ onBack, onOpenBulkMessage }) => {
  const dispatch = useDispatch();
  const { selectedCustomer, messages, isLoadingMessages, messagesError } = useSelector(
    (s) => s.whatsapp
  );
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
      if (textareaRef.current) textareaRef.current.style.height = "24px";
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
    e.target.style.height = "40px";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  /* ── No selection ── */
  if (!selectedCustomer) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center text-center px-6"
        style={{ background: "#f0f2f5" }}
      >
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
          <MessageCircle size={28} className="text-gray-300" />
        </div>
        <p className="text-base font-semibold text-gray-600">Select a conversation</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          Choose a contact from the list to view messages
        </p>
        <button
          onClick={onOpenBulkMessage}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#00a884" }}
        >
          <Send size={16} />
          Send Bulk Messages
        </button>
      </div>
    );
  }

  const name = selectedCustomer.customer_name || selectedCustomer.name;
  const phone = selectedCustomer.customer_phone || selectedCustomer.phone;
  const displayName = getDisplayName(name, phone);
  const initials = getInitials(name, phone);
  const cleanPhone = stripPlus(phone);

  const flatItems = flattenMessages(messages);
  const grouped = groupByDate(flatItems);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: "#fff" }}>

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{ background: "#f0f2f5", height: "59px", borderLeft: "1px solid #d1d7db" }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="md:hidden p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors -ml-1"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold select-none flex-shrink-0"
            style={{ background: "#dfe5e7", color: "#4a5568" }}
          >
            {initials}
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[15px] font-medium text-[#111b21] leading-tight">{displayName}</span>
            <div className="text-[12px] leading-tight mt-0.5 flex items-center gap-1.5 flex-wrap" style={{ color: "#667781" }}>
              <span>{cleanPhone}</span>
              {selectedCustomer.status && (
                <>
                  <span>•</span>
                  <span className="capitalize font-medium text-gray-600">{selectedCustomer.status.replace('_', ' ')}</span>
                </>
              )}
              {selectedCustomer.created_at && (
                <>
                  <span>•</span>
                  <span>{new Date(selectedCustomer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-[#54656f]">
          <button
            onClick={() => {
              dispatch(setSelectedCustomer(null));
              onBack?.();
            }}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="Close chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{
          background: "#efeae2",
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "1300px auto",
        
          backgroundAttachment: "local",
        }}
      >
        {/* Error */}
        {messagesError && (
          <div className="flex justify-center mb-3">
            <span className="text-xs text-red-600 bg-white border border-red-100 px-3 py-1 rounded-full shadow-sm">
              Failed to load messages
            </span>
          </div>
        )}

        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 size={20} className="animate-spin" style={{ color: "#25d366" }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center">
            <span className="text-xs text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
              No messages yet
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {grouped.map((group, gi) => (
              <div key={gi}>
                {/* Date pill */}
                <div className="flex justify-center my-4">
                  <span
                    className="text-[11px] font-medium px-3 py-1 rounded-full shadow-sm"
                    style={{ background: "#fff", color: "#667781" }}
                  >
                    {formatDateLabel(group.dateTs)}
                  </span>
                </div>

                {/* Bubbles */}
                <div className="space-y-1">
                  {group.items.map((item, idx) => {
                    const isBot = item.side === "bot";
                    const isImg = isUrl(item.text?.trim()) && isImageUrl(item.text?.trim());

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`flex ${isBot ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`relative max-w-[72%] md:max-w-[65%] shadow-sm ${
                            isImg ? "p-1" : "px-2 pt-1.5 pb-1"
                          }`}
                          style={{
                            background: isBot ? "#d9fdd3" : "#ffffff",
                            borderRadius: "7.5px",
                          }}
                        >
                          {/* Content */}
                          {isImg ? (
                            <div className="relative">
                              <MessageContent text={item.text} isBot={isBot} />
                              {/* Time overlay on image */}
                              <div
                                className="absolute bottom-1.5 right-2 flex items-center gap-1 px-1 rounded"
                                style={{ background: "rgba(0,0,0,0.38)" }}
                              >
                                <span className="text-[10px] text-white tabular-nums">
                                  {formatTime(item.ts)}
                                </span>
                                {isBot && (
                                  <CheckCheck size={12} className="text-white opacity-80" />
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div style={{ color: isBot ? "#1a1a1a" : "#1a1a1a" }}>
                                <MessageContent text={item.text} isBot={isBot} />
                              </div>
                              {/* Time + tick */}
                              <div
                                className={`flex items-center gap-0.5 mt-0.5 ${isBot ? "justify-end" : "justify-end"}`}
                              >
                                <span
                                  className="text-[10px] tabular-nums"
                                  style={{ color: "#667781" }}
                                >
                                  {formatTime(item.ts)}
                                </span>
                                {isBot && (
                                  <CheckCheck
                                    size={14}
                                
                                    strokeWidth={2.5}
                                  />
                                )}
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
      <div
        className="flex-shrink-0 px-4 py-3 flex items-end gap-3"
        style={{ background: "#f0f2f5" }}
      >
        {/* Textarea */}
        <div className="flex-1 rounded-lg bg-white shadow-sm border border-gray-200 flex items-end px-4 py-1.5 transition-colors focus-within:border-gray-300">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type a message"
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            className="flex-1 resize-none bg-transparent text-[15px] text-[#111b21] placeholder-[#667781] focus:outline-none leading-[24px] disabled:opacity-50 py-1.5"
            style={{ 
              minHeight: "36px", 
              maxHeight: "120px"
            }}
          />
        </div>

        {/* Send button */}
        <div className="mb-1.5 flex-shrink-0">
          <button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="p-2.5 rounded-full flex items-center justify-center text-[#54656f] bg-transparent hover:bg-black/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <Send size={22} className="translate-x-[2px]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;