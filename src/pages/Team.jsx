import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Shield,
  Wifi,
  WifiOff,
  Phone,
  RefreshCw,
  Mail,
  Hash,
  MapPin,
  Globe,
  Tag,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit3,
  Camera,
  Upload,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { fetchWABAStatus } from "../store/metaConnectSlice";
import { fetchMe } from "../store/authSlice";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const VERTICAL_OPTIONS = [
  { value: "OTHER", label: "Other" },
  { value: "AUTO", label: "Automotive" },
  { value: "BEAUTY", label: "Beauty & Personal Care" },
  { value: "APPAREL", label: "Clothing & Apparel" },
  { value: "EDU", label: "Education" },
  { value: "ENTERTAIN", label: "Entertainment" },
  { value: "EVENT_PLAN", label: "Event Planning" },
  { value: "FINANCE", label: "Finance & Banking" },
  { value: "GROCERY", label: "Grocery" },
  { value: "GOVT", label: "Government" },
  { value: "HOTEL", label: "Hotel & Lodging" },
  { value: "HEALTH", label: "Medical & Health" },
  { value: "NONPROFIT", label: "Non-Profit" },
  { value: "PROF_SERVICES", label: "Professional Services" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "RETAIL", label: "Retail" },
  { value: "TRAVEL", label: "Travel & Transportation" },
];

