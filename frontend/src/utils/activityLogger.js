import api from "../api";

/**
 * Utility to log user activity from the frontend.
 * @param {string} actionType - 'PROFILE_SWITCH', 'COMPANY_SWITCH', 'PAGE_VIEW', 'OTHER', etc.
 * @param {string} actionTitle - Short descriptive title of what the user did.
 * @param {object} details - Additional contextual object/metadata.
 */
export const logUserActivity = async (actionType, actionTitle, details = {}) => {
  try {
    const token = localStorage.getItem("access");
    if (!token) return;

    await api.post("user-activity/log/", {
      action_type: actionType,
      action_title: actionTitle,
      details: details,
    });
  } catch (err) {
    // Fail silently in background so user experience is never interrupted
    console.warn("Failed to record activity log:", err);
  }
};
