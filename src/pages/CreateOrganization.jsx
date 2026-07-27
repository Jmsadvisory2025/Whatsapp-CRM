/**
 * ConnectWhatsApp.jsx  (was CreateOrganization.jsx)
 *
 * Post-signup / post-signin onboarding for NEW users who haven't connected WABA yet.
 *
 * Flow:  Signin → HomeResolver detects !waba_connected → navigate('/setup')
 *        This page: Meta Embedded Signup popup → success → navigate('/')
 *
 * Route: /setup  (requires accessToken)
 *
 * Redux slices:
 *   metaConnectSlice → startEmbeddedSignup, setSignupStep, resetSignupStep
 *
 * ENV vars needed:
 *   VITE_META_APP_ID
 *   VITE_META_CONFIG_ID
 */

import React, { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { FaWhatsapp, FaMeta } from "react-icons/fa6";

import {
  startEmbeddedSignup,
  setSignupStep,
  resetSignupStep,
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

/* ── Logo ─────────────────────────────────────────────────────────────────── */
const Logo = () => (
  <div className="flex items-center gap-2 mb-8">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
      <FaWhatsapp className="text-white text-sm" />
    </div>
    <span className="font-extrabold text-gray-900 text-lg tracking-tight">
      JMS TechNova
    </span>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────── */

export default function ConnectWhatsApp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isSaving, signupStep, error: metaError } =
    useSelector((s) => s.metaConnect);

  const wabaRef = useRef({ waba_id: "", phone_number_id: "", business_id: "" });

  /* ── FB SDK + postMessage listener ───────────────────────────────────── */
  useEffect(() => {
    dispatch(resetSignupStep());

    // Pre-load SDK so popup opens instantly when user clicks
    loadFbSdk(() => dispatch(setSignupStep("sdk_ready")));
    window.addEventListener("message", handleFbMessage);

    return () => {
      window.removeEventListener("message", handleFbMessage);
    };
  }, []);

  const handleFbMessage = useCallback((event) => {
    if (event.origin !== "https://www.facebook.com") return;
    try {
      const data = JSON.parse(event.data);
      if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
        wabaRef.current = {
          waba_id:         data.data?.waba_id         || "",
          phone_number_id: data.data?.phone_number_id || "",
          business_id:     data.data?.business_id     || "",
        };
      }
    } catch { /* ignore non-JSON */ }
  }, []);

  /* ── Launch Meta Embedded Signup popup ───────────────────────────────── */
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
      (response) => {
        if (!response.authResponse) {
          dispatch(setSignupStep("idle"));
          return;
        }

        const { code } = response.authResponse;
        const { waba_id, phone_number_id, business_id } = wabaRef.current;

        // dispatch(startEmbeddedSignup({ code, waba_id, phone_number_id, business_id }))
        //   .unwrap()
        //   .then(() => navigate("/"))
        dispatch(startEmbeddedSignup({ code, waba_id, phone_number_id, business_id }))
        .unwrap()
        .then(() => navigate("/connected-business", { replace: true }))  
          .catch(() => {
            // metaError Redux state will show the error in UI
          });
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

  const isConnecting = isSaving || signupStep === "popup_open" || signupStep === "saving";

  /* ── render ── */
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 px-8 py-10">
          <Logo />

          {/* WhatsApp icon */}
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

          {/* Steps */}
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

          {/* Error */}
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

          {/* CTA */}
          <button
            onClick={handleConnectWhatsApp}
            disabled={isConnecting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
          >
            {isSaving || signupStep === "saving" ? (
              <><Loader2 size={16} className="animate-spin" /> Connecting…</>
            ) : signupStep === "popup_open" ? (
              <><Loader2 size={16} className="animate-spin" /> Waiting for Facebook…</>
            ) : (
              <><FaMeta size={16} /> Continue with Facebook</>
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
              onClick={() => {
                localStorage.setItem("skip_setup", "true");
                navigate("/");
              }}
              className="text-blue-500 hover:underline font-semibold"
            >
              connect later from Dashboard
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
