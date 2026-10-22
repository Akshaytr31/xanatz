import { useState, useEffect, useCallback } from "react";
import { UserPlus, UserCheck, UserX, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";

/**
 * ConnectButton — shows the correct state for person ↔ person connections.
 * Props:
 *   targetUserId   — the ID (integer or public_id) of the user to connect with
 *   size           — "sm" | "md" | "lg" (default "md")
 *   onStatusChange — optional callback when status changes
 *   style          — optional style overrides
 *   className      — optional CSS classes
 */
export default function ConnectButton({
  targetUserId,
  size = "md",
  initialStatus,
  connectionId,
  iAmSender,
  onStatusChange,
  style = {},
  className = "",
}) {
  const [state, setState] = useState(
    initialStatus
      ? {
          status: initialStatus,
          connectionId: connectionId || null,
          iAmSender: Boolean(iAmSender),
        }
      : null
  );
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const sm = size === "sm";
  const lg = size === "lg";

  const fetchStatus = useCallback(async () => {
    if (!targetUserId) return;
    const token = localStorage.getItem("access");
    if (!token || token === "null" || token === "undefined") {
      setState({ status: "none", unauth: true });
      return;
    }
    try {
      const res = await api.get(`connections/status_with/?user_id=${targetUserId}`);
      if (res.data.status === "self") {
        setState({ status: "self" });
      } else if (res.data.status === "none") {
        setState({ status: "none" });
      } else {
        setState({
          status: res.data.status,
          connectionId: res.data.id,
          iAmSender: res.data.i_am_sender,
        });
      }
    } catch {
      setState({ status: "none" });
    }
  }, [targetUserId]);

  useEffect(() => {
    if (initialStatus) {
      setState({
        status: initialStatus,
        connectionId: connectionId || null,
        iAmSender: Boolean(iAmSender),
      });
    } else {
      fetchStatus();
    }
  }, [initialStatus, connectionId, iAmSender, fetchStatus]);

  const handleConnect = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    const token = localStorage.getItem("access");
    if (!token || token === "null" || token === "undefined") {
      navigate("/login");
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post("connections/", { receiver: targetUserId });
      setState({
        status: res.data.status || "pending",
        connectionId: res.data.id,
        iAmSender: true,
      });
      onStatusChange?.(res.data.status || "pending");
    } catch (err) {
      // Re-fetch to synchronize state accurately if already existing
      await fetchStatus();
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (!state?.connectionId) return;
    try {
      setActionLoading(true);
      await api.patch(`connections/${state.connectionId}/accept/`);
      setState((prev) => ({ ...prev, status: "accepted" }));
      onStatusChange?.("accepted");
    } catch {
      await fetchStatus();
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawOrDisconnect = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (!state?.connectionId) return;

    if (
      state.status === "accepted" &&
      !window.confirm("Are you sure you want to remove this connection?")
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await api.delete(`connections/${state.connectionId}/`);
      setState({ status: "none", connectionId: null });
      onStatusChange?.("none");
    } catch {
      await fetchStatus();
    } finally {
      setActionLoading(false);
    }
  };

  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: sm ? "4px" : "6px",
    padding: sm ? "6px 12px" : lg ? "10px 20px" : "8px 16px",
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

  // If viewing self, don't show connect button
  if (state?.status === "self") {
    return null;
  }

  // Initial loading skeleton
  if (state === null) {
    return (
      <div
        className={className}
        style={{
          ...base,
          background: "rgba(255,255,255,0.04)",
          color: "transparent",
          border: "1px solid rgba(255,255,255,0.08)",
          width: sm ? "78px" : "104px",
          height: sm ? "28px" : "36px",
          pointerEvents: "none",
        }}
      />
    );
  }

  // Not connected -> Show Connect button
  if (state.status === "none") {
    return (
      <button
        type="button"
        className={className}
        onClick={handleConnect}
        disabled={actionLoading}
        style={{
          ...base,
          background: "linear-gradient(135deg, #10b981, #06b6d4)",
          color: "#ffffff",
          boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        {actionLoading ? (
          <Loader2 size={sm ? 12 : 15} className="animate-spin" />
        ) : (
          <UserPlus size={sm ? 12 : 15} />
        )}
        Connect
      </button>
    );
  }

  // Pending request sent by me -> Show Pending (Withdraw on click)
  if (state.status === "pending" && state.iAmSender) {
    return (
      <button
        type="button"
        className={className}
        onClick={handleWithdrawOrDisconnect}
        disabled={actionLoading}
        title="Click to withdraw request"
        style={{
          ...base,
          background: "rgba(234,179,8,0.12)",
          color: "#fbbf24",
          border: "1px solid rgba(234,179,8,0.3)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.15)";
          e.currentTarget.style.color = "#ef4444";
          e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(234,179,8,0.12)";
          e.currentTarget.style.color = "#fbbf24";
          e.currentTarget.style.borderColor = "rgba(234,179,8,0.3)";
        }}
      >
        {actionLoading ? (
          <Loader2 size={sm ? 12 : 15} className="animate-spin" />
        ) : (
          <Clock size={sm ? 12 : 15} />
        )}
        Pending
      </button>
    );
  }

  // Pending request sent to me -> Show Accept & Ignore
  if (state.status === "pending" && !state.iAmSender) {
    return (
      <div style={{ display: "inline-flex", gap: "6px" }} className={className}>
        <button
          type="button"
          onClick={handleAccept}
          disabled={actionLoading}
          style={{
            ...base,
            background: "linear-gradient(135deg,#10b981,#06b6d4)",
            color: "#fff",
            boxShadow: "0 2px 10px rgba(16,185,129,0.3)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {actionLoading ? (
            <Loader2 size={sm ? 12 : 15} className="animate-spin" />
          ) : (
            <UserCheck size={sm ? 12 : 15} />
          )}
          Accept
        </button>
        <button
          type="button"
          onClick={handleWithdrawOrDisconnect}
          disabled={actionLoading}
          style={{
            ...base,
            background: "rgba(239,68,68,0.1)",
            color: "#ef4444",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
          }}
        >
          <UserX size={sm ? 12 : 15} />
          Ignore
        </button>
      </div>
    );
  }

  // Already accepted -> Show Connected
  return (
    <button
      type="button"
      className={className}
      onClick={handleWithdrawOrDisconnect}
      disabled={actionLoading}
      title="Connected. Click to remove connection"
      style={{
        ...base,
        background: "rgba(16,185,129,0.12)",
        color: "#10b981",
        border: "1px solid rgba(16,185,129,0.28)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(239,68,68,0.12)";
        e.currentTarget.style.color = "#ef4444";
        e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(16,185,129,0.12)";
        e.currentTarget.style.color = "#10b981";
        e.currentTarget.style.borderColor = "rgba(16,185,129,0.28)";
      }}
    >
      {actionLoading ? (
        <Loader2 size={sm ? 12 : 15} className="animate-spin" />
      ) : (
        <UserCheck size={sm ? 12 : 15} />
      )}
      Connected
    </button>
  );
}
