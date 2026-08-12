import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, ShieldAlert, FileText,
  ArrowUpRight, Briefcase, Search, Bell, Building2, FolderKanban,
} from "lucide-react";
import AdminNavbar from "../components/admin/AdminNavbar";
import PrivacyPolicyEditor from "../components/admin/PrivacyPolicyEditor";
import PlanManager from "../components/admin/PlanManager";
import FlaggedReviewModerator from "../components/admin/FlaggedReviewModerator";
import AdminUsersList from "../components/admin/AdminUsersList";
import AdminCompaniesList from "../components/admin/AdminCompaniesList";
import AdminJobsList from "../components/admin/AdminJobsList";
import AdminRFPsList from "../components/admin/AdminRFPsList";
import api from "../api";

/* ── Constants ──────────────────────────────────────────────── */
const SIDEBAR_FULL = 240;
const SIDEBAR_MINI = 68;
const MOBILE_BP    = 768;

/* ── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, delay, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: 14,
      backdropFilter: "blur(20px)",
      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      cursor: onClick ? "pointer" : "default",
      animation: `fadeSlideUp 0.5s ease ${delay || 0}s both`,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.borderColor = `${color}40`;
      e.currentTarget.style.boxShadow = `0 12px 32px ${color}20`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: `${color}18`, border: `1px solid ${color}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={20} color={color} />
      </div>
      {onClick && (
        <span style={{ fontSize: 11, fontWeight: 600, color, display: "flex", alignItems: "center", gap: 3 }}>
          View <ArrowUpRight size={12} />
        </span>
      )}
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "white", lineHeight: 1, letterSpacing: "-0.5px" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  </div>
);

/* ── Tab Button ─────────────────────────────────────────────── */
const TabButton = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "9px 14px", borderRadius: 10, border: "none", cursor: "pointer",
      background: isActive
        ? "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))"
        : "rgba(255,255,255,0.04)",
      color: isActive ? "#a5b4fc" : "rgba(255,255,255,0.4)",
      fontWeight: isActive ? 600 : 500, fontSize: 12,
      borderBottom: isActive ? "2px solid #6366f1" : "2px solid transparent",
      transition: "all 0.2s", whiteSpace: "nowrap",
    }}
    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; } }}
    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; } }}
  >
    <Icon size={14} />
    {label}
  </button>
);

