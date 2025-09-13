const getIndex = (array, item, filterApplied = false) => {
  const dataArray = filterApplied ? array : array; // Use filtered array if filterApplied is true
  const index = dataArray.indexOf(item) + 1; // Add 1 to start from 1 instead of 0
  return index;
};

const toCamelCase = (str) => {
  if (!str) return str;
  return str
    .toLowerCase()
    .replace(/(^|\s)\w/g, (match) => match.toUpperCase());
};

export { getIndex, toCamelCase };