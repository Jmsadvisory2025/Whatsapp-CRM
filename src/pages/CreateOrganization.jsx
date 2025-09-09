import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { CheckCircle, Info, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import CreateOrganizationIcons from "../assets/images/assets";

const { BuildingIcon } = CreateOrganizationIcons;

const CreateOrganization = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
  });

  // Redirect to dashboard after demo submission
  useEffect(() => {
    // No token check for demo
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For demo, just log the data and navigate to dashboard
    console.log("Demo Organization Data:", formData);
    navigate("/"); // Navigate to dashboard for demo
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto lg:grid lg:grid-cols-2 lg:gap-10">
        {/* Left Blue Panel */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col justify-center bg-primary text-white p-10 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 7L12 12L22 7"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22V12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold">Welcome to META-CRM</span>
          </div>
          <p className="text-indigo-200 mb-8">
            Set up your organization to start managing your Instagram pages
            and campaigns effectively.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <CheckCircle size={20} /> Organize your Instagram pages
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle size={20} /> Manage ad campaigns
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle size={20} /> Track ad performance
            </li>
          </ul>
        </motion.div>

        {/* Right Form Panel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-surface p-8 md:p-10 rounded-2xl shadow-lg border border-gray-200/80"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 flex items-center gap-2">
            Create Your Organization
            <img
              src={BuildingIcon}
              alt="Organization Icon"
              className="w-8 h-8"
            />
          </h1>
          <p className="text-text-secondary mb-8">
            Get started by setting up your organization profile (Demo Mode)
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Organization Name *"
              name="name"
              placeholder="Enter your organization name"
              // value={formData.name}
              // onChange={handleInputChange}
              // error={formData.name === "" ? "Organization name is required" : ""}
            />

            <Input
              label="Email Address *"
              type="email"
              name="email"
              placeholder="your@email.com"
              // value={formData.email}
              // onChange={handleInputChange}
              // error={formData.email === "" ? "Email address is required" : ""}
            />

            <Input
              label={
                <>
                  Website URL <span className="text-gray-400">(Optional)</span>
                </>
              }
              name="website"
              placeholder="https://yourwebsite.com"
              // value={formData.website}
              // onChange={handleInputChange}
              // error={
              //   formData.website &&
              //   !formData.website.startsWith("http")
              //     ? "Please enter a valid URL (include http:// or https://)"
              //     : ""
              // }
            />

            <Button
              type="submit"
              className="w-full !py-3 !text-base !mt-8 bg-blue-600 hover:bg-blue-700"
            >
              Create Organization (Demo)
            </Button>
          </form>

          <div className="flex items-start gap-2 text-xs text-text-secondary mt-6">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <p>
              This is a demo mode. Your data will not be saved and will navigate
              to the dashboard upon submission.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateOrganization;