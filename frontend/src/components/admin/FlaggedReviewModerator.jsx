import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Check, Edit2, Trash2, Star, AlertCircle, ShieldAlert, Filter, Loader, CheckCircle, RotateCcw, Clock, Flag, MessageSquare, Send, Bell, Eye, Briefcase, FileText } from "lucide-react";
import api from "../../api";
import { formatDate } from "../../utils/dateUtils";

/* ─── Shared ─────────────────────────────────────────────────── */
const card = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, backdropFilter: "blur(20px)",
};

const STATUS_CONFIG = [
  { key: "unresolved", label: "Unresolved Flags", color: "#f59e0b", icon: AlertCircle },
  { key: "resolved", label: "Resolved Flags", color: "#10b981", icon: CheckCircle },
  { key: "all", label: "All Statuses", color: "#6366f1", icon: ShieldAlert },
];

const FILTER_CONFIG = [
  { key: "all", label: "All Content", color: "#6366f1" },
  { key: "job", label: "Job Openings", color: "#0d9488" },
  { key: "rfp", label: "RFP Proposals", color: "#ea580c" },
  { key: "reviews", label: "Reviews", color: "#7c3aed" },
];

const TYPE_COLORS = {
  company: { bg: "rgba(59,130,246,0.12)", text: "#93c5fd", label: "Company Review" },
  freelancer: { bg: "rgba(139,92,246,0.12)", text: "#c4b5fd", label: "Freelancer Review" },
  job: { bg: "rgba(13,148,136,0.12)", text: "#5eead4", label: "Job Opening" },
  rfp: { bg: "rgba(234,88,12,0.12)", text: "#fdba74", label: "RFP Proposal" },
};

/* ─── Star Rating ────────────────────────────────────────────── */
const StarRating = ({ rating, editable, onChange }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s} type="button"
        onClick={editable ? () => onChange(s) : undefined}
        style={{ background: "none", border: "none", cursor: editable ? "pointer" : "default", padding: 0 }}
      >
        <Star
          size={editable ? 20 : 13}
          style={{
            fill: s <= rating ? "#f59e0b" : "none",
            stroke: s <= rating ? "#f59e0b" : "#374151",
          }}
        />
      </button>
    ))}
  </div>
);

import AdminChatModal from "./AdminChatModal";

