import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search, MessageSquare, Heart, HeartOff, Trash2, Edit3, MessageSquarePlus,
  Calendar, Mail, User, Clock, Filter, Download, ArrowUpRight, CheckCircle2,
  Eye, RefreshCw, X, Code, ExternalLink, Sparkles, Building2, Layers, Shield
} from "lucide-react";
import api from "../../api";
import { formatDate } from "../../utils/dateUtils";

/* Action Configuration: Labels, Colors, Badges, Icons */
const ACTION_CONFIG = {
  POST_CREATE: {
    label: "Post Created",
    category: "posts",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.3)",
    icon: MessageSquarePlus
  },
  POST_UPDATE: {
    label: "Post Updated",
    category: "posts",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.15)",
    border: "rgba(245, 158, 11, 0.3)",
    icon: Edit3
  },
  POST_DELETE: {
    label: "Post Deleted",
    category: "posts",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.15)",
    border: "rgba(239, 68, 68, 0.3)",
    icon: Trash2
  },
  POST_LIKE: {
    label: "Post Liked",
    category: "likes",
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.15)",
    border: "rgba(236, 72, 153, 0.3)",
    icon: Heart
  },
  POST_UNLIKE: {
    label: "Post Unliked",
    category: "likes",
    color: "#64748b",
    bg: "rgba(100, 116, 139, 0.15)",
    border: "rgba(100, 116, 139, 0.3)",
    icon: HeartOff
  },
  COMMENT_CREATE: {
    label: "Comment Added",
    category: "comments",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.15)",
    border: "rgba(59, 130, 246, 0.3)",
    icon: MessageSquare
  },
  COMMENT_UPDATE: {
    label: "Comment Updated",
    category: "comments",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.15)",
    border: "rgba(245, 158, 11, 0.3)",
    icon: Edit3
  },
  COMMENT_DELETE: {
    label: "Comment Deleted",
    category: "comments",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.15)",
    border: "rgba(239, 68, 68, 0.3)",
    icon: Trash2
  },
  COMMENT_LIKE: {
    label: "Comment Liked",
    category: "likes",
    color: "#a855f7",
    bg: "rgba(168, 85, 247, 0.15)",
    border: "rgba(168, 85, 247, 0.3)",
    icon: Heart
  },
  COMMENT_UNLIKE: {
    label: "Comment Unliked",
    category: "likes",
    color: "#64748b",
    bg: "rgba(100, 116, 139, 0.15)",
    border: "rgba(100, 116, 139, 0.3)",
    icon: HeartOff
  },
};

const getRelativeTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const mins = Math.floor(diffInSeconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(isoString, "N/A");
};

