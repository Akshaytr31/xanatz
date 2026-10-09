import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search, History, Shield, Calendar, Mail, User, Clock,
  Filter, Download, ArrowUpRight, CheckCircle2, Eye,
  Building2, Briefcase, FolderKanban, LogIn, LogOut, RefreshCw, X, Code
} from "lucide-react";
import api from "../../api";
import { formatDate } from "../../utils/dateUtils";

/* Action Type Config (Icons & Colors) */
const ACTION_CONFIG = {
  LOGIN: { label: "Login", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)", icon: LogIn },
  LOGOUT: { label: "Logout", color: "#64748b", bg: "rgba(100, 116, 139, 0.15)", border: "rgba(100, 116, 139, 0.3)", icon: LogOut },
  PROFILE_SWITCH: { label: "Profile Switch", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)", border: "rgba(139, 92, 246, 0.3)", icon: User },
  COMPANY_SWITCH: { label: "Company Switch", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.3)", icon: Building2 },
  JOB_APPLY: { label: "Applied for Job", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.15)", border: "rgba(6, 182, 212, 0.3)", icon: Briefcase },
  JOB_CREATE: { label: "Posted Job", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)", icon: Briefcase },
  JOB_UPDATE: { label: "Updated Job", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)", icon: Briefcase },
  RFP_CREATE: { label: "Posted RFP", color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.3)", icon: FolderKanban },
  RFP_UPDATE: { label: "Updated RFP", color: "#ec4899", bg: "rgba(236, 72, 153, 0.15)", border: "rgba(236, 72, 153, 0.3)", icon: FolderKanban },
  RFP_INTEREST: { label: "Submitted Proposal", color: "#6366f1", bg: "rgba(99, 102, 241, 0.15)", border: "rgba(99, 102, 241, 0.3)", icon: FolderKanban },
  REVIEW_POST: { label: "Posted Review", color: "#f97316", bg: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.3)", icon: RefreshCw },
  PROFILE_UPDATE: { label: "Profile Update", color: "#14b8a6", bg: "rgba(20, 184, 166, 0.15)", border: "rgba(20, 184, 166, 0.3)", icon: User },
  PAGE_VIEW: { label: "Page Navigation", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.12)", border: "rgba(148, 163, 184, 0.25)", icon: Eye },
  OTHER: { label: "System Action", color: "#a5b4fc", bg: "rgba(165, 180, 252, 0.12)", border: "rgba(165, 180, 252, 0.25)", icon: Shield },
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

const AdminUserLogsList = ({ initialSearch = "" }) => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [selectedLogModal, setSelectedLogModal] = useState(null);

  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  const fetchLogs = () => {
    setLoading(true);
    let url = `admin/user-logs/?q=${encodeURIComponent(search)}&action_type=${actionFilter}&date_range=${dateRange}`;
    api.get(url)
      .then(res => {
        setLogs(res.data.logs || []);
        setStats(res.data.stats || null);
      })
      .catch(err => console.error("Error fetching user logs", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, actionFilter, dateRange]);

  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = ["Log ID", "User ID", "User Name", "User Email", "Action Type", "Action Title", "IP Address", "Timestamp", "Details"];
    const rows = logs.map(l => [
      l.id,
      l.user_id || "N/A",
      `"${(l.user_name || "").replace(/"/g, '""')}"`,
      `"${(l.user_email || "").replace(/"/g, '""')}"`,
      l.action_type,
      `"${(l.action_title || "").replace(/"/g, '""')}"`,
      l.ip_address || "N/A",
      l.created_at,
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `user_activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Top Bar with Title, Stats & Action Buttons ── */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16, padding: "20px 22px",
        display: "flex", flexDirection: "column", gap: 16,
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))",
              border: "1px solid rgba(99,102,241,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <History size={22} color="#a5b4fc" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "white", letterSpacing: "-0.3px" }}>
                User Activity Audit Logs
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                Track login history, IP addresses, profile switches, job postings, and proposals by User Name or User ID.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={fetchLogs}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)", color: "white", fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <RefreshCw size={13} className={loading ? "spin" : ""} /> Refresh
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!logs.length}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.4)",
                background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))",
                color: "#a5b4fc", fontSize: 12, fontWeight: 700,
                cursor: logs.length ? "pointer" : "not-allowed", opacity: logs.length ? 1 : 0.5,
                transition: "all 0.2s"
              }}
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* ── Summary Stats Header Cards ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12,
          paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)"
        }}>
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Total Logs</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginTop: 4 }}>{stats ? stats.total_logs : "—"}</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(16,185,129,0.15)" }}>
            <div style={{ fontSize: 11, color: "#34d399", fontWeight: 500 }}>Logins</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981", marginTop: 4 }}>{stats ? stats.login_count : "—"}</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(139,92,246,0.15)" }}>
            <div style={{ fontSize: 11, color: "#c084fc", fontWeight: 500 }}>Switches</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#a855f7", marginTop: 4 }}>{stats ? stats.switch_count : "—"}</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(6,182,212,0.15)" }}>
            <div style={{ fontSize: 11, color: "#67e8f9", fontWeight: 500 }}>Job Actions</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#06b6d4", marginTop: 4 }}>{stats ? stats.job_count : "—"}</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(168,85,247,0.15)" }}>
            <div style={{ fontSize: 11, color: "#e9d5ff", fontWeight: 500 }}>RFP Actions</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#c084fc", marginTop: 4 }}>{stats ? stats.rfp_count : "—"}</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Panel ── */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          {/* Main Search Bar (User Name, Email, User ID) */}
          <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
            <Search size={16} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search User Name, User ID (e.g. 12), Email, or IP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px 10px 40px",
                background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 12, color: "white", fontSize: 13, outline: "none",
                fontFamily: "inherit"
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer"
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Date Range Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={14} color="rgba(255,255,255,0.4)" />
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              style={{
                background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 10, color: "white", padding: "8px 12px", fontSize: 12, outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="all" style={{ background: "#0d1117" }}>All Time</option>
              <option value="today" style={{ background: "#0d1117" }}>Today</option>
              <option value="7d" style={{ background: "#0d1117" }}>Last 7 Days</option>
              <option value="30d" style={{ background: "#0d1117" }}>Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Action Type Pills */}
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap", overflowX: "auto", paddingBottom: 4
        }}>
          {[
            { id: "all", label: "All Actions" },
            { id: "LOGIN", label: "Logins" },
            { id: "PROFILE_SWITCH", label: "Profile Switches" },
            { id: "COMPANY_SWITCH", label: "Company Switches" },
            { id: "JOB_APPLY", label: "Job Applies" },
            { id: "JOB_CREATE", label: "Job Posts" },
            { id: "RFP_CREATE", label: "RFP Posts" },
            { id: "RFP_INTEREST", label: "Proposals" },
            { id: "REVIEW_POST", label: "Reviews" },
            { id: "PROFILE_UPDATE", label: "Profile Edits" },
          ].map(type => {
            const isActive = actionFilter === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setActionFilter(type.id)}
                style={{
                  padding: "6px 13px", borderRadius: 20, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: isActive ? 700 : 500,
                  background: isActive
                    ? "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.25))"
                    : "rgba(255,255,255,0.04)",
                  color: isActive ? "#a5b4fc" : "rgba(255,255,255,0.45)",
                  border: isActive ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
                  transition: "all 0.2s", whiteSpace: "nowrap"
                }}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Logs List Feed ── */}
      {loading ? (
        <div style={{ padding: 50, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          <RefreshCw size={20} className="spin" style={{ margin: "0 auto 10px", display: "block" }} />
          Fetching activity logs...
        </div>
      ) : logs.length === 0 ? (
        <div style={{
          padding: 60, textAlign: "center", background: "rgba(255,255,255,0.02)",
          borderRadius: 16, border: "1px dashed rgba(255,255,255,0.08)"
        }}>
          <History size={32} color="rgba(255,255,255,0.2)" style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>No activity logs found</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            Try adjusting your search term (User Name or ID) or selecting "All Actions".
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {logs.map(log => {
            const config = ACTION_CONFIG[log.action_type] || ACTION_CONFIG.OTHER;
            const ActionIcon = config.icon;
            const formattedDate = formatDate(log.created_at, "N/A");
            const relativeTime = getRelativeTime(log.created_at);

            return (
              <div
                key={log.id}
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.025), rgba(255,255,255,0.008))",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14, padding: "14px 18px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 14, flexWrap: "wrap",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.025), rgba(255,255,255,0.008))";
                }}
              >
                {/* Left: User Avatar & Action Badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 260, flex: 1 }}>
                  {/* Action Icon Badge */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: config.bg, border: `1px solid ${config.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <ActionIcon size={18} color={config.color} />
                  </div>

                  {/* Log Details & User Info */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
                        {log.action_title}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 12,
                        background: config.bg, color: config.color, border: `1px solid ${config.border}`
                      }}>
                        {config.label}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4, flexWrap: "wrap", fontSize: 12 }}>
                      {/* User Name / Email Pill */}
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                        <User size={12} color="#a5b4fc" />
                        <span>{log.user_name || "Unknown User"}</span>
                        {log.user_email && <span style={{ color: "rgba(255,255,255,0.38)" }}>({log.user_email})</span>}
                      </div>

                      {/* User ID Badge */}
                      {log.user_id && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: "#a5b4fc",
                          background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
                          padding: "1px 6px", borderRadius: 6
                        }}>
                          ID: #{log.user_id}
                        </span>
                      )}

                      {/* IP Pill */}
                      {log.ip_address && (
                        <span style={{
                          fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)",
                          background: "rgba(255,255,255,0.05)", padding: "1px 7px", borderRadius: 6
                        }}>
                          IP: {log.ip_address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Timestamp & Details Button */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
                      {relativeTime}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                      {formattedDate}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedLogModal(log)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.05)", color: "#a5b4fc", fontSize: 11, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  >
                    <Code size={12} /> Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── JSON Details Modal ── */}
      {selectedLogModal && createPortal(
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            background: "#0f172a", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 20, width: "100%", maxWidth: 580, maxHeight: "90vh",
            overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <History size={18} color="#6366f1" />
                <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>
                  Log Record Details #{selectedLogModal.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedLogModal(null)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 1 }}>
                  User Overview
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginTop: 4 }}>
                  {selectedLogModal.user_name || "Unknown Name"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                  Email: {selectedLogModal.user_email || "N/A"} | User ID: #{selectedLogModal.user_id || "N/A"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                  IP Address: {selectedLogModal.ip_address || "N/A"}
                </div>
                {selectedLogModal.user_agent && (
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 6, wordBreak: "break-all" }}>
                    User Agent: {selectedLogModal.user_agent}
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
                  Action Payload / Context
                </div>
                <pre style={{
                  background: "#080c14", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, padding: 14, color: "#a5b4fc", fontSize: 12,
                  overflowX: "auto", fontFamily: "monospace"
                }}>
                  {JSON.stringify(selectedLogModal.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "right" }}>
              <button
                onClick={() => setSelectedLogModal(null)}
                style={{
                  padding: "8px 18px", borderRadius: 10, border: "none",
                  background: "#6366f1", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer"
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

export default AdminUserLogsList;
