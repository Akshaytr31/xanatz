/**
 * Formats a date string, timestamp, or Date object into MM/DD/YYYY format (e.g., 08/29/2026).
 *
 * @param {string|number|Date} dateVal - The date to format
 * @param {string} [fallback=""] - Fallback string if date is missing or invalid
 * @returns {string} Formatted date string in MM/DD/YYYY format
 */
export const formatDate = (dateVal, fallback = "") => {
  if (!dateVal) return fallback;

  if (typeof dateVal === "string") {
    const trimmed = dateVal.trim();
    // Handles pure YYYY-MM-DD strings without timezone offset shifts
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split("-");
      return `${month}/${day}/${year}`;
    }
  }

  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return fallback;

  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};