/* ─── Review Card ────────────────────────────────────────────── */
const ReviewCard = ({ review, onDismiss, onReopen, onEdit, onDelete, onOpenChat, onViewPost }) => {
  const typeInfo = TYPE_COLORS[review.review_type] || TYPE_COLORS.company;
  const isResolved = review.flag_status === "resolved" || review.is_flagged === false;

  return (
    <div
      id={`flag-card-${review.review_type}-${review.id}`}
      style={{
        ...card, padding: "18px 20px",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Status Badge */}
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
            display: "inline-flex", alignItems: "center", gap: 4,
            background: isResolved ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
            color: isResolved ? "#34d399" : "#fbbf24",
            border: isResolved ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(245,158,11,0.25)",
            letterSpacing: "0.5px",
          }}>
            {isResolved ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
            {isResolved ? "RESOLVED" : "UNRESOLVED"}
          </span>

          {/* Reply Status Badge */}
          {review.unread_replies_count > 0 ? (
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 99,
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "rgba(239, 68, 68, 0.2)",
              color: "#fca5a5",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              boxShadow: "0 0 10px rgba(239, 68, 68, 0.3)",
              letterSpacing: "0.5px"
            }}>
              <MessageSquare size={11} fill="#ef4444" />
              {review.unread_replies_count} NEW REPLY
            </span>
          ) : review.has_reply ? (
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 99,
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "rgba(59, 130, 246, 0.15)",
              color: "#60a5fa",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              letterSpacing: "0.5px"
            }}>
              <MessageSquare size={11} />
              REPLIED
            </span>
          ) : null}

          {/* Total Flags Badge */}
          <span style={{
            fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 99,
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "rgba(239,68,68,0.15)",
            color: "#f87171",
            border: "1px solid rgba(239,68,68,0.3)",
            letterSpacing: "0.5px",
          }}>
            <Flag size={11} fill="#f87171" />
            {review.flags_count || 1} {(review.flags_count || 1) === 1 ? "FLAG" : "FLAGS"}
          </span>

          {/* Type Badge */}
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
            background: typeInfo.bg, color: typeInfo.text, letterSpacing: "0.5px",
          }}>
            {typeInfo.label}
          </span>

          {review.custom_id && (
            <span style={{
              fontSize: 10, color: "rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "2px 7px",
            }}>
              {review.custom_id}
            </span>
          )}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Clock size={11} />
            {formatDate(review.created_at)}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {!isResolved ? (
            <ActionBtn color="#10b981" hoverColor="#059669" onClick={() => onDismiss(review)} title="Dismiss Flag">
              <Check size={12} /> <span>Dismiss</span>
            </ActionBtn>
          ) : (
            <ActionBtn color="#f59e0b" hoverColor="#d97706" onClick={() => onReopen(review)} title="Reopen Flag">
              <RotateCcw size={12} /> <span>Reopen</span>
            </ActionBtn>
          )}
          <ActionBtn color="#8b5cf6" hoverColor="#7c3aed" onClick={() => onViewPost && onViewPost(review)} title="View Job Post Details">
            <Eye size={12} /> <span>View Post</span>
          </ActionBtn>
          <ActionBtn color="#3b82f6" hoverColor="#2563eb" onClick={() => onEdit(review)} title="Edit">
            <Edit2 size={12} />
          </ActionBtn>
          <ActionBtn color="#ef4444" hoverColor="#dc2626" onClick={() => onDelete(review)} title="Delete">
            <Trash2 size={12} />
          </ActionBtn>
        </div>
      </div>

      {/* Info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "1px", marginBottom: 3 }}>
            {review.review_type === "job" || review.review_type === "rfp" ? "OWNER / POSTER" : "SUBMITTED BY"}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{review.owner_name || review.reviewer_name}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>{review.owner_email || review.reviewer_email}</div>
          {(review.company_id || review.owner_id) && (
            <button
              type="button"
              onClick={() => onOpenChat && onOpenChat({
                is_company_channel: !!review.company_id,
                company_id: review.company_id || null,
                company_name: review.subject_name || null,
                user_id: review.company_id ? null : (review.owner_id || null),
                owner_name: review.owner_name || review.reviewer_name,
                owner_email: review.owner_email || review.reviewer_email,
                reason: `Admin clarification inquiry regarding ${review.subject_name}`
              }, review)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 9px",
                borderRadius: 6,
                background: "rgba(168, 85, 247, 0.18)",
                border: "1px solid rgba(168, 85, 247, 0.35)",
                color: "#c084fc",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              title={`Contact company channel for ${review.subject_name}`}
            >
              <MessageSquare size={12} />
              <span>{review.company_id ? "Contact Company Channel" : "Contact Poster"}</span>
            </button>
          )}
        </div>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "1px", marginBottom: 3 }}>ABOUT</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{review.subject_name}</div>
        </div>
      </div>

      {review.rating != null && <div style={{ marginBottom: 10 }}><StarRating rating={review.rating} /></div>}

      {/* Flag Reason */}
      {review.flag_reason && (
        <div style={{
          padding: "10px 12px", borderRadius: 10, marginBottom: 10,
          background: isResolved ? "rgba(16,185,129,0.04)" : "rgba(239,68,68,0.06)",
          border: isResolved ? "1px solid rgba(16,185,129,0.12)" : "1px solid rgba(239,68,68,0.15)",
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: isResolved ? "#6ee7b7" : "#fca5a5", letterSpacing: "1.5px", marginBottom: 6 }}>
            FLAG REASONS {isResolved && "(RESOLVED)"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {review.flagged_users && review.flagged_users.length > 0 ? (
              review.flagged_users.map((fu, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.85)",
                    lineHeight: 1.5,
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.25)",
                    borderLeft: "3px solid #EF4444",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap"
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>👤 {fu.name} <span style={{ opacity: 0.65, fontWeight: 400 }}>({fu.email})</span></span>
                      {fu.unread_reply_count > 0 ? (
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99,
                          background: "rgba(239, 68, 68, 0.25)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)"
                        }}>
                          🔴 New Reply
                        </span>
                      ) : fu.has_reply ? (
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99,
                          background: "rgba(59, 130, 246, 0.18)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)"
                        }}>
                          💬 Replied
                        </span>
                      ) : null}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", color: "rgba(255,255,255,0.85)" }}>
                      {fu.reason}
                    </div>
                  </div>
                  {fu.user_id && (
                    <button
                      type="button"
                      onClick={() => onOpenChat && onOpenChat(fu, review)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "5px 11px",
                        borderRadius: 6,
                        background: fu.unread_reply_count > 0 ? "rgba(239, 68, 68, 0.25)" : "rgba(59, 130, 246, 0.18)",
                        border: fu.unread_reply_count > 0 ? "1px solid rgba(239, 68, 68, 0.5)" : "1px solid rgba(59, 130, 246, 0.35)",
                        color: fu.unread_reply_count > 0 ? "#fca5a5" : "#60a5fa",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: fu.unread_reply_count > 0 ? "0 0 10px rgba(239, 68, 68, 0.4)" : "none"
                      }}
                      title={`Chat with ${fu.name} about this flag`}
                    >
                      <MessageSquare size={12} />
                      <span>{fu.unread_reply_count > 0 ? `Chat (${fu.unread_reply_count} new)` : "Chat User"}</span>
                    </button>
                  )}
                </div>
              ))
            ) : (
              review.flag_reason.split("\n").filter(Boolean).map((reasonLine, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.75)",
                    lineHeight: 1.5,
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: "rgba(0,0,0,0.15)",
                    borderLeft: "2px solid rgba(239,68,68,0.4)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                  }}
                >
                  {reasonLine}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{
        padding: "10px 12px", borderRadius: 10,
        background: "rgba(255,255,255,0.03)", borderLeft: "2px solid rgba(99,102,241,0.5)",
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "1.5px", marginBottom: 4 }}>
          {review.review_type === "job" || review.review_type === "rfp" ? "DESCRIPTION" : "REVIEW CONTENT"}
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {review.review_text}
        </p>
      </div>
    </div>
  );
};

