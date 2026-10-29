import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, Building2, Globe, User, Key, Eye, EyeOff } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import jmsLogo from "../assets/jms.png";
import SignUpSimpleArt from "../components/ui/SignUpSimpleArt";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SignUp = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) { setError("Please enter a valid email"); return; }
    if (!password.trim()) { setError("PIN/Password is required"); return; }
    if (!fullName.trim()) { setError("Your name is required"); return; }
    if (!name.trim()) { setError("Organisation name is required"); return; }

    try {
      setLoading(true);
      setError("");
      const res = await axios.post(`${API_BASE_URL}api/signup/`, {
        full_name: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        name: name.trim(),
        website: website.trim() || undefined,
      });
      setSuccess(res.data.message || "Account created successfully");
      setTimeout(() => navigate("/signin"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const isValid = validateEmail(email) && name.trim().length > 0 && fullName.trim().length > 0 && password.trim().length > 0;

  return (
    <div className="h-screen w-full bg-[#FAFAFC] flex flex-col font-sans overflow-hidden">
      {/* Top Brand Logo - Clean, without sticky bar border/background */}
      <div className="w-full px-8 sm:px-14 pt-6 pb-2 shrink-0">
        <img
          src={jmsLogo}
          alt="JMS Logo"
          className="h-16 sm:h-20 w-auto object-contain cursor-pointer"
          onClick={() => navigate("/signin")}
        />
      </div>

      {/* Split Screen Content - elevated and centered */}
      <main className="flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center px-6 sm:px-12 pb-8 gap-8 lg:gap-14 overflow-hidden -mt-4">

        {/* ── LEFT HERO BANNER ── */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <SignUpSimpleArt />
        </div>

        {/* ── RIGHT SIGN UP CARD ── */}
        <div className="lg:col-span-6 w-full max-w-[440px] mx-auto flex flex-col justify-center">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xl shadow-blue-500/5">

            {/* Title Header */}
            <div className="mb-4 text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
                Create Account
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed font-normal">
                Set up your organisation and manage leads, customer conversations, and WhatsApp campaigns in one place.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Your Name */}
                <div>
                  <label className="text-xs font-medium text-[#172033] mb-1.5 block">
                    Your Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setError(""); }}
                      placeholder="Enter Your Name"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-white rounded-xl border border-[#E5E7EB] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 outline-none transition-all"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Organisation Name */}
                <div>
                  <label className="text-xs font-medium text-[#172033] mb-1.5 block">
                    Organisation Name
                  </label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(""); }}
                      placeholder="Organisation Name"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-white rounded-xl border border-[#E5E7EB] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 outline-none transition-all"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-xs font-medium text-[#172033] mb-1.5 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white rounded-xl border border-[#E5E7EB] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 outline-none transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-medium text-[#172033] mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  {/* Lock icon */}
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Create a secure password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-white rounded-xl border border-[#E5E7EB] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 outline-none transition-all"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Website (Optional) */}
              <div>
                <label className="text-xs font-medium text-[#172033] mb-1.5 block">
                  Website <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => { setWebsite(e.target.value); setError(""); }}
                    placeholder="https://example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white rounded-xl border border-[#E5E7EB] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 outline-none transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Error / Success Notifications */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 rounded-xl text-xs">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-2 rounded-xl text-xs">
                  {success}
                </div>
              )}

              {/* Submit Button - Solid Vibrant Blue exactly matching reference image */}
              <button
                type="submit"
                disabled={loading}
                className="w-full !mt-3 py-3 px-4 text-xs font-semibold rounded-xl text-white bg-[#165DFF] hover:bg-[#1247CC] active:bg-[#0D38A8] transition-all shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <span>Create Account &rarr;</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-[#64748B]">
                  Already have an account?{" "}
                  <span
                    onClick={() => navigate("/signin")}
                    className="text-[#165DFF] font-medium cursor-pointer hover:underline"
                  >
                    Sign In
                  </span>
                </p>
              </div>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
};

export default SignUp;