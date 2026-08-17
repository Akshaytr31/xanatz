import React, { useState, useEffect, useRef } from "react";
import {
  Box, Container, VStack, Flex, Text, Spinner, Button,
  HStack, Badge,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import VisualHeader from "../components/Profile/VisualHeader";
import CareerTimeline from "../components/Profile/CareerTimeline";
import EducationSection from "../components/Profile/EducationSection";
import SkillsSection from "../components/Profile/SkillsSection";
import CompanySection from "../components/company/CompanySection";
import CreateCompanySection from "../components/company/CreateCompanySection";
import api from "../api";
import { useNavigate } from "react-router-dom";
import {
  Building2, ChevronDown, LayoutDashboard, Briefcase,
  Zap, TrendingUp, CheckCircle2, User, Star, AlertCircle, UserCheck
} from "lucide-react";
import CompleteProfileModal, { getProfileCompletionDetails } from "../components/Profile/CompleteProfileModal";

const MotionBox   = motion.create(Box);
const MotionFlex  = motion.create(Flex);
const MotionVStack = motion.create(VStack);

/* ─── Animated entrance variants ─────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 22 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
});

const fadeRight = (delay = 0) => ({
  initial:    { opacity: 0, x: 22 },
  animate:    { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
});

/* ─── Sidebar quick-stat tile ─────────────────────────────── */
const QuickStat = ({ label, value, color = "#3b82f6" }) => (
  <div style={{
    flex: "1 1 0",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12, padding: "12px 14px",
    display: "flex", flexDirection: "column", gap: 4,
    minWidth: 0,
  }}>
    <span style={{ fontSize: 18, fontWeight: 800, color: color, lineHeight: 1 }}>{value}</span>
    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 600, letterSpacing: "0.8px" }}>
      {label.toUpperCase()}
    </span>
  </div>
);

/* ─── Sidebar section wrapper ─────────────────────────────── */
const SideCard = ({ children, accent = "#3b82f6", style = {} }) => (
  <div style={{
    background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderTop: `2px solid ${accent}`,
    borderRadius: 18,
    backdropFilter: "blur(20px)",
    overflow: "visible",
    ...style,
  }}>
    <div style={{ padding: "18px 18px 20px" }}>
      {children}
    </div>
  </div>
);

