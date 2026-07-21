import React, { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

const FlagConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  status,
  title = "Flag this content?",
  description = "Are you sure you want to flag this content as inappropriate? It will be sent to the administrator for moderation."
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason or comment for flagging.");
      return;
    }
    setError("");
    onConfirm(reason);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div
        style={{
          backgroundColor: "#0f172a",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "1.5rem",
          padding: "2rem",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center"
        }}
      >
        {status === 'confirm' && (
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <ShieldAlert size={28} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "white", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>
              {title}
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: "1.5", marginBottom: "1.25rem" }}>
              {description}
            </p>

            <div style={{ textAlign: "left", width: "100%", marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: "0.5rem" }}>
                Reason for Flagging <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim()) setError("");
                }}
                placeholder="Describe why this content is inappropriate (e.g. spam, offensive language, scam, false information)..."
                disabled={loading}
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: error ? "1px solid #EF4444" : "1px solid rgba(255, 255, 255, 0.1)",
                  color: "white",
                  fontSize: "0.875rem",
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s"
                }}
              />
              {error && (
                <span style={{ display: "block", color: "#EF4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {error}
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: "#CD2426",
                  color: "white",
                  border: "none",
                  borderRadius: "0.75rem",
                  padding: "0.75rem",
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "opacity 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
              >
                {loading ? "Flagging..." : "Yes, Flag"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.75rem",
                  padding: "0.75rem",
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <CheckCircle2 size={28} color="#10B981" />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "white", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>
              Successfully Flagged
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: "1.5", marginBottom: "1.5rem" }}>
              Thank you. The content has been flagged and submitted to system administration for moderation.
            </p>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                fontWeight: "bold",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
            >
              Close
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <ShieldAlert size={28} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "white", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>
              Action Failed
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: "1.5", marginBottom: "1.5rem" }}>
              Failed to submit the flag. Please check your connection or try again later.
            </p>
            <button
              onClick={onClose}
              style={{
                width: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                fontWeight: "bold",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FlagConfirmationModal;