const Team = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    organization,
    org_email,
    owner_email,
  } = useSelector((s) => s.auth);

  const {
    wabaStatus,
    wabaId,
    phoneNumber,
    phoneNumberId,
    isLoadingStatus: metaLoading,
  } = useSelector((s) => s.metaConnect);

  // Business Profile State
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [uploadingPic, setUploadingPic] = useState(false);

  const [profileData, setProfileData] = useState({
    about: "",
    address: "",
    description: "",
    email: "",
    profile_picture_url: "",
    websites: ["", ""],
    vertical: "OTHER",
  });

  const isWhatsAppConnected =
    wabaStatus === "connected" || Boolean(wabaId && phoneNumberId);

  const loadData = () => {
    dispatch(fetchWABAStatus());
    dispatch(fetchMe());
    if (isWhatsAppConnected) {
      fetchBusinessProfile();
    }
  };

  const fetchBusinessProfile = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await fetch(`${API_BASE}/api/waba/business-profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch WhatsApp profile");
      }
      if (data.profile) {
        const p = data.profile;
        const sites = Array.isArray(p.websites) ? p.websites : [];
        setProfileData({
          about: p.about || "",
          address: p.address || "",
          description: p.description || "",
          email: p.email || "",
          profile_picture_url: p.profile_picture_url || "",
          websites: [sites[0] || "", sites[1] || ""],
          vertical: p.vertical || "OTHER",
        });
      }
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchWABAStatus());
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (isWhatsAppConnected) {
      fetchBusinessProfile();
    }
  }, [isWhatsAppConnected]);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (<= 5MB)
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setProfileError("Please select a valid image file (JPEG or PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Image size must be less than 5MB.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setUploadingPic(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const formData = new FormData();
      formData.append("profile_picture", file);

      const res = await fetch(`${API_BASE}/api/waba/business-profile/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload profile picture to Meta");
      }

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
      // Re-fetch to get the updated profile_picture_url from Meta
      setTimeout(() => {
        fetchBusinessProfile();
      }, 1000);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setUploadingPic(false);
      // Reset input value so same file can be re-selected if needed
      e.target.value = "";
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setProfileSaving(true);
    setProfileSuccess(false);
    setProfileError(null);

    try {
      const cleanWebsites = (profileData.websites || [])
        .map((w) => w.trim())
        .filter(Boolean);

      const payload = {
        address: profileData.address,
        description: profileData.description,
        email: profileData.email,
        websites: cleanWebsites,
        vertical: profileData.vertical,
      };

      const res = await fetch(`${API_BASE}/api/waba/business-profile/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const rawErr = data.error || data.detail || "";
        if (
          rawErr.toLowerCase().includes("coexistence") ||
          rawErr.toLowerCase().includes("smb") ||
          rawErr.toLowerCase().includes("app") ||
          res.status === 403 ||
          res.status === 400
        ) {
          throw new Error(
            rawErr ||
              "Your phone number is linked to the WhatsApp Business Mobile App (Coexistence). Please update this profile information directly inside your WhatsApp Business App on your phone."
          );
        }
        throw new Error(rawErr || "Failed to update profile");
      }

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
      fetchBusinessProfile();
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const orgNameVal =
    organization ||
    localStorage.getItem("userOrg") ||
    localStorage.getItem("organization") ||
    "—";

  const emailVal =
    owner_email ||
    org_email ||
    localStorage.getItem("ownerEmail") ||
    localStorage.getItem("orgEmail") ||
    "—";

  const rawPhone = String(phoneNumber || "").trim();
  const phoneVal = rawPhone
    ? rawPhone.startsWith("+")
      ? rawPhone
      : `+${rawPhone}`
    : "—";

  const wabaIdVal = wabaId || "—";
  const phoneIdVal = phoneNumberId || localStorage.getItem("phoneNumberId") || "—";

  const cards = [
    {
      icon: Building2,
      label: "ORGANIZATION",
      value: orgNameVal,
    },
    {
      icon: Mail,
      label: "EMAIL",
      value: emailVal,
    },
    {
      icon: isWhatsAppConnected ? Wifi : WifiOff,
      label: "STATUS",
      value: isWhatsAppConnected ? "Connected" : "Disconnected",
      badge: (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            isWhatsAppConnected
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-100 text-[#64748B] border border-slate-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isWhatsAppConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
            }`}
          />
          <span>{isWhatsAppConnected ? "Active" : "Offline"}</span>
        </span>
      ),
    },
    {
      icon: Phone,
      label: "PHONE NUMBER",
      value: phoneVal,
      isMono: true,
    },
    {
      icon: Shield,
      label: "WABA ID",
      value: wabaIdVal,
      isMono: true,
    },
    {
      icon: Hash,
      label: "PHONE NUMBER ID",
      value: phoneIdVal,
      isMono: true,
    },
  ];

  return (
    <div className="p-5 sm:p-6 lg:p-7 space-y-5 bg-[#FAFAFC] min-h-screen w-full font-sans text-[#172033]">
      {/* ── Page Header (Exact match with Dashboard, Customers, Templates & Campaigns) ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3.5 min-h-[56px] border-b border-[#E5E7EB]/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172033] leading-tight">
            Profile
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-normal">
            Manage your organization information and official WhatsApp Business profile on Meta.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={loadData}
            disabled={metaLoading || profileLoading}
            className="h-9 flex items-center gap-1.5 text-xs font-semibold px-3.5 bg-white border border-[#E5E7EB] rounded-xl text-[#172033] hover:border-[#165DFF]/40 hover:text-[#165DFF] hover:bg-blue-50/30 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              size={13}
              className={metaLoading || profileLoading ? "animate-spin text-[#165DFF]" : "text-[#64748B]"}
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => navigate("/setup")}
            className="h-9 flex items-center gap-1.5 text-xs font-semibold px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
          >
            <FaWhatsapp className="text-sm" />
            <span>{isWhatsAppConnected ? "Reconnect WhatsApp" : "Connect WhatsApp"}</span>
          </button>
        </div>
      </div>

      {/* ── Single Unified Card: Account & WhatsApp Business Profile ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Unified Card Header: Profile DP, Org Name & Meta Connection Status */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4 bg-slate-50/40">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              {/* WhatsApp Circular Avatar with Ring Preview */}
              <div
                style={{ width: "80px", height: "80px", minWidth: "80px", minHeight: "80px" }}
                className="rounded-full bg-white border-2 border-slate-200/90 shadow-sm flex items-center justify-center overflow-hidden p-1.5 transition-all group-hover:border-[#165DFF]/60"
              >
                {uploadingPic ? (
                  <RefreshCw size={26} className="animate-spin text-[#165DFF]" />
                ) : profileData.profile_picture_url ? (
                  <img
                    src={profileData.profile_picture_url}
                    alt="WhatsApp Profile"
                    style={{ width: "68px", height: "68px", minWidth: "68px", minHeight: "68px" }}
                    className="object-cover rounded-full"
                  />
                ) : (
                  <Building2 size={30} className="text-[#165DFF]" />
                )}
              </div>

              {/* Hover Camera Overlay for quick re-upload */}
              {isWhatsAppConnected && (
                <label
                  title="Change WhatsApp Profile Picture"
                  className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                >
                  <Camera size={20} className="drop-shadow" />
                  <span className="text-[9px] font-semibold mt-0.5 drop-shadow">Change</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleProfilePicChange}
                    disabled={uploadingPic}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#172033] tracking-tight">
                {orgNameVal}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5 flex items-center gap-2">
                <span>{emailVal}</span>
                {phoneVal !== "—" && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-slate-700 font-medium">{phoneVal}</span>
                  </>
                )}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <FaWhatsapp className="text-emerald-500 text-xs" />
                  WhatsApp Live Avatar Preview
                </span>
                {isWhatsAppConnected && (
                  <label className="text-[11px] text-[#165DFF] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1">
                    <Camera size={11} />
                    <span>{uploadingPic ? "Uploading..." : "Change Photo"}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleProfilePicChange}
                      disabled={uploadingPic}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Quick Technical Badges Strip */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs flex items-center gap-2">
              <Shield size={13} className="text-[#165DFF]" />
              <span className="text-slate-400 font-medium">WABA:</span>
              <span className="font-mono font-semibold text-[#172033] text-[11px]">{wabaIdVal}</span>
            </div>
            <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs flex items-center gap-2">
              <Hash size={13} className="text-[#165DFF]" />
              <span className="text-slate-400 font-medium">Phone ID:</span>
              <span className="font-mono font-semibold text-[#172033] text-[11px]">{phoneIdVal}</span>
            </div>
          </div>
        </div>

        {/* Unified Card Body */}
        {!isWhatsAppConnected ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-3">
              <WifiOff size={22} />
            </div>
            <h3 className="text-sm font-bold text-[#172033]">
              WhatsApp Business Account Not Connected
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 mb-4 leading-relaxed">
              To customize your WhatsApp Business profile (Address, Description, Websites, and Industry category), please connect your Meta WABA account.
            </p>
            <button
              onClick={() => navigate("/setup")}
              className="h-9 px-4 rounded-xl bg-[#165DFF] hover:bg-[#1247CC] text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer"
            >
              Connect WhatsApp Now
            </button>
          </div>
        ) : profileLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <RefreshCw size={24} className="animate-spin text-[#165DFF] mb-2" />
            <p className="text-xs text-[#64748B]">Fetching live profile from Meta...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
            {/* Notifications */}
            {profileSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>WhatsApp Business Profile updated successfully on Meta!</span>
              </div>
            )}
            {profileError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-800 font-medium">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Industry Category */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag size={13} className="text-[#165DFF]" />
                  Industry Category
                </label>
                <select
                  value={profileData.vertical}
                  onChange={(e) =>
                    setProfileData({ ...profileData, vertical: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs text-[#172033] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 outline-none transition"
                >
                  {VERTICAL_OPTIONS.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Public Business Email */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Mail size={13} className="text-[#165DFF]" />
                  Public Contact Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  placeholder="info@yourcompany.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs text-[#172033] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 outline-none transition"
                />
              </div>

              {/* Business Description */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} className="text-[#165DFF]" />
                    Business Description
                  </label>
                  <span className="text-[11px] text-[#94A3B8] font-mono">
                    {profileData.description.length}/512
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={512}
                  value={profileData.description}
                  onChange={(e) =>
                    setProfileData({ ...profileData, description: e.target.value })
                  }
                  placeholder="Describe your company, products, and specialties..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs text-[#172033] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 outline-none transition resize-none leading-relaxed"
                />
              </div>

              {/* Physical Business Address */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#165DFF]" />
                  Business Address
                </label>
                <input
                  type="text"
                  maxLength={256}
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                  placeholder="Street, City, State, Country"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs text-[#172033] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 outline-none transition"
                />
              </div>

              {/* Website 1 */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe size={13} className="text-[#165DFF]" />
                  Website 1
                </label>
                <input
                  type="url"
                  value={profileData.websites[0] || ""}
                  onChange={(e) => {
                    const next = [...profileData.websites];
                    next[0] = e.target.value;
                    setProfileData({ ...profileData, websites: next });
                  }}
                  placeholder="https://example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs text-[#172033] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 outline-none transition"
                />
              </div>

              {/* Website 2 */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe size={13} className="text-[#165DFF]" />
                  Website 2 (Optional)
                </label>
                <input
                  type="url"
                  value={profileData.websites[1] || ""}
                  onChange={(e) => {
                    const next = [...profileData.websites];
                    next[1] = e.target.value;
                    setProfileData({ ...profileData, websites: next });
                  }}
                  placeholder="https://portal.example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs text-[#172033] focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/10 outline-none transition"
                />
              </div>
            </div>

            {/* Form Footer Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <span className="text-[11px] text-[#64748B] flex items-center gap-1.5">
                <FaWhatsapp className="text-emerald-500 text-sm" />
                <span>Changes save instantly to official Meta WhatsApp servers.</span>
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={fetchBusinessProfile}
                  disabled={profileSaving}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#64748B] hover:text-[#172033] hover:bg-slate-50 transition cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#165DFF] hover:bg-[#1247CC] text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {profileSaving ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving to Meta...</span>
                    </>
                  ) : (
                    <>
                      <Save size={13} />
                      <span>Save to WhatsApp Meta</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Team;
