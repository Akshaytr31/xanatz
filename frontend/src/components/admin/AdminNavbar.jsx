import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../../api";
import {
  LayoutDashboard, Shield, FileText, LogOut, CreditCard,
  ShieldAlert, ChevronRight, Menu, X, Users, Building2, Briefcase, FolderKanban,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview",        tab: "overview" },
  { icon: Users,           label: "Users List",      tab: "users" },
  { icon: Building2,       label: "Companies List",  tab: "companies" },
  { icon: Briefcase,       label: "Jobs List",       tab: "jobs" },
  { icon: FolderKanban,    label: "RFPs List",       tab: "rfps" },
  { icon: CreditCard,      label: "Job Plans",       tab: "plans" },
  { icon: FileText,        label: "Privacy Policy",  tab: "policy" },
  { icon: ShieldAlert,     label: "Flagged Content", tab: "flagged_reviews" },
];

const SIDEBAR_FULL    = 240;
const SIDEBAR_MINI    = 68;
const MOBILE_BREAKPOINT = 768;

const AdminNavbar = ({ handleLogout, activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const [user, setUser]           = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* detect mobile width for toggle button visibility */
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_BREAKPOINT : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* fetch current user */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("me/");
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    if (localStorage.getItem("access")) fetchUser();
  }, []);

  /* close drawer when a nav item is tapped on mobile */
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const sidebarWidth = isMobile ? SIDEBAR_FULL : (collapsed ? SIDEBAR_MINI : SIDEBAR_FULL);
  const showLabels   = isMobile ? true : !collapsed;

  return (
    <>
      {/* ── Mobile overlay backdrop ─────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 997,
          }}
        />
      )}

      {/* ── Hamburger button (mobile only) ─────────────────── */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(v => !v)}
          style={{
            position: "fixed", top: 12, left: 12, zIndex: 1001,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 10, padding: "8px",
            cursor: "pointer", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: sidebarWidth,
          /* on mobile: slide in/out; on desktop: width transitions */
          transform: isMobile
            ? (mobileOpen ? "translateX(0)" : "translateX(-100%)")
            : "translateX(0)",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          background: "linear-gradient(180deg, #0d1117 0%, #0f172a 55%, #0d1117 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column",
          zIndex: 998, overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 14px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          minHeight: 68,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden", flex: 1, minWidth: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(99,102,241,0.45)",
            }}>
              <Shield size={17} color="white" />
            </div>

            {showLabels && (
              <div style={{ overflow: "hidden", minWidth: 0 }}>
                <div style={{
                  color: "white", fontWeight: 800, fontSize: 14,
                  letterSpacing: "0.5px", lineHeight: 1.1, whiteSpace: "nowrap",
                }}>
                  XANATZ
                </div>
                <div style={{
                  color: "#6366f1", fontSize: 8, fontWeight: 700,
                  letterSpacing: "3px", marginTop: 2, whiteSpace: "nowrap",
                }}>
                  ADMIN PANEL
                </div>
              </div>
            )}
          </div>

          {/* Collapse toggle — desktop only */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(v => !v)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 7, padding: "5px 6px",
                cursor: "pointer", color: "rgba(255,255,255,0.45)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", flexShrink: 0,
              }}
              aria-label="Collapse sidebar"
            >
              <ChevronRight
                size={13}
                style={{
                  transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
                  transition: "transform 0.3s",
                }}
              />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "10px 9px", overflowY: "auto" }}>
          {showLabels && (
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "2px",
              color: "rgba(255,255,255,0.22)", padding: "6px 9px 4px",
            }}>
              NAVIGATION
            </div>
          )}

          {NAV_ITEMS.map(({ icon: Icon, label, tab }) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleNavClick(tab)}
                title={!showLabels ? label : undefined}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: 10,
                  padding: showLabels ? "10px 11px" : "10px 0",
                  justifyContent: showLabels ? "flex-start" : "center",
                  borderRadius: 10, marginBottom: 2, cursor: "pointer",
                  border: "none", textAlign: "left",
                  background: isActive
                    ? "linear-gradient(135deg,rgba(99,102,241,0.22),rgba(139,92,246,0.13))"
                    : "transparent",
                  borderLeft: isActive ? "2px solid #6366f1" : "2px solid transparent",
                  color: isActive ? "#a5b4fc" : "rgba(255,255,255,0.42)",
                  transition: "all 0.18s",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.42)";
                  }
                }}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                {showLabels && (
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                )}
                {isActive && showLabels && (
                  <div style={{
                    marginLeft: "auto", width: 5, height: 5, borderRadius: "50%",
                    background: "#6366f1", boxShadow: "0 0 7px #6366f1",
                    flexShrink: 0,
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: user + status + logout */}
        <div style={{
          padding: "10px 9px 14px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          {/* Online pill */}
          {showLabels && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 11px", borderRadius: 8, marginBottom: 8,
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.15)",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#10b981", boxShadow: "0 0 8px #10b981",
                animation: "pulse-glow 2s infinite",
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>
                System Online
              </span>
            </div>
          )}

          {/* User row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "9px 11px", borderRadius: 10, marginBottom: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            justifyContent: showLabels ? "flex-start" : "center",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "white",
            }}>
              {user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            {showLabels && (
              <div style={{ overflow: "hidden", minWidth: 0 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  maxWidth: 140,
                }}>
                  {user?.email || "Administrator"}
                </div>
                <div style={{
                  fontSize: 9, color: "#6366f1", fontWeight: 700, letterSpacing: "1.5px",
                }}>
                  SUPER ADMIN
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={!showLabels ? "Log Out" : undefined}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              gap: 7, padding: "8px 11px", borderRadius: 10, cursor: "pointer",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              color: "rgba(252,165,165,0.8)", transition: "all 0.18s",
              justifyContent: showLabels ? "flex-start" : "center",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(239,68,68,0.18)";
              e.currentTarget.style.color = "#fca5a5";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(239,68,68,0.08)";
              e.currentTarget.style.color = "rgba(252,165,165,0.8)";
            }}
          >
            <LogOut size={14} style={{ flexShrink: 0 }} />
            {showLabels && (
              <span style={{ fontSize: 12, fontWeight: 600 }}>Log Out</span>
            )}
          </button>
        </div>
      </aside>

      <style>{`
        @keyframes pulse-glow {
          0%,100% { opacity:1; box-shadow:0 0 8px #10b981; }
          50%      { opacity:0.6; box-shadow:0 0 4px #10b981; }
        }
      `}</style>
    </>
  );
};

export default AdminNavbar;
