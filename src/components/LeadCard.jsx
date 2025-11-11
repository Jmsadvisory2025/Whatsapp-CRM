import React from "react";
import { motion } from "framer-motion";
import { MdClose } from "react-icons/md";
import Button from "./ui/Button";
import { FileImage, Phone, MapPin, Calendar, Clock, User, FileText, Activity, Stethoscope } from "lucide-react";
import { toCamelCase } from "../hooks/utils";

const LeadCard = ({ lead, isOpen, onClose, onEdit }) => {
  if (!isOpen || !lead) return null;

  const handleBackdropClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
  };

  const handleImageDownload = (imageUrl, patientName) => {
    try {
      // Create a temporary link element for download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${patientName || 'lead'}_image.jpg`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: open image in new tab
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl  shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-y-auto"
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {toCamelCase(lead.patient_name) || "Unknown Patient"}
              </h2>
              <p className="text-gray-600">Lead Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Contact, Medical & Appointment Info */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-300">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Phone Number</p>
                      <p className="font-medium text-md text-gray-900">{lead.phone?.replace("whatsapp:", "") || "Not Available"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-300">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Location</p>
                      <p className="font-medium text-md text-gray-900">{lead.location || "Not Specified"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Medical Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-300">
                    <Stethoscope className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-xs text-red-600 uppercase tracking-wide">Disease</p>
                      <p className="font-medium text-md text-red-700">{toCamelCase(lead.disease) || "Not Specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-300">
                    <User className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Relation</p>
                      <p className="font-medium text-sm text-gray-900">{lead.relation || "Not Specified"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Appointment Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-300">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Visit Date</p>
                      <p className="font-medium text-sm text-gray-900">{lead.visit_date || "Not Scheduled"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-300">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Visit Time</p>
                      <p className="font-medium text-sm text-gray-900">{lead.visit_time || "Not Scheduled"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-300">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Status</p>
                      <p className="font-medium text-sm text-gray-900">{lead.status || "Not Specified"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Additional Info and Assets */}
            <div className="space-y-6">
              {/* Additional Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Additional Information
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-300">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Reminder Note</p>
                    <p className="font-medium text-sm text-gray-900 leading-relaxed">{lead.reminder_note || "No reminder notes"}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-300">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Assigned To</p>
                    <p className="font-medium text-sm text-gray-900">{lead.assigned_to?.name || "Not Assigned"}</p>
                  </div>
                </div>
              </div>

              {/* Assets */}
              {/* <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-indigo-600" />
                  Assets
                </h3>
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-300">
                  {lead.photo_url ? (
                    <div className="space-y-3">
                      <div className="relative group">
                        <img
                          src={lead.photo_url}
                          alt="Lead attachment"
                          className="w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]"
                          onClick={() => handleImageDownload(lead.photo_url, lead.patient_name)}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />

                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Click to download
                        </div>
                      </div>
                      <div className="hidden text-gray-500 text-center">
                        <FileImage className="w-8 h-8 mx-auto mb-2" />
                        Failed to load image
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      <FileImage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium mb-1">No Image</p>
                      <p className="text-sm text-gray-400">No image attached to this lead</p>
                    </div>
                  )}
                </div> 
              </div> */}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="secondary"
            onClick={onClose}
            className="px-6 w-full py-2"
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onEdit(lead);
              onClose();
            }}
            className="px-6 w-full py-2 font-extrabold"
          >
            Edit Lead
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LeadCard;
