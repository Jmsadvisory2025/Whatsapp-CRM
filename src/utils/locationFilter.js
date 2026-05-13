/**
 * Utility function to filter data by location
 * @param {Array} data - Array of data objects to filter
 * @param {string} selectedLocation - Selected location ID
 * @param {string} locationField - Field name containing location information
 * @returns {Array} Filtered data array
 */
export const filterByLocation = (data, selectedLocation, locationField = 'location') => {
  if (!data || !Array.isArray(data)) return [];
  
  if (selectedLocation === "all") return data;
  
  // Location keywords in all three languages
  const locationKeywords = {
    "ahmedabad-nikol": [
      "ahmedabad - nikol",
      "અમદાવાદ - નિકોલ",
      "अहमदाबाद - निकोल"
    ],
    "ahmedabad-ambawadi": [
      "ahmedabad - ambawadi",
      "અમદાવાદ - આંબાવાડી",
      "अहमदाबाद - आंबावाडी"
    ]
  };
  
  return data.filter(item => {
    const location = item[locationField];
    if (!location) return false;
    
    const locationLower = location.toLowerCase();
    const keywords = locationKeywords[selectedLocation] || [];
    
    return keywords.some(keyword => locationLower.includes(keyword.toLowerCase()));
  });
};

export default filterByLocation;