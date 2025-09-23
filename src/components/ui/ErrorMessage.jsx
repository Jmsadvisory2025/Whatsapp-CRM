import React from "react";

 function ErrorMessage({ icon: Icon, message }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
      {Icon && <Icon className="w-5 h-5 mt-1 text-red-600" />}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export default ErrorMessage;