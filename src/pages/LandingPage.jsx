// src/pages/LandingPage.jsx
// Enhanced UI — JMS TechNova | Official Meta Tech Provider

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import axios from "axios";

import chatbotDemo from "../assets/chatbot-demo.jpeg";
import logo from "../assets/jms.png";
import hero from "../assets/hero1.png";
import {
  MessageCircle,
  Bot,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Send,
  Users,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  BarChart3,
  Lock,
  Star,
  ChevronRight,
  Headphones,
  TrendingUp,
  Clock,
  Menu,
  X,
  Rocket,
} from "lucide-react";

/* ─── DATA ─────────────────────────────────────────────── */

const stats = [
  { value: "10M+", label: "Messages Sent Daily" },
  { value: "98%", label: "Delivery Rate" },
  { value: "5000+", label: "Businesses Trust Us" },
  { value: "24/7", label: "AI Support Active" },
];

const features = [
  {
    icon: <Users size={24} />,
    tag: "CRM",
    title: "Smart CRM & Pipeline",
    desc: "Manage leads and unify every customer conversation inside one intelligent dashboard built for WhatsApp first teams.",
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50",
  },
  {
    icon: <Send size={24} />,
    tag: "Campaigns",
    title: "Bulk Campaign Engine",
    desc: "Send Meta approved WhatsApp campaigns at scale with advanced segmentation and real time delivery analytics.",
    color: "from-indigo-500 to-indigo-700",
    bg: "bg-indigo-50",
  },
  {
    icon: <Bot size={24} />,
    tag: "AI",
    title: "AI Automation",
    desc: "Boost response speed, reduce manual work, and engage customers 24/7 with intelligent automation.",
    color: "from-sky-500 to-sky-700",
    bg: "bg-sky-50",
  },

  // NEW FEATURE CARD
  {
  icon: <Rocket size={24} />,
  tag: "Coming Soon",
  title: "More Powerful Integrations",
  desc: "Create Workflow using Template, connect webhooks and unlock advanced WhatsApp business tools.",
  color: "from-cyan-500 to-blue-700",
  bg: "bg-cyan-50",
},
];

const useCases = [
  { icon: <TrendingUp size={18} />, label: "Lead Generation" },
  { icon: <Headphones size={18} />, label: "Customer Support" },
  { icon: <Clock size={18} />, label: "Appointment Booking" },
  { icon: <Zap size={18} />, label: "Order Notifications" },
  { icon: <Star size={18} />, label: "Loyalty Programs" },
  { icon: <Globe size={18} />, label: "Multi-language Bots" },
];

/* ─── COUNTER ANIMATION ─────────────────────────────────── */

function AnimatedStat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-4xl xl:text-5xl font-black text-white tracking-tight">
        {value}
      </div>
      <div className="text-blue-200 text-sm font-medium mt-1">{label}</div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────── */

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const demoRef = useRef(null);
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwPAPOn1zkdnOEnErujK6nq5lcXgCCq3ayC_OAr6eVqDmnmkTDCAKXeTHC4oOBFq9wS7A/exec"
  const [form, setForm] = useState({
  name: "",
  company: "",
  phone: "",
  email: "",
  location: "",
  message: "",
});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [purpose, setPurpose] = useState([]);
  const [otherMsg, setOtherMsg] = useState("");

  const purposes = [
    { label: "Sales", emoji: "💰" },
    { label: "Lead Generation", emoji: "🎯" },
    { label: "Marketing", emoji: "📣" },
    { label: "Customer Support", emoji: "🎧" },
    { label: "Other", emoji: "✍️" },
  ];
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
const [countryCode, setCountryCode] = useState("+91");
const [countrySearch, setCountrySearch] = useState("");
const [showDropdown, setShowDropdown] = useState(false);

