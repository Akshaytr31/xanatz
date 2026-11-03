import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, TrendingUp, Calendar, Zap, Clock, Search, Filter, Download,
  ChevronDown, ChevronRight, BarChart3, LineChart, Award, Sparkles, CheckCircle2,
  LogIn, LogOut, User, Building2, Briefcase, FolderKanban, RefreshCw,
  MessageSquarePlus, Edit3, Trash2, Heart, HeartOff, MessageSquare, Eye, Shield,
  Layers, ArrowUpRight, FileSpreadsheet, Info
} from "lucide-react";
import api from "../../api";
import { formatDate } from "../../utils/dateUtils";

/* ─── Action Type Configuration (Colors, Labels, Icons) ─────────────────── */
const ACTION_CONFIG = {
  LOGIN: { label: "Login", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)", icon: LogIn, category: "account" },
  LOGOUT: { label: "Logout", color: "#64748b", bg: "rgba(100, 116, 139, 0.15)", border: "rgba(100, 116, 139, 0.3)", icon: LogOut, category: "account" },
  PROFILE_SWITCH: { label: "Profile Switch", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)", border: "rgba(139, 92, 246, 0.3)", icon: User, category: "account" },
  COMPANY_SWITCH: { label: "Company Switch", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.3)", icon: Building2, category: "account" },
  PROFILE_UPDATE: { label: "Profile Update", color: "#14b8a6", bg: "rgba(20, 184, 166, 0.15)", border: "rgba(20, 184, 166, 0.3)", icon: User, category: "account" },

  JOB_APPLY: { label: "Applied for Job", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.15)", border: "rgba(6, 182, 212, 0.3)", icon: Briefcase, category: "jobs" },
  JOB_CREATE: { label: "Posted Job", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)", icon: Briefcase, category: "jobs" },
  JOB_UPDATE: { label: "Updated Job", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)", icon: Briefcase, category: "jobs" },

  RFP_CREATE: { label: "Posted RFP", color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.3)", icon: FolderKanban, category: "rfps" },
  RFP_UPDATE: { label: "Updated RFP", color: "#ec4899", bg: "rgba(236, 72, 153, 0.15)", border: "rgba(236, 72, 153, 0.3)", icon: FolderKanban, category: "rfps" },
  RFP_INTEREST: { label: "Submitted Proposal", color: "#6366f1", bg: "rgba(99, 102, 241, 0.15)", border: "rgba(99, 102, 241, 0.3)", icon: FolderKanban, category: "rfps" },

  POST_CREATE: { label: "Created Post", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)", icon: MessageSquarePlus, category: "feed" },
  POST_UPDATE: { label: "Updated Post", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)", icon: Edit3, category: "feed" },
  POST_DELETE: { label: "Deleted Post", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)", icon: Trash2, category: "feed" },
  POST_LIKE: { label: "Liked Post", color: "#ec4899", bg: "rgba(236, 72, 153, 0.15)", border: "rgba(236, 72, 153, 0.3)", icon: Heart, category: "feed" },
  POST_UNLIKE: { label: "Unliked Post", color: "#64748b", bg: "rgba(100, 116, 139, 0.15)", border: "rgba(100, 116, 139, 0.3)", icon: HeartOff, category: "feed" },
  COMMENT_CREATE: { label: "Added Comment", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.3)", icon: MessageSquare, category: "feed" },
  COMMENT_UPDATE: { label: "Updated Comment", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)", icon: Edit3, category: "feed" },
  COMMENT_DELETE: { label: "Deleted Comment", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)", icon: Trash2, category: "feed" },
  COMMENT_LIKE: { label: "Liked Comment", color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.3)", icon: Heart, category: "feed" },
  COMMENT_UNLIKE: { label: "Unliked Comment", color: "#64748b", bg: "rgba(100, 116, 139, 0.15)", border: "rgba(100, 116, 139, 0.3)", icon: HeartOff, category: "feed" },

  REVIEW_POST: { label: "Posted Review", color: "#f97316", bg: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.3)", icon: RefreshCw, category: "other" },
  PAGE_VIEW: { label: "Page Navigation", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.12)", border: "rgba(148, 163, 184, 0.25)", icon: Eye, category: "other" },
  OTHER: { label: "System Action", color: "#a5b4fc", bg: "rgba(165, 180, 252, 0.12)", border: "rgba(165, 180, 252, 0.25)", icon: Shield, category: "other" },
};

