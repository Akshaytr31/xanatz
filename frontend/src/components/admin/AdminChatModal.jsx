import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Send, MessageSquare, Loader } from "lucide-react";
import api from "../../api";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const AdminChatModal = ({ target, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get("me/").then((res) => setCurrentUser(res.data)).catch(() => {});
  }, []);

  const fetchHistory = async () => {
    if (!target?.company_id && !target?.user_id) return;
    try {
      let res;
      if (target.is_company_channel && target.company_id) {
        res = await api.get(`messages/chat/?company_id=${target.company_id}`);
        await api.post("messages/mark-read/", { company_id: target.company_id }).catch(() => {});
      } else if (target.user_id) {
        res = await api.get(`messages/chat/?user_id=${target.user_id}`);
        await api.post("messages/mark-read/", { sender_id: target.user_id }).catch(() => {});
      } else if (target.company_id) {
        res = await api.get(`messages/chat/?company_id=${target.company_id}`);
        await api.post("messages/mark-read/", { company_id: target.company_id }).catch(() => {});
      }
      setMessages(res.data || []);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, [target]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!target?.company_id && !target?.user_id) return;

    setSending(true);
    try {
      const payload = { content: inputText.trim() };
      if (target.is_company_channel && target.company_id) {
        payload.company = target.company_id;
      } else if (target.user_id) {
        payload.recipient = target.user_id;
      } else if (target.company_id) {
        payload.company = target.company_id;
      }

      await api.post("messages/", payload);
      setInputText("");
      fetchHistory();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const isCompanyChannel = target.is_company_channel || (target.company_id && !target.user_id);

  const partnerName = isCompanyChannel
    ? (target.company_name || target.name || "Company Channel")
    : (target.user_name || target.name || "User");

  const partnerEmail = isCompanyChannel
    ? (target.owner_name ? `Company Channel • Shared Team (Owner: ${target.owner_name})` : "Company Channel • Shared Team")
    : (target.user_email || target.email || "");

  return ReactDOM.createPortal(
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      width: "420px",
      height: "560px",
      maxWidth: "calc(100vw - 32px)",
      maxHeight: "calc(100vh - 48px)",
      zIndex: 99999,
      background: "rgba(15, 23, 42, 0.96)",
      backdropFilter: "blur(24px)",
      borderRadius: "1.25rem",
      border: "1px solid var(--color-card-border, rgba(255, 255, 255, 0.12))",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Chat window Header */}
      <div style={{
        padding: "1rem 1.5rem",
        borderBottom: "1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(10, 15, 30, 0.4)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "0.85rem",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            {getInitials(partnerName)}
          </div>
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "white" }}>{partnerName}</h3>
            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
              {partnerEmail}
              {!isCompanyChannel && target.user_company_name ? ` • (${target.user_company_name})` : ""}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255, 255, 255, 0.06)", border: "none", color: "white",
            width: 32, height: 32, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700
          }}
        >
          ✕
        </button>
      </div>

      {/* Reason Context Banner */}
      {target.reason && (
        <div style={{
          padding: "10px 1.5rem", background: "rgba(239, 68, 68, 0.08)",
          borderBottom: "1px solid rgba(239, 68, 68, 0.15)",
          fontSize: "0.8rem", color: "#fca5a5", lineHeight: 1.4
        }}>
          <strong>Flagged Item ({target.company_name || target.item_title || "Company"}):</strong> {target.reason}
        </div>
      )}

      {/* Message Log */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "12px", background: "rgba(15, 23, 42, 0.15)" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Loader size={24} style={{ color: "#3b82f6", animation: "spin 1s linear infinite" }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", color: "#64748b" }}>
            <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: "8px" }} />
            <p style={{ fontSize: "0.8rem", marginBottom: "12px" }}>Say hello to {partnerName}!</p>
            <button
              type="button"
              onClick={() => setInputText(`Hi ${partnerName}, regarding '${target.item_title || "this content"}': Could you please clarify?`)}
              style={{
                padding: "8px 14px", background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa",
                borderRadius: "0.75rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer"
              }}
            >
              Auto-fill Clarification Question
            </button>
          </div>
        ) : (
          messages.map((msg, index) => {
            const senderId = typeof msg.sender === "object" ? msg.sender?.id : msg.sender;
            const isMe = currentUser && (Number(senderId) === Number(currentUser.id) || String(senderId) === String(currentUser.id));
            const timeStr = msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "";
            return (
              <div
                key={msg.id || index}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    background: isMe
                      ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                      : "rgba(255, 255, 255, 0.05)",
                    border: isMe
                      ? "none"
                      : "1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))",
                    borderRadius: isMe ? "1.25rem 1.25rem 0.25rem 1.25rem" : "1.25rem 1.25rem 1.25rem 0.25rem",
                    padding: "10px 14px",
                    color: isMe ? "white" : "var(--color-text-primary, #f8fafc)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    textAlign: "left",
                  }}
                >
                  {!isMe && (
                    <span style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#93c5fd", marginBottom: "3px" }}>
                      {msg.sender_name || msg.sender_email || "User"}
                    </span>
                  )}
                  <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.4", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {msg.content}
                  </p>
                  {timeStr && (
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.6rem",
                        color: isMe ? "rgba(255,255,255,0.6)" : "#64748b",
                        textAlign: "right",
                        marginTop: "4px",
                      }}
                    >
                      {timeStr}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <form
        onSubmit={handleSend}
        style={{
          padding: "1.25rem 1.5rem",
          borderTop: "1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))",
          display: "flex",
          gap: "12px",
          background: "rgba(10, 15, 30, 0.4)",
        }}
      >
        <input
          type="text"
          placeholder="Type your message here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "0.75rem",
            border: "1px solid var(--color-card-border, rgba(255, 255, 255, 0.08))",
            background: "rgba(15, 23, 42, 0.6)",
            color: "white",
            fontSize: "0.85rem",
            outline: "none",
            transition: "border 0.2s",
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--color-accent, #3b82f6)"}
          onBlur={(e) => e.target.style.borderColor = "var(--color-card-border, rgba(255, 255, 255, 0.08))"}
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          style={{
            background: inputText.trim() ? "var(--color-accent, #2563eb)" : "rgba(255,255,255,0.03)",
            border: "none",
            borderRadius: "0.75rem",
            padding: "0 20px",
            color: inputText.trim() ? "white" : "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: sending || !inputText.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          <span>{sending ? "..." : "Send"}</span>
          <Send size={18} />
        </button>
      </form>
    </div>,
    document.body
  );
};

export default AdminChatModal;