const countries = [
  { code: "+91",  flag: "🇮🇳", name: "India" },
  { code: "+1",   flag: "🇺🇸", name: "USA" },
  { code: "+1",   flag: "🇨🇦", name: "Canada" },
  { code: "+44",  flag: "🇬🇧", name: "UK" },
  { code: "+61",  flag: "🇦🇺", name: "Australia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+60",  flag: "🇲🇾", name: "Malaysia" },
  { code: "+65",  flag: "🇸🇬", name: "Singapore" },
  { code: "+64",  flag: "🇳🇿", name: "New Zealand" },
  { code: "+49",  flag: "🇩🇪", name: "Germany" },
  { code: "+33",  flag: "🇫🇷", name: "France" },
  { code: "+39",  flag: "🇮🇹", name: "Italy" },
  { code: "+34",  flag: "🇪🇸", name: "Spain" },
  { code: "+31",  flag: "🇳🇱", name: "Netherlands" },
  { code: "+7",   flag: "🇷🇺", name: "Russia" },
  { code: "+86",  flag: "🇨🇳", name: "China" },
  { code: "+81",  flag: "🇯🇵", name: "Japan" },
  { code: "+82",  flag: "🇰🇷", name: "South Korea" },
  { code: "+92",  flag: "🇵🇰", name: "Pakistan" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+94",  flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+55",  flag: "🇧🇷", name: "Brazil" },
  { code: "+52",  flag: "🇲🇽", name: "Mexico" },
  { code: "+27",  flag: "🇿🇦", name: "South Africa" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+20",  flag: "🇪🇬", name: "Egypt" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
];

const selectedCountry = countries.find((c) => c.code === countryCode) || countries[0];

const filteredCountries = countries.filter(
  (c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
);
//   const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     setLoading(true);

//     // ✅ FormData create
//     const formData = new FormData();

//     formData.append("name", form.name);
//     formData.append("company", form.company);
//     formData.append("email", form.email);
//     formData.append("phone", form.phone);
//     formData.append("message", form.message);

//     // ✅ Send request
//     await axios.post(
//       GOOGLE_SCRIPT_URL,
//       formData
//     );

//     // ✅ Success
//     setSuccess(true);

//     setForm({
//       name: "",
//       company: "",
//       phone: "",
//       email: "",
//       message: "",
//     });
//     setTimeout(() => {
//       setSuccess(false);
//     }, 10000);

//   } catch (err) {
//     console.log(err);
//     alert("Something went wrong");
//   } finally {
//     setLoading(false);
//   }
// };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("company", form.company);
    formData.append("email", form.email);
    formData.append("phone", countryCode + form.phone);
    formData.append("location", form.location);
const finalPurpose = purpose
  .map((p) => (p === "Other" ? otherMsg : p))
  .filter(Boolean)
  .join(", ");

formData.append("purpose", finalPurpose);
    await axios.post(GOOGLE_SCRIPT_URL, formData);

    // ✅ Show thank-you banner
    setSuccess(true);

    // Reset form
    setForm({ name: "", company: "", phone: "", email: "", location: "", message: "" });
    setPurpose("");
    setOtherMsg("");

    // ✅ After 2.5s → redirect to WhatsApp
    setTimeout(() => {
      window.open(
        "https://api.whatsapp.com/send?phone=919274916851&text=Hi",
        "_blank"
      );
      setSuccess(false);
    }, 2500);

  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest(".phone-dropdown-wrapper")) {
      setShowDropdown(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
  const scrollToDemo = () =>
    demoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* stagger children */
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };
  const item = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  return (
    <div
      className="bg-white overflow-x-hidden text-gray-900"
      style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .mesh-bg {
          background: radial-gradient(ellipse 80% 60% at 70% 20%, #dbeafe 0%, transparent 60%),
                      radial-gradient(ellipse 60% 50% at 10% 80%, #eff6ff 0%, transparent 55%),
                      #f8faff;
        }

        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 64px rgba(37,99,235,0.12);
        }

        .gradient-border {
          position: relative;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8, #93c5fd);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .noise-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          border-radius: inherit;
        }

        .tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 999px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #fff;
          font-weight: 700;
          border-radius: 14px;
          padding: 14px 28px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 24px rgba(37,99,235,0.35);
          transition: all 0.25s ease;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          box-shadow: 0 8px 32px rgba(37,99,235,0.45);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #fff;
          color: #1e40af;
          font-weight: 700;
          border-radius: 14px;
          padding: 14px 28px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1.5px solid #bfdbfe;
          box-shadow: 0 2px 12px rgba(37,99,235,0.08);
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background: #eff6ff;
          border-color: #3b82f6;
          box-shadow: 0 6px 24px rgba(37,99,235,0.14);
          transform: translateY(-1px);
        }

        .floating-badge {
          backdrop-filter: blur(12px);
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(37,99,235,0.12);
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════
    NAV BAR
═══════════════════════════════════════════════════ */}
<nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-blue-50 shadow-sm">
  <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between py-4">
      
      {/* LOGO */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="JMS TechNova" className="h-10 w-auto" />

        <div>
          <span className="font-black text-gray-900 text-lg tracking-tight">
            JMS TechNova
          </span>

          <div className="flex items-center gap-1 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>

            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Official Meta Partner
            </span>
          </div>
        </div>
      </div>

      {/* DESKTOP BUTTONS */}
      <div className="hidden md:flex items-center gap-3">
        {/* <button
          onClick={() => navigate("/signup")}
          className="btn-secondary text-sm py-2.5 px-5"
        >
          Sign Up Free
        </button> */}

        <button
          onClick={scrollToDemo}
          className="btn-primary text-sm py-2.5 px-5"
        >
          Request For Demo
          <ChevronRight size={16} />
        </button>
      </div>

      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden w-11 h-11 rounded-xl border border-blue-100 flex items-center justify-center bg-white shadow-sm"
      >
        {mobileMenuOpen ? (
          <X size={22} className="text-blue-700" />
        ) : (
          <Menu size={22} className="text-blue-700" />
        )}
      </button>
    </div>

    {/* MOBILE MENU */}
    <div
      className={`md:hidden overflow-hidden transition-all duration-300 ${
        mobileMenuOpen
          ? "max-h-60 opacity-100 pb-5"
          : "max-h-0 opacity-0"
      }`}
    >
      <div className="flex flex-col gap-3 pt-2">
        {/* <button
          onClick={() => {
            navigate("/signup");
            setMobileMenuOpen(false);
          }}
          className="btn-secondary w-full justify-center text-sm py-3"
        >
          Sign Up Free
        </button> */}

        <button
          onClick={() => {
            scrollToDemo();
            setMobileMenuOpen(false);
          }}
          className="btn-primary w-full justify-center text-sm py-3"
        >
          Request For Demo
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  </div>
</nav>
      {/* ═══════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden mesh-bg min-h-[92vh] flex items-center">
        {/* decorative blobs */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-indigo-300/15 rounded-full blur-[60px] pointer-events-none" />

        {/* grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#1d4ed8 1px, transparent 1px), linear-gradient(90deg, #1d4ed8 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="order-1"
            >
              {/* Meta badge */}
              <motion.div variants={item} className="mb-7">
                <span className="tag-pill">
                  <ShieldCheck size={12} />
                  Official Meta Partner 
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={item}
                className="text-4xl sm:text-6xl xl:text-[72px] font-black leading-[1.05] text-gray-900 tracking-tight"
              >
                Grow Faster{" "}
                with{" "}
                <span
                  className="relative"
                  style={{
                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  WhatsApp Automation.
                </span>
                
              </motion.h1>

              {/* Subheading */}
              <motion.p
  variants={item}
  className="mt-7 text-lg text-black leading-relaxed max-w-lg"
>
  As an{" "}
  <span className="font-semibold text-blue-700">
    Official Meta Tech Provider
  </span>
  , JMS TechNova gives businesses direct access to the WhatsApp Business API
  with built in CRM, AI chatbots, bulk campaigns and a shared team inbox.
</motion.p>

              {/* CTA Row */}
              <motion.div
  variants={item}
  className="mt-10 flex flex-row flex-nowrap items-center gap-3 sm:gap-4 w-full sm:w-auto"
>
  <button
    onClick={scrollToDemo}
    className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-3 whitespace-nowrap"
  >
    Request For Demo
    <ArrowRight size={18} />
  </button>

  {/* <button
    onClick={() => navigate("/signup")}
    className="btn-secondary text-sm sm:text-base px-4 sm:px-6 py-3 whitespace-nowrap"
  >
    Start for Free
    <ArrowRight size={18} />
  </button> */}
</motion.div>

              {/* Trust chips */}
              <motion.div
                variants={item}
                className="mt-10 flex flex-wrap gap-3"
              >
                {[
                  "✓ Official Meta API",
                  "✓ CRM",
                  "✓ Campaigns",
                ].map((chip) => (
                  <span
                    key={chip}
                    className="text-sm font-semibold text-blue-800 bg-white border border-blue-100 rounded-xl px-4 py-2 shadow-sm"
                  >
                    {chip}
                  </span>
                ))}
              </motion.div>

            </motion.div>

            {/* RIGHT — Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative flex justify-center order-2"
            >
              {/* glow ring */}
              <div className="absolute w-[420px] h-[420px] bg-blue-400/20 rounded-full blur-[60px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

              {/* Main image card */}
              <div className="relative w-full max-w-[560px] rounded-[36px] overflow-hidden border border-blue-100 shadow-[0_32px_80px_rgba(37,99,235,0.18)] bg-gradient-to-br from-blue-50 to-white">
                {/* top bar */}
                <div className="flex items-center gap-2 px-5 py-4 border-b border-blue-50 bg-white">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  
                </div>

                <img
                  src={hero}
                  alt="WhatsApp Automation Platform"
                  className="w-full h-[360px] sm:h-[440px] object-cover"
                />

                {/* overlay gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
              </div>

              {/* Floating: Meta verified */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="floating-badge absolute -left-6 top-1/4 px-5 py-4 flex items-center gap-3 z-20"
              >
                <div className="bg-blue-600 text-white p-2.5 rounded-xl shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900">Meta Verified</p>
                  <p className="text-xs text-gray-400">Official Tech Provider</p>
                </div>
              </motion.div> */}

              {/* Floating: live stats */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="floating-badge absolute -right-4 bottom-16 px-5 py-4 flex items-center gap-3 z-20"
              >
                <div className="bg-blue-600 text-white p-2.5 rounded-xl shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900">Meta Verified</p>
                  <p className="text-xs text-gray-400">Official Tech Provider</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════ */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="tag-pill mb-5 inline-flex">
              <Sparkles size={12} />
              Platform Capabilities
            </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mt-4 leading-tight text-center break-words">
  Everything to Scale on{" "}
  <span className="text-[#25D366]">WhatsApp</span>
</h2>
            <p className="text-gray-500 mt-5 text-lg leading-relaxed">
              Built on Official Meta WhatsApp Business APIs the same
              infrastructure powering the world's fastest growing brands.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"     >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={item}
                className="card-hover group relative bg-white border border-gray-100 rounded-[28px] p-8 cursor-default overflow-hidden"
                style={{ boxShadow: "0 4px 24px rgba(0, 0, 0, 0.05)" }}
              >
                {/* bg glow on hover */}
                <div
                  className={`absolute inset-0 ${f.bg} opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-[28px]`}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`bg-gradient-to-br ${f.color} text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg`}>
                      {f.icon}
                    </div>
                    <span
  className="
    text-[11px] font-bold uppercase tracking-widest
    px-3 py-1 rounded-full
    bg-blue-50 text-blue-600
    border border-blue-100
    shadow-sm
    group-hover:bg-blue-600
    group-hover:text-white
    group-hover:shadow-md
    transition-all duration-300
  "
>
  {f.tag}
</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-[15px]">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          USE CASES
      ═══════════════════════════════════════════════════ */}
      <section id="use-cases" className="py-24 bg-[#F7FAFF] overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="tag-pill inline-flex mb-6">
                <Zap size={12} /> Use Cases
              </span>

              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight mt-2">
                One Platform.
                <br />
                <span className="text-blue-600">Endless Possibilities.</span>
              </h2>

              <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-xl">
                From e commerce notifications to healthcare appointment reminders,
                JMS TechNova powers conversations that convert.
              </p>

              {/* Use case chips */}
              <div className="mt-8 flex flex-wrap gap-3">
                {useCases.map((u, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 bg-white border border-blue-100 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:border-blue-400 hover:text-blue-700 transition-colors cursor-default"
                  >
                    <span className="text-blue-600">{u.icon}</span>
                    {u.label}
                  </motion.div>
                ))}
              </div>

              {/* Checklist */}
              <div className="mt-10 space-y-4">
                {[
                  "Lead capture and intelligent follow up sequences",
                  "24/7 AI powered customer support that never sleeps",
                  "Shared team inbox for seamless agent handoffs",
                  "Broadcast campaigns with 98% open rates",
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                    <p className="text-gray-600 text-[15px]">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT — Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative flex justify-center"
            >
              <div className="absolute w-80 h-80 bg-blue-300/20 rounded-full blur-[60px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

              {/* phone frame */}
              <div className="relative bg-gray-900 rounded-[44px] p-3 shadow-[0_40px_100px_rgba(0,0,0,0.25)] max-w-[300px] w-full">
                {/* notch */}
                <div className="bg-black rounded-[36px] overflow-hidden">
                  <div className="bg-gray-800 h-8 flex items-center justify-center rounded-t-[36px]">
                    <div className="w-20 h-1.5 rounded-full bg-gray-600" />
                  </div>
                  <img
                    src={chatbotDemo}
                    alt="WhatsApp Chatbot Demo"
                    className="w-full object-cover"
                  />
                </div>

                {/* home bar */}
                <div className="flex justify-center mt-3">
                  <div className="w-24 h-1 rounded-full bg-gray-600" />
                </div>
              </div>

              {/* Floating AI chip */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="floating-badge absolute -left-6 top-16 px-5 py-4 flex items-center gap-3"
              >
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-2.5 rounded-xl">
                  <Bot size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900">AI Chatbot Active</p>
                  <p className="text-xs text-gray-400">Responding instantly</p>
                </div>
              </motion.div>

              {/* Floating messages */}
              
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          META PARTNER HIGHLIGHT
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-[80px]" />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 mb-8">
              <ShieldCheck size={16} className="text-blue-200" />
              <span className="text-sm font-bold text-blue-100 uppercase tracking-widest">
                Official Meta Tech Provider
              </span>
            </div>

<h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight text-center break-words">
  Build on Meta's Official{" "}
  <span className="border-b-4 border-[#25D366] pb-1 inline-block">
    WhatsApp Business
  </span>{" "}
  API
</h2>
            <p className="mt-6 text-lg text-blue-200 leading-relaxed max-w-3xl mx-auto">
              As an officially recognised Meta Tech Provider, JMS TechNova grants you
              compliant, high throughput access to WhatsApp's Business API
              enabling enterprise grade messaging, bots and CRM at any scale.
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
  {[
    {
      icon: <ShieldCheck size={18} />,
      title: "Meta Verified Access",
      desc: "Direct API access without third party resellers or hidden fees.",
    },
    {
      icon: <Zap size={18} />,
      title: "Embedded Signup",
      desc: "Connect your Business and Phone Number to Whatsapp .",
    },
    {
      icon: <Lock size={18} />,
      title: "End-to-End Encrypted",
      desc: "All messages secured with WhatsApp encryption layer.",
    },
  ].map((item, i) => (
    <div
      key={i}
      className="
        bg-[#F8FBFF]
        border border-blue-100
        rounded-2xl
        p-5
        shadow-sm
        hover:shadow-md
        transition-all duration-300
      "
    >

      {/* ICON + TITLE INLINE */}
      <div className="flex items-center gap-2 mb-2">
        <div className="text-blue-600">
          {item.icon}
        </div>

        <h4 className="font-bold text-gray-900 text-sm">
          {item.title}
        </h4>
      </div>

      {/* DESCRIPTION BELOW */}
      <p className="text-gray-500 text-sm leading-relaxed pl-7">
        {item.desc}
      </p>

    </div>
  ))}
</div>

 <button
  onClick={scrollToDemo}
  className="
    mt-12
    bg-white/10
    border border-white/20
    text-white
    hover:bg-white/20
    backdrop-blur-md
    shadow-lg
    hover:shadow-xl
    font-bold
    rounded-2xl
    px-7 py-4
    inline-flex items-center gap-2
    transition-all duration-300
  "
>
  🚀 Request For Demo
  <ArrowRight size={18} />
</button>
          </motion.div>
        </div>
      </section>

     

      {/* ═══════════════════════════════════════════════════
                DEMO FORM
      ═══════════════════════════════════════════════════ */}

      <section
        ref={demoRef}
        className="py-24 bg-[#EDF5FF] relative overflow-hidden"
      >

        {/* 🌈 Background blobs */}
        <div className="absolute -top-40 -right-40 w-[420px] h-[420px] bg-blue-300/30 rounded-full blur-[90px] animate-pulse" />
        <div className="absolute bottom-0 -left-40 w-[350px] h-[350px] bg-indigo-300/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] bg-sky-300/20 rounded-full blur-[80px] animate-bounce" />

        {/* 📊 Grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />

        {/* ✨ Floating icons */}
      {/* ✨ FLOATING CRM + CAMPAIGN ICON SYSTEM */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* 📊 Analytics */}
        <div className="absolute top-16 left-10 text-blue-400 text-4xl animate-bounce opacity-30">
          📊
        </div>

        {/* 🤖 AI Bot */}
        <div className="absolute top-32 left-1/4 text-indigo-400 text-3xl animate-pulse opacity-25">
          🤖
        </div>

        {/* 📩 Messages */}
        <div className="absolute top-1/2 left-16 text-sky-400 text-4xl animate-bounce opacity-20">
          📩
        </div>

        {/* 📣 Campaign */}
        <div className="absolute top-24 right-1/4 text-blue-500 text-3xl animate-ping opacity-30">
          📣
        </div>

        {/* 👤 CRM Lead */}
        <div className="absolute top-1/2 right-20 text-indigo-500 text-3xl animate-pulse opacity-25">
          👤
        </div>

        {/* 💬 Chat */}
        <div className="absolute bottom-24 left-1/3 text-sky-500 text-4xl animate-bounce opacity-30">
          💬
        </div>

        {/* 📈 Growth */}
        <div className="absolute bottom-20 right-1/3 text-blue-400 text-3xl animate-pulse opacity-20">
          📈
        </div>

        {/* ⚡ Automation */}
        <div className="absolute top-1/3 right-10 text-indigo-400 text-4xl animate-bounce opacity-25">
          ⚡
        </div>

        {/* 🔔 Notification */}
        <div className="absolute bottom-1/3 left-10 text-sky-400 text-3xl animate-ping opacity-25">
          🔔
        </div>

      </div>
        
      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 relative">

        <div className="bg-white rounded-[40px] shadow-[0_24px_80px_rgba(37,99,235,0.1)] border border-blue-50 overflow-hidden">

          {/* top accent */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />

<div className="p-5 sm:p-7 md:p-10 lg:p-14">
            {/* TWO COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-stretch">

              {/* ================= LEFT SIDE ================= */}
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col justify-center"
              >

                <span className="tag-pill inline-flex mb-5 w-fit">
                  📅 <PhoneCall size={12} /> Book a Demo
                </span>

                <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
Turn  <span className="text-[#25D366]">WhatsApp</span> into a Powerful Growth Engine </h2>

                {/* VALUE POINTS */}
                <div className="mt-8 space-y-5">

                  {[
                    { icon: "⚡", text: "Automate 90% customer replies with AI chatbot flows." },
                    { icon: "📊", text: "Track leads, campaigns & conversions in one CRM." },
                    { icon: "📣", text: "Run bulk WhatsApp campaigns with 98% delivery rate." },
                    { icon: "🤖", text: "AI handles support, booking & follow-ups 24/7." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-blue-600 text-lg">{item.icon}</span>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}

                </div>

              {/* TRUST STRIP */}
      <div className="mt-10 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center gap-3">

        {/* Checkbox */}
        <div className="w-5 h-5 rounded-md  bg-white flex items-center justify-center">
          <CheckCircle2 size={14} className="text-blue-600" />
        </div>

        {/* Text */}
        <p className="text-sm text-blue-900 font-medium">
          Official Meta Tech Provider & Secure WhatsApp Business API Access with enterprise-grade protection
        </p>

      </div>

              </motion.div>

              {/* ================= RIGHT SIDE ================= */}
              <motion.div
                initial={{ opacity: 0, x: 25 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center"
              >

                {success ? (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="
      w-full
      bg-gradient-to-br from-green-50 to-white
      border border-green-200
      rounded-3xl
      p-10
      flex flex-col items-center justify-center
      text-center
      shadow-lg
      min-h-[520px]
    "
  >
    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
      <CheckCircle2 size={42} className="text-green-600" />
    </div>

    <h3 className="text-3xl font-black text-gray-900">
      Thank You 🎉
    </h3>

    <p className="mt-4 text-gray-600 leading-relaxed max-w-sm">
      Your demo request has been submitted successfully.
      Our team will contact you shortly.
    </p>

    <div className="mt-8 flex items-center gap-2 text-sm text-green-700 font-semibold">
  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
  Redirecting you to WhatsApp...
</div>
  </motion.div>
) : (
  <form
    onSubmit={handleSubmit}
    className="w-full bg-[#F8FBFF] border border-blue-100 rounded-3xl p-7 md:p-9 flex flex-col gap-5 shadow-sm"
  >


 {[
  { name: "name", placeholder: "👤  Name", type: "text" },
  { name: "company", placeholder: "🏢 Company", type: "text" },
  { name: "email", placeholder: "📧  Email", type: "email" },
  { name: "location", placeholder: "📍 Location", type: "text" },
].map((field, i) => (
  <motion.input
    key={field.name}
    type={field.type}
    name={field.name}
    value={form[field.name]}
    onChange={handleChange}
    placeholder={field.placeholder}
    required
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: i * 0.08 }}
    viewport={{ once: true }}
    className="w-full border border-blue-100 bg-white rounded-xl px-4 py-3 text-gray-800 text-sm transition-all duration-300 focus:scale-[1.02] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
  />
))}

{/* Phone Number with +91 prefix */}
{/* Phone with Country Code Dropdown */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: 0.24 }}
  viewport={{ once: true }}
  className="relative phone-dropdown-wrapper"
>
<div
  className={`flex items-center w-full border bg-white rounded-xl overflow-hidden transition-all duration-300 ${
    showDropdown
      ? "border-blue-400 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
      : "border-blue-100"
  }`}
>
    {/* Dropdown trigger */}
    <button
      type="button"
      onClick={() => {
        setShowDropdown(!showDropdown);
        setCountrySearch("");
      }}
className="
  flex items-center gap-1
  px-2 sm:px-3
  py-3
  border-r border-blue-100
  bg-blue-50 hover:bg-blue-100
  transition-colors
  shrink-0
  rounded-l-xl
  min-w-fit
"    >
      {/* <span className="text-base leading-none">{selectedCountry.flag}</span> */}
      <span className="text-sm font-bold text-blue-700">{countryCode}</span>
      <svg
        className={`w-3 h-3 text-blue-500 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {/* Phone number input */}
<input
  type="tel"
  name="phone"
  value={form.phone}
  onChange={handleChange}
  placeholder="📱 Phone Number"
  required
  className="
    flex-1
    w-full
    min-w-0
    px-2 sm:px-3
    py-3
    text-sm
    sm:text-base
    text-gray-800
    bg-transparent
    outline-none
    overflow-hidden
    whitespace-nowrap
    text-ellipsis
  "
/>
  </div>

  {/* Dropdown menu */}
  {showDropdown && (
    <div className="absolute z-50 top-full left-0 mt-2 w-full sm:w-72 max-w-full bg-white border border-blue-100 rounded-2xl shadow-[0_16px_48px_rgba(37,99,235,0.15)] overflow-hidden">
      
      {/* Search */}
      <div className="p-3 border-b border-blue-50">
        <input
          type="text"
          value={countrySearch}
          onChange={(e) => setCountrySearch(e.target.value)}
          placeholder="🔍 Search country or code..."
          autoFocus
          className="w-full border border-blue-100 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400"
        />
      </div>

      {/* List */}
      <ul className="max-h-52 overflow-y-auto divide-y divide-blue-50">
        {filteredCountries.length > 0 ? (
          filteredCountries.map((c, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  setCountryCode(c.code);
                  setShowDropdown(false);
                  setCountrySearch("");
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors text-left ${
                  countryCode === c.code && selectedCountry.name === c.name
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-gray-700"
                }`}
              >
                <span className="text-base">{c.flag}</span>
                <span className="flex-1">{c.name}</span>
                <span className="text-blue-500 font-bold text-xs">{c.code}</span>
              </button>
            </li>
          ))
        ) : (
          <li className="px-4 py-4 text-sm text-gray-400 text-center">
            No country found
          </li>
        )}
      </ul>
    </div>
  )}
</motion.div>


                  {/* <textarea
                    rows="4"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="✍️ Tell us about your business goals..."
                    className="
                      w-full
                      border border-blue-100
                      bg-white
                      rounded-xl px-4 py-3
                      text-gray-800 text-sm
                      resize-none
                      focus:scale-[1.02]
                      focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]
                    "
                  /> */}
                  {/* Purpose selector */}
<div className="flex flex-col gap-2">
  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
    Purpose
  </p>
  <div className="flex flex-wrap gap-2">
    {purposes.map((p) => (
      <button
        key={p.label}
        type="button"
       onClick={() => {
  if (purpose.includes(p.label)) {
    setPurpose(purpose.filter((item) => item !== p.label));

    if (p.label === "Other") {
      setOtherMsg("");
    }
  } else {
    setPurpose([...purpose, p.label]);
  }
}}
        className={`
          flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
          border transition-all duration-200
          ${
            purpose.includes(p.label)
              ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
              : "bg-white text-gray-600 border-blue-100 hover:border-blue-400 hover:text-blue-700"
          }
        `}
      >
        <span>{p.emoji}</span>
        {p.label}
      </button>
    ))}
  </div>

  {/* Show text area only when "Other" is selected */}
  {purpose.includes("Other") && (
    <motion.textarea
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      rows={3}
      value={otherMsg}
      onChange={(e) => setOtherMsg(e.target.value)}
placeholder="✍️ What do you want to use WhatsApp for?"
      required
      className="
        w-full border border-blue-100 bg-white
        rounded-xl px-4 py-3 text-gray-800 text-sm
        resize-none mt-1
        focus:scale-[1.02]
        focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]
      "
    />
  )}
</div>
                  <button
  type="submit"
  disabled={
  loading ||
  purpose.length === 0 ||
  (purpose.includes("Other") && !otherMsg.trim())
}
className="
  btn-primary
  justify-center
  w-full
  py-3 sm:py-4
  rounded-xl
  flex items-center justify-center
  gap-2
  text-xs sm:text-sm md:text-base
  whitespace-nowrap
  overflow-hidden
  disabled:opacity-50
  disabled:cursor-not-allowed">
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        🚀 Request For Demo
                        <span className="animate-bounce">→</span>
                      </>
                    )}
                  </button>

                
                
                 </form>
)}

                
              </motion.div>

            </div>
          </div>
        </div>
      </div>
        
</section>

    
      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="bg-white border-t border-blue-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-7">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            {/* LEFT */}
<div className="flex items-center gap-4">
  <a
    href="https://jmstechnova.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-4"
  >
    <img src={logo} alt="JMS TechNova" className="h-12 w-auto" />

    <div>
      <h3 className="text-lg font-bold text-gray-900">
        JMS TechNova
      </h3>

      <div className="flex items-center gap-1 mt-0.5">
        <div className="w-2 h-2 rounded-full bg-blue-600"></div>

        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
          Official Meta Partner
        </span>
      </div>
    </div>
  </a>
</div>

            {/* RIGHT */}
          <p className="text-sm font-semibold text-blue-500 text-center md:text-right">
  © {new Date().getFullYear()}{" "}
  <a
    href="https://jmstechnova.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="font-bold"
  >
    JMS TechNova
  </a>
  . All rights reserved.
</p>
          </div>
        </div>
      </footer>
      {/* ═══════════════════════════════════════════════════
    FLOATING WHATSAPP BUTTON
═══════════════════════════════════════════════════ */}

  <a
  href="https://api.whatsapp.com/send?phone=919274916851&text=whatsapp"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
  aria-label="Chat on WhatsApp"
>
  {/* Tooltip */}
  <span className="
    hidden group-hover:flex
    bg-gray-900 text-white
    text-xs font-semibold
    px-3 py-2 rounded-xl
    shadow-lg whitespace-nowrap
    transition-all duration-200
  ">
    Chat with us on WhatsApp
  </span>

  {/* Button */}
  <div className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-110"
    style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
  >
    {/* Ping ring */}
    <span className="absolute inset-0 rounded-full animate-ping opacity-25"
      style={{ background: "#25D366" }}
    />

    {/* WhatsApp SVG icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className="w-7 h-7"
      fill="white"
    >
      <path d="M16.003 2.667C8.639 2.667 2.667 8.638 2.667 16c0 2.364.638 4.572 1.745 6.481L2.667 29.333l7.09-1.718A13.276 13.276 0 0 0 16.003 29.333C23.365 29.333 29.333 23.362 29.333 16S23.365 2.667 16.003 2.667zm0 2.4c6.033 0 10.93 4.897 10.93 10.933s-4.897 10.933-10.93 10.933a10.88 10.88 0 0 1-5.637-1.565l-.402-.243-4.207 1.02 1.062-4.083-.268-.418A10.878 10.878 0 0 1 5.07 16c0-6.036 4.897-10.933 10.933-10.933zm-3.29 5.333c-.213 0-.558.08-.85.4-.293.32-1.117 1.09-1.117 2.656s1.143 3.082 1.302 3.295c.16.213 2.24 3.413 5.44 4.651 2.666 1.05 3.2.84 3.776.787.577-.053 1.867-.76 2.134-1.494.266-.733.266-1.36.186-1.493-.08-.134-.293-.214-.613-.374s-1.893-.933-2.187-1.04c-.293-.106-.506-.16-.72.16-.213.32-.826 1.04-.986 1.253-.16.213-.32.24-.64.08s-1.244-.458-2.37-1.463c-.876-.781-1.468-1.746-1.64-2.04-.174-.293-.02-.452.13-.597.134-.13.294-.347.44-.52.147-.173.196-.293.294-.493.097-.2.048-.373-.027-.52-.08-.146-.712-1.72-.976-2.36-.254-.617-.517-.528-.71-.534-.18-.008-.387-.01-.6-.01z"/>
    </svg>
  </div>
</a>

    </div>
  );
};

export default LandingPage;