const AdminFeedLogsList = ({ initialSearch = "" }) => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [selectedLogModal, setSelectedLogModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchLogs = () => {
    setLoading(true);
    let url = `admin/feed-logs/?q=${encodeURIComponent(search)}&category=${categoryFilter}&action_type=${actionFilter}&date_range=${dateRange}`;
    api.get(url)
      .then(res => {
        setLogs(res.data.logs || []);
        setStats(res.data.stats || null);
      })
      .catch(err => console.error("Error fetching feed logs", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, actionFilter, dateRange]);

  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = [
      "Log ID", "Action Type", "Action Title", "User ID", "User Name", "User Email",
      "Post ID", "Comment ID", "Company Name", "IP Address", "Timestamp", "Details"
    ];
    const rows = logs.map(l => [
      l.id,
      l.action_type,
      `"${(l.action_title || "").replace(/"/g, '""')}"`,
      l.user_id || "N/A",
      `"${(l.user_name || "").replace(/"/g, '""')}"`,
      `"${(l.user_email || "").replace(/"/g, '""')}"`,
      l.details?.post_id || "N/A",
      l.details?.comment_id || "N/A",
      `"${(l.details?.company_name || "").replace(/"/g, '""')}"`,
      l.ip_address || "N/A",
      l.created_at,
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `feed_activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to moderate / delete post if needed
  const handleDeletePost = async (postId) => {
    if (!window.confirm(`Are you sure you want to delete post #${postId}? This will remove it from the live feed.`)) return;
    try {
      setDeletingId(postId);
      await api.delete(`feed/${postId}/`);
      fetchLogs();
    } catch (err) {
      alert("Failed to delete post: " + (err.response?.data?.detail || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const fmt = n => (n == null ? "—" : n.toLocaleString());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Top Metric Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap: 12,
      }}>
        {/* Total Feed Logs */}
        <div style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 14, padding: "16px 18px",
          display: "flex", flexDirection: "column", gap: 8,
          backdropFilter: "blur(16px)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Total Feed Events
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Layers size={14} color="#a5b4fc" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "white", letterSpacing: "-0.5px" }}>
            {loading && !stats ? "…" : fmt(stats?.total_logs)}
          </div>
          <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 500 }}>
            {fmt(stats?.total_filtered)} matching filter
          </div>
        </div>

        {/* Posts Published */}
        <div style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.03))",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: 14, padding: "16px 18px",
          display: "flex", flexDirection: "column", gap: 8,
          backdropFilter: "blur(16px)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Posts Published
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageSquarePlus size={14} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981", letterSpacing: "-0.5px" }}>
            {loading && !stats ? "…" : fmt(stats?.posts_created)}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
            {fmt(stats?.live_posts)} live in feed
          </div>
        </div>

        {/* Post & Comment Likes */}
        <div style={{
          background: "linear-gradient(135deg, rgba(236,72,153,0.08), rgba(236,72,153,0.03))",
          border: "1px solid rgba(236,72,153,0.2)",
          borderRadius: 14, padding: "16px 18px",
          display: "flex", flexDirection: "column", gap: 8,
          backdropFilter: "blur(16px)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Total Likes Given
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(236,72,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={14} color="#ec4899" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f472b6", letterSpacing: "-0.5px" }}>
            {loading && !stats ? "…" : fmt((stats?.post_likes || 0) + (stats?.comment_likes || 0))}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
            {fmt(stats?.post_likes)} post • {fmt(stats?.comment_likes)} comment
          </div>
        </div>

        {/* Comments & Replies */}
        <div style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.03))",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: 14, padding: "16px 18px",
          display: "flex", flexDirection: "column", gap: 8,
          backdropFilter: "blur(16px)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Comments & Replies
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageSquare size={14} color="#3b82f6" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#60a5fa", letterSpacing: "-0.5px" }}>
            {loading && !stats ? "…" : fmt(stats?.comments_created)}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
            {fmt(stats?.live_comments)} live comments
          </div>
        </div>

        {/* Unique Contributors */}
        <div style={{
          background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(168,85,247,0.03))",
          border: "1px solid rgba(168,85,247,0.2)",
          borderRadius: 14, padding: "16px 18px",
          display: "flex", flexDirection: "column", gap: 8,
          backdropFilter: "blur(16px)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Active Users
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(168,85,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={14} color="#c084fc" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#c084fc", letterSpacing: "-0.5px" }}>
            {loading && !stats ? "…" : fmt(stats?.unique_users)}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
            Engaged in social feed
          </div>
        </div>
      </div>

      {/* ── Filter & Search Control Panel ── */}
      <div style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.07)",
        borderRadius: 16, padding: "16px 18px",
        display: "flex", flexDirection: "column", gap: 14
      }}>
        {/* Category switcher buttons */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 10,
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          paddingBottom: 12
        }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All Feed Activity", icon: Layers },
              { id: "posts", label: "Posts & Media", icon: MessageSquarePlus },
              { id: "comments", label: "Comments & Replies", icon: MessageSquare },
              { id: "likes", label: "Likes & Reactions", icon: Heart },
            ].map(cat => {
              const isActive = categoryFilter === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryFilter(cat.id);
                    setActionFilter("all");
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: isActive ? 700 : 500,
                    background: isActive
                      ? "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))"
                      : "rgba(255, 255, 255, 0.04)",
                    color: isActive ? "#a5b4fc" : "rgba(255, 255, 255, 0.5)",
                    borderBottom: isActive ? "2px solid #6366f1" : "2px solid transparent",
                    transition: "all 0.2s"
                  }}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={handleExportCSV}
              disabled={!logs.length}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 13px", borderRadius: 9,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.75)",
                fontSize: 12, fontWeight: 600, cursor: logs.length ? "pointer" : "not-allowed",
                transition: "all 0.2s", opacity: logs.length ? 1 : 0.5
              }}
            >
              <Download size={13} /> Export CSV
            </button>

            <button
              onClick={fetchLogs}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 9,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.75)",
                cursor: "pointer", transition: "all 0.2s"
              }}
              title="Refresh Logs"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Search, Action Filter & Date Range */}
        <div style={{
          display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between"
        }}>
          {/* Search bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.09)",
            borderRadius: 10, padding: "8px 12px",
            flex: 1, minWidth: 220
          }}>
            <Search size={14} color="rgba(255,255,255,0.4)" />
            <input
              type="text"
              placeholder="Search by user name, email, post content, comment, or IP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: "none", border: "none", outline: "none",
                color: "white", fontSize: 12, width: "100%",
                fontFamily: "inherit"
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex" }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* Action Type Dropdown */}
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.09)",
                borderRadius: 10, padding: "8px 12px",
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: 12, outline: "none", cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              <option value="all" style={{ background: "#0d1117" }}>All Action Types</option>
              <option value="POST_CREATE" style={{ background: "#0d1117" }}>Posts Created</option>
              <option value="POST_UPDATE" style={{ background: "#0d1117" }}>Posts Updated</option>
              <option value="POST_DELETE" style={{ background: "#0d1117" }}>Posts Deleted</option>
              <option value="POST_LIKE" style={{ background: "#0d1117" }}>Post Liked</option>
              <option value="POST_UNLIKE" style={{ background: "#0d1117" }}>Post Unliked</option>
              <option value="COMMENT_CREATE" style={{ background: "#0d1117" }}>Comments Added</option>
              <option value="COMMENT_UPDATE" style={{ background: "#0d1117" }}>Comments Updated</option>
              <option value="COMMENT_DELETE" style={{ background: "#0d1117" }}>Comments Deleted</option>
              <option value="COMMENT_LIKE" style={{ background: "#0d1117" }}>Comment Liked</option>
              <option value="COMMENT_UNLIKE" style={{ background: "#0d1117" }}>Comment Unliked</option>
            </select>

            {/* Date Range Dropdown */}
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.09)",
                borderRadius: 10, padding: "8px 12px",
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: 12, outline: "none", cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              <option value="all" style={{ background: "#0d1117" }}>All Time</option>
              <option value="today" style={{ background: "#0d1117" }}>Today</option>
              <option value="7d" style={{ background: "#0d1117" }}>Last 7 Days</option>
              <option value="30d" style={{ background: "#0d1117" }}>Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Logs List / Audit Table ── */}
      {loading ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "60px 20px", gap: 12,
          background: "rgba(255, 255, 255, 0.02)", borderRadius: 16, border: "1px solid rgba(255, 255, 255, 0.06)"
        }}>
          <RefreshCw size={24} color="#6366f1" className="animate-spin" />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Loading feed activity audit logs...</span>
        </div>
      ) : logs.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "60px 20px", gap: 12,
          background: "rgba(255, 255, 255, 0.02)", borderRadius: 16, border: "1px solid rgba(255, 255, 255, 0.06)"
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <MessageSquare size={20} color="rgba(255,255,255,0.3)" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>No Feed Activity Found</div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, textAlign: "center", maxWidth: 400 }}>
            No logs matched your active filters. Try adjusting the search query, category, or date range.
          </p>
        </div>
      ) : (
        <div style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: 16, overflow: "hidden"
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  background: "rgba(255, 255, 255, 0.02)"
                }}>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>Action</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>User / Author</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>Activity Details & Snippet</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>IP & Time</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const cfg = ACTION_CONFIG[log.action_type] || {
                    label: log.action_type,
                    color: "#a5b4fc",
                    bg: "rgba(165,180,252,0.12)",
                    border: "rgba(165,180,252,0.25)",
                    icon: MessageSquare
                  };
                  const Icon = cfg.icon;
                  const details = log.details || {};
                  const isCompany = details.is_company || Boolean(details.company_name);

                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                        transition: "background 0.15s ease"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {/* Action Badge */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "4px 9px", borderRadius: 8,
                          background: cfg.bg, border: `1px solid ${cfg.border}`,
                          color: cfg.color, fontSize: 11, fontWeight: 700
                        }}>
                          <Icon size={12} />
                          {cfg.label}
                        </div>
                        {details.post_id && (
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4, fontFamily: "monospace" }}>
                            Post #{details.post_id}
                          </div>
                        )}
                      </td>

                      {/* User Info */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top", minWidth: 170 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          {log.user_profile_picture ? (
                            <img
                              src={log.user_profile_picture}
                              alt=""
                              style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{
                              width: 30, height: 30, borderRadius: "50%",
                              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0
                            }}>
                              {(log.user_name || log.user_email || "U")[0].toUpperCase()}
                            </div>
                          )}
                          <div style={{ overflow: "hidden" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {log.user_name || "Anonymous User"}
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {log.user_email || "No email"}
                            </div>
                            {isCompany && (
                              <div style={{
                                display: "inline-flex", alignItems: "center", gap: 3,
                                fontSize: 9, fontWeight: 600, color: "#38bdf8",
                                background: "rgba(56, 189, 248, 0.12)", padding: "1px 6px", borderRadius: 4, marginTop: 2
                              }}>
                                <Building2 size={9} /> {details.company_name || "Company Post"}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Activity Details / Content Snippet */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top", maxWidth: 360 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: 3 }}>
                          {log.action_title}
                        </div>

                        {/* Text Preview */}
                        {(details.content || details.comment_text || details.content_preview || details.comment_snippet) && (
                          <div style={{
                            fontSize: 11, color: "rgba(255,255,255,0.5)",
                            background: "rgba(0,0,0,0.2)", padding: "6px 9px", borderRadius: 6,
                            marginTop: 4, lineHeight: 1.4,
                            borderLeft: `2px solid ${cfg.color}`,
                            wordBreak: "break-word"
                          }}>
                            "{details.content || details.comment_text || details.content_preview || details.comment_snippet}"
                          </div>
                        )}

                        {/* Extra tags */}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 5 }}>
                          {details.media_count > 0 && (
                            <span style={{ fontSize: 10, color: "#a5b4fc", background: "rgba(99,102,241,0.12)", padding: "2px 6px", borderRadius: 4 }}>
                              📷 {details.media_count} media file(s)
                            </span>
                          )}
                          {details.is_reply && (
                            <span style={{ fontSize: 10, color: "#38bdf8", background: "rgba(56,189,248,0.12)", padding: "2px 6px", borderRadius: 4 }}>
                              ↩ Reply to comment #{details.parent_id}
                            </span>
                          )}
                          {details.total_likes != null && (
                            <span style={{ fontSize: 10, color: "#f472b6", background: "rgba(236,72,153,0.12)", padding: "2px 6px", borderRadius: 4 }}>
                              ❤️ {details.total_likes} likes
                            </span>
                          )}
                        </div>
                      </td>

                      {/* IP & Timestamp */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "white" }}>
                          {getRelativeTime(log.created_at)}
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                          {formatDate(log.created_at, "N/A")}
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2, fontFamily: "monospace" }}>
                          IP: {log.ip_address || "127.0.0.1"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                          <button
                            onClick={() => setSelectedLogModal(log)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "5px 10px", borderRadius: 7,
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: "#a5b4fc", fontSize: 11, fontWeight: 600,
                              cursor: "pointer", transition: "all 0.15s"
                            }}
                            title="Inspect complete payload"
                          >
                            <Eye size={12} /> View
                          </button>

                          {/* Quick delete moderation button for live posts if post_id exists */}
                          {details.post_id && log.action_type !== "POST_DELETE" && (
                            <button
                              onClick={() => handleDeletePost(details.post_id)}
                              disabled={deletingId === details.post_id}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                padding: "5px 8px", borderRadius: 7,
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                color: "#f87171", fontSize: 11, fontWeight: 600,
                                cursor: "pointer", transition: "all 0.15s"
                              }}
                              title="Delete live post from feed"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Log Details Modal ── */}
      {selectedLogModal && createPortal(
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div style={{
            background: "#0d1117", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 18, width: "100%", maxWidth: 640,
            maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.8)"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: ACTION_CONFIG[selectedLogModal.action_type]?.bg || "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Shield size={16} color={ACTION_CONFIG[selectedLogModal.action_type]?.color || "#a5b4fc"} />
                </div>
                <div>
                  <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>
                    Log #{selectedLogModal.id}: {selectedLogModal.action_title}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                    {selectedLogModal.action_type} • Recorded {getRelativeTime(selectedLogModal.created_at)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogModal(null)}
                style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                  cursor: "pointer", display: "flex", padding: 4
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* User meta box */}
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>Initiated By</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginTop: 2 }}>{selectedLogModal.user_name || "Anonymous User"}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{selectedLogModal.user_email || "N/A"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>IP & Device</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#a5b4fc", marginTop: 2 }}>{selectedLogModal.ip_address || "127.0.0.1"}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedLogModal.user_agent || "Browser Client"}
                  </div>
                </div>
              </div>

              {/* Timestamp Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Exact Timestamp</div>
                  <div style={{ fontSize: 12, color: "white", fontWeight: 600, marginTop: 2 }}>{formatDate(selectedLogModal.created_at, "N/A")}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Relative Time</div>
                  <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600, marginTop: 2 }}>{getRelativeTime(selectedLogModal.created_at)}</div>
                </div>
              </div>

              {/* Full Content if available */}
              {(selectedLogModal.details?.content || selectedLogModal.details?.comment_text) && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "1px" }}>
                    Full Content Payload
                  </div>
                  <div style={{
                    background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10, padding: "12px", fontSize: 13, color: "white", lineHeight: 1.5,
                    whiteSpace: "pre-wrap", wordBreak: "break-word"
                  }}>
                    {selectedLogModal.details.content || selectedLogModal.details.comment_text}
                  </div>
                </div>
              )}

              {/* Raw JSON Details */}
              <div>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 6
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Raw Event Metadata (JSON)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedLogModal.details, null, 2));
                      alert("Copied payload to clipboard!");
                    }}
                    style={{
                      background: "none", border: "none", color: "#a5b4fc",
                      fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                    }}
                  >
                    <Code size={11} /> Copy JSON
                  </button>
                </div>
                <pre style={{
                  background: "#080c14", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "12px", fontSize: 11, color: "#a5b4fc",
                  overflowX: "auto", fontFamily: "'SF Mono', Consolas, monospace", margin: 0
                }}>
                  {JSON.stringify(selectedLogModal.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex", justifyContent: "flex-end", gap: 10, background: "rgba(255,255,255,0.01)"
            }}>
              <button
                onClick={() => setSelectedLogModal(null)}
                style={{
                  padding: "8px 16px", borderRadius: 8,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminFeedLogsList;