/* ─── Progress bar ────────────────────────────────────────── */
const ProfileStrengthBar = ({ pct = 0 }) => {
  const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#3b82f6";
  const label = pct >= 80 ? "Excellent" : pct >= 50 ? "Good" : "Getting started";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px" }}>
          PROFILE STRENGTH
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>
          {label}
        </span>
      </div>
      {/* Track */}
      <div style={{
        height: 6, borderRadius: 99,
        background: "rgba(255,255,255,0.06)",
        position: "relative", overflow: "hidden",
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(pct, 2)}%` }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          style={{
            height: "100%", borderRadius: 99,
            background: `linear-gradient(90deg, ${color}, ${color}99)`,
            boxShadow: `0 0 12px ${color}55`,
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: "white", letterSpacing: "-1px" }}>
          {pct}
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>%</span>
        </span>
        {pct < 100 && (
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "1px",
            color: color, background: `${color}15`,
            border: `1px solid ${color}30`,
            borderRadius: 8, padding: "3px 9px",
            display: "flex", alignItems: "center",
          }}>
            BOOST SCORE
          </span>
        )}
      </div>
    </div>
  );
};

/* ─── Freelancer availability pills control ──────────────────── */
const AvailabilityPills = ({ currentAvailability, onChange, disabled }) => {
  const options = [
    { key: "available", label: "Available", color: "#10b981", activeBg: "rgba(16,185,129,0.2)", activeBorder: "rgba(16,185,129,0.4)" },
    { key: "busy", label: "Busy", color: "#f59e0b", activeBg: "rgba(245,158,11,0.2)", activeBorder: "rgba(245,158,11,0.4)" },
    { key: "unavailable", label: "Unavailable", color: "#ef4444", activeBg: "rgba(239,68,68,0.2)", activeBorder: "rgba(239,68,68,0.4)" },
  ];

  const current = currentAvailability || "available";

  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "4px 0 8px 0" }}>
      {options.map((opt) => {
        const isActive = current === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(opt.key); }}
            disabled={disabled}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 9px", borderRadius: 8, fontSize: 10, fontWeight: isActive ? 800 : 600,
              cursor: disabled ? "wait" : "pointer",
              border: isActive ? `1px solid ${opt.activeBorder}` : "1px solid rgba(255,255,255,0.08)",
              background: isActive ? opt.activeBg : "rgba(255,255,255,0.02)",
              color: isActive ? "white" : "rgba(255,255,255,0.4)",
              transition: "all 0.2s",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: opt.color, boxShadow: isActive ? `0 0 6px ${opt.color}` : "none" }} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

/* ─── Freelancer card content ─────────────────────────────── */
const FreelancerCard = ({ user, becomingFreelancer, onBecomeFreelancer, navigate, onAvailabilityChange, updatingAvailability }) => {
  const isFreelancer = user?.profile?.is_freelancer;
  return (
    <SideCard accent="#8b5cf6">
      {/* Purple glow background */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
        background: "radial-gradient(ellipse at 10% 10%, rgba(139,92,246,0.06) 0%, transparent 60%)",
      }} />

      <div style={{ position: "relative" }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Briefcase size={14} color="#a78bfa" />
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(167,139,250,0.85)", letterSpacing: "1.5px" }}>
              {isFreelancer ? "FREELANCER PROFILE" : "BECOME A FREELANCER"}
            </span>
          </div>
          {isFreelancer && (
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: "1px",
              background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.35)",
              color: "#c4b5fd", borderRadius: 6, padding: "3px 8px",
            }}>
              ACTIVE
            </span>
          )}
        </div>

        <p style={{
          fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 12,
        }}>
          {isFreelancer
            ? "Your freelancer profile is live! Set your availability status below to reflect on the Freelancers list:"
            : "Set your rates, showcase your projects, and share your profile as a high-conversion landing page."}
        </p>

        {isFreelancer && (
          <AvailabilityPills
            currentAvailability={user?.profile?.freelancer_availability}
            onChange={onAvailabilityChange}
            disabled={updatingAvailability}
          />
        )}

        <button
          onClick={isFreelancer ? () => navigate("/freelancer-dashboard") : onBecomeFreelancer}
          disabled={becomingFreelancer}
          style={{
            width: "100%", padding: "10px 16px", borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            border: "none", color: "white", cursor: "pointer",
            fontSize: 11, fontWeight: 800, letterSpacing: "1px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
            transition: "all 0.2s", opacity: becomingFreelancer ? 0.7 : 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(139,92,246,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,92,246,0.35)"; }}
        >
          {isFreelancer ? <LayoutDashboard size={13} /> : <Briefcase size={13} />}
          {becomingFreelancer ? "ACTIVATING…" : isFreelancer ? "FREELANCER DASHBOARD" : "GET STARTED"}
        </button>
      </div>
    </SideCard>
  );
};

/* ─── Company switcher card ───────────────────────────────── */
const CompanySwitchCard = ({ user, navigate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const accessible = (user?.companies || []).filter(c => c.is_owner || Boolean(c.access_role));
  if (!accessible.length) return null;

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const single = accessible.length === 1;

  return (
    <SideCard accent="#3b82f6">
      <div style={{
        position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
        background: "radial-gradient(ellipse at 10% 10%, rgba(59,130,246,0.05) 0%, transparent 60%)",
      }} />
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Building2 size={14} color="#60a5fa" />
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(147,197,253,0.85)", letterSpacing: "1.5px" }}>
            COMPANY ACCOUNT
          </span>
        </div>

        <div ref={ref} style={{ position: "relative" }}>
          <button
            onClick={single ? () => navigate(`/company/${accessible[0].id}`) : () => setOpen(v => !v)}
            style={{
              width: "100%", padding: "10px 16px", borderRadius: 10,
              background: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
              border: "none", color: "white", cursor: "pointer",
              fontSize: 11, fontWeight: 800, letterSpacing: "1px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(59,130,246,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(59,130,246,0.3)"; }}
          >
            <Building2 size={13} />
            SWITCH TO COMPANY
            {!single && (
              <ChevronDown size={12} style={{
                marginLeft: "auto", transition: "transform 0.2s",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }} />
            )}
          </button>

          <AnimatePresence>
            {open && !single && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                  background: "rgba(8,12,28,0.97)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, overflow: "hidden",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                  backdropFilter: "blur(20px)",
                  zIndex: 50,
                }}
              >
                {accessible.map((company, i) => (
                  <button
                    key={company.id}
                    onClick={() => { setOpen(false); navigate(`/company/${company.id}`); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "11px 14px", background: "transparent",
                      border: "none", borderBottom: i < accessible.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      cursor: "pointer", transition: "background 0.15s",
                      textAlign: "left",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: company.is_owner ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)",
                      border: `1px solid ${company.is_owner ? "rgba(59,130,246,0.2)" : "rgba(239,68,68,0.2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800,
                      color: company.is_owner ? "#60a5fa" : "#f87171",
                    }}>
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {company.name}
                      </div>
                      {!company.is_owner && (
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#f87171", letterSpacing: "0.8px", marginTop: 1 }}>
                          {(company.access_role || "MEMBER").replace("_", " ").toUpperCase()}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SideCard>
  );
};

/* ─── Main Page ───────────────────────────────────────────── */
const Profile = () => {
  const [user, setUser]                       = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [companyRefreshTrigger, setCompanyRefreshTrigger] = useState(0);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [becomingFreelancer, setBecomingFreelancer]       = useState(false);
  const navigate = useNavigate();

  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const handleAvailabilityChange = async (newAvailability) => {
    setUpdatingAvailability(true);
    try {
      const res = await api.patch("me/", { freelancer_availability: newAvailability });
      setUser(res.data);
    } catch (err) {
      console.error("Failed to update availability status", err);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleBecomeFreelancer = async () => {
    setBecomingFreelancer(true);
    try {
      await api.patch("me/", { is_freelancer: true });
      navigate("/freelancer-dashboard");
    } catch (err) {
      console.error("Failed to activate freelancer profile", err);
    } finally {
      setBecomingFreelancer(false);
    }
  };

  const handleCompanyChange = () => {
    fetchProfile();
    setCompanyRefreshTrigger(p => p + 1);
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("me/");
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  /* ── Loading screen ── */
  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
        <AnimatePresence>
          <MotionVStack
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            gap={5}
          >
            {/* Animated rings */}
            <div style={{ position: "relative", width: 72, height: 72 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: "2px solid rgba(59,130,246,0.15)",
              }} />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute", inset: 4, borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTopColor: "#3b82f6",
                  borderRightColor: "rgba(59,130,246,0.3)",
                }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute", inset: 12, borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTopColor: "#8b5cf6",
                }}
              />
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <User size={20} color="#3b82f6" />
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "white", fontSize: 13, fontWeight: 700, letterSpacing: "2px" }}>
                LOADING PROFILE
              </div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 4 }}>
                Preparing your workspace…
              </div>
            </div>
          </MotionVStack>
        </AnimatePresence>
      </Flex>
    );
  }

  /* ── Derived stats ── */
  const experiences = user?.profile?.experiences || [];
  const education   = user?.profile?.education   || [];
  const skills      = user?.profile?.skills      || [];
  const pct         = getProfileCompletionDetails(user).pct;

  const totalYearsExp = (() => {
    if (!experiences || experiences.length === 0) return "0 Yrs";
    let totalMonths = 0;
    experiences.forEach((exp) => {
      if (!exp.start_date) return;
      const start = new Date(exp.start_date);
      const end = exp.current || !exp.end_date ? new Date() : new Date(exp.end_date);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (diffMonths > 0) totalMonths += diffMonths;
    });
    const years = (totalMonths / 12).toFixed(1);
    const numYears = parseFloat(years);
    return numYears > 0 ? `${numYears % 1 === 0 ? numYears.toFixed(0) : numYears} Yrs` : `${totalMonths} Mos`;
  })();

  const totalCompaniesCount = new Set(
    experiences.map((e) => e.company?.trim().toLowerCase()).filter(Boolean)
  ).size || experiences.length;

  return (
    <Box
      minH="100vh"
      bg="var(--color-primary)"
      position="relative"
      overflow="hidden"
      pb="60px"
    >
      {/* ── Ambient background blobs ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.55, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: "-20%", left: "-15%",
            width: "60vw", height: "60vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.45, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{
            position: "absolute", bottom: "-15%", right: "-10%",
            width: "50vw", height: "50vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          }}
        />
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      <Navbar handleLogout={handleLogout} />

      <Container maxW="1180px" mt={{ base: "80px", md: "100px" }} px={{ base: 4, md: 6 }} position="relative" zIndex={1}>

        {/* ═══ ROW 1: VisualHeader — FULL WIDTH ═══════════════ */}
        {user ? (
          <MotionBox {...fadeUp(0)} mb={4}>
            <VisualHeader user={user} onUpdate={fetchProfile} />
          </MotionBox>
        ) : (
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: 32, textAlign: "center",
            color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 20,
          }}>
            Unable to load profile details.
          </div>
        )}

        {/* ═══ ROW 2: Action Bar — Responsive Grid ════════════════ */}
        {user && (
          <MotionBox {...fadeUp(0.08)} mb={5}>
            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }}
              background="linear-gradient(135deg, rgba(15,23,42,0.9), rgba(8,12,28,0.95))"
              border="1px solid rgba(255,255,255,0.07)"
              borderRadius="20px"
              backdropFilter="blur(28px)"
              overflow="hidden"
              boxShadow="0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)"
            >

              {/* ── Cell 1: Activity Stats ─────────────────── */}
              <Box
                p={{ base: 4, md: 5 }}
                borderRight={{ base: "none", sm: "1px solid rgba(255,255,255,0.06)", lg: "1px solid rgba(255,255,255,0.06)" }}
                borderBottom={{ base: "1px solid rgba(255,255,255,0.06)", lg: "none" }}
                display="flex" flexDirection="column" gap={3.5}
                position="relative" overflow="hidden"
              >
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 0%, rgba(59,130,246,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "2px", color: "rgba(255,255,255,0.22)" }}>
                  ACTIVITY
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Years Exp.",  value: totalYearsExp,        color: "#3b82f6", bar: Math.min((parseFloat(totalYearsExp) || 1) * 12, 100) },
                    { label: "Companies",   value: totalCompaniesCount,  color: "#8b5cf6", bar: Math.min(totalCompaniesCount * 20, 100) },
                    { label: "Skills",      value: skills.length,        color: "#f59e0b", bar: Math.min(skills.length * 8, 100) },
                  ].map(({ label, value, color, bar }) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{label}</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color, letterSpacing: "-0.3px" }}>{value}</span>
                      </div>
                      <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.06)" }}>
                        <div style={{ height: "100%", borderRadius: 99, width: `${bar}%`, background: color, opacity: 0.7, minWidth: (typeof value === "number" ? value > 0 : true) ? 6 : 0 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Box>

              {/* ── Cell 2: Profile Strength ────────────────── */}
              {(() => {
                const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#3b82f6";
                const trackColor = pct >= 80 ? "rgba(16,185,129,0.12)" : pct >= 50 ? "rgba(245,158,11,0.12)" : "rgba(59,130,246,0.12)";
                const label = pct >= 80 ? "Excellent" : pct >= 50 ? "Good" : "Getting started";
                // SVG ring math for 130x130 viewBox
                const r = 52, cx = 65, cy = 65;
                const circumference = 2 * Math.PI * r;          // ~326.72
                const dashOffset = circumference * (1 - pct / 100);
                const ringId = `ring-grad-${pct}`;
                return (
                  <div style={{
                    padding: "20px",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", flexDirection: "column", gap: 12,
                    position: "relative", overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}>
                    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, ${color}12 0%, transparent 70%)`, pointerEvents: "none" }} />
                    
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "2px", color: "rgba(255,255,255,0.25)", alignSelf: "center", marginBottom: 2 }}>
                      PROFILE STRENGTH
                    </span>

                    {/* SVG Ring - enlarged & centered */}
                    <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
                        <defs>
                          <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={color} />
                            <stop offset="100%" stopColor={`${color}99`} />
                          </linearGradient>
                        </defs>
                        {/* Track */}
                        <circle
                          cx={cx} cy={cy} r={r}
                          fill="none"
                          stroke={trackColor}
                          strokeWidth="9"
                        />
                        {/* Progress arc */}
                        <circle
                          cx={cx} cy={cy} r={r}
                          fill="none"
                          stroke={`url(#${ringId})`}
                          strokeWidth="9"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          style={{
                            filter: `drop-shadow(0 0 8px ${color}88)`,
                            transition: "stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1) 0.3s",
                          }}
                        />
                      </svg>
                      {/* Center text */}
                      <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 2,
                      }}>
                        <span style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1, letterSpacing: "-1px" }}>
                          {pct}<span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>%</span>
                        </span>
                        <span style={{ fontSize: 7, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.8px" }}>
                          {label.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500, textAlign: "center", marginTop: 2 }}>
                      {100 - pct > 0 ? `${100 - pct}% left to complete` : "Profile 100% Complete! 🎉"}
                    </span>

                    <Button
                      size="xs"
                      mt={1}
                      px={3}
                      py={1.5}
                      borderRadius="full"
                      style={{
                        background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)",
                        color: "white",
                        boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)",
                      }}
                      fontWeight="bold"
                      fontSize="10px"
                      onClick={() => setIsCompletionModalOpen(true)}
                      _hover={{ transform: "scale(1.05)", boxShadow: "0 6px 20px rgba(124, 58, 237, 0.6)" }}
                    >
                      <CheckCircle2 size={11} style={{ marginRight: 4 }} />
                      {pct < 100 ? "Complete Profile" : "Edit Profile Details"}
                    </Button>
                  </div>
                );
              })()}


              {/* ── Cell 3: Freelancer ──────────────────────── */}
              <div style={{
                padding: "22px 20px",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                display: "flex", flexDirection: "column", gap: 14,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 0%, rgba(139,92,246,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "2px", color: "rgba(255,255,255,0.22)" }}>
                  FREELANCER
                </span>
                {user?.profile?.is_freelancer ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: user?.profile?.freelancer_availability === "busy" ? "#f59e0b" : user?.profile?.freelancer_availability === "unavailable" ? "#ef4444" : "#10b981",
                        boxShadow: user?.profile?.freelancer_availability === "busy" ? "0 0 8px #f59e0b" : user?.profile?.freelancer_availability === "unavailable" ? "0 0 8px #ef4444" : "0 0 8px #10b981",
                        flexShrink: 0, animation: "pulse-dot 2s infinite"
                      }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#a7f3d0" }}>Profile Active</span>
                    </div>

                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>
                      AVAILABILITY STATUS:
                    </span>
                    <AvailabilityPills
                      currentAvailability={user?.profile?.freelancer_availability}
                      onChange={handleAvailabilityChange}
                      disabled={updatingAvailability}
                    />

                    <button
                      onClick={() => navigate("/freelancer-dashboard")}
                      style={{
                        padding: "9px 0", borderRadius: 10, marginTop: 2,
                        background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(167,139,250,0.15))",
                        border: "1px solid rgba(139,92,246,0.35)",
                        color: "#c4b5fd", cursor: "pointer",
                        fontSize: 10, fontWeight: 800, letterSpacing: "1px",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(167,139,250,0.25))"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(139,92,246,0.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(167,139,250,0.15))"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <LayoutDashboard size={12} /> OPEN DASHBOARD
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.55 }}>
                      Set your rates, showcase projects and get discovered by clients.
                    </span>
                    <button
                      onClick={handleBecomeFreelancer}
                      disabled={becomingFreelancer}
                      style={{
                        padding: "9px 0", borderRadius: 10, marginTop: 2,
                        background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                        border: "none", color: "white", cursor: "pointer",
                        fontSize: 10, fontWeight: 800, letterSpacing: "1px",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
                        transition: "all 0.2s", opacity: becomingFreelancer ? 0.7 : 1,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(124,58,237,0.5)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,0.4)"; }}
                    >
                      <Briefcase size={12} />
                      {becomingFreelancer ? "ACTIVATING…" : "GET STARTED FREE"}
                    </button>
                  </div>
                )}
              </div>

              {/* ── Cell 4: Company ─────────────────────────── */}
              <div style={{
                padding: "22px 20px",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                display: "flex", flexDirection: "column", gap: 14,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 0%, rgba(59,130,246,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "2px", color: "rgba(255,255,255,0.22)" }}>
                  COMPANY
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Accessible companies */}
                  {(user?.companies || []).filter(c => c.is_owner || Boolean(c.access_role)).length > 0 ? (
                    <>
                      {(user?.companies || []).filter(c => c.is_owner || Boolean(c.access_role)).map(company => (
                        <button
                          key={company.id}
                          onClick={() => navigate(`/company/${company.id}`)}
                          style={{
                            padding: "8px 12px", borderRadius: 9,
                            background: "rgba(59,130,246,0.08)",
                            border: "1px solid rgba(59,130,246,0.18)",
                            color: "#93c5fd", cursor: "pointer",
                            fontSize: 11, fontWeight: 600,
                            display: "flex", alignItems: "center", gap: 7,
                            transition: "all 0.2s", textAlign: "left",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.16)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.35)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(59,130,246,0.08)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.18)"; }}
                        >
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(59,130,246,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#60a5fa", flexShrink: 0 }}>
                            {company.name[0].toUpperCase()}
                          </div>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{company.name}</span>
                        </button>
                      ))}
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8 }}>
                        <CreateCompanySection onCreated={handleCompanyChange} width="100%" />
                      </div>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.55 }}>
                        Create or join a company to manage jobs, RFPs and team members.
                      </span>
                      <CreateCompanySection onCreated={handleCompanyChange} width="100%" />
                    </>
                  )}
                </div>
              </div>

              {/* ── Cell 5: Profile Tips ────────────────────── */}
              <div style={{
                padding: "22px 20px",
                display: "flex", flexDirection: "column", gap: 14,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 0%, rgba(16,185,129,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "2px", color: "rgba(255,255,255,0.22)" }}>
                  PROFILE TIPS
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { done: (user?.profile?.headline || "").length > 0, tip: "Add a headline"         },
                    { done: experiences.length > 0,                      tip: "Add work experience"    },
                    { done: skills.length >= 5,                          tip: "Add 5+ skills"          },
                    { done: (user?.profile?.about || "").length > 40,    tip: "Write about section"    },
                    { done: user?.profile?.is_freelancer,                tip: "Enable freelancer"      },
                  ].map(({ done, tip }) => (
                    <div key={tip} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        background: done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                        border: done ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.3s",
                      }}>
                        {done
                          ? <CheckCircle2 size={10} color="#10b981" />
                          : <div style={{ width: 5, height: 5, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
                        }
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: done ? 400 : 500,
                        color: done ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)",
                        textDecoration: done ? "line-through" : "none",
                        transition: "all 0.3s",
                      }}>
                        {tip}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </Box>
            <style>{`
              @keyframes pulse-dot {
                0%,100% { opacity:1; box-shadow:0 0 8px #10b981; }
                50%      { opacity:0.65; box-shadow:0 0 4px #10b981; }
              }
            `}</style>
          </MotionBox>
        )}


        {/* ═══ ROW 3: Career Timeline — FULL WIDTH ═══════════════ */}

        {user && (
          <MotionBox {...fadeUp(0.1)} mb={5}>
            <CareerTimeline user={user} onUpdate={fetchProfile} />
          </MotionBox>
        )}

        {/* ═══ ROW 3: Education + Skills — 2-column grid ══════════ */}
        {user && (
          <Box
            display="grid"
            gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={5}
            mb={5}
          >
            <MotionBox {...fadeUp(0.14)}>
              <EducationSection user={user} onUpdate={fetchProfile} />
            </MotionBox>
            <MotionBox {...fadeUp(0.18)}>
              <SkillsSection user={user} onUpdate={fetchProfile} />
            </MotionBox>
          </Box>
        )}

        {/* ═══ ROW 4: Company Section — FULL WIDTH ════════════════ */}
        {user && (
          <MotionBox {...fadeUp(0.22)}>
            <CompanySection
              user={user}
              refreshTrigger={companyRefreshTrigger}
              onCompanyChange={handleCompanyChange}
            />
          </MotionBox>
        )}

      </Container>

      <CompleteProfileModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        user={user}
        onProfileUpdated={fetchProfile}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>
    </Box>
  );
};

export default Profile;
