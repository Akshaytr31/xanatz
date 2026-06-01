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
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api, { backendUrl } from "../api";

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */

const NavItem = ({ icon: Icon, label, active, onClick }) => {
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
          background: active ? "rgba(255,255,255,0.10)" : "transparent",
          color: active ? "#fff" : "rgba(255,255,255,0.45)",
          fontSize: "0.78rem",
          fontWeight: active ? 700 : 500,
          cursor: "pointer",
          transition: "all 0.25s ease",
          letterSpacing: active ? "0.02em" : "0",
        }}
      >
        <Icon size={15} strokeWidth={active ? 2.5 : 2} />
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
              border: "1px solid rgba(255, 255, 255, 0.08)",
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
      color: danger ? "#f87171" : "rgba(255,255,255,0.75)",
      fontSize: "0.82rem",
      fontWeight: 500,
      cursor: "pointer",
      transition: "background 0.2s ease, color 0.2s ease",
      textAlign: "left",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
      e.currentTarget.style.color = danger ? "#fca5a5" : "#fff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = danger ? "#f87171" : "rgba(255,255,255,0.75)";
    }}
  >
    <Icon size={15} strokeWidth={1.8} />
    {label}
  </button>
);

/* ─── main component ────────────────────────────────────────────────────────── */

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        paddingBottom: scrolled ? "0.6rem" : "1rem",
        backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        background: scrolled ? "rgba(2,6,23,0.85)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
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
          margin: "0 auto",
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
            color: "white",
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
          <NavItem
            icon={MessageSquare}
            label="Chats"
            active={location.pathname === "/messages"}
            onClick={() => navigate("/messages")}
          />
          <NavItem
            icon={Bell}
            label="Alerts"
            active={location.pathname === "/notifications"}
            onClick={() => navigate("/notifications")}
          />
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
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
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
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                borderRadius: "9999px",
              }}
            >
              {isSearchExpanded ? <X size={13} /> : <Search size={13} />}
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
                <User size={16} color="rgba(255,255,255,0.8)" />
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
                    background: "rgba(8, 12, 28, 0.96)",
                    backdropFilter: "blur(40px)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 24px 48px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  {/* User info block */}
                  <div
                    style={{
                      padding: "1.25rem",
                      position: "relative",
                      overflow: "hidden",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
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
                            "linear-gradient(#0d1224, #0d1224) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6) border-box",
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
                          <User size={24} color="rgba(255,255,255,0.8)" />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            color: "white",
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
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.85)",
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
                        e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
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
                    <MenuLink icon={Settings} label="Preferences" />
                    <MenuLink icon={HelpCircle} label="Help & Support" />
                    <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "0.4rem 0.5rem" }} />
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