/* ─── Post Detail Modal ─────────────────────────────────────── */
const PostDetailModal = ({ review, onClose, onOpenChat }) => {
  if (!review) return null;
  const isJob = review.review_type === "job";
  const isRFP = review.review_type === "rfp";

  return ReactDOM.createPortal(
    <div style={{
      position: "fixed",
      bottom: "24px",
      left: "24px",
      width: "540px",
      height: "560px",
      maxWidth: "calc(100vw - 32px)",
      maxHeight: "calc(100vh - 48px)",
      zIndex: 99998,
      background: "rgba(15, 23, 42, 0.96)",
      backdropFilter: "blur(24px)",
      borderRadius: "1.25rem",
      border: "1px solid rgba(139, 92, 246, 0.35)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      color: "white",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Modal Header */}
      <div style={{
        padding: "1rem 1.5rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(10, 15, 30, 0.4)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "rgba(139,92,246,0.18)",
            border: "1px solid rgba(139,92,246,0.35)", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#c084fc", flexShrink: 0
          }}>
            {isJob ? <Briefcase size={18} /> : isRFP ? <FileText size={18} /> : <Eye size={18} />}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", textTransform: "uppercase", letterSpacing: "1px" }}>
              {review.review_type.toUpperCase()} DETAILS {review.custom_id ? `• ${review.custom_id}` : ""}
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: "2px 0 0 0", color: "white" }}>
              {review.title || review.subject_name}
            </h3>
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

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Attribute Badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {review.company_name && (
            <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)", fontWeight: 600 }}>
              🏢 {review.company_name}
            </span>
          )}
          {review.job_type && (
            <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)", fontWeight: 600 }}>
              💼 {review.job_type}
            </span>
          )}
          {review.location && (
            <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "rgba(245,158,11,0.15)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.3)", fontWeight: 600 }}>
              📍 {review.location}
            </span>
          )}
          {review.salary_range && (
            <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "rgba(236,72,153,0.15)", color: "#f472b6", border: "1px solid rgba(236,72,153,0.3)", fontWeight: 600 }}>
              💰 {review.salary_range}
            </span>
          )}
          {review.budget && (
            <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "rgba(236,72,153,0.15)", color: "#f472b6", border: "1px solid rgba(236,72,153,0.3)", fontWeight: 600 }}>
              💰 Budget: {review.budget}
            </span>
          )}
        </div>

        {/* Poster / Owner Info Box */}
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>Posted By</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{review.owner_name || review.reviewer_name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{review.owner_email || review.reviewer_email}</div>
          </div>
          {(review.company_id || review.owner_id) && (
            <button
              type="button"
              onClick={() => {
                onOpenChat && onOpenChat({
                  is_company_channel: !!review.company_id,
                  company_id: review.company_id || null,
                  company_name: review.company_name || review.subject_name,
                  user_id: review.company_id ? null : (review.owner_id || null),
                  owner_name: review.owner_name || review.reviewer_name,
                  owner_email: review.owner_email || review.reviewer_email,
                  reason: `Admin inquiry regarding ${review.subject_name}`
                }, review);
              }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8, background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)", color: "#c084fc", fontSize: 11, fontWeight: 700, cursor: "pointer"
              }}
            >
              <MessageSquare size={12} />
              <span>{review.company_id ? "Contact Channel" : "Contact Poster"}</span>
            </button>
          )}
        </div>

        {/* Description */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
            {isJob || isRFP ? "Full Description" : "Review Content"}
          </div>
          <div style={{
            padding: "12px 14px", borderRadius: 10, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
            fontSize: 12.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, whiteSpace: "pre-wrap"
          }}>
            {review.review_text || "No description provided."}
          </div>
        </div>

        {/* Requirements if applicable */}
        {review.requirements && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
              Requirements
            </div>
            <div style={{
              padding: "12px 14px", borderRadius: 10, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)",
              fontSize: 12.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, whiteSpace: "pre-wrap"
            }}>
              {review.requirements}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "0.85rem 1.5rem",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex", justifyContent: "flex-end", gap: 10,
        background: "rgba(10, 15, 30, 0.4)", flexShrink: 0
      }}>
        <button
          onClick={onClose}
          style={{
            padding: "8px 18px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
            color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer"
          }}
        >
          Close Preview
        </button>
      </div>
    </div>,
    document.body
  );
};

