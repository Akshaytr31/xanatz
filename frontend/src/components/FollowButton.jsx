import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";

/**
 * FollowButton — follow/unfollow a company (no acceptance needed).
 * Props:
 *   companyId      — the ID of the company
 *   size           — "sm" | "md" | "lg" (default "md")
 *   initialFollowing — initial boolean state if known
 *   followId       — initial follow record ID if known
 *   onStatusChange — optional callback({ following, followId })
 *   style          — optional style overrides
 *   className      — optional CSS classes
 */
export default function FollowButton({
  companyId,
  size = "md",
  initialFollowing,
  followId,
  onStatusChange,
  style = {},
  className = "",
}) {
  const [state, setState] = useState(
    typeof initialFollowing === "boolean"
      ? { following: initialFollowing, followId: followId || null }
      : null
  ); // null = loading
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const sm = size === "sm";
  const lg = size === "lg";

  const fetchStatus = useCallback(async () => {
    if (!companyId) return;
    const token = localStorage.getItem("access");
    if (!token || token === "null" || token === "undefined") {
      setState({ following: false, unauth: true });
      return;
    }
    try {
      const res = await api.get(`company-follows/status_with/?company_id=${companyId}`);
      setState({ following: Boolean(res.data.following), followId: res.data.follow_id || null });
    } catch {
      setState({ following: false });
    }
  }, [companyId]);

  useEffect(() => {
    if (typeof initialFollowing === "boolean") {
      setState({ following: initialFollowing, followId: followId || null });
    } else {
      fetchStatus();
    }
  }, [companyId, initialFollowing, followId, fetchStatus]);

  const handleFollow = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    const token = localStorage.getItem("access");
    if (!token || token === "null" || token === "undefined") {
      navigate("/login");
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post("company-follows/", { company: companyId });
      setState({ following: true, followId: res.data.id });
      onStatusChange?.({ following: true, followId: res.data.id });
    } catch {
      setState({ following: false });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfollow = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (!state?.followId) {
      // Re-fetch to get followId if needed
      try {
        const res = await api.get(`company-follows/status_with/?company_id=${companyId}`);
        if (!res.data.follow_id) return;
        state.followId = res.data.follow_id;
      } catch {
        return;
      }
    }

    try {
      setActionLoading(true);
      await api.delete(`company-follows/${state.followId}/`);
      setState({ following: false, followId: null });
      onStatusChange?.({ following: false });
    } catch {
      /* ignore */
    } finally {
      setActionLoading(false);
    }
  };

  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: sm ? "4px" : "6px",
    padding: sm ? "5px 10px" : lg ? "10px 20px" : "8px 16px",
    borderRadius: sm ? "8px" : "10px",
    fontSize: sm ? "11px" : lg ? "14px" : "13px",
    fontWeight: 700,
    cursor: actionLoading ? "wait" : "pointer",
    border: "1px solid transparent",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    textDecoration: "none",
    userSelect: "none",
    ...style,
  };

  if (state === null) {
    return (
      <div
        className={className}
        style={{
          ...base,
          background: "rgba(255,255,255,0.04)",
          color: "transparent",
          border: "1px solid rgba(255,255,255,0.08)",
          width: sm ? "80px" : lg ? "120px" : "100px",
          height: sm ? "28px" : lg ? "42px" : "36px",
        }}
      />
    );
  }

  if (!state.following) {
    return (
      <button
        onClick={handleFollow}
        disabled={actionLoading}
        className={className}
        style={{
          ...base,
          background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
          color: "#fff",
          boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        {actionLoading ? <Loader2 size={sm ? 12 : 15} className="animate-spin" /> : <Bell size={sm ? 12 : 15} />}
        Follow
      </button>
    );
  }

  return (
    <button
      onClick={handleUnfollow}
      disabled={actionLoading}
      title="Unfollow company"
      className={className}
      style={{
        ...base,
        background: "rgba(139,92,246,0.12)",
        color: "#c084fc",
        border: "1px solid rgba(139,92,246,0.25)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(239,68,68,0.12)";
        e.currentTarget.style.color = "#ef4444";
        e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(139,92,246,0.12)";
        e.currentTarget.style.color = "#c084fc";
        e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)";
      }}
    >
      {actionLoading ? <Loader2 size={sm ? 12 : 15} className="animate-spin" /> : <BellOff size={sm ? 12 : 15} />}
      Following
    </button>
  );
}
