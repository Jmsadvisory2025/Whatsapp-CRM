import React, { useState } from "react";
import WhatsappSidebar from "../components/WhatsappSidebar";
import ChatArea from "../components/ChatArea";

const Whatsapp = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);
  const [showBulkMessage, setShowBulkMessage] = useState(false);

  if (showBulkMessage) {
    return (
      <div
        className="w-full flex overflow-hidden rounded-lg border border-green-500"
        style={{
          height: "calc(100vh - 70px)",
          background: "#fff",
        }}
      >
        <BulkMessage onClose={() => setShowBulkMessage(false)} />
      </div>
    );
  }

  return (
    <div
      className="w-full flex overflow-hidden rounded-lg border border-green-500"
      style={{
        height: "calc(100vh - 70px)",
        background: "#111b21",
      }}
    >
      <div className="relative z-10 flex w-full h-full overflow-hidden" style={{ margin: "0" }}>

        {/* ── Sidebar ── */}
        <div
          className={`flex-shrink-0 flex flex-col h-full overflow-hidden ${
            mobileSidebarOpen ? "flex" : "hidden"
          } md:flex w-full md:w-[340px]`}
          style={{
            borderRight: "1px solid #e9edef",
            background: "#fff",
          }}
        >
          <WhatsappSidebar onSelectCustomer={() => setMobileSidebarOpen(false)} />
        </div>

        {/* ── Chat Area ── */}
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            mobileSidebarOpen ? "hidden md:flex" : "flex"
          }`}
          style={{ background: "#efeae2" }}
        >
          <ChatArea
            onBack={() => setMobileSidebarOpen(true)}
            onOpenBulkMessage={() => setShowBulkMessage(true)}
          />
        </div>
      </div>
    </div>
  );
};

export default Whatsapp;