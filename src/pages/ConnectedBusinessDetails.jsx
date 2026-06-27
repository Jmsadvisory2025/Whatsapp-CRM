import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function ConnectedBusinessDetails() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(true);

  const accessToken = useSelector((state) => state.auth?.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, [accessToken]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/user/me/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = () => {
    setShowModal(false);
    navigate("/"); 
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-red-200 p-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-center font-bold text-gray-900 mb-2">
            Unable to load details
          </h3>
          <p className="text-center text-sm text-gray-600 mb-6">
            {error || "Business details not found"}
          </p>
          <button
            onClick={fetchUserProfile}
            className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const businessName = profile.organization || "Business Account";
  const wabaId = profile.waba_id || "—";
  const phoneNumber = profile.phone_number || "Not set";

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Page content behind the modal */}
      <div className={`p-8 transition-all duration-300 ${showModal ? "opacity-50 blur-[1px] pointer-events-none select-none" : ""}`}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Business Dashboard</h2>
        <div className="bg-white rounded-xl shadow p-6 h-64 border border-gray-100" />
      </div>

      {/* Success Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm p-8 text-center"
          >
            {/* Circular Check Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" strokeWidth={1.5} />
              </div>
            </div>

            {/* Heading */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>

            {/* Subtext */}
            <p className="text-sm text-gray-500 mb-5">
              Your WhatsApp Business Account has been connected successfully.
            </p>

            {/* List of details */}
            <div className="space-y-2 mb-6 text-left">
              <DetailRow label="Business Name" value={businessName} />
              <DetailRow label="WABA ID" value={wabaId} />
              <DetailRow label="Phone" value={phoneNumber} />
            </div>

            {/* OK Button */}
            <button
              onClick={handleOk}
              className="w-full py-2.5 rounded-lg border border-green-300 text-green-600 font-semibold text-sm hover:bg-green-50 transition-colors"
            >
              Ok
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-900 truncate ml-2">
        {value}
      </span>
    </div>
  );
}