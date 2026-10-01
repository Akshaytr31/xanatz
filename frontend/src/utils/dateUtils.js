const MONTHS_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/**
 * Formats a date string, timestamp, or Date object into DD/MMM/YYYY format (e.g., 19/SEP/2026).
 *
 * @param {string|number|Date} dateVal - The date to format
 * @param {string} [fallback=""] - Fallback string if date is missing or invalid
 * @returns {string} Formatted date string in DD/MMM/YYYY format (e.g. 19/SEP/2026)
 */
export const formatDate = (dateVal, fallback = "") => {
  if (!dateVal) return fallback;

  if (typeof dateVal === "string") {
    const trimmed = dateVal.trim();
    // Handles pure YYYY-MM-DD strings without timezone offset shifts
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, monthStr, dayStr] = trimmed.split("-");
      const mIdx = Math.max(0, Math.min(11, parseInt(monthStr, 10) - 1));
      const mName = MONTHS_SHORT[mIdx] || "JAN";
      const day = String(parseInt(dayStr, 10)).padStart(2, "0");
      return `${day}/${mName}/${year}`;
    }
  }

  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return fallback;

  const day = String(d.getDate()).padStart(2, "0");
  const mName = MONTHS_SHORT[d.getMonth()] || "JAN";
  const year = d.getFullYear();
  return `${day}/${mName}/${year}`;
};
