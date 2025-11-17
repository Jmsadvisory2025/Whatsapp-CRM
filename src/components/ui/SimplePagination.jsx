import React from "react";
import Button from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SimplePagination = ({
  next,
  previous,
  onNext,
  onPrevious,
  totalItems,
  currentPage,
  itemsPerPage
}) => {
  // Calculate current page info
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
  const showingText = totalItems > 0 
    ? `Showing ${startIndex} to ${endIndex} of ${totalItems} entries` 
    : "No entries to show";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 border-t border-gray-200">
      {/* Showing text */}
      <div className="text-sm text-gray-600">{showingText}</div>

      {/* Simple Pagination controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!previous}
          className="p-2 flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>
        
        <div className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded">
          Page {currentPage}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!next}
          className="p-2 flex items-center gap-1"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SimplePagination;