import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Mail, ShieldCheck, UserPlus, Building2, Globe, User, Key } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SignUp = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

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
        email:     email.trim(),
        password:  password.trim(),
        name:      name.trim(),
        website:   website.trim() || undefined,
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface p-8 md:p-10 rounded-2xl shadow-lg border border-gray-200/80">
          <div className="text-center mb-8">
            <div className="inline-block bg-primary p-3 rounded-xl mb-4">
              <UserPlus className="text-white" size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Create Account</h1>
            <p className="text-text-secondary mt-2">Set up your organisation and get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Your Name */}
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1 block">
                Your Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setError(""); }}
                  placeholder=" John Doe "
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Organisation Name */}
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1 block">
                Organisation Name
              </label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  placeholder="JMS TechNova"
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1 block">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="admin@example.com"
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* PIN / Password */}
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1 block">
                PIN / Password
              </label>
              <div className="relative">
                <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter a secure PIN"
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Website (optional) */}
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1 block">
                Website <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="url"
                  value={website}
                  onChange={(e) => { setWebsite(e.target.value); setError(""); }}
                  placeholder="https://example.com"
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Error / Success */}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading || !isValid}
              className="w-full !py-3 !text-base bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : "Create Account"}
            </Button>

            <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-4 rounded-lg flex items-center gap-3">
              <ShieldCheck size={20} />
              <div>
                <h4 className="font-semibold">Secure Registration</h4>
                <p>You'll connect WhatsApp after signing in.</p>
              </div>
            </div>
          </form>

          <p className="text-sm text-center mt-6 text-gray-500">
            Already have an account?{" "}
            <span onClick={() => navigate("/signin")} className="text-blue-600 cursor-pointer font-medium">
              Sign In
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;