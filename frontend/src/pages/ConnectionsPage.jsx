import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, UserCheck, UserX, Clock, Search, X,
  UserPlus, Building2, Bell, RefreshCw,
  Compass, MapPin, ExternalLink, ArrowRight, Briefcase
} from "lucide-react";
import api, { backendUrl } from "../api";
import Navbar from "../components/Navbar";
import ConnectButton from "../components/ConnectButton";
import FollowButton from "../components/FollowButton";

const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) return url;
  return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

const Avatar = ({ src, name, size = 46, isCompany }) => {
  const bg = isCompany
    ? "linear-gradient(135deg,#8b5cf6,#6366f1)"
    : "linear-gradient(135deg,#10b981,#06b6d4)";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: isCompany ? "12px" : "50%",
        background: bg,
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 800,
        color: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
      }}
    >
      {src ? (
        <img
          src={getMediaUrl(src)}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        (name || "?").charAt(0).toUpperCase()
      )}
    </div>
  );
};

const TABS = [
  { id: "discover",  label: "Discover & Suggestions", icon: Compass },
  { id: "accepted",  label: "My Network",            icon: UserCheck },
  { id: "following", label: "Following Companies",   icon: Bell },
  { id: "pending",   label: "Pending Requests",       icon: Clock },
  { id: "sent",      label: "Sent",                   icon: UserPlus },
];

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState("discover");
  const [suggestionFilter, setSuggestionFilter] = useState("all"); // 'all' | 'members' | 'companies'
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [following, setFollowing] = useState([]);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [connRes, pendRes, followRes, meRes, userSugRes, coSugRes] = await Promise.all([
        api.get("connections/"),
        api.get("connections/pending/"),
        api.get("company-follows/"),
        api.get("me/"),
        api.get("connections/suggestions/").catch(() => ({ data: [] })),
        api.get("company-follows/suggestions/").catch(() => ({ data: [] })),
      ]);
      setConnections(connRes.data || []);
      setPending(pendRes.data || []);
      setFollowing(followRes.data || []);
      setMe(meRes.data || null);
      setUserSuggestions(userSugRes.data || []);
      setCompanySuggestions(coSugRes.data || []);
    } catch (err) {
      console.error("Failed to load network data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Debounced search when user types in the Find search bar
  useEffect(() => {
    if (!search.trim()) return;

    const timer = setTimeout(async () => {
      try {
        const [userSugRes, coSugRes] = await Promise.all([
          api.get(`connections/suggestions/?q=${encodeURIComponent(search.trim())}`).catch(() => ({ data: [] })),
          api.get(`company-follows/suggestions/?q=${encodeURIComponent(search.trim())}`).catch(() => ({ data: [] })),
        ]);
        if (userSugRes.data) setUserSuggestions(userSugRes.data);
        if (coSugRes.data) setCompanySuggestions(coSugRes.data);
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // When search is cleared, reload default suggestions
  useEffect(() => {
    if (!search.trim() && !loading) {
      Promise.all([
        api.get("connections/suggestions/").catch(() => ({ data: [] })),
        api.get("company-follows/suggestions/").catch(() => ({ data: [] })),
      ]).then(([userSugRes, coSugRes]) => {
        setUserSuggestions(userSugRes.data || []);
        setCompanySuggestions(coSugRes.data || []);
      });
    }
  }, [search, loading]);

  // Reject / Withdraw connection
  const handleRemove = async (conn) => {
    try {
      await api.delete(`connections/${conn.id}/`);
      setPending((prev) => prev.filter((c) => c.id !== conn.id));
      setConnections((prev) => prev.filter((c) => c.id !== conn.id));
    } catch {
      /* ignore */
    }
  };

  const myId = me?.id;
  const accepted = connections.filter((c) => c.status === "accepted");
  const sent = connections.filter((c) => c.status === "pending" && c.sender_id === myId);

  const getPeer = (conn) =>
    conn.sender_id === myId
      ? { id: conn.receiver_id, name: conn.receiver_name, avatar: conn.receiver_avatar }
      : { id: conn.sender_id,   name: conn.sender_name,   avatar: conn.sender_avatar };

  // Helper to determine exact connection state with any member
  const getMemberConnState = useCallback(
    (member) => {
      if (!member) return { status: "none" };

      if (myId && (member.id === myId || member.public_id === myId)) {
        return { status: "self" };
      }

      // Check accepted connections (My Network)
      const acceptedConn = accepted.find((c) => {
        const peer = getPeer(c);
        return peer.id === member.id;
      });
      if (acceptedConn) {
        return { status: "accepted", connectionId: acceptedConn.id };
      }

      // Check sent pending connections
      const sentConn = sent.find((c) => {
        const peer = getPeer(c);
        return peer.id === member.id;
      });
      if (sentConn) {
        return { status: "pending", iAmSender: true, connectionId: sentConn.id };
      }

      // Check pending received requests
      const pendingReceivedConn = pending.find((c) => c.sender_id === member.id);
      if (pendingReceivedConn) {
        return {
          status: "pending",
          iAmSender: false,
          connectionId: pendingReceivedConn.id,
        };
      }

      // Fallback to backend-reported status
      if (member.connection_status && member.connection_status !== "none") {
        return {
          status: member.connection_status,
          connectionId: member.connection_id,
          iAmSender: Boolean(member.i_am_sender),
        };
      }

      return { status: "none" };
    },
    [myId, accepted, sent, pending]
  );

  const matchesSearch = (text) =>
    !search.trim() || (text && text.toLowerCase().includes(search.trim().toLowerCase()));

  // Filtered lists — Discover & Suggestions strictly shows people you can connect with (excluding already connected or pending)
  const filteredUserSuggestions = userSuggestions.filter((member) => {
    const connInfo = getMemberConnState(member);
    // Strictly exclude if already connected, pending, or self
    if (connInfo.status === "accepted" || connInfo.status === "pending" || connInfo.status === "self") {
      return false;
    }
    if (accepted.some((c) => getPeer(c).id === member.id)) return false;
    if (sent.some((c) => getPeer(c).id === member.id)) return false;
    if (pending.some((c) => c.sender_id === member.id)) return false;

    return (
      matchesSearch(member.name) ||
      matchesSearch(member.headline) ||
      matchesSearch(member.location) ||
      matchesSearch(member.email) ||
      (Array.isArray(member.skills) && member.skills.some((s) => matchesSearch(s)))
    );
  });

  const filteredCompanySuggestions = companySuggestions.filter((c) => {
    if (c.is_following) return false;
    if (following.some((f) => f.company_id === c.id || f.company === c.id)) return false;

    return (
      matchesSearch(c.name) ||
      matchesSearch(c.industry) ||
      matchesSearch(c.tagline) ||
      matchesSearch(c.location)
    );
  });

  const filteredAccepted = accepted.filter((c) => matchesSearch(getPeer(c).name));
  const filteredFollowing = following.filter((f) => matchesSearch(f.company_name));
  const filteredPending = pending.filter((c) => matchesSearch(c.sender_name));
  const filteredSent = sent.filter((c) => matchesSearch(getPeer(c).name));

  const cardStyle = {
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const pendingCount = pending.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-primary,#020617)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Navbar />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px 0" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            marginTop:"20px",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  margin: 0,
                  background: "linear-gradient(135deg, #10b981, #06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.02em",
                }}
              >
                Network Hub
              </h1>
              <span
                style={{
                  background: "rgba(16,185,129,0.12)",
                  color: "#10b981",
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(16,185,129,0.25)",
                }}
              >
                {accepted.length} Connected
              </span>
              <span
                style={{
                  background: "rgba(139,92,246,0.12)",
                  color: "#c084fc",
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(139,92,246,0.25)",
                }}
              >
                {following.length} Following
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: "6px 0 0" }}>
              Find and connect with professionals, follow innovative companies, and grow your network
            </p>
          </div>

          <button
            onClick={load}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              color: "rgba(255,255,255,0.75)",
              padding: "8px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "12px",
              fontWeight: 700,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "rgba(255,255,255,0.75)";
            }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* ── SEARCH & FIND BAR ────────────────────────────────────── */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: search ? "#10b981" : "rgba(255,255,255,0.4)",
                transition: "color 0.2s ease",
              }}
            />
            <input
              type="text"
              placeholder="Find people by name, skills, title or companies by name, industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "13px 44px 13px 46px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.04)",
                border: search ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                boxShadow: search ? "0 0 20px rgba(16,185,129,0.15)" : "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(16,185,129,0.5)";
                e.target.style.background = "rgba(255,255,255,0.06)";
              }}
              onBlur={(e) => {
                if (!search) {
                  e.target.style.borderColor = "rgba(255,255,255,0.08)";
                  e.target.style.background = "rgba(255,255,255,0.04)";
                }
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sub-filters for suggestions */}
          {activeTab === "discover" && (
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Filter by:</span>
              {[
                { id: "all",       label: `All (${filteredUserSuggestions.length + filteredCompanySuggestions.length})` },
                { id: "members",   label: `People to Connect (${filteredUserSuggestions.length})`, icon: Users },
                { id: "companies", label: `Companies to Follow (${filteredCompanySuggestions.length})`, icon: Building2 },
              ].map((f) => {
                const Icon = f.icon;
                const active = suggestionFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSuggestionFilter(f.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "1px solid",
                      background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.02)",
                      borderColor: active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.06)",
                      color: active ? "#fff" : "rgba(255,255,255,0.55)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {Icon && <Icon size={12} />}
                    {f.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── TABS BAR ────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "26px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const badge = tab.id === "pending" ? pendingCount : 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "9px 18px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontWeight: 700,
                  fontSize: "13px",
                  border: "1px solid",
                  background: active ? "rgba(16,185,129,0.14)" : "rgba(255,255,255,0.03)",
                  borderColor: active ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)",
                  color: active ? "#10b981" : "rgba(255,255,255,0.6)",
                  boxShadow: active ? "0 4px 14px rgba(16,185,129,0.15)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <Icon size={15} />
                {tab.label}
                {badge > 0 && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      borderRadius: "9999px",
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "1px 6px",
                      minWidth: "18px",
                      textAlign: "center",
                    }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT ─────────────────────────────────────────────── */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "14px",
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                style={{
                  ...cardStyle,
                  height: "140px",
                  background: "rgba(255,255,255,0.02)",
                  animation: "pulse 1.5s infinite ease-in-out",
                }}
              />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {/* ─────────────────────────────────────────────────────────────
                  TAB 1: DISCOVER & SUGGESTIONS (PEOPLE + COMPANIES)
              ────────────────────────────────────────────────────────────── */}
              {activeTab === "discover" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

                  {/* ── 1. SUGGESTED MEMBERS (PEOPLE TO CONNECT) ── */}
                  {(suggestionFilter === "all" || suggestionFilter === "members") && (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "16px",
                        }}
                      >
                        <div>
                          <h2
                            style={{
                              fontSize: "17px",
                              fontWeight: 800,
                              margin: 0,
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <Users size={18} color="#10b981" />
                            People You May Know
                          </h2>
                          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>
                            Expand your professional circle by connecting with members
                          </p>
                        </div>
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                          {filteredUserSuggestions.length} suggested
                        </span>
                      </div>

                      {filteredUserSuggestions.length === 0 ? (
                        <EmptyState
                          icon={<Users size={32} />}
                          text={
                            search
                              ? "No members match your search criteria."
                              : "No new member suggestions available right now."
                          }
                        />
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
                            gap: "16px",
                          }}
                        >
                          {filteredUserSuggestions.map((member) => {
                            const connInfo = getMemberConnState(member);

                            return (
                              <motion.div
                                key={member.id}
                                whileHover={{ y: -3, borderColor: "rgba(16,185,129,0.35)" }}
                                style={{
                                  background: "rgba(255,255,255,0.03)",
                                  backdropFilter: "blur(20px)",
                                  WebkitBackdropFilter: "blur(20px)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  borderRadius: "16px",
                                  padding: "18px",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  gap: "14px",
                                  position: "relative",
                                  overflow: "hidden",
                                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                                  transition: "all 0.25s ease",
                                }}
                              >
                                {/* Accent top gradient bar */}
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 0, left: 0, right: 0,
                                    height: "3px",
                                    background: "linear-gradient(90deg, #10b981, #06b6d4)",
                                  }}
                                />

                                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                  <Link
                                    to={`/profile/${member.public_id || member.id}`}
                                    style={{ textDecoration: "none" }}
                                  >
                                    <Avatar src={member.avatar} name={member.name} size={48} />
                                  </Link>

                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                      <Link
                                        to={`/profile/${member.public_id || member.id}`}
                                        style={{ textDecoration: "none", color: "inherit" }}
                                      >
                                        <div
                                          style={{
                                            fontWeight: 800,
                                            fontSize: "15px",
                                            color: "#fff",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                          }}
                                          onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
                                          onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
                                        >
                                          {member.name}
                                        </div>
                                      </Link>
                                    </div>

                                    {member.headline ? (
                                      <div
                                        style={{
                                          fontSize: "12px",
                                          color: "rgba(255,255,255,0.65)",
                                          marginTop: "3px",
                                          lineHeight: "1.35",
                                          display: "-webkit-box",
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: "vertical",
                                          overflow: "hidden",
                                        }}
                                      >
                                        {member.headline}
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                                        {member.email ? `@${member.email.split('@')[0]}` : "Member on Xanatz"}
                                      </div>
                                    )}

                                    {member.location && (
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "4px",
                                          fontSize: "11px",
                                          color: "rgba(255,255,255,0.4)",
                                          marginTop: "4px",
                                        }}
                                      >
                                        <MapPin size={11} color="#06b6d4" />
                                        <span>{member.location}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Skills preview */}
                                {Array.isArray(member.skills) && member.skills.length > 0 && (
                                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                                    {member.skills.slice(0, 3).map((s, idx) => (
                                      <span
                                        key={idx}
                                        style={{
                                          fontSize: "10px",
                                          fontWeight: 700,
                                          padding: "2px 8px",
                                          borderRadius: "6px",
                                          background: "rgba(16,185,129,0.08)",
                                          color: "#6ee7b7",
                                          border: "1px solid rgba(16,185,129,0.2)",
                                        }}
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Actions footer */}
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "8px",
                                    paddingTop: "12px",
                                    borderTop: "1px solid rgba(255,255,255,0.06)",
                                  }}
                                >
                                  <Link
                                    to={`/profile/${member.public_id || member.id}`}
                                    style={{
                                      color: "rgba(255,255,255,0.6)",
                                      textDecoration: "none",
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      padding: "6px 10px",
                                      borderRadius: "8px",
                                      background: "rgba(255,255,255,0.03)",
                                      border: "1px solid rgba(255,255,255,0.08)",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.color = "#fff";
                                      e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                                    }}
                                  >
                                    Profile <ExternalLink size={11} />
                                  </Link>

                                  <ConnectButton
                                    targetUserId={member.id}
                                    initialStatus={connInfo.status}
                                    connectionId={connInfo.connectionId}
                                    iAmSender={connInfo.iAmSender}
                                    size="sm"
                                    onStatusChange={() => load()}
                                  />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── 2. SUGGESTED COMPANIES (COMPANIES TO FOLLOW) ── */}
                  {(suggestionFilter === "all" || suggestionFilter === "companies") && (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "16px",
                        }}
                      >
                        <div>
                          <h2
                            style={{
                              fontSize: "17px",
                              fontWeight: 800,
                              margin: 0,
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <Building2 size={18} color="#8b5cf6" />
                            Companies to Follow
                          </h2>
                          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>
                            Stay updated with job openings, announcements, and RFP opportunities
                          </p>
                        </div>
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                          {filteredCompanySuggestions.length} suggested
                        </span>
                      </div>

                      {filteredCompanySuggestions.length === 0 ? (
                        <EmptyState
                          icon={<Building2 size={32} />}
                          text={
                            search
                              ? "No companies match your search criteria."
                              : "You are already following all suggested companies."
                          }
                        />
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
                            gap: "16px",
                          }}
                        >
                          {filteredCompanySuggestions.map((co) => (
                            <motion.div
                              key={co.id}
                              whileHover={{ y: -3, borderColor: "rgba(139,92,246,0.35)" }}
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "16px",
                                padding: "18px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                gap: "14px",
                                position: "relative",
                                overflow: "hidden",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                                transition: "all 0.25s ease",
                              }}
                            >
                              {/* Accent top purple gradient bar */}
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0, left: 0, right: 0,
                                  height: "3px",
                                  background: "linear-gradient(90deg, #8b5cf6, #6366f1)",
                                }}
                              />

                              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                <Link
                                  to={`/company/${co.public_id || co.id}`}
                                  style={{ textDecoration: "none" }}
                                >
                                  <Avatar src={co.logo_url} name={co.name} isCompany size={48} />
                                </Link>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <Link
                                    to={`/company/${co.public_id || co.id}`}
                                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                                  >
                                    <div
                                      style={{
                                        fontWeight: 800,
                                        fontSize: "15px",
                                        color: "#fff",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                                      onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
                                    >
                                      {co.name}
                                    </div>
                                  </Link>

                                  {co.tagline ? (
                                    <div
                                      style={{
                                        fontSize: "12px",
                                        color: "rgba(255,255,255,0.65)",
                                        marginTop: "3px",
                                        lineHeight: "1.35",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                      }}
                                    >
                                      {co.tagline}
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>
                                      Registered Company
                                    </div>
                                  )}

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      fontSize: "11px",
                                      color: "rgba(255,255,255,0.45)",
                                      marginTop: "6px",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {co.industry && (
                                      <span
                                        style={{
                                          padding: "2px 7px",
                                          borderRadius: "6px",
                                          background: "rgba(139,92,246,0.1)",
                                          color: "#c4b5fd",
                                          border: "1px solid rgba(139,92,246,0.2)",
                                          fontSize: "10px",
                                          fontWeight: 700,
                                          textTransform: "capitalize",
                                        }}
                                      >
                                        {co.industry}
                                      </span>
                                    )}
                                    {co.location && (
                                      <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                        <MapPin size={10} color="#60a5fa" /> {co.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Actions footer */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "8px",
                                  paddingTop: "12px",
                                  borderTop: "1px solid rgba(255,255,255,0.06)",
                                }}
                              >
                                <Link
                                  to={`/company/${co.public_id || co.id}`}
                                  style={{
                                    color: "rgba(255,255,255,0.6)",
                                    textDecoration: "none",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "6px 10px",
                                    borderRadius: "8px",
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#fff";
                                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                                  }}
                                >
                                  Company Profile <ExternalLink size={11} />
                                </Link>

                                <FollowButton
                                  companyId={co.id}
                                  initialFollowing={co.is_following}
                                  followId={co.follow_id}
                                  size="sm"
                                  onStatusChange={() => load()}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 2: MY NETWORK (ACCEPTED CONNECTIONS)
              ────────────────────────────────────────────────────────────── */}
              {activeTab === "accepted" && (
                <div>
                  {filteredAccepted.length === 0 ? (
                    <div>
                      <EmptyState
                        icon={<Users size={36} />}
                        text={
                          search
                            ? "No connections match your search."
                            : "You don't have any connections yet. Connect with members below!"
                        }
                      />

                      {/* Fallback suggestions inside empty network */}
                      {userSuggestions.length > 0 && (
                        <div style={{ marginTop: "32px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "16px",
                            }}
                          >
                            <h3
                              style={{
                                fontSize: "15px",
                                fontWeight: 800,
                                margin: 0,
                                color: "#10b981",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <Compass size={16} /> Suggested Members to Connect With
                            </h3>
                            <button
                              onClick={() => {
                                setActiveTab("discover");
                                setSuggestionFilter("members");
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#06b6d4",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              Explore all <ArrowRight size={13} />
                            </button>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                              gap: "12px",
                            }}
                          >
                            {filteredUserSuggestions.slice(0, 4).map((member) => {
                              const connInfo = getMemberConnState(member);
                              return (
                                <div key={member.id} style={cardStyle}>
                                  <Link
                                    to={`/profile/${member.public_id || member.id}`}
                                    style={{ textDecoration: "none" }}
                                  >
                                    <Avatar src={member.avatar} name={member.name} size={44} />
                                  </Link>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                      style={{
                                        fontWeight: 800,
                                        fontSize: "14px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {member.name}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "11px",
                                        color: "rgba(255,255,255,0.45)",
                                        marginTop: "2px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {member.headline || (member.email ? `@${member.email.split('@')[0]}` : "Suggested member")}
                                    </div>
                                  </div>
                                  <ConnectButton
                                    targetUserId={member.id}
                                    initialStatus={connInfo.status}
                                    connectionId={connInfo.connectionId}
                                    iAmSender={connInfo.iAmSender}
                                    size="sm"
                                    onStatusChange={() => load()}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      {filteredAccepted.map((conn) => {
                        const peer = getPeer(conn);
                        return (
                          <motion.div
                            key={conn.id}
                            style={cardStyle}
                            whileHover={{ scale: 1.01, borderColor: "rgba(16,185,129,0.3)" }}
                          >
                            <Link to={`/profile/${peer.id}`} style={{ textDecoration: "none" }}>
                              <Avatar src={peer.avatar} name={peer.name} />
                            </Link>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <Link
                                to={`/profile/${peer.id}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                              >
                                <div
                                  style={{
                                    fontWeight: 800,
                                    fontSize: "14px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {peer.name}
                                </div>
                              </Link>
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "#10b981",
                                  marginTop: "2px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontWeight: 600,
                                }}
                              >
                                <UserCheck size={12} /> Connected
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <Link to={`/profile/${peer.id}`}>
                                <button
                                  style={{
                                    background: "rgba(16,185,129,0.1)",
                                    border: "1px solid rgba(16,185,129,0.25)",
                                    color: "#10b981",
                                    borderRadius: "8px",
                                    padding: "6px 12px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                  }}
                                >
                                  Profile
                                </button>
                              </Link>
                              <button
                                onClick={() => handleRemove(conn)}
                                title="Remove connection"
                                style={{
                                  background: "rgba(239,68,68,0.08)",
                                  border: "1px solid rgba(239,68,68,0.18)",
                                  color: "#ef4444",
                                  borderRadius: "8px",
                                  padding: "6px 9px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <UserX size={13} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 3: FOLLOWING COMPANIES
              ────────────────────────────────────────────────────────────── */}
              {activeTab === "following" && (
                <div>
                  {filteredFollowing.length === 0 ? (
                    <div>
                      <EmptyState
                        icon={<Building2 size={36} />}
                        text={
                          search
                            ? "No companies match your search."
                            : "You are not following any companies yet."
                        }
                      />

                      {/* Fallback suggested companies */}
                      {companySuggestions.length > 0 && (
                        <div style={{ marginTop: "32px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "16px",
                            }}
                          >
                            <h3
                              style={{
                                fontSize: "15px",
                                fontWeight: 800,
                                margin: 0,
                                color: "#8b5cf6",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <Building2 size={16} /> Suggested Companies to Follow
                            </h3>
                            <button
                              onClick={() => {
                                setActiveTab("discover");
                                setSuggestionFilter("companies");
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#a78bfa",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              Explore all <ArrowRight size={13} />
                            </button>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                              gap: "12px",
                            }}
                          >
                            {companySuggestions.slice(0, 4).map((co) => (
                              <div key={co.id} style={cardStyle}>
                                <Link
                                  to={`/company/${co.public_id || co.id}`}
                                  style={{ textDecoration: "none" }}
                                >
                                  <Avatar src={co.logo_url} name={co.name} isCompany size={44} />
                                </Link>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontWeight: 800,
                                      fontSize: "14px",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {co.name}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "rgba(255,255,255,0.45)",
                                      marginTop: "2px",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {co.industry || "Company"}
                                  </div>
                                </div>
                                <FollowButton companyId={co.id} size="sm" onStatusChange={() => load()} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      {filteredFollowing.map((follow) => (
                        <motion.div
                          key={follow.id}
                          style={cardStyle}
                          whileHover={{ scale: 1.01, borderColor: "rgba(139,92,246,0.3)" }}
                        >
                          <Link
                            to={`/company/${follow.company}`}
                            style={{ textDecoration: "none" }}
                          >
                            <Avatar
                              src={follow.company_logo}
                              name={follow.company_name}
                              isCompany
                              size={44}
                            />
                          </Link>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Link
                              to={`/company/${follow.company}`}
                              style={{ textDecoration: "none", color: "inherit" }}
                            >
                              <div
                                style={{
                                  fontWeight: 800,
                                  fontSize: "14px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {follow.company_name}
                              </div>
                            </Link>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#a78bfa",
                                marginTop: "2px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontWeight: 600,
                              }}
                            >
                              <Bell size={11} /> Following
                            </div>
                          </div>

                          <FollowButton
                            companyId={follow.company}
                            size="sm"
                            onStatusChange={() => load()}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 4: PENDING REQUESTS RECEIVED
              ────────────────────────────────────────────────────────────── */}
              {activeTab === "pending" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {filteredPending.length === 0 ? (
                    <EmptyState
                      icon={<Clock size={36} />}
                      text="No pending connection requests received."
                    />
                  ) : (
                    filteredPending.map((conn) => (
                      <motion.div
                        key={conn.id}
                        style={{ ...cardStyle, justifyContent: "space-between" }}
                        whileHover={{ scale: 1.005 }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Link
                            to={`/profile/${conn.sender_id}`}
                            style={{ textDecoration: "none" }}
                          >
                            <Avatar src={conn.sender_avatar} name={conn.sender_name} />
                          </Link>
                          <div>
                            <Link
                              to={`/profile/${conn.sender_id}`}
                              style={{ textDecoration: "none", color: "inherit" }}
                            >
                              <div style={{ fontWeight: 800, fontSize: "14px" }}>
                                {conn.sender_name}
                              </div>
                            </Link>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "rgba(255,255,255,0.4)",
                                marginTop: "2px",
                              }}
                            >
                              Sent you a connection request
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                          <ConnectButton
                            targetUserId={conn.sender_id}
                            initialStatus="pending"
                            connectionId={conn.id}
                            iAmSender={false}
                            size="sm"
                            onStatusChange={() => {
                              setPending((prev) => prev.filter((p) => p.id !== conn.id));
                              load();
                            }}
                          />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 5: SENT REQUESTS
              ────────────────────────────────────────────────────────────── */}
              {activeTab === "sent" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {filteredSent.length === 0 ? (
                    <EmptyState
                      icon={<UserPlus size={36} />}
                      text={
                        search
                          ? "No sent requests match your search."
                          : "You have no outgoing connection requests pending."
                      }
                    />
                  ) : (
                    filteredSent.map((conn) => {
                      const peer = getPeer(conn);
                      return (
                        <motion.div key={conn.id} style={cardStyle} whileHover={{ scale: 1.01 }}>
                          <Link to={`/profile/${peer.id}`} style={{ textDecoration: "none" }}>
                            <Avatar src={peer.avatar} name={peer.name} />
                          </Link>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Link
                              to={`/profile/${peer.id}`}
                              style={{ textDecoration: "none", color: "inherit" }}
                            >
                              <div
                                style={{
                                  fontWeight: 800,
                                  fontSize: "14px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {peer.name}
                              </div>
                            </Link>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#fbbf24",
                                marginTop: "2px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontWeight: 600,
                              }}
                            >
                              <Clock size={11} /> Awaiting response
                            </div>
                          </div>

                          <ConnectButton
                            targetUserId={peer.id}
                            initialStatus="pending"
                            connectionId={conn.id}
                            iAmSender={true}
                            size="sm"
                            onStatusChange={() => load()}
                          />
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        )}

        <div style={{ height: "60px" }} />
      </div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div
      style={{
        gridColumn: "1/-1",
        textAlign: "center",
        padding: "50px 20px",
        color: "rgba(255,255,255,0.35)",
        background: "rgba(255,255,255,0.015)",
        borderRadius: "16px",
        border: "1px dashed rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ marginBottom: "12px", opacity: 0.5, display: "flex", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ fontSize: "14px", fontWeight: 500, maxWidth: "420px", margin: "0 auto" }}>
        {text}
      </div>
    </div>
  );
}
