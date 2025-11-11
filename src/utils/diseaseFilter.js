/**
 * Utility function to filter data by disease
 * @param {Array} data - Array of data objects to filter
 * @param {string} selectedDisease - Selected disease ID
 * @param {string} diseaseField - Field name containing disease information
 * @returns {Array} Filtered data array
 */
export const filterByDisease = (data, selectedDisease, diseaseField = 'disease') => {
  if (!data || !Array.isArray(data)) return [];
  
  if (selectedDisease === "all") return data;
  
  // Disease keywords in all three languages
  const diseaseKeywords = {
    "ptosis": [
      "ptosis",
      "ढळેલી",
      "ढळેલી પાંપણ",
      "झुकी हुई पलक",
      "प्टोसिस"
    ],
    "squint": [
      "squint",
      "cross eye",
      "ત્રાસી",
      "ત્રાસી આંખ",
      "भेंगापन",
      "तिरछी आंख",
      "तिरछी आँख"
    ],
    "artificial-eye": [
      "artificial",
      "કૃત્રિમ",
      "કૃત્રિમ આંખ",
      "આર્ટિફિશિયલ આંખ",
      "कृत्रिम",
      "कृत्रिम आँख",
      "कृत्रिम आंख"
    ],
    "small-mass": [
      "mass",
      "lump",
      "small",
      "ગાંઠ",
      "આંખની આજુબાજુ ગાંઠ",
      "गठन",
      "आँख की पलक में गठन",
      "आॉंख की पलक में गठन"
    ]
  };
  
  return data.filter(item => {
    const disease = item[diseaseField];
    if (!disease) return false;
    
    const diseaseLower = disease.toLowerCase();
    const keywords = diseaseKeywords[selectedDisease] || [];
    
    return keywords.some(keyword => diseaseLower.includes(keyword.toLowerCase()));
  });
};

export default filterByDisease;