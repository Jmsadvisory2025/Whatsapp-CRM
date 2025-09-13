import React from "react";
import { UserCheck, User, Briefcase } from "lucide-react";

const RecentActivities = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return <div className="text-center py-4 text-gray-500">No recent activity</div>;
  }

  const getStatusText = (status, confirmation) => {
    const statusMap = {
      patient: "Patient added",
      follow_up: "Follow-up scheduled",
      not_interested: "Not interested",
    };
    const confirmationStatus = confirmation === "confirmed" ? " (Confirmed)" : confirmation === "pending" ? " (Pending)" : "";
    return `${statusMap[status] || status}${confirmationStatus}`;
  };

  const getIcon = (status) => {
    switch (status) {
      case "patient":
        return UserCheck;
      case "follow_up":
        return User;
      case "not_interested":
      default:
        return Briefcase;
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {activities.map((activity, index) => (
        <div key={index} className="p-3 hover:bg-gray-50 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {React.createElement(getIcon(activity.status), { className: "w-5 h-5 text-gray-600" })}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getStatusText(activity.status, activity.confirmation)}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {activity.name ? `${activity.name} - ${activity.disease || "No disease specified"}` : activity.phone.replace("whatsapp:", "")}
              </p>
            </div>
            <div className="flex-shrink-0 text-xs text-gray-400">
              {new Date(activity.created_at).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivities;