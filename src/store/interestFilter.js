/**
 * Utility function to filter leads/prospects by interest or service.
 * Replaces the healthcare-specific diseaseFilter.
 *
 * @param {Array}  data           - Array of lead/prospect objects
 * @param {string} selectedValue  - Selected filter value ("all" or a keyword)
 * @param {string} field          - Field name to filter on (default: "interest")
 * @returns {Array} Filtered array
 */
export const filterByInterest = (data, selectedValue, field = "interest") => {
  if (!data || !Array.isArray(data)) return [];
  if (selectedValue === "all") return data;

  return data.filter((item) => {
    // Support both new field name (interest) and legacy alias (disease)
    const value = item[field] || item["disease"] || item["service"] || "";
    if (!value) return false;
    return value.toLowerCase().includes(selectedValue.toLowerCase());
  });
};

export default filterByInterest;