/* ─── Action Button ──────────────────────────────────────────── */
const ActionBtn = ({ color, hoverColor, onClick, title, children }) => (
  <button
    onClick={onClick} title={title}
    style={{
      display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7,
      cursor: "pointer", border: `1px solid ${color}30`, background: `${color}12`,
      color, fontSize: 11, fontWeight: 600, transition: "all 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.background = `${color}25`; }}
    onMouseLeave={e => { e.currentTarget.style.background = `${color}12`; }}
  >
    {children}
  </button>
);

/* ─── Edit Modal ─────────────────────────────────────────────── */
const EditModal = ({ review, onClose, onSave, saving }) => {
  const [text, setText] = useState(review.review_text);
  const [rating, setRating] = useState(review.rating || 5);

  return ReactDOM.createPortal(
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(12px)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0f172a, #0d1117)",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20,
        padding: "28px", width: "100%", maxWidth: 500,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        animation: "fadeSlideUp 0.25s ease both",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ShieldAlert size={16} color="#a5b4fc" />
            </div>
            <div>
              <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>Moderate Content</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                {review.custom_id || `ID #${review.id}`} · {review.subject_name}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "rgba(255,255,255,0.5)",
            fontSize: 12,
          }}>✕ Close</button>
        </div>

        {/* Rating */}
        {review.rating != null && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
              EDIT RATING
            </div>
            <StarRating rating={rating} editable onChange={setRating} />
          </div>
        )}

        {/* Content */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
            {review.review_type === "job" || review.review_type === "rfp" ? "EDIT DESCRIPTION" : "EDIT REVIEW"}
          </div>
          <textarea
            value={text} onChange={e => setText(e.target.value)} rows={6}
            style={{
              width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, color: "white", fontSize: 13, padding: "12px 14px",
              outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onSave(text, rating)} disabled={saving}
            style={{
              flex: 1, padding: "12px", borderRadius: 10, cursor: saving ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", color: "white", fontSize: 13, fontWeight: 700,
              opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
            }}
          >
            {saving ? <><Loader size={13} style={{ animation: "spin 1s linear infinite" }} /> Saving...</> : <><CheckCircle size={14} /> Save & Mark Resolved</>}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "12px 18px", borderRadius: 10, cursor: "pointer",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>,
    document.body
  );
};

/* ─── FlaggedReviewModerator ─────────────────────────────────── */
const FlaggedReviewModerator = () => {
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [chatTarget, setChatTarget] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("unresolved");
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    fetchFlaggedReviews();
    fetchNotifications();
    const notifInterval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(notifInterval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("notifications/");
      const allNotifs = res.data || [];
      const flagOnlyNotifs = allNotifs.filter(n => {
        const msg = (n.message || "").toLowerCase();
        const url = (n.target_url || "").toLowerCase();
        return (
          url.includes("moderation") ||
          url.includes("flag") ||
          msg.includes("flag") ||
          msg.includes("🚩") ||
          msg.includes("inquiry")
        );
      });
      setNotifications(flagOnlyNotifs);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post("notifications/mark-all-read/");
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  const handleNotificationClick = async (n) => {
    try {
      if (!n.is_read) {
        await api.post(`notifications/${n.id}/mark-read/`);
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }

    if (n.sender) {
      const matchedReview = flaggedReviews.find(r =>
        r.flagged_users && r.flagged_users.some(fu => fu.user_id === n.sender)
      );

      if (matchedReview) {
        setSelectedStatus("all");
        setSelectedFilter("all");
        
        const matchedFu = matchedReview.flagged_users.find(fu => fu.user_id === n.sender);
        if (matchedFu) {
          setChatTarget({
            user_id: matchedFu.user_id,
            user_name: matchedFu.name,
            user_email: matchedFu.email,
            user_company_name: matchedFu.user_company_name || null,
            company_id: matchedFu.flagged_company_id || matchedReview?.company_id || null,
            company_name: matchedFu.flagged_company_name || matchedReview?.subject_name || null,
            reason: matchedFu.reason,
            item_title: matchedReview.subject_name
          });
        }

        setTimeout(() => {
          const el = document.getElementById(`flag-card-${matchedReview.review_type}-${matchedReview.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.style.border = "1px solid rgba(59, 130, 246, 0.6)";
            el.style.boxShadow = "0 0 25px rgba(59, 130, 246, 0.4)";
            setTimeout(() => {
              el.style.border = "1px solid rgba(255,255,255,0.07)";
              el.style.boxShadow = "none";
            }, 3000);
          }
        }, 100);
      }
    }
  };

  const fetchFlaggedReviews = async () => {
    try {
      setLoading(true); setError("");
      const res = await api.get("admin/reviews/flagged/?status=all");
      setFlaggedReviews(res.data);
    } catch { setError("Failed to load flagged reviews."); }
    finally { setLoading(false); }
  };

  const handleDismissFlag = async (review) => {
    if (!window.confirm("Dismiss this flag? The content will be marked as resolved.")) return;
    try {
      await api.post("admin/reviews/flagged/", { review_id: review.id, review_type: review.review_type, action: "dismiss" });
      setSuccess("Flag dismissed & marked as resolved.");
      fetchFlaggedReviews();
    } catch { setError("Failed to dismiss flag."); }
  };

  const handleReopenFlag = async (review) => {
    if (!window.confirm("Reopen this flag for moderation?")) return;
    try {
      await api.post("admin/reviews/flagged/", { review_id: review.id, review_type: review.review_type, action: "reopen" });
      setSuccess("Flag reopened successfully.");
      fetchFlaggedReviews();
    } catch { setError("Failed to reopen flag."); }
  };

  const handleDeleteReview = async (review) => {
    if (!window.confirm("Delete this content? This cannot be undone.")) return;
    try {
      await api.post("admin/reviews/flagged/", { review_id: review.id, review_type: review.review_type, action: "delete" });
      setSuccess("Content deleted.");
      fetchFlaggedReviews();
    } catch { setError("Failed to delete content."); }
  };

  const handleSaveEdit = async (text, rating) => {
    if (!text.trim()) { alert("Content cannot be empty."); return; }
    setSavingEdit(true);
    try {
      await api.post("admin/reviews/flagged/", {
        review_id: editingReview.id, review_type: editingReview.review_type,
        action: "edit", review_text: text.trim(), rating,
      });
      setSuccess("Content updated and flag marked as resolved.");
      setEditingReview(null);
      fetchFlaggedReviews();
    } catch { setError("Failed to update review."); }
    finally { setSavingEdit(false); }
  };

  // Filter items by status and type
  const statusFiltered = flaggedReviews.filter(r => {
    const isResolved = r.flag_status === "resolved" || r.is_flagged === false;
    if (selectedStatus === "unresolved") return !isResolved;
    if (selectedStatus === "resolved") return isResolved;
    return true; // "all"
  });

  const finalFiltered = statusFiltered
    .filter(r => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "job") return r.review_type === "job";
      if (selectedFilter === "rfp") return r.review_type === "rfp";
      if (selectedFilter === "reviews") return r.review_type === "company" || r.review_type === "freelancer";
      return true;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getStatusCount = (statusKey) => {
    if (statusKey === "all") return flaggedReviews.length;
    if (statusKey === "resolved") return flaggedReviews.filter(r => r.flag_status === "resolved" || r.is_flagged === false).length;
    if (statusKey === "unresolved") return flaggedReviews.filter(r => r.flag_status === "unresolved" || r.is_flagged === true).length;
    return 0;
  };

  const getTypeCount = (typeKey) => {
    if (typeKey === "all") return statusFiltered.length;
    if (typeKey === "job") return statusFiltered.filter(r => r.review_type === "job").length;
    if (typeKey === "rfp") return statusFiltered.filter(r => r.review_type === "rfp").length;
    if (typeKey === "reviews") return statusFiltered.filter(r => r.review_type === "company" || r.review_type === "freelancer").length;
    return 0;
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, gap: 10, color: "rgba(255,255,255,0.4)" }}>
      <Loader size={18} style={{ animation: "spin 1s linear infinite" }} />
      <span style={{ fontSize: 13 }}>Loading flagged content...</span>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Admin Flag Reply Notifications Banner */}
      {notifications.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
          border: "1px solid rgba(59, 130, 246, 0.25)",
          borderRadius: 14, padding: "14px 18px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                position: "relative", background: "rgba(59, 130, 246, 0.15)",
                padding: "6px 8px", borderRadius: 8, color: "#60a5fa", display: "flex", alignItems: "center", gap: 6
              }}>
                <Bell size={15} />
                {notifications.some(n => !n.is_read) && (
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", background: "#ef4444",
                    boxShadow: "0 0 8px #ef4444"
                  }} />
                )}
              </div>
              <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>
                Flag Reply Notifications ({notifications.filter(n => !n.is_read).length} unread)
              </span>
            </div>
            {notifications.some(n => !n.is_read) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 6, padding: "4px 10px", color: "rgba(255, 255, 255, 0.6)",
                  fontSize: 11, fontWeight: 600, cursor: "pointer"
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 150, overflowY: "auto" }}>
            {notifications.slice(0, 8).map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "9px 14px", borderRadius: 8, cursor: "pointer",
                  background: n.is_read ? "rgba(255, 255, 255, 0.02)" : "rgba(59, 130, 246, 0.14)",
                  border: n.is_read ? "1px solid transparent" : "1px solid rgba(59, 130, 246, 0.3)",
                  fontSize: 12, color: n.is_read ? "rgba(255,255,255,0.6)" : "white",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = n.is_read ? "rgba(255, 255, 255, 0.02)" : "rgba(59, 130, 246, 0.14)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                  <MessageSquare size={13} color={n.is_read ? "#94a3b8" : "#60a5fa"} />
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: n.is_read ? 400 : 600 }}>
                    {n.message}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", flexShrink: 0, marginLeft: 10 }}>
                  {formatDate(n.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Primary Status Filters (Unresolved vs Resolved vs All) */}
      <div style={{
        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: "10px 14px",
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginRight: 4 }}>
          FLAG STATUS:
        </div>
        {STATUS_CONFIG.map(({ key, label, color, icon: Icon }) => {
          const count = getStatusCount(key);
          const isActive = selectedStatus === key;
          return (
            <button
              key={key} onClick={() => setSelectedStatus(key)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 10, cursor: "pointer",
                background: isActive ? `${color}22` : "rgba(255,255,255,0.03)",
                border: isActive ? `1px solid ${color}60` : "1px solid rgba(255,255,255,0.07)",
                color: isActive ? color : "rgba(255,255,255,0.5)",
                fontSize: 12, fontWeight: isActive ? 700 : 500,
                transition: "all 0.2s",
                boxShadow: isActive ? `0 4px 12px ${color}15` : "none",
              }}
            >
              <Icon size={14} color={isActive ? color : "rgba(255,255,255,0.4)"} />
              <span>{label}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 7px",
                background: isActive ? `${color}35` : "rgba(255,255,255,0.08)",
                color: isActive ? color : "rgba(255,255,255,0.4)",
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Content Type Filter Bar */}
      <div style={{
        display: "flex", gap: 8,
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 12, padding: 6, width: "fit-content", flexWrap: "wrap",
      }}>
        {FILTER_CONFIG.map(({ key, label, color }) => {
          const count = getTypeCount(key);
          const isActive = selectedFilter === key;
          return (
            <button
              key={key} onClick={() => setSelectedFilter(key)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                background: isActive ? `${color}22` : "transparent",
                color: isActive ? color : "rgba(255,255,255,0.4)",
                fontSize: 12, fontWeight: isActive ? 600 : 500,
                borderBottom: isActive ? `2px solid ${color}` : "2px solid transparent",
                transition: "all 0.2s",
              }}
            >
              <Filter size={11} />
              {label}
              <span style={{
                fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "1px 6px",
                background: isActive ? `${color}30` : "rgba(255,255,255,0.07)",
                color: isActive ? color : "rgba(255,255,255,0.3)",
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alerts */}
      {error && (
        <div style={{
          display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", borderRadius: 10,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 12,
        }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}
      {success && (
        <div style={{
          display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", borderRadius: 10,
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#6ee7b7", fontSize: 12,
        }}>
          <Check size={13} /> {success}
        </div>
      )}

      {/* Content List */}
      {finalFiltered.length === 0 ? (
        <div style={{
          ...card, padding: 60, textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Check size={24} color="#10b981" />
          </div>
          <div>
            <div style={{ color: "white", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No Items Found</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
              {flaggedReviews.length === 0 ? "No flagged content in queue." : "No items match the selected status and type filters."}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {finalFiltered.map((review) => (
            <ReviewCard
              key={`${review.review_type}-${review.id}`}
              review={review}
              onDismiss={handleDismissFlag}
              onReopen={handleReopenFlag}
              onEdit={setEditingReview}
              onDelete={handleDeleteReview}
              onViewPost={setViewingPost}
              onOpenChat={(fu, rev) => setChatTarget({
                user_id: fu.user_id,
                user_name: fu.name,
                user_email: fu.email,
                user_company_name: fu.user_company_name || null,
                company_id: fu.flagged_company_id || rev?.company_id || null,
                company_name: fu.flagged_company_name || rev?.subject_name || null,
                reason: fu.reason,
                item_title: rev.subject_name
              })}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingReview && (
        <EditModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSave={handleSaveEdit}
          saving={savingEdit}
        />
      )}

      {/* View Post Detail Modal */}
      {viewingPost && (
        <PostDetailModal
          review={viewingPost}
          onClose={() => setViewingPost(null)}
          onOpenChat={setChatTarget}
        />
      )}

      {/* Admin Chat Modal */}
      {chatTarget && (
        <AdminChatModal
          target={chatTarget}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  );
};

export default FlaggedReviewModerator;
