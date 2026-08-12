import React, { useState, useEffect } from "react";
import { Check, Edit2, Trash2, Star, AlertCircle, ShieldAlert, Filter, Loader, CheckCircle, RotateCcw, Clock } from "lucide-react";
import api from "../../api";

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

/* ─── Review Card ────────────────────────────────────────────── */
const ReviewCard = ({ review, onDismiss, onReopen, onEdit, onDelete }) => {
  const typeInfo = TYPE_COLORS[review.review_type] || TYPE_COLORS.company;
  const isResolved = review.flag_status === "resolved" || review.is_flagged === false;

  return (
    <div
      style={{
        ...card, padding: "18px 20px",
        transition: "all 0.25s",
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
            {new Date(review.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
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
            {review.review_type === "job" || review.review_type === "rfp" ? "OWNER" : "SUBMITTED BY"}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{review.reviewer_name}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{review.reviewer_email}</div>
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
          <div style={{ fontSize: 9, fontWeight: 700, color: isResolved ? "#6ee7b7" : "#fca5a5", letterSpacing: "1.5px", marginBottom: 4 }}>
            FLAG REASON {isResolved && "(RESOLVED)"}
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.5 }}>
            {review.flag_reason}
          </p>
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

  return (
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
    </div>
  );
};

/* ─── FlaggedReviewModerator ─────────────────────────────────── */
const FlaggedReviewModerator = () => {
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("unresolved");
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => { fetchFlaggedReviews(); }, []);

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
    </div>
  );
};

export default FlaggedReviewModerator;
