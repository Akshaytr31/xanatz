import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  MessageSquare, Send, X, ExternalLink, Building2, User, Loader2, ArrowRight,
  Shield, Check, Clock, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { backendUrl } from "../../api";
import { useAccount } from "../../context/AccountContext";
import { formatDate } from "../../utils/dateUtils";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const RFPChatModal = ({ rfp, targetPartner, onClose }) => {
  const navigate = useNavigate();
  const { accountMode, activeCompany, userCompanies, switchAccountMode } = useAccount();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get("me/").then((res) => setCurrentUser(res.data)).catch(() => {});
  }, []);

  const rfpCompanyId = typeof rfp?.company === "object" ? rfp.company?.id : rfp?.company;
  const rfpCompanyName = rfp?.company_name || (typeof rfp?.company === "object" ? rfp.company?.name : "RFP Client");

  // Determine if this RFP belongs to one of the current user's companies
  const matchingCompany = userCompanies?.find(
    (c) => String(c.id) === String(rfpCompanyId)
  ) || currentUser?.companies?.find((c) => String(c.id) === String(rfpCompanyId));

  const isOwnCompanyRfp = Boolean(matchingCompany);
  const isOperatingAsRfpOwner = Boolean(
    accountMode === "company" && activeCompany && String(activeCompany.id) === String(rfpCompanyId)
  );

  // If this is the user's company's RFP, but they're currently in Personal Mode, they must switch
  const needsSwitchToCompany = isOwnCompanyRfp && !isOperatingAsRfpOwner;

  const fetchHistory = async (silent = false) => {
    if (!rfp?.id) return;
    if (needsSwitchToCompany) {
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    try {
      let queryUrl = `messages/chat/?rfp_id=${rfp.id}`;

      if (accountMode === "company" && activeCompany) {
        queryUrl += `&sender_company_id=${activeCompany.id}`;
        if (isOperatingAsRfpOwner) {
          if (targetPartner?.company_id) {
            queryUrl += `&company_id=${targetPartner.company_id}`;
          } else if (targetPartner?.user_id) {
            queryUrl += `&user_id=${targetPartner.user_id}`;
          }
        } else {
          queryUrl += `&company_id=${rfpCompanyId}`;
        }
      } else {
        // Personal mode
        queryUrl += `&company_id=${rfpCompanyId}`;
        if (targetPartner?.user_id) {
          queryUrl += `&user_id=${targetPartner.user_id}`;
        }
      }

      const res = await api.get(queryUrl);
      setMessages(res.data || []);

      // Mark read
      api.post("messages/mark-read/", {
        rfp_id: rfp.id,
        company_id: rfpCompanyId,
      }).catch(() => {});
    } catch (err) {
      console.error("Failed to load RFP chat history:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(false);
    const interval = setInterval(() => fetchHistory(true), 3500);
    return () => clearInterval(interval);
  }, [rfp?.id, accountMode, activeCompany?.id, targetPartner, needsSwitchToCompany]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending || needsSwitchToCompany) return;

    setSending(true);
    try {
      const payload = {
        content: inputText.trim(),
        rfp: rfp.id,
      };

      if (accountMode === "company" && activeCompany) {
        payload.sender_company_id = activeCompany.id;
        if (isOperatingAsRfpOwner) {
          if (targetPartner?.company_id) {
            payload.company_id = targetPartner.company_id;
          } else if (targetPartner?.user_id) {
            payload.recipient_id = targetPartner.user_id;
          }
        } else {
          payload.company_id = rfpCompanyId;
        }
      } else {
        payload.company_id = rfpCompanyId;
        if (targetPartner?.user_id) {
          payload.recipient_id = targetPartner.user_id;
        }
      }

      const res = await api.post("messages/", payload);
      setMessages((prev) => [...prev, res.data]);
      setInputText("");
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (err) {
      console.error("Failed to send RFP message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleOpenFullPage = () => {
    onClose();
    if (accountMode === "company" && activeCompany) {
      navigate(`/messages?company_id=${activeCompany.id}&rfp_id=${rfp.id}`);
    } else {
      navigate(`/messages?rfp_id=${rfp.id}`);
    }
  };

  const chatPartnerDisplayName = isOperatingAsRfpOwner
    ? (targetPartner?.company_name || targetPartner?.name || "Proposal Inquirer")
    : rfpCompanyName;

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "440px",
        height: "590px",
        maxWidth: "calc(100vw - 32px)",
        maxHeight: "calc(100vh - 48px)",
        zIndex: 99999,
        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 30, 0.98) 100%)",
        backdropFilter: "blur(24px)",
        borderRadius: "1.25rem",
        border: "1px solid rgba(139, 92, 246, 0.35)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.85), 0 0 40px rgba(139, 92, 246, 0.2)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ─── Header ─── */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "0.85rem",
              fontWeight: "bold",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
            }}
          >
            {getInitials(chatPartnerDisplayName)}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h3
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  margin: 0,
                  color: "white",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "210px",
                }}
              >
                {chatPartnerDisplayName}
              </h3>
              {rfp?.rfp_id && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    background: "rgba(139, 92, 246, 0.25)",
                    color: "#c4b5fd",
                    fontWeight: 700,
                  }}
                >
                  {rfp.rfp_id}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "rgba(255, 255, 255, 0.6)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "240px",
              }}
            >
              💬 {rfp?.title}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={handleOpenFullPage}
            title="Expand to Full Messages Page"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#c4b5fd",
              width: 30,
              height: 30,
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ExternalLink size={14} />
          </button>
          <button
            onClick={onClose}
            title="Close Chat"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
              width: 30,
              height: 30,
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ─── Active Persona Indicator Bar ─── */}
      <div
        style={{
          padding: "6px 14px",
          background: "rgba(139, 92, 246, 0.08)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.72rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {accountMode === "company" && activeCompany ? (
            <>
              <Building2 size={12} color="#a78bfa" />
              <span style={{ color: "#c4b5fd" }}>
                Chatting as corporate entity: <strong>{activeCompany.name}</strong>
              </span>
            </>
          ) : (
            <>
              <User size={12} color="#93c5fd" />
              <span style={{ color: "#93c5fd" }}>
                Chatting as individual: <strong>{currentUser?.first_name || currentUser?.email?.split("@")[0] || "Personal"}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* ─── Company Switch Required Banner ─── */}
      {needsSwitchToCompany ? (
        <div
          style={{
            flex: 1,
            padding: "2rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            background: "rgba(15, 23, 42, 0.5)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(139, 92, 246, 0.15)",
              border: "1px solid rgba(139, 92, 246, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Building2 size={28} color="#c4b5fd" />
          </div>

          <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "white", marginBottom: 8 }}>
            Switch to {matchingCompany?.name || rfpCompanyName}
          </h4>

          <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.65)", lineHeight: 1.5, marginBottom: 20, maxWidth: "320px" }}>
            This RFP was published by your company. Inquiries and tender proposals are managed directly through the company workspace.
          </p>

          <button
            type="button"
            onClick={() => {
              if (matchingCompany) {
                switchAccountMode("company", matchingCompany);
              }
            }}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
              border: "none",
              color: "white",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 8px 20px rgba(139, 92, 246, 0.35)",
            }}
          >
            <span>Switch to {matchingCompany?.name || "Company"} & View Chats</span>
            <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <>
          {/* ─── Message Stream ─── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "rgba(10, 15, 30, 0.25)",
            }}
          >
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <Loader2 size={26} style={{ color: "#8b5cf6", animation: "spin 1s linear infinite" }} />
              </div>
            ) : messages.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "#64748b",
                  textAlign: "center",
                  padding: "0 1.5rem",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "14px",
                    background: "rgba(139, 92, 246, 0.12)",
                    border: "1px solid rgba(139, 92, 246, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                  }}
                >
                  <MessageSquare size={24} color="#c4b5fd" />
                </div>
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "white", marginBottom: "4px" }}>
                  Discuss this RFP
                </p>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "16px" }}>
                  Reach out to {chatPartnerDisplayName} regarding specifications, timelines, or quotations.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                  {[
                    "Hello, could you provide more details regarding the deliverables for this RFP?",
                    "Hi! We are preparing our proposal and have a quick question regarding the timeline.",
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputText(suggestion)}
                      style={{
                        padding: "7px 12px",
                        background: "rgba(139, 92, 246, 0.08)",
                        border: "1px solid rgba(139, 92, 246, 0.2)",
                        color: "#c4b5fd",
                        borderRadius: "8px",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        textAlign: "left",
                        lineHeight: 1.3,
                      }}
                    >
                      💡 {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender === currentUser?.id;
                const isCompanySender = Boolean(m.sender_company);

                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      alignSelf: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>
                        {isMe ? "You" : m.sender_name}
                      </span>
                      {m.sender_role && (
                        <span
                          style={{
                            fontSize: "0.62rem",
                            padding: "0.5px 5px",
                            borderRadius: "4px",
                            background: isCompanySender ? "rgba(139, 92, 246, 0.2)" : "rgba(59, 130, 246, 0.2)",
                            color: isCompanySender ? "#c4b5fd" : "#93c5fd",
                            fontWeight: 700,
                          }}
                        >
                          {m.sender_role}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        padding: "9px 13px",
                        borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                        background: isMe
                          ? "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                          : "rgba(30, 41, 59, 0.8)",
                        border: isMe ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                        color: "white",
                        fontSize: "0.82rem",
                        lineHeight: 1.45,
                        wordBreak: "break-word",
                        boxShadow: isMe ? "0 4px 14px rgba(139, 92, 246, 0.3)" : "none",
                      }}
                    >
                      {m.content}
                    </div>

                    <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                      {formatDate(m.created_at)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ─── Bottom Message Input ─── */}
          <form
            onSubmit={handleSend}
            style={{
              padding: "10px 14px",
              borderTop: "1px solid rgba(139, 92, 246, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(15, 23, 42, 0.95)",
            }}
          >
            <input
              type="text"
              placeholder={`Message ${chatPartnerDisplayName}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={sending}
              style={{
                flex: 1,
                padding: "9px 14px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                color: "white",
                fontSize: "0.82rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              style={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: inputText.trim()
                  ? "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                  : "rgba(255, 255, 255, 0.08)",
                border: "none",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: inputText.trim() && !sending ? "pointer" : "default",
                opacity: inputText.trim() && !sending ? 1 : 0.4,
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {sending ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={15} />}
            </button>
          </form>
        </>
      )}
    </div>,
    document.body
  );
};

export default RFPChatModal;

