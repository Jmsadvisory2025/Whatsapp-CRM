import React from "react";
import { CSVLink } from "react-csv";
import Button from "./Button"; // Adjust the import path based on your project structure

const ExportCSVButton = ({ data, headers, filename = "export.csv", className = "", onClick }) => {
  return (
    <CSVLink
      data={data}
      headers={headers}
      filename={filename}
      className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md inline-flex items-center ${className}`}
      onClick={onClick}
    >
      Export as CSV
    </CSVLink>
  );
};

export default ExportCSVButton;