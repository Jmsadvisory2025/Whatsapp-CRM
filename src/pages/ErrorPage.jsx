import React, { useEffect, useState } from "react";

const errorConfigs = {
  404: {
    code: "404",
    title: "Page not found",
    message: "The page you're looking for doesn't exist or has been moved.",
  },
  400: {
    code: "400",
    title: "Bad request",
    message: "The request was invalid. Please check your input and try again.",
  },
  401: {
    code: "401",
    title: "Session expired",
    message: "Please sign in again to continue.",
    cta: "Go to sign in",
    ctaHref: "/signin",
  },
  403: {
    code: "403",
    title: "Access denied",
    message: "You don't have permission to view this page.",
  },
  500: {
    code: "500",
    title: "Server error",
    message: "Something went wrong on our end. Please try again in a moment.",
  },
};

const EnhancedIllustration = () => (
  <svg
    viewBox="0 0 420 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", maxWidth: 420, height: "auto" }}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="docGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#f8fafc", stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#0f172a", stopOpacity: 0.08 }} />
        <stop offset="100%" style={{ stopColor: "#0f172a", stopOpacity: 0 }} />
      </linearGradient>
      <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        <feOffset dx="0" dy="4" result="offsetblur" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.12" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <style>{`
      @keyframes ep-float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-12px); }
      }
      @keyframes ep-float-delayed {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      @keyframes ep-blink {
        0%, 88%, 100% { transform: scaleY(1); }
        94% { transform: scaleY(0.05); }
      }
      @keyframes ep-signal {
        0%, 100% { opacity: 0.15; }
        50% { opacity: 1; }
      }
      @keyframes ep-pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      @keyframes ep-rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .ep-float { animation: ep-float 3.8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      .ep-magnifier { animation: ep-float-delayed 3.8s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.2s; transform-origin: 290px 148px; }
      .ep-eyes { animation: ep-blink 4.2s ease-in-out infinite; transform-origin: 202px 82px; }
      .ep-s1 { animation: ep-signal 1.4s ease-in-out infinite; }
      .ep-s2 { animation: ep-signal 1.4s ease-in-out infinite 0.25s; }
      .ep-s3 { animation: ep-signal 1.4s ease-in-out infinite 0.5s; }
      .ep-x-pulse { animation: ep-pulse 2s ease-in-out infinite; }
    `}</style>

    {/* Soft ground shadow */}
    <ellipse cx="210" cy="242" rx="92" ry="8" fill="#e2e8f0" opacity="0.6" />
    <ellipse cx="210" cy="240" rx="76" ry="5" fill="url(#shadowGradient)" />

    {/* Main floating group */}
    <g className="ep-float">
      {/* Document with enhanced styling */}
      <g filter="url(#softShadow)">
        <rect x="148" y="58" width="118" height="152" rx="12" fill="url(#docGradient)" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Subtle depth lines on document */}
        <rect x="150" y="60" width="114" height="148" rx="11" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Folded corner with gradient */}
      <defs>
        <linearGradient id="cornerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#f1f5f9", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#e2e8f0", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path d="M236 58 L266 88 L236 88 Z" fill="url(#cornerGradient)" />
      <path d="M236 58 L266 88" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Content lines - more sophisticated hierarchy */}
      <rect x="163" y="108" width="60" height="5" rx="2.5" fill="#1e293b" opacity="0.75" />
      <rect x="163" y="120" width="78" height="4" rx="2" fill="#64748b" />
      <rect x="163" y="131" width="48" height="4" rx="2" fill="#cbd5e1" />
      <rect x="163" y="142" width="68" height="4" rx="2" fill="#cbd5e1" />
      <rect x="163" y="153" width="40" height="4" rx="2" fill="#e2e8f0" />
      <rect x="163" y="164" width="54" height="4" rx="2" fill="#e2e8f0" />

      {/* Face with refined proportions */}
      <g className="ep-eyes">
        {/* Eye whites */}
        <circle cx="191" cy="81" r="5.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
        <circle cx="213" cy="81" r="5.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
        {/* Pupils */}
        <circle cx="191" cy="81" r="3" fill="#1e293b" />
        <circle cx="213" cy="81" r="3" fill="#1e293b" />
        {/* Light reflection */}
        <circle cx="192.5" cy="79.5" r="1.2" fill="#ffffff" />
        <circle cx="214.5" cy="79.5" r="1.2" fill="#ffffff" />
      </g>
      
      {/* Refined sad mouth */}
      <path d="M192 95 Q202 89 214 95" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.8" />

      {/* Magnifier glass - refined and animated */}
      <g className="ep-magnifier">
        <circle cx="290" cy="148" r="28" fill="#fafbfc" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="290" cy="148" r="17" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
        <line x1="303" y1="161" x2="315" y2="173" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        {/* Question mark with better styling */}
        <text x="285" y="154" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" fill="#64748b" opacity="0.9">?</text>
      </g>

      {/* Wifi signal waves - more refined */}
      <path className="ep-s3" d="M318 74 Q332 62 346 74" stroke="#cbd5e1" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path className="ep-s2" d="M322 83 Q332 75 342 83" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path className="ep-s1" d="M326 92 Q332 87 338 92" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      
      {/* No signal X - enhanced error indicator */}
      <g className="ep-x-pulse">
        <line x1="327" y1="100" x2="333" y2="106" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="333" y1="100" x2="327" y2="106" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

const ErrorPage = ({ status = "404" }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const config = errorConfigs[String(status)] || {
    code: String(status),
    title: "Something went wrong",
    message: `An unexpected error occurred (${status}). Please try again.`,
  };

  const ctaHref = config.ctaHref || "/";
  const ctaLabel = config.cta || "Go to dashboard";

  const handleCta = (e) => {
    e.preventDefault();
    window.location.href = ctaHref;
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "40px 16px",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "520px", width: "100%" }}>
        {/* Error code - prominent but refined */}
        <div
          style={{
            fontSize: "clamp(84px, 18vw, 120px)",
            fontWeight: "900",
            color: "#0f172a",
            lineHeight: 0.9,
            letterSpacing: "-3px",
            marginBottom: "8px",
            fontVariantNumeric: "tabular-nums",
            opacity: mounted ? 1 : 0.7,
            transform: mounted ? "scale(1)" : "scale(0.95)",
            transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {config.code}
        </div>

        {/* Subtle accent line */}
        <div
          style={{
            width: "48px",
            height: "3px",
            background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
            margin: "0 auto 24px",
            borderRadius: "2px",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease 0.1s",
          }}
        />

        {/* SVG Illustration */}
        <div
          style={{
            margin: "0 auto 28px",
            maxWidth: "380px",
            opacity: mounted ? 1 : 0.6,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s",
          }}
        >
          <EnhancedIllustration />
        </div>

        {/* Title - refined typography */}
        <h1
          style={{
            fontSize: "clamp(20px, 5vw, 28px)",
            fontWeight: "700",
            color: "#0f172a",
            margin: "0 0 12px",
            letterSpacing: "-0.3px",
            opacity: mounted ? 1 : 0.7,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s ease 0.15s",
          }}
        >
          {config.title}
        </h1>

        {/* Message - improved readability */}
        <p
          style={{
            fontSize: "15px",
            color: "#475569",
            margin: "0 0 36px",
            lineHeight: "1.7",
            maxWidth: "420px",
            marginLeft: "auto",
            marginRight: "auto",
            opacity: mounted ? 1 : 0.6,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s ease 0.2s",
          }}
        >
          {config.message}
        </p>

        {/* CTA Button - enhanced styling and interactions */}
        <a
          href={ctaHref}
          onClick={handleCta}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px 32px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "15px",
            fontWeight: "600",
            letterSpacing: "0.01em",
            transition:
              "all 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
            cursor: "pointer",
            border: "none",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
            opacity: mounted ? 1 : 0.6,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transitionDelay: "0.25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #059669 0%, #047857 100%)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.25)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.15)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.97)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid #3b82f6";
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          {ctaLabel}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: "transform 0.2s ease" }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>
  );
};

export default ErrorPage;