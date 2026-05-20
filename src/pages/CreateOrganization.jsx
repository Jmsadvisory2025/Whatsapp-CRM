/**
 * CreateOrganization.jsx
 *
 * Post-signup onboarding — replaces the existing CreateOrganization.jsx.
 *
 * Steps:
 *   1. Create Organization  (name, email, website)
 *   2. Connect WhatsApp     (Meta Embedded Signup popup via FB JS SDK)
 *      - FB.login() launches OAuth popup
 *      - sessionInfoListener captures { waba_id, phone_number_id }
 *      - POST /api/meta/embedded-signup/start/ via startEmbeddedSignup thunk
 *   3. Success → navigate('/')  (dashboard)
 *
 * Route: /setup  (requires accessToken)
 *
 * Redux slices:
 *   organizationSlice → createOrganization, clearErrors, clearFieldError
 *   metaConnectSlice  → startEmbeddedSignup, setSignupStep, resetSignupStep
 *
 * ENV vars needed:
 *   VITE_META_APP_ID
 *   VITE_META_CONFIG_ID
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Building2,
  Globe,
  Mail,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { FaWhatsapp, FaMeta } from "react-icons/fa6";

import {
  createOrganization,
  clearErrors,
  clearFieldError,
} from "../store/organizationSlice";

import {
  startEmbeddedSignup,
  setSignupStep,
  resetSignupStep,
  clearMetaError,
} from "../store/metaConnectSlice";

/* ── ENV ─────────────────────────────────────────────────────────────────── */
const META_APP_ID    = import.meta.env.VITE_META_APP_ID    || "";
const META_CONFIG_ID = import.meta.env.VITE_META_CONFIG_ID || "";

/* ── FB SDK loader ────────────────────────────────────────────────────────── */
let _sdkReady = false;

function loadFbSdk(onReady) {
  if (_sdkReady || window.FB) { onReady(); return; }
  window.fbAsyncInit = () => {
    window.FB.init({ appId: META_APP_ID, autoLogAppEvents: true, xfbml: true, version: "v19.0" });
    _sdkReady = true;
    onReady();
  };
  const s = document.createElement("script");
  s.src = "https://connect.facebook.net/en_US/sdk.js";
  s.async = true; s.defer = true;
  document.body.appendChild(s);
}

/* ── Step indicator ───────────────────────────────────────────────────────── */
const StepDot = ({ n, active, done, label }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className={`
        w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
        ${done  ? "bg-green-500 text-white shadow-sm shadow-green-200"
                : active ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                : "bg-gray-100 text-gray-400"}
      `}
    >
      {done ? <CheckCircle size={16} /> : n}
    </div>
    <span className={`text-xs font-semibold ${active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"}`}>
      {label}
    </span>
  </div>
);

const StepConnector = ({ done }) => (
  <div className={`flex-1 h-0.5 mb-5 rounded-full transition-colors ${done ? "bg-green-400" : "bg-gray-200"}`} />
);

/* ── Logo ─────────────────────────────────────────────────────────────────── */
const Logo = () => (
  <div className="flex items-center gap-2 mb-8">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
      <FaWhatsapp className="text-white text-sm" />
    </div>
    <span className="font-extrabold text-gray-900 text-lg tracking-tight">
      Meta<span className="text-green-500">CRM</span>
    </span>
  </div>
);

/* ── Input field ──────────────────────────────────────────────────────────── */
const Field = ({ label, icon: Icon, error, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
      {Icon && <Icon size={14} className="text-gray-400" />} {label}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
  </div>
);

import { useNavigate, useLocation } from "react-router-dom";  

export default function CreateOrganization() {
  const navigate  = useNavigate();
  const location  = useLocation();           
  const dispatch  = useDispatch();

  const { isLoading: orgLoading, error: orgError, fieldErrors } =
    useSelector((s) => s.organization);
  const { isSaving, signupStep, error: metaError } =
    useSelector((s) => s.metaConnect);

  //  HomeResolver passes state: { step: 2 } if org exists but WABA not connected
  const [uiStep, setUiStep] = useState(
    location.state?.step === 2 ? 2 : 1
  );

  // Org form
  const [orgName,    setOrgName]    = useState("");
  const [orgEmail,   setOrgEmail]   = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");

  // WABA data captured from FB postMessage
  const wabaRef = useRef({ waba_id: "", phone_number_id: "", business_id: "" });

  /* ── FB SDK + postMessage listener ───────────────────────────────────── */
  useEffect(() => {
    dispatch(resetSignupStep());

    // Load SDK when user arrives at step 2
    // (we lazy-load to keep step-1 snappy)
    return () => {
      window.removeEventListener("message", handleFbMessage);
    };
  }, []);

  const handleFbMessage = useCallback((event) => {
    if (event.origin !== "https://www.facebook.com") return;
    try {
      const data = JSON.parse(event.data);
      if (data.type === "WA_EMBEDDED_SIGNUP") {
        if (data.event === "FINISH") {
          wabaRef.current = {
            waba_id:         data.data?.waba_id          || "",
            phone_number_id: data.data?.phone_number_id  || "",
            business_id:     data.data?.business_id      || "",
          };
        }
      }
    } catch { /* ignore non-JSON */ }
  }, []);

  /* ── Step 1: Create Organisation ─────────────────────────────────────── */
  const handleCreateOrg = async (e) => {
    e.preventDefault();
    dispatch(clearErrors());

    const payload = {
      name:    orgName.trim(),
      email:   orgEmail.trim(),
      website: orgWebsite.trim() || undefined,
    };

    try {
      await dispatch(createOrganization(payload)).unwrap();
      setUiStep(2);
      // Load FB SDK in background as user reads step-2 UI
      loadFbSdk(() => dispatch(setSignupStep("sdk_ready")));
      window.addEventListener("message", handleFbMessage);
    } catch { /* fieldErrors shown below */ }
  };

  /* ── Step 2: Launch Meta Embedded Signup popup ────────────────────────── */
  const handleConnectWhatsApp = useCallback(() => {
    if (!window.FB) {
      dispatch(setSignupStep("sdk_loading"));
      loadFbSdk(() => {
        dispatch(setSignupStep("sdk_ready"));
        openPopup();
      });
      return;
    }
    openPopup();
  }, []);

  const openPopup = () => {
    dispatch(setSignupStep("popup_open"));

    window.FB.login(
      async (response) => {
        if (response.authResponse) {
          const { code } = response.authResponse;
          const { waba_id, phone_number_id, business_id } = wabaRef.current;

          try {
            await dispatch(
              startEmbeddedSignup({ code, waba_id, phone_number_id, business_id })
            ).unwrap();
            setUiStep(3);
          } catch { /* metaError shown below */ }
        } else {
          dispatch(setSignupStep("idle"));
        }
      },
      {
        config_id: META_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: "3",
        },
      }
    );
  };

  /* ── render ── */
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 px-8 py-10">
          <Logo />

          {/* Step indicator */}
          <div className="flex items-center mb-10">
            <StepDot n="1" active={uiStep === 1} done={uiStep > 1} label="Organization" />
            <StepConnector done={uiStep > 1} />
            <StepDot n="2" active={uiStep === 2} done={uiStep > 2} label="WhatsApp" />
            <StepConnector done={uiStep > 2} />
            <StepDot n="3" active={uiStep === 3} done={false} label="Done" />
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: ORG FORM ──────────────────────────────────────── */}
            {uiStep === 1 && (
              <motion.div
                key="org"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 leading-tight">Create your Organisation</h2>
                    <p className="text-gray-500 text-xs mt-0.5">Set up your workspace in MetaCRM</p>
                  </div>
                </div>

                <form onSubmit={handleCreateOrg} className="mt-7 space-y-5">
                  <Field label="Organisation Name" icon={Building2} error={fieldErrors?.name}>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => { setOrgName(e.target.value); dispatch(clearFieldError("name")); }}
                      placeholder="JMS Eye Hospital"
                      disabled={orgLoading}
                      className={`
                        w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all
                        ${fieldErrors?.name ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}
                        disabled:opacity-50
                      `}
                    />
                  </Field>

                  <Field label="Organisation Email" icon={Mail} error={fieldErrors?.email}>
                    <input
                      type="email"
                      value={orgEmail}
                      onChange={(e) => { setOrgEmail(e.target.value); dispatch(clearFieldError("email")); }}
                      placeholder="admin@hospital.com"
                      disabled={orgLoading}
                      className={`
                        w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all
                        ${fieldErrors?.email ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}
                        disabled:opacity-50
                      `}
                    />
                  </Field>

                  <Field label="Website (optional)" icon={Globe} error={fieldErrors?.website}>
                    <input
                      type="url"
                      value={orgWebsite}
                      onChange={(e) => { setOrgWebsite(e.target.value); dispatch(clearFieldError("website")); }}
                      placeholder="https://hospital.com"
                      disabled={orgLoading}
                      className={`
                        w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all
                        ${fieldErrors?.website ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}
                        disabled:opacity-50
                      `}
                    />
                  </Field>

                  {orgError && !Object.keys(fieldErrors || {}).length && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"
                    >
                      <AlertCircle size={15} /> {orgError}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={orgLoading || !orgName.trim() || !orgEmail.trim()}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {orgLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> Creating…</>
                    ) : (
                      <>Continue <ChevronRight size={16} /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: CONNECT WHATSAPP ──────────────────────────────── */}
            {uiStep === 2 && (
              <motion.div
                key="wa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* WA icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
                    <FaWhatsapp className="text-white text-3xl" />
                  </div>
                </div>

                <h2 className="text-xl font-extrabold text-gray-900 text-center mb-2">
                  Connect WhatsApp Business
                </h2>
                <p className="text-gray-500 text-sm text-center mb-7 leading-relaxed">
                  Click the button below to launch Meta's secure Embedded Signup.
                  Log in with Facebook, select your Business Manager and grant permissions.
                </p>

                {/* What happens next */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-7 space-y-3">
                  {[
                    { icon: "🔐", text: "Log in with your Facebook account" },
                    { icon: "🏢", text: "Select your Business Manager account" },
                    { icon: "✅", text: "Grant WhatsApp messaging permissions" },
                    { icon: "🚀", text: "Get redirected to your CRM dashboard" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-gray-700 text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Meta error */}
                {metaError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5"
                  >
                    <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Connection failed</p>
                      <p className="text-xs mt-0.5">{metaError}</p>
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={handleConnectWhatsApp}
                  disabled={isSaving || signupStep === "popup_open" || signupStep === "saving"}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                >
                  {isSaving || signupStep === "saving" ? (
                    <><Loader2 size={16} className="animate-spin" /> Connecting…</>
                  ) : signupStep === "popup_open" ? (
                    <><Loader2 size={16} className="animate-spin" /> Waiting for Facebook…</>
                  ) : (
                    <>
                      <FaMeta size={16} />
                      Continue with Facebook
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 mt-4 text-gray-400 text-xs">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-green-500">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secured by Meta's official OAuth 2.0 · No passwords shared
                </div>

                <p className="text-center text-xs text-gray-400 mt-5">
                  You can also skip this step and{" "}
                  <button
                    onClick={() => navigate("/")}
                    className="text-blue-500 hover:underline font-semibold"
                  >
                    connect later from Dashboard
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── STEP 3: SUCCESS ───────────────────────────────────────── */}
            {uiStep === 3 && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 280, damping: 18 }}
                  className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200"
                >
                  <CheckCircle size={36} className="text-white" />
                </motion.div>

                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                  You're all set!
                </h2>
                <p className="text-gray-500 text-sm mb-7 leading-relaxed">
                  Your WhatsApp Business Account is connected.
                  Start sending messages directly from your CRM.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-7 text-left space-y-2.5">
                  {["WABA Connected", "Templates Synced", "Dashboard Ready", "Team Notifications Enabled"].map((t) => (
                    <div key={t} className="flex items-center gap-2.5">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      <span className="text-green-800 text-sm font-medium">{t}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate("/")}
                  className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-green-200"
                >
                  Go to Dashboard <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}