/* ── Overview Panel ─────────────────────────────────────────── */
const OverviewPanel = ({ setActiveTab }) => {
  const [stats, setStats]           = useState(null);
  const [statsLoading, setLoading]  = useState(true);

  useEffect(() => {
    api.get("admin/stats/")
      .then(r => setStats(r.data))
      .catch(err => console.error("Failed to fetch admin stats", err))
      .finally(() => setLoading(false));
  }, []);

  const fmt = n => (n == null ? "—" : n.toLocaleString());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Stat grid — responsive via minmax */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 14,
      }}>
        <StatCard icon={Users}        label="Total Users"   value={statsLoading ? "…" : fmt(stats?.total_users)}   color="#6366f1" delay={0.05} onClick={() => setActiveTab("users")} />
        <StatCard icon={Building2}    label="Companies"     value={statsLoading ? "…" : fmt(stats?.total_companies)} color="#3b82f6" delay={0.1}  onClick={() => setActiveTab("companies")} />
        <StatCard icon={Briefcase}    label="Active Jobs"   value={statsLoading ? "…" : fmt(stats?.active_jobs)}   color="#10b981" delay={0.15} onClick={() => setActiveTab("jobs")} />
        <StatCard icon={FolderKanban} label="Total RFPs"    value={statsLoading ? "…" : fmt(stats?.total_rfps)}    color="#8b5cf6" delay={0.2}  onClick={() => setActiveTab("rfps")} />
        <StatCard icon={ShieldAlert}  label="Flagged Items" value={statsLoading ? "…" : fmt(stats?.flagged_count)} color="#ef4444" delay={0.25} onClick={() => setActiveTab("flagged_reviews")} />
      </div>

      {/* Quick Actions */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: "18px 20px",
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "2px",
          color: "rgba(255,255,255,0.3)", marginBottom: 12,
        }}>
          QUICK ACTIONS
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { icon: CreditCard,  label: "Manage Plans",  tab: "plans",           color: "#6366f1" },
            { icon: ShieldAlert, label: "Review Flags",  tab: "flagged_reviews", color: "#ef4444" },
            { icon: FileText,    label: "Edit Policy",   tab: "policy",          color: "#10b981" },
          ].map(({ icon: Icon, label, tab, color }) => (
            <button
              key={tab} onClick={() => setActiveTab(tab)}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "9px 15px",
                borderRadius: 10, cursor: "pointer", border: `1px solid ${color}25`,
                background: `${color}10`, color, fontSize: 13, fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: "18px 20px",
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "2px",
          color: "rgba(255,255,255,0.3)", marginBottom: 14,
        }}>
          SYSTEM STATUS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {["API Server", "Database", "File Storage", "Email Service"].map(label => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>Operational</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Admin Dashboard ────────────────────────────────────────── */
const AdminDashboard = () => {
  const navigate    = useNavigate();
  const [activeTab, setActiveTab]     = useState("overview");
  const [collapsed, setCollapsed]     = useState(false);
  const [isMobile,  setIsMobile]      = useState(
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_BP : false
  );

  /* track viewport for margin calc */
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BP);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("access")) navigate("/login");
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const TAB_META = {
    overview:        { icon: LayoutDashboard, label: "Overview",          desc: "System overview and quick access to all modules" },
    users:           { icon: Users,           label: "Users List",        desc: "All registered users across the platform" },
    companies:       { icon: Building2,       label: "Companies List",    desc: "All registered companies on the platform" },
    jobs:            { icon: Briefcase,       label: "Jobs List",         desc: "All active and closed job openings" },
    rfps:            { icon: FolderKanban,    label: "RFPs List",         desc: "All active and draft RFPs (Request for Proposals)" },
    plans:           { icon: CreditCard,      label: "Job Posting Plans", desc: "Create and manage subscription plans for companies" },
    policy:          { icon: FileText,        label: "Privacy Policy",    desc: "Edit the privacy policy shown to users during registration" },
    flagged_reviews: { icon: ShieldAlert,     label: "Flagged Content",   desc: "Moderate flagged content submitted by users" },
  };

  const current = TAB_META[activeTab] || TAB_META.overview;

  /* ── margin-left = sidebar width on desktop, 0 on mobile */
  const mainMargin = isMobile ? 0 : (collapsed ? SIDEBAR_MINI : SIDEBAR_FULL);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#080c14 0%,#0d1117 40%,#0a0f1e 100%)",
      fontFamily: "'Inter','SF Pro Display',-apple-system,sans-serif",
      display: "flex",
    }}>
      {/* Sidebar — receives collapsed state from parent */}
      <AdminNavbar
        handleLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* ── Main content — expands/shrinks with sidebar ─── */}
      <main style={{
        flex: 1,
        /* key: marginLeft matches sidebar width, same transition timing */
        marginLeft: mainMargin,
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        /* prevent content from going under hamburger on mobile */
        paddingTop: isMobile ? 52 : 0,
        minWidth: 0, /* allow flex child to shrink */
        overflow: "hidden",
      }}>

        {/* Top Bar */}
        <header style={{
          padding: isMobile ? "10px 16px" : "14px 28px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(8,12,20,0.85)",
          backdropFilter: "blur(20px)",
          position: "sticky", top: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12,
        }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, overflow: "hidden" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", fontWeight: 500, whiteSpace: "nowrap" }}>
              Admin
            </span>
            <span style={{ color: "rgba(255,255,255,0.18)" }}>/</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
              <current.icon size={13} color="#6366f1" style={{ flexShrink: 0 }} />
              <span style={{
                fontSize: 12, color: "#a5b4fc", fontWeight: 600,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {current.label}
              </span>
            </div>
          </div>

          {/* Right: search + bell */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {!isMobile && (
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 9, padding: "6px 12px",
              }}>
                <Search size={12} color="rgba(255,255,255,0.28)" />
                <input
                  placeholder="Search..."
                  style={{
                    background: "none", border: "none", outline: "none",
                    color: "rgba(255,255,255,0.6)", fontSize: 12, width: 110,
                    fontFamily: "inherit",
                  }}
                />
              </div>
            )}
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative", flexShrink: 0,
            }}>
              <Bell size={14} color="rgba(255,255,255,0.5)" />
              <div style={{
                position: "absolute", top: 7, right: 7, width: 6, height: 6,
                borderRadius: "50%", background: "#ef4444",
                border: "1.5px solid #080c14",
              }} />
            </div>
          </div>
        </header>

        {/* Page body */}
        <div style={{
          flex: 1, overflow: "auto",
          padding: isMobile ? "20px 14px" : "26px 28px",
        }}>
          {/* Page heading */}
          <div style={{ marginBottom: 22, animation: "fadeSlideUp 0.4s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 4, flexWrap: "wrap" }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: "linear-gradient(135deg,rgba(99,102,241,0.28),rgba(139,92,246,0.18))",
                border: "1px solid rgba(99,102,241,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <current.icon size={17} color="#a5b4fc" />
              </div>
              <div style={{ minWidth: 0 }}>
                <h1 style={{
                  color: "white", fontSize: isMobile ? 18 : 21, fontWeight: 800,
                  letterSpacing: "-0.4px", margin: 0,
                }}>
                  {current.label}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 11, margin: "3px 0 0", fontWeight: 400 }}>
                  {current.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-tab switcher */}
          {activeTab !== "overview" && (
            <div style={{
              display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 11, padding: 5, width: "fit-content", maxWidth: "100%",
            }}>
              <TabButton icon={LayoutDashboard} label="Overview"     isActive={activeTab === "overview"}        onClick={() => setActiveTab("overview")} />
              <TabButton icon={Users}           label="Users"        isActive={activeTab === "users"}           onClick={() => setActiveTab("users")} />
              <TabButton icon={Building2}       label="Companies"    isActive={activeTab === "companies"}       onClick={() => setActiveTab("companies")} />
              <TabButton icon={Briefcase}       label="Jobs"         isActive={activeTab === "jobs"}            onClick={() => setActiveTab("jobs")} />
              <TabButton icon={FolderKanban}    label="RFPs"         isActive={activeTab === "rfps"}            onClick={() => setActiveTab("rfps")} />
              <TabButton icon={CreditCard}      label="Job Plans"    isActive={activeTab === "plans"}           onClick={() => setActiveTab("plans")} />
              <TabButton icon={FileText}        label="Policy"       isActive={activeTab === "policy"}          onClick={() => setActiveTab("policy")} />
              <TabButton icon={ShieldAlert}     label="Flagged"      isActive={activeTab === "flagged_reviews"} onClick={() => setActiveTab("flagged_reviews")} />
            </div>
          )}

          {/* Content */}
          <div key={activeTab} style={{ animation: "fadeSlideUp 0.3s ease both" }}>
            {activeTab === "overview"        && <OverviewPanel setActiveTab={setActiveTab} />}
            {activeTab === "users"           && <AdminUsersList />}
            {activeTab === "companies"       && <AdminCompaniesList />}
            {activeTab === "jobs"            && <AdminJobsList />}
            {activeTab === "rfps"            && <AdminRFPsList />}
            {activeTab === "plans"           && <PlanManager />}
            {activeTab === "policy"          && <PrivacyPolicyEditor />}
            {activeTab === "flagged_reviews" && <FlaggedReviewModerator />}
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
