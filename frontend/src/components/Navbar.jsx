import React, { useState, useEffect, useRef } from "react";
import { Image, Button } from "@chakra-ui/react";
import {
  Search,
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  HelpCircle,
  X,
  Clock,
  AlertCircle,
  Calendar,
  ChevronRight,
  ClipboardList,
  FileText,
  Sun,
  Moon,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import api, { backendUrl } from "../api";

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */

const NavItem = ({ icon: Icon, label, active, onClick, badgeCount }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: active ? "0.45rem 0.85rem" : "0.45rem 0.6rem",
          borderRadius: "9999px",
          border: "none",
          background: active ? "var(--color-card-border)" : "transparent",
          color: active ? "var(--color-text-primary)" : "var(--color-text-muted)",
          fontSize: "0.78rem",
          fontWeight: active ? 700 : 500,
          cursor: "pointer",
          transition: "all 0.25s ease",
          letterSpacing: active ? "0.02em" : "0",
        }}
      >
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
          <Icon size={18} strokeWidth={active ? 2.5 : 2} />
          {badgeCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                background: "#ef4444",
                color: "white",
                borderRadius: "9999px",
                fontSize: "8px",
                fontWeight: "bold",
                height: "14px",
                minWidth: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
                boxShadow: "0 0 0 1.5px var(--color-nav-bg, #0a0f1e)",
              }}
            >
              {badgeCount}
            </span>
          )}
        </div>
        <AnimatePresence>
          {active && (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              style={{ overflow: "hidden", whiteSpace: "nowrap" }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Sleek Premium Tooltip */}
      <AnimatePresence>
        {hovered && !active && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: "-38px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(15, 23, 42, 0.92)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--color-card-border)",
              color: "white",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "10px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
              zIndex: 1010,
              letterSpacing: "0.03em",
            }}
          >
            {label.toUpperCase()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuLink = ({ icon: Icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      width: "100%",
      padding: "0.6rem 0.75rem",
      borderRadius: "0.6rem",
      border: "none",
      background: "transparent",
      color: danger ? "#f87171" : "var(--color-text-secondary)",
      fontSize: "0.82rem",
      fontWeight: 500,
      cursor: "pointer",
      transition: "background 0.2s ease, color 0.2s ease",
      textAlign: "left",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "var(--color-card-border)";
      e.currentTarget.style.color = danger ? "#fca5a5" : "var(--color-text-primary)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = danger ? "#f87171" : "var(--color-text-secondary)";
    }}
  >
    <Icon size={17} strokeWidth={1.8} />
    {label}
  </button>
);

/* ─── main component ────────────────────────────────────────────────────────── */

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [user, setUser] = useState(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);

  /* scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* fetch user */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("me/");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user in navbar", err);
      }
    };
    fetchUser();
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(e.target)) {
        setIsMessagesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("notifications/");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get("messages/conversations/");
      setConversations(res.data);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("access")) {
      fetchNotifications();
      fetchConversations();
      const interval = setInterval(() => {
        fetchNotifications();
        fetchConversations();
      }, 12000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post("notifications/mark-all-read/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await api.post(`notifications/${notif.id}/mark-read/`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      }
      setIsNotificationsOpen(false);
      if (notif.target_url) {
        navigate(notif.target_url);
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      setIsNotificationsOpen(false);
      if (notif.target_url) {
        navigate(notif.target_url);
      }
    }
  };

  const handleMarkAsReadAndNavigateToChat = async (notif) => {
    try {
      if (!notif.is_read) {
        await api.post(`notifications/${notif.id}/mark-read/`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      }
      setIsNotificationsOpen(false);
      navigate("/messages", {
        state: {
          startChatWith: {
            id: notif.sender,
            email: notif.sender_email,
            name: notif.sender_name || notif.sender_email,
            profile_picture: notif.sender_profile_picture
          }
        }
      });
    } catch (err) {
      console.error("Failed to process notification chat click", err);
      setIsNotificationsOpen(false);
      navigate("/messages", {
        state: {
          startChatWith: {
            id: notif.sender,
            email: notif.sender_email,
            name: notif.sender_name || notif.sender_email,
            profile_picture: notif.sender_profile_picture
          }
        }
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${backendUrl}${path}`;
  };

  const toggleSearch = () => {
    setIsSearchExpanded((prev) => !prev);
    if (!isSearchExpanded) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingLeft: "clamp(1.25rem, 5vw, 5rem)",
        paddingRight: "clamp(1.25rem, 5vw, 5rem)",
        paddingTop: scrolled ? "0.6rem" : "1rem",
        paddingBottom: scrolled ? "calc(0.6rem + 3px)" : "calc(1rem + 3px)",
        backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        background: scrolled ? "var(--color-nav-bg)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--color-card-border)" : "none",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.5)" : "none",
        transition: "all 0.4s ease",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1400px",
          margin: "-5px auto",
        }}
      >
        {/* ── Logo ── */}
        <motion.span
          onClick={() => navigate("/dashboard")}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: "1.15rem",
            letterSpacing: "-0.04em",
            color: "var(--color-text-primary)",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          XANATZ
          <span
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            .
          </span>
        </motion.span>

        {/* ── Center Nav Items ── */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
          <NavItem
            icon={Home}
            label="Home"
            active={location.pathname === "/dashboard"}
            onClick={() => navigate("/dashboard")}
          />
          <NavItem
            icon={Users}
            label="Network"
            active={location.pathname === "/network"}
            onClick={() => navigate("/network")}
          />
          <NavItem
            icon={Briefcase}
            label="Jobs"
            active={location.pathname === "/jobs"}
            onClick={() => navigate("/jobs")}
          />
          <NavItem
            icon={FileText}
            label="RFPs"
            active={location.pathname === "/rfps"}
            onClick={() => navigate("/rfps")}
          />

          <NavItem
            icon={ClipboardList}
            label="Applications"
            active={location.pathname === "/my-applications"}
            onClick={() => navigate("/my-applications")}
          />
          
          {/* Chats / Messages Dropdown */}
          <div ref={messagesRef} style={{ position: "relative" }}>
            <NavItem
              icon={MessageSquare}
              label="Chats"
              active={isMessagesOpen}
              onClick={() => {
                setIsMessagesOpen(!isMessagesOpen);
                setIsNotificationsOpen(false);
                setIsProfileOpen(false);
              }}
              badgeCount={conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0)}
            />
            <AnimatePresence>
              {isMessagesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 320, damping: 26 }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 0.75rem)",
                    right: 0,
                    width: "320px",
                    zIndex: 2000,
                    borderRadius: "1rem",
                    overflow: "hidden",
                    background: "var(--color-dropdown-bg)",
                    backdropFilter: "blur(40px)",
                    border: "1px solid var(--color-card-border)",
                    boxShadow: "0 24px 48px -12px rgba(0,0,0,0.7), inset 0 1px 0 var(--color-glass)",
                    padding: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0.75rem 0.5rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-primary)" }}>Messages</span>
                    <button
                      onClick={() => {
                        setIsMessagesOpen(false);
                        navigate("/messages");
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--color-accent, #3b82f6)",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      View all
                    </button>
                  </div>
                  <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {conversations.length === 0 ? (
                      <div style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                        <MessageSquare size={24} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                        No messages yet
                      </div>
                    ) : (
                      conversations.slice(0, 4).map((conv) => (
                        <div
                          key={conv.id}
                          onClick={() => {
                            setIsMessagesOpen(false);
                            navigate("/messages");
                          }}
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            background: conv.unread_count > 0 ? "rgba(59,130,246,0.06)" : "transparent",
                            cursor: "pointer",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-card-border)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = conv.unread_count > 0 ? "rgba(59,130,246,0.06)" : "transparent"}
                        >
                          {conv.profile_picture ? (
                            <img
                              src={conv.profile_picture}
                              alt=""
                              style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "0.7rem",
                                flexShrink: 0,
                              }}
                            >
                              {conv.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{conv.name}</span>
                              {conv.unread_count > 0 && (
                                <span
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: "#ef4444",
                                    display: "inline-block",
                                  }}
                                />
                              )}
                            </div>
                            <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "var(--color-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {conv.last_message || "No messages yet"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Alerts / Notifications Dropdown */}
          <div ref={notificationsRef} style={{ position: "relative" }}>
            <NavItem
              icon={Bell}
              label="Alerts"
              active={isNotificationsOpen}
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsMessagesOpen(false);
                setIsProfileOpen(false);
              }}
              badgeCount={notifications.filter((n) => !n.is_read).length}
            />
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 320, damping: 26 }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 0.75rem)",
                    right: 0,
                    width: "320px",
                    zIndex: 2000,
                    borderRadius: "1rem",
                    overflow: "hidden",
                    background: "var(--color-dropdown-bg)",
                    backdropFilter: "blur(40px)",
                    border: "1px solid var(--color-card-border)",
                    boxShadow: "0 24px 48px -12px rgba(0,0,0,0.7), inset 0 1px 0 var(--color-glass)",
                    padding: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0.75rem 0.5rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-primary)" }}>Alerts</span>
                    {notifications.some((n) => !n.is_read) && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--color-accent, #3b82f6)",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                        <Bell size={24} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            cursor: "pointer",
                            background: notif.is_read ? "transparent" : "rgba(59,130,246,0.06)",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-card-border)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = notif.is_read ? "transparent" : "rgba(59,130,246,0.06)"}
                        >
                          <div style={{ position: "relative", top: "2px" }}>
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: notif.is_read ? "transparent" : "#ef4444",
                              }}
                            />
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
                            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                              <p style={{ margin: 0, fontSize: "0.75rem", color: notif.is_read ? "var(--color-text-secondary)" : "var(--color-text-primary)", lineHeight: "1.4" }}>
                                {notif.message}
                              </p>
                              <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", display: "block", marginTop: "4px" }}>
                                {new Date(notif.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {new Date(notif.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {notif.sender && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsReadAndNavigateToChat(notif);
                                }}
                                style={{
                                  background: "rgba(59, 130, 246, 0.1)",
                                  border: "none",
                                  borderRadius: "0.35rem",
                                  padding: "6px",
                                  color: "var(--color-accent, #3b82f6)",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.2s",
                                  flexShrink: 0,
                                }}
                                onMouseEnter={(el) => el.currentTarget.style.background = "rgba(59, 130, 246, 0.25)"}
                                onMouseLeave={(el) => el.currentTarget.style.background = "rgba(59, 130, 246, 0.1)"}
                                title="Chat with user"
                              >
                                <MessageSquare size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* ── Right: Search + Avatar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Expandable search */}
          <motion.div
            animate={{ width: isSearchExpanded ? "200px" : "34px" }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              borderRadius: "9999px",
              border: "1px solid var(--color-card-border)",
              background: "var(--color-glass)",
              height: "34px",
              flexShrink: 0,
            }}
          >
            <button
              onClick={toggleSearch}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                width: "32px",
                height: "32px",
                background: "transparent",
                border: "none",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                borderRadius: "9999px",
              }}
            >
              {isSearchExpanded ? <X size={16} /> : <Search size={16} />}
            </button>
            <AnimatePresence>
              {isSearchExpanded && (
                <motion.input
                  key="search-input"
                  ref={searchInputRef}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  placeholder="Search Xanatz…"
                  onBlur={() => setIsSearchExpanded(false)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "white",
                    fontSize: "0.78rem",
                    paddingRight: "0.75rem",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Avatar + dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <motion.button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "9999px",
                border: "1.5px solid transparent",
                background:
                  "linear-gradient(#0a0f1e, #0a0f1e) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6) border-box",
                cursor: "pointer",
                padding: 0,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {user?.profile?.profile_picture ? (
                <img
                  src={getImageUrl(user.profile.profile_picture)}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "9999px" }}
                />
              ) : (
                <User size={18} color="var(--color-text-primary)" />
              )}
            </motion.button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 320, damping: 26 }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 0.75rem)",
                    right: 0,
                    width: "290px",
                    zIndex: 2000,
                    borderRadius: "1rem",
                    overflow: "hidden",
                    background: "var(--color-dropdown-bg)",
                    backdropFilter: "blur(40px)",
                    border: "1px solid var(--color-card-border)",
                    boxShadow: "0 24px 48px -12px rgba(0,0,0,0.7), inset 0 1px 0 var(--color-glass)",
                  }}
                >
                  {/* User info block */}
                  <div
                    style={{
                      padding: "1.25rem",
                      position: "relative",
                      overflow: "hidden",
                      borderBottom: "1px solid var(--color-card-border)",
                    }}
                  >
                    {/* decorative orb */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-30px",
                        right: "-30px",
                        width: "100px",
                        height: "100px",
                        background: "#8b5cf6",
                        filter: "blur(55px)",
                        opacity: 0.25,
                        borderRadius: "9999px",
                        pointerEvents: "none",
                      }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative", zIndex: 1 }}>
                      {/* Avatar */}
                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "9999px",
                          border: "1.5px solid transparent",
                          background:
                            "linear-gradient(var(--color-surface), var(--color-surface)) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6) border-box",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {user?.profile?.profile_picture ? (
                          <img
                            src={getImageUrl(user.profile.profile_picture)}
                            alt="avatar"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <User size={24} color="var(--color-text-primary)" />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            color: "var(--color-text-primary)",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p
                          style={{
                            margin: "0.3rem 0 0",
                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {user?.profile?.headline || "Professional at Xanatz"}
                        </p>
                      </div>
                    </div>

                    {/* View Profile button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/profile");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        marginTop: "1rem",
                        padding: "0.55rem 1rem",
                        borderRadius: "9999px",
                        border: "1px solid var(--color-card-border)",
                        background: "var(--color-glass)",
                        color: "var(--color-text-primary)",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontFamily: "'Outfit', sans-serif",
                        position: "relative",
                        zIndex: 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--color-card-border)";
                        e.currentTarget.style.borderColor = "var(--color-card-border)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--color-glass)";
                        e.currentTarget.style.borderColor = "var(--color-card-border)";
                      }}
                    >
                      View Profile
                    </motion.button>
                  </div>

                  {/* Menu links */}
                  <div style={{ padding: "0.5rem" }}>
                    {user?.is_staff && (
                      <MenuLink
                        icon={LayoutDashboard}
                        label="Admin Dashboard"
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/admin");
                        }}
                      />
                    )}
                    <MenuLink
                      icon={ClipboardList}
                      label="My Applications"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/my-applications");
                      }}
                    />
                    <MenuLink
                      icon={theme === "light" ? Moon : Sun}
                      label={theme === "light" ? "Dark Mode" : "Light Mode"}
                      onClick={() => {
                        setTheme(theme === "light" ? "dark" : "light");
                      }}
                    />
                    <MenuLink icon={HelpCircle} label="Help & Support" />
                    <div style={{ height: "1px", background: "var(--color-card-border)", margin: "0.4rem 0.5rem" }} />
                    <MenuLink icon={LogOut} label="Sign Out" danger onClick={handleLogout} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
