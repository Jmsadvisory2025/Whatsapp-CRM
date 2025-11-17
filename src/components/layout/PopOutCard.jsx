import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X } from "lucide-react";
import { toCamelCase } from "../../hooks/utils";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

// Enhanced PopOutCard Component
const PopOutCard = ({ date, totalVisits, items, onClose }) => {
  // Log items to debug
  // console.log("PopOutCard items:", items);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.3,
          }}
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden mx-4 border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Visit Details</h3>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                Total Visits: {totalVisits}
              </div>
            </div>

            {totalVisits > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, index) => (
                  <motion.div
                  onClick={() => navigate("/leads")}
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {toCamelCase(item.patient_name || "N/A")}
                        </h4>
                        <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                          {item.visit_time || "N/A"}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">Disease:</span>
                          <span className="text-gray-800 font-semibold"> {toCamelCase(item.disease || "N/A")}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">Phone:</span>
                          <span className="text-gray-800">
                            {item.customer?.phone ? item.customer.phone.replace("whatsapp:", "") : "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">Relation:</span>
                          <span className="text-gray-800">{item.relation || "N/A"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 font-medium">Assigned To:</span>
                          <span className="text-gray-800 font-semibold">{toCamelCase(item.assigned_to?.label || "N/A")}</span>
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                          {/* <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-500 font-medium text-xs">Status:</span>
                            <span className="text-gray-700 text-xs">{toCamelCase(item.status || "N/A")}</span>
                          </div> */}
                          {item.reminder_note && item.reminder_note !== "N/A" && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                              <span className="text-xs text-yellow-800 font-medium">Note: </span>
                              <span className="text-xs text-yellow-700">{item.reminder_note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">No visits scheduled</p>
                <p className="text-gray-400 text-sm mt-1">for {new Date(date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PopOutCard;