const CATEGORIES = [
  { key: "all", label: "All Activity", color: "#3b82f6" },
  { key: "feed", label: "Community & Feed", color: "#ec4899", desc: "Posts, Likes, Comments" },
  { key: "jobs", label: "Jobs & Careers", color: "#06b6d4", desc: "Applications & Job Openings" },
  { key: "rfps", label: "RFPs & Projects", color: "#a855f7", desc: "RFPs & Proposal Submissions" },
  { key: "account", label: "Account & Security", color: "#10b981", desc: "Logins, Switches & Profile" },
];

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

/* ─── Interactive SVG Trend Chart ────────────────────────────────────────── */
const ActivityTrendChart = ({ trends = [], chartType = "area" }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!trends || trends.length === 0) {
    return (
      <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 10 }}>
        No trend data recorded for this time window.
      </div>
    );
  }

  const counts = trends.map((t) => t.count);
  const maxCount = Math.max(...counts, 4);

  // SVG dimensions & margins
  const width = 800;
  const height = 210;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 35;

  const innerW = width - paddingLeft - paddingRight;
  const innerH = height - paddingTop - paddingBottom;

  const points = trends.map((item, idx) => {
    const x = paddingLeft + (idx / Math.max(trends.length - 1, 1)) * innerW;
    const y = paddingTop + (1 - item.count / maxCount) * innerH;
    return { x, y, ...item };
  });

  // Smooth bezier curve generator
  let pathD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + innerH} L ${points[0].x} ${paddingTop + innerH} Z`
    : "";

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

  // Label ticks: choose ~6 evenly spaced labels
  const step = Math.max(Math.floor(trends.length / 6), 1);

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          <linearGradient id="activityAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="activityLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <filter id="glowLine" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Y-axis guidelines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = paddingTop + ratio * innerH;
          const val = Math.round(maxCount * (1 - ratio));
          return (
            <g key={ratio}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray={ratio === 1 ? "none" : "3 3"}
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                fill="rgba(255,255,255,0.3)"
                fontSize="10"
                fontWeight="600"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Chart View: Area vs Bars */}
        {chartType === "area" ? (
          <>
            {/* Area Fill */}
            <path d={areaD} fill="url(#activityAreaGrad)" />

            {/* Glowing Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#activityLineGrad)"
              strokeWidth="2.8"
              strokeLinecap="round"
              filter="url(#glowLine)"
            />

            {/* Data Circles */}
            {points.map((pt, idx) => {
              const isHovered = hoverIndex === idx;
              const hasActivity = pt.count > 0;
              return (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : hasActivity ? 3.5 : 2}
                  fill={isHovered ? "#38bdf8" : hasActivity ? "#60a5fa" : "rgba(255,255,255,0.2)"}
                  stroke={isHovered ? "white" : "rgba(15,23,42,0.9)"}
                  strokeWidth={isHovered ? 2.5 : 1}
                  style={{ transition: "all 0.15s ease", pointerEvents: "none" }}
                />
              );
            })}
          </>
        ) : (
          /* Bar Chart Mode */
          points.map((pt, idx) => {
            const barW = Math.max(innerW / trends.length - 4, 6);
            const barH = (pt.count / maxCount) * innerH;
            const barY = paddingTop + innerH - barH;
            const isHovered = hoverIndex === idx;
            return (
              <rect
                key={idx}
                x={pt.x - barW / 2}
                y={pt.count > 0 ? barY : paddingTop + innerH - 2}
                width={barW}
                height={pt.count > 0 ? barH : 2}
                rx={3}
                fill={isHovered ? "#38bdf8" : pt.count > 0 ? "rgba(96,165,250,0.75)" : "rgba(255,255,255,0.08)"}
                style={{ transition: "fill 0.15s ease" }}
              />
            );
          })
        )}

        {/* Active hover vertical crosshair line */}
        {hoveredPoint && (
          <line
            x1={hoveredPoint.x}
            y1={paddingTop}
            x2={hoveredPoint.x}
            y2={paddingTop + innerH}
            stroke="rgba(255,255,255,0.25)"
            strokeDasharray="3 3"
            strokeWidth="1.2"
            pointerEvents="none"
          />
        )}

        {/* X-axis labels */}
        {points.map((pt, idx) => {
          if (idx % step === 0 || idx === points.length - 1) {
            return (
              <text
                key={idx}
                x={pt.x}
                y={height - 10}
                fill="rgba(255,255,255,0.38)"
                fontSize="7"
                fontWeight="600"
                textAnchor="middle"
              >
                {pt.label}
              </text>
            );
          }
          return null;
        })}

        {/* Invisible hit targets for smooth hover detection */}
        {points.map((pt, idx) => {
          const slotW = innerW / trends.length;
          return (
            <rect
              key={`hit-${idx}`}
              x={pt.x - slotW / 2}
              y={paddingTop}
              width={slotW}
              height={innerH}
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: Math.min(Math.max(hoveredPoint.x, 90), width - 90),
            transform: "translateX(-50%)",
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(96, 165, 250, 0.3)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5), 0 0 12px rgba(59,130,246,0.2)",
            borderRadius: 10,
            padding: "8px 12px",
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            zIndex: 10,
            minWidth: 120,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.5px" }}>
            {hoveredPoint.day_name}, {hoveredPoint.label}
          </span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: hoveredPoint.count > 0 ? "#10b981" : "#64748b" }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: "white" }}>
              {hoveredPoint.count} <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>{hoveredPoint.count === 1 ? "action" : "actions"}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Component: MyActivitySection ─────────────────────────────────── */
const MyActivitySection = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [chartType, setChartType] = useState("area"); // "area" | "bar"
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchActivity = () => {
    setLoading(true);
    const params = new URLSearchParams({
      range: timeRange,
      category: activeCategory,
      q: searchQuery.trim(),
    });

    api.get(`user-activity/my-activity/?${params.toString()}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Failed to load user activity:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivity();
    }, 200);
    return () => clearTimeout(timer);
  }, [timeRange, activeCategory, searchQuery]);

  const summary = data?.summary || {};
  const breakdown = data?.category_breakdown || {};
  const dailyTrends = data?.daily_trends || [];
  const logs = data?.logs || [];
  const weekdays = data?.weekday_distribution || [];

  // Export CSV handler
  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = ["Log ID", "Action Type", "Action Title", "Category", "Timestamp", "IP Address", "Details"];
    const rows = logs.map((l) => [
      l.id,
      l.action_type,
      `"${(l.action_title || "").replace(/"/g, '""')}"`,
      ACTION_CONFIG[l.action_type]?.category || "other",
      l.created_at,
      l.ip_address || "N/A",
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `my_activity_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPeriodActions = Math.max(summary.total_in_period || 0, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ═══ Header Bar: Title, Range Filters & Export ═══ */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(8,12,28,0.95))",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "20px 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.25))",
              border: "1px solid rgba(59,130,246,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#60a5fa",
              boxShadow: "0 0 16px rgba(59,130,246,0.3)",
            }}
          >
            <Activity size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: 0, letterSpacing: "-0.4px" }}>
              My Activity & Performance Insights
            </h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "3px 0 0" }}>
              Explore your engagement velocity, platform interactions, and security event logs.
            </p>
          </div>
        </div>

        {/* Time Window Pills & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Time Range Selector */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 3,
              gap: 2,
            }}
          >
            {[
              { key: "7d", label: "7 Days" },
              { key: "30d", label: "30 Days" },
              { key: "90d", label: "90 Days" },
              { key: "all", label: "All Time" },
            ].map((opt) => {
              const active = timeRange === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setTimeRange(opt.key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 9,
                    border: "none",
                    background: active
                      ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                      : "transparent",
                    color: active ? "white" : "rgba(255,255,255,0.55)",
                    fontSize: 11,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: active ? "0 2px 10px rgba(59,130,246,0.3)" : "none",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={!logs.length}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: logs.length ? "#93c5fd" : "rgba(255,255,255,0.3)",
              fontSize: 11,
              fontWeight: 700,
              cursor: logs.length ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (logs.length) e.currentTarget.style.background = "rgba(59,130,246,0.15)";
            }}
            onMouseLeave={(e) => {
              if (logs.length) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ═══ KPI Summary Metrics Row ═══ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 14,
        }}
      >
        {/* Metric 1: Total Activities */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(8,12,28,0.9))",
            border: "1px solid rgba(59,130,246,0.2)",
            borderTop: "3px solid #3b82f6",
            borderRadius: 16,
            padding: "16px 18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.2px", color: "rgba(255,255,255,0.4)" }}>
              TOTAL ACTIONS
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
              <TrendingUp size={15} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "white", marginTop: 8, letterSpacing: "-0.5px" }}>
            {summary.total_in_period || 0}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
            Lifetime recorded: <strong style={{ color: "#93c5fd" }}>{summary.total_all_time || 0}</strong>
          </div>
        </div>

        {/* Metric 2: Active Streak */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(8,12,28,0.9))",
            border: "1px solid rgba(245,158,11,0.2)",
            borderTop: "3px solid #f59e0b",
            borderRadius: 16,
            padding: "16px 18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.2px", color: "rgba(255,255,255,0.4)" }}>
              ACTIVE STREAK
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24" }}>
              <Zap size={15} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "white", marginTop: 8, letterSpacing: "-0.5px" }}>
            {summary.active_streak_days || 0} <span style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>Days</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
            {summary.active_streak_days > 2 ? "Consistent engagement 🔥" : "Log daily actions to build streak"}
          </div>
        </div>

        {/* Metric 3: Peak Engagement Day */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(8,12,28,0.9))",
            border: "1px solid rgba(16,185,129,0.2)",
            borderTop: "3px solid #10b981",
            borderRadius: 16,
            padding: "16px 18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.2px", color: "rgba(255,255,255,0.4)" }}>
              PEAK DAY
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
              <Award size={15} />
            </div>
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "white", marginTop: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {summary.peak_day || "N/A"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
            Record: <strong style={{ color: "#6ee7b7" }}>{summary.peak_day_count || 0} actions</strong> in one day
          </div>
        </div>

        {/* Metric 4: Peak Activity Window */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(8,12,28,0.9))",
            border: "1px solid rgba(139,92,246,0.2)",
            borderTop: "3px solid #8b5cf6",
            borderRadius: 16,
            padding: "16px 18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.2px", color: "rgba(255,255,255,0.4)" }}>
              RHYTHM WINDOW
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
              <Clock size={15} />
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginTop: 8 }}>
            {summary.peak_hour_window || "12:00 - 13:00"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
            Most active time of the day
          </div>
        </div>
      </div>

      {/* ═══ Visual Activity Graph Section ═══ */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(8,12,28,0.95))",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "22px 24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span>Activity Trend Velocity</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#60a5fa",
                  background: "rgba(59,130,246,0.15)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  borderRadius: 6,
                  padding: "2px 7px",
                }}
              >
                LIVE
              </span>
            </h3>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "3px 0 0" }}>
              Daily actions recorded across Xanatz features during the selected period.
            </p>
          </div>

          {/* Chart Type Toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: 2,
            }}
          >
            <button
              onClick={() => setChartType("area")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 8,
                border: "none",
                background: chartType === "area" ? "rgba(59,130,246,0.25)" : "transparent",
                color: chartType === "area" ? "#93c5fd" : "rgba(255,255,255,0.4)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <LineChart size={13} />
              <span>Curve</span>
            </button>
            <button
              onClick={() => setChartType("bar")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 8,
                border: "none",
                background: chartType === "bar" ? "rgba(59,130,246,0.25)" : "transparent",
                color: chartType === "bar" ? "#93c5fd" : "rgba(255,255,255,0.4)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <BarChart3 size={13} />
              <span>Bars</span>
            </button>
          </div>
        </div>

        {/* Render Trend Graph */}
        <ActivityTrendChart trends={dailyTrends} chartType={chartType} />
      </div>

      {/* ═══ 2-Column Grid: Category Breakdown + Weekday Rhythm ═══ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        {/* Category Breakdown Matrix */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(8,12,28,0.95))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: "20px 22px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: "white", margin: 0 }}>
                Activity by Category
              </h4>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>
                Click a category below to filter your timeline.
              </p>
            </div>
            <Layers size={16} color="rgba(255,255,255,0.4)" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { key: "feed", label: "Community & Feed", count: breakdown.feed || 0, color: "#ec4899", desc: "Posts, likes & comments" },
              { key: "jobs", label: "Jobs & Careers", count: breakdown.jobs || 0, color: "#06b6d4", desc: "Applications & job posts" },
              { key: "rfps", label: "RFPs & Proposals", count: breakdown.rfps || 0, color: "#a855f7", desc: "RFP leads & bids" },
              { key: "account", label: "Account & Security", count: breakdown.account || 0, color: "#10b981", desc: "Logins & profile edits" },
              { key: "other", label: "Other Actions", count: breakdown.other || 0, color: "#94a3b8", desc: "Reviews & navigation" },
            ].map((cat) => {
              const pct = Math.round((cat.count / totalPeriodActions) * 100) || 0;
              const isSelected = activeCategory === cat.key;
              return (
                <div
                  key={cat.key}
                  onClick={() => setActiveCategory(isSelected ? "all" : cat.key)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: isSelected ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                    border: isSelected ? `1px solid ${cat.color}60` : "1px solid rgba(255,255,255,0.05)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{cat.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: cat.color }}>{cat.count}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>({pct}%)</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 99,
                        width: `${pct}%`,
                        background: cat.color,
                        boxShadow: `0 0 8px ${cat.color}66`,
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekday Rhythm & Consistency */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(8,12,28,0.95))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: "20px 22px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: "white", margin: 0 }}>
                  Weekly Engagement Rhythm
                </h4>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>
                  Distribution of actions across days of the week.
                </p>
              </div>
              <Calendar size={16} color="rgba(255,255,255,0.4)" />
            </div>

            {/* Weekday Bars */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, height: 140, paddingTop: 20 }}>
              {(() => {
                const maxWeekday = Math.max(...weekdays.map((w) => w.count), 1);
                return weekdays.map((item) => {
                  const barPct = Math.round((item.count / maxWeekday) * 100);
                  const isPeak = item.count === maxWeekday && item.count > 0;
                  return (
                    <div
                      key={item.day}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        height: "100%",
                        justifyContent: "flex-end",
                      }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 700, color: isPeak ? "#60a5fa" : "rgba(255,255,255,0.4)" }}>
                        {item.count}
                      </span>
                      <div
                        style={{
                          width: "100%",
                          maxWidth: 28,
                          height: `${Math.max(barPct, 8)}%`,
                          borderRadius: 6,
                          background: isPeak
                            ? "linear-gradient(180deg, #60a5fa, #3b82f6)"
                            : "rgba(255,255,255,0.08)",
                          boxShadow: isPeak ? "0 0 12px rgba(59,130,246,0.5)" : "none",
                          transition: "height 0.6s ease",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: isPeak ? 800 : 600,
                          color: isPeak ? "white" : "rgba(255,255,255,0.35)",
                        }}
                      >
                        {item.day}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Quick Tip Footer */}
          <div
            style={{
              marginTop: 18,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.15)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Sparkles size={14} color="#60a5fa" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
              Tip: Regular activity on Xanatz raises your profile rank in freelancer searches and job recommendations.
            </span>
          </div>
        </div>
      </div>

      {/* ═══ Filterable Activity Timeline Feed ═══ */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(8,12,28,0.95))",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "22px 24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Timeline Header & Search / Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span>Recent Activity History</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 99,
                  padding: "1px 8px",
                }}
              >
                {logs.length} events
              </span>
            </h3>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "3px 0 0" }}>
              A full chronological log of your interactions and security audits.
            </p>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", minWidth: 240 }}>
            <Search size={14} color="rgba(255,255,255,0.35)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "white",
                fontSize: 12,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
        </div>

        {/* Category Pills Filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 8,
                  border: active ? `1px solid ${cat.color}60` : "1px solid rgba(255,255,255,0.08)",
                  background: active ? `${cat.color}20` : "rgba(255,255,255,0.02)",
                  color: active ? "white" : "rgba(255,255,255,0.5)",
                  fontSize: 11,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Timeline Items List */}
        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            Loading your activity records...
          </div>
        ) : logs.length === 0 ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              background: "rgba(255,255,255,0.015)",
              borderRadius: 14,
              border: "1px dashed rgba(255,255,255,0.08)",
            }}
          >
            <Activity size={32} color="rgba(255,255,255,0.2)" style={{ margin: "0 auto 10px" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>No activities recorded yet</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              Try adjusting your search filter or date range above.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
            {logs.map((log) => {
              const conf = ACTION_CONFIG[log.action_type] || ACTION_CONFIG.OTHER;
              const IconComp = conf.icon || Activity;
              const isExpanded = expandedLogId === log.id;
              const hasDetails = log.details && Object.keys(log.details).length > 0;

              return (
                <div
                  key={log.id}
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12,
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      {/* Icon Pill */}
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: conf.bg,
                          border: `1px solid ${conf.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: conf.color,
                          flexShrink: 0,
                        }}
                      >
                        <IconComp size={16} />
                      </div>

                      {/* Title & Metadata */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                            {log.action_title}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 800,
                              color: conf.color,
                              background: conf.bg,
                              border: `1px solid ${conf.border}`,
                              borderRadius: 6,
                              padding: "1px 6px",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {conf.label.toUpperCase()}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                            {getRelativeTime(log.created_at)}
                          </span>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>•</span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                            {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {log.ip_address && (
                            <>
                              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>•</span>
                              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                                IP: {log.ip_address}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expand Details Trigger */}
                    {hasDetails && (
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: isExpanded ? "#93c5fd" : "rgba(255,255,255,0.35)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "4px 8px",
                          borderRadius: 6,
                        }}
                      >
                        <span>{isExpanded ? "Hide" : "Details"}</span>
                        <ChevronDown
                          size={14}
                          style={{
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s",
                          }}
                        />
                      </button>
                    )}
                  </div>

                  {/* Expandable JSON details */}
                  {isExpanded && hasDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 8,
                        padding: "10px 14px",
                        marginTop: 4,
                        fontSize: 11,
                        color: "#93c5fd",
                        fontFamily: "monospace",
                        overflowX: "auto",
                      }}
                    >
                      <pre style={{ margin: 0 }}>
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyActivitySection;
