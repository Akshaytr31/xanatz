import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { ArrowRight, Globe, MapPin, Users, Calendar, Link2, AtSign, Briefcase, ExternalLink, Share2, Check, Mail, ArrowUpRight, Star } from "lucide-react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";

const INDUSTRY_LABELS = {
  technology: "Technology", finance: "Finance", healthcare: "Healthcare",
  education: "Education", retail: "Retail & E-commerce", manufacturing: "Manufacturing",
  media: "Media & Entertainment", real_estate: "Real Estate", consulting: "Consulting",
  logistics: "Logistics & Supply Chain", hospitality: "Hospitality & Tourism", energy: "Energy & Utilities", other: "Other",
};

const SIZE_LABELS = {
  "1-10": "1–10 employees", "11-50": "11–50 employees", "51-200": "51–200 employees",
  "201-500": "201–500 employees", "501-1000": "501–1000 employees", "1001+": "1001+ employees",
};

const PublicCompanyProfile = () => {
  const { publicId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reviewTab, setReviewTab] = useState("employee");

  const token = localStorage.getItem("access");
  const isAuthenticated = token && token !== "null" && token !== "undefined";

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const response = await api.get(`public-company/${publicId}/`);
        setCompany(response.data);
      } catch (err) {
        setError("Company profile not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyProfile();
  }, [publicId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accentColor = "#CD2426"; // Xanatz brand accent red

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "var(--color-primary)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ position: "relative", width: "3.5rem", height: "3.5rem" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.05)" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#3b82f6", animation: "spin 1s linear infinite" }} />
          </div>
          <p style={{ fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.3em", color: "#4b5563" }}>Loading Profile</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "var(--color-primary)", color: "white", padding: "1.5rem" }}>
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            marginBottom: "1rem",
            fontSize: "clamp(5rem, 20vw, 12rem)",
            color: "var(--color-glass)",
          }}
        >
          404
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1.125rem", marginBottom: "2rem", fontWeight: 300 }}>{error}</p>
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "1rem",
            fontWeight: "bold",
            color: "white",
            textDecoration: "none",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            boxShadow: "0 8px 24px rgba(59,130,246,0.3)",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          Return Home <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const hasSocials = company.linkedin_url || company.twitter_url || company.website;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-primary text-white overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "var(--color-primary)", minHeight: "100vh" }}
    >
      {/* Styles for media queries and keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (min-width: 640px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 768px) {
          .about-main-grid { grid-template-columns: 200px 1fr !important; gap: 3rem !important; }
          .about-details-grid { grid-template-columns: 2fr 1fr !important; gap: 2.5rem !important; }
          .jobs-grid, .rfps-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 640px) {
          .team-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 768px) {
          .team-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .team-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        .text-glow {
          text-shadow: 0 0 40px rgba(255,255,255,0.15);
        }
        .card-hover:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          transform: translateY(-4px);
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6) !important;
        }
      `}</style>

      {/* Premium animated background */}
      <div className="bg-mesh">
        <div
          className="bg-blob"
          style={{ top: "-15%", left: "-10%", width: "600px", height: "600px" }}
        />
        <div
          className="bg-blob"
          style={{
            bottom: "-15%",
            right: "-10%",
            animationDelay: "-5s",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
            width: "700px",
            height: "700px",
          }}
        />
        <div
          className="bg-blob"
          style={{
            top: "40%",
            left: "40%",
            animationDelay: "-10s",
            background: "radial-gradient(circle, rgba(205, 36, 38, 0.06) 0%, transparent 70%)",
            width: "400px",
            height: "400px",
          }}
        />
      </div>

      {/* Scroll progress bar */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          transformOrigin: "left",
          zIndex: 100,
          scaleX,
          background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #CD2426)",
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 60,
          paddingLeft: "clamp(1.5rem, 5vw, 5rem)",
          paddingRight: "clamp(1.5rem, 5vw, 5rem)",
          paddingTop: scrolled ? "0.75rem" : "1.25rem",
          paddingBottom: scrolled ? "0.75rem" : "1.25rem",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
          background: scrolled ? "var(--color-nav-bg)" : "transparent",
          borderBottom: scrolled ? "1px solid var(--color-glass-border)" : "none",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.5)" : "none",
          transition: "all 0.4s ease",
        }}
      >
        <div className="pub-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "1.15rem", letterSpacing: "-0.04em", color: "var(--color-text-primary)" }}>
              XANATZ
              <span style={{ background: `linear-gradient(135deg, #3b82f6, ${accentColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>.</span>
            </span>
          </Link>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-card-hover-bg)";
                e.currentTarget.style.borderColor = "var(--color-card-hover-border)";
                if (!copied) e.currentTarget.style.color = "var(--color-text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-glass)";
                e.currentTarget.style.borderColor = "var(--color-glass-border)";
                if (!copied) e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                padding: "0.5rem 0.85rem",
                borderRadius: "9999px",
                border: "1px solid var(--color-glass-border)",
                background: "var(--color-glass)",
                fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: copied ? "#4ade80" : "var(--color-text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span key="copied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Check size={11} /> Copied
                  </motion.span>
                ) : (
                  <motion.span key="share" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Share2 size={11} /> Share
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {company.website && (
              <motion.a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.55rem 1rem",
                  borderRadius: "9999px",
                  background: `linear-gradient(135deg, #3b82f6, ${accentColor})`,
                  boxShadow: `0 0 18px rgba(59,130,246,0.35)`,
                  fontSize: "0.75rem", fontWeight: 700, color: "white",
                  textDecoration: "none",
                }}
              >
                Visit Site <ArrowUpRight size={13} />
              </motion.a>
            )}
          </div>
        </div>
      </motion.header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pub-section-hero">
          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "800px",
              height: "280px",
              pointerEvents: "none",
              opacity: 0.14,
              background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(205,36,38,0.8), transparent)",
              filter: "blur(50px)",
            }}
          />

          <div className="pub-inner" style={{ marginTop: "2rem", position: "relative", zIndex: 10 }}>
            {/* Custom styles for Hero Redesign */}
            <style>{`
              .hero-card-container {
                position: relative;
                width: 100%;
                background: transparent;
                border: none;
                display: grid;
                grid-template-columns: 1fr;
                gap: 2.5rem;
                align-items: center;
              }
              @media (min-width: 1024px) {
                .hero-card-container {
                  grid-template-columns: 1.25fr 0.75fr;
                  gap: 4rem;
                }
              }
              .hero-logo-wrapper {
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
              }
              .hero-logo-glow-ring {
                position: absolute;
                width: 250px;
                height: 250px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(205, 36, 38, 0.18) 0%, transparent 70%);
                filter: blur(20px);
                pointer-events: none;
              }
              .hero-logo-box {
                position: relative;
                width: 9.5rem;
                height: 9.5rem;
                border-radius: 2rem;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
                box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6);
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .hero-logo-box:hover {
                transform: scale(1.05) rotate(1deg);
                border-color: rgba(255, 255, 255, 0.15);
              }
              .hero-tagline-quote {
                font-size: 1rem;
                color: #9ca3af;
                font-weight: 300;
                line-height: 1.6;
                padding-left: 1.25rem;
                border-left: 2px solid ${accentColor};
                margin-top: 1.25rem;
                margin-bottom: 2rem;
                font-style: italic;
                text-align: left;
              }
              .hero-stats-row {
                display: grid;
                grid-template-columns: 1fr;
                gap: 0.85rem;
                width: 100%;
                margin-top: 2rem;
              }
              @media (min-width: 640px) {
                .hero-stats-row {
                  grid-template-columns: repeat(3, 1fr);
                }
              }
              .hero-stat-card {
                padding: 1rem 1.25rem;
                border-radius: 1.25rem;
                border: 1px solid rgba(255, 255, 255, 0.04);
                background: rgba(255, 255, 255, 0.01);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.85rem;
              }
              .hero-stat-card:hover {
                background: rgba(255, 255, 255, 0.03);
                border-color: rgba(255, 255, 255, 0.08);
                transform: translateY(-2px);
              }
              .hero-stat-info {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
              }
            `}</style>

            <motion.div
              style={{ y: heroY, opacity: heroOpacity }}
              className="hero-card-container"
            >
              {/* Left Column: Info, Badges, Name, Tagline, Stats */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
                {/* Badges row */}
                <motion.div
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.25rem" }}
                >
                  {company.industry && (
                    <span style={{ padding: "0.35rem 0.8rem", borderRadius: "9999px", fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#d1d5db" }}>
                      {INDUSTRY_LABELS[company.industry] || company.industry}
                    </span>
                  )}
                  {company.location && (
                    <span style={{ padding: "0.35rem 0.8rem", borderRadius: "9999px", fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#d1d5db", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                      <MapPin size={10} style={{ color: "#3b82f6" }} /> {company.location}
                    </span>
                  )}
                </motion.div>

                {/* Company Name */}
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-glow"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(2rem, 5vw, 3.75rem)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                    color: "white",
                    marginBottom: "0.5rem",
                  }}
                >
                  {company.name}
                </motion.h1>

                {/* Tagline */}
                {company.tagline && (
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="hero-tagline-quote"
                  >
                    "{company.tagline}"
                  </motion.p>
                )}

                {/* Stats Grid */}
                <motion.div
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="hero-stats-row"
                >
                  {company.company_size && (
                    <div className="hero-stat-card">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", height: "2.25rem", borderRadius: "0.75rem", background: "rgba(96, 165, 250, 0.1)" }}>
                        <Users size={16} style={{ color: "#60a5fa" }} />
                      </div>
                      <div className="hero-stat-info">
                        <span style={{ fontSize: "0.55rem", color: "#6b7280", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Size</span>
                        <span style={{ fontSize: "0.8rem", fontWeight: 900, color: "white", marginTop: "0.1rem" }}>{SIZE_LABELS[company.company_size] || company.company_size}</span>
                      </div>
                    </div>
                  )}
                  {company.founded_year && (
                    <div className="hero-stat-card">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", height: "2.25rem", borderRadius: "0.75rem", background: "rgba(167, 139, 250, 0.1)" }}>
                        <Calendar size={16} style={{ color: "#a78bfa" }} />
                      </div>
                      <div className="hero-stat-info">
                        <span style={{ fontSize: "0.55rem", color: "#6b7280", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Founded</span>
                        <span style={{ fontSize: "0.8rem", fontWeight: 900, color: "white", marginTop: "0.1rem" }}>{company.founded_year}</span>
                      </div>
                    </div>
                  )}
                  <div className="hero-stat-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", height: "2.25rem", borderRadius: "0.75rem", background: `rgba(205, 36, 38, 0.1)` }}>
                      <Briefcase size={16} style={{ color: accentColor }} />
                    </div>
                    <div className="hero-stat-info">
                      <span style={{ fontSize: "0.55rem", color: "#6b7280", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Openings</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 900, color: "white", marginTop: "0.1rem" }}>{company.jobs?.length || 0} Jobs</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Logo Container */}
              <div className="hero-logo-wrapper">
                <div className="hero-logo-glow-ring" />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                  className="hero-logo-box"
                >
                  {company.logo_url ? (
                    <img src={company.logo_url} alt={company.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "4rem", fontWeight: 900, color: accentColor, fontFamily: "'Outfit', sans-serif" }}>
                      {company.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        {company.description && (
          <section className="pub-section" style={{ backgroundColor: "rgba(15,23,42,0.4)" }}>
            <div className="pub-inner">
              {/* Divider */}
              <div style={{ height: "1px", width: "100%", marginBottom: "3.5rem", background: "linear-gradient(90deg, transparent, var(--color-card-border), transparent)" }} />

              <div className="about-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", alignItems: "start" }}>
                {/* Left Header */}
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                >
                  <p style={{
                    fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em",
                    background: `linear-gradient(90deg, #3b82f6, ${accentColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    marginBottom: "0.75rem",
                  }}>Company Profile</p>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif", fontWeight: 900,
                    fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1.1, letterSpacing: "-0.04em",
                    color: "white", marginBottom: "1.5rem",
                  }}>
                    About<br />Us
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, #3b82f6, ${accentColor})`, boxShadow: `0 0 10px rgba(205,36,38,0.5)` }} />
                    <div style={{ height: "1px", flex: 1, background: `linear-gradient(90deg, rgba(205,36,38,0.5), transparent)` }} />
                  </div>
                </motion.div>

                {/* Right Content */}
                <div className="about-details-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                  {/* Bio Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  >
                    <div style={{
                      borderRadius: "1.25rem", padding: "2rem", position: "relative", overflow: "hidden",
                      background: "var(--color-glass)", border: "1px solid var(--color-card-border)",
                      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 20px 50px -15px rgba(0,0,0,0.5)",
                    }}>
                      <div style={{ position: "absolute", top: 0, right: 0, width: "150px", height: "150px", pointerEvents: "none", opacity: 0.2, background: `radial-gradient(circle, ${accentColor}, transparent 70%)`, filter: "blur(25px)" }} />
                      <div style={{ position: "relative", zIndex: 10 }}>
                        <p style={{
                          fontFamily: "'Inter', sans-serif", fontWeight: 300,
                          fontSize: "1rem", lineHeight: 1.8,
                          color: "#d1d5db", wordBreak: "break-word", overflowWrap: "break-word",
                          whiteSpace: "pre-line"
                        }}>
                          {company.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Social / Info links */}
                  {hasSocials && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.2 }}
                      style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
                    >
                      <h4 style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "#6b7280", marginBottom: "0.25rem" }}>Resources</h4>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem",
                            borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)",
                            color: "#d1d5db", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500,
                            transition: "all 0.2s"
                          }}
                          className="card-hover"
                        >
                          <Globe size={14} style={{ color: "#3b82f6" }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                          <ExternalLink size={11} style={{ color: "#4b5563" }} />
                        </a>
                      )}
                      {company.linkedin_url && (
                        <a
                          href={company.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem",
                            borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)",
                            color: "#d1d5db", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500,
                            transition: "all 0.2s"
                          }}
                          className="card-hover"
                        >
                          <Link2 size={14} style={{ color: "#60a5fa" }} />
                          <span style={{ flex: 1 }}>LinkedIn Profile</span>
                          <ExternalLink size={11} style={{ color: "#4b5563" }} />
                        </a>
                      )}
                      {company.twitter_url && (
                        <a
                          href={company.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem",
                            borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)",
                            color: "#d1d5db", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500,
                            transition: "all 0.2s"
                          }}
                          className="card-hover"
                        >
                          <AtSign size={14} style={{ color: "#38bdf8" }} />
                          <span style={{ flex: 1 }}>Twitter / X</span>
                          <ExternalLink size={11} style={{ color: "#4b5563" }} />
                        </a>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Meet the Team Section */}
        {company.members_details && company.members_details.length > 0 && (
          <section className="pub-section">
            <div className="pub-inner">
              {/* Divider */}
              <div style={{ height: "1px", width: "100%", marginBottom: "3.5rem", background: "linear-gradient(90deg, transparent, var(--color-card-border), transparent)" }} />

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem" }}>
                <div style={{ width: "3px", height: "1.25rem", borderRadius: "9999px", backgroundColor: "#8b5cf6" }} />
                <h2 style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", color: "#6b7280" }}>Meet the Team</h2>
              </div>

              <div className="team-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
                {company.members_details.map((member) => (
                  <Link
                    key={member.id}
                    to={`/p/${member.public_id}`}
                    style={{
                      display: "block", padding: "1.25rem", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.05)",
                      background: "rgba(255,255,255,0.02)", textDecoration: "none", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                    className="card-hover"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      {/* Photo */}
                      <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#1e293b", flexShrink: 0 }}>
                        {member.profile_picture ? (
                          <img src={member.profile_picture} alt={member.first_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.125rem", color: "#a78bfa", background: "rgba(139,92,246,0.1)" }}>
                            {member.first_name ? member.first_name.charAt(0).toUpperCase() : "M"}
                          </div>
                        )}
                      </div>
                      {/* Name / Title */}
                      <div style={{ overflow: "hidden" }}>
                        <h4 style={{ fontWeight: "bold", color: "white", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {member.first_name || ""} {member.last_name || ""}
                        </h4>
                        <p style={{ fontSize: "0.55rem", color: "#c084fc", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {member.position || "Team Member"}
                        </p>
                      </div>
                    </div>
                    {member.headline && (
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "1rem", lineHeight: 1.5, fontWeight: 300, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {member.headline}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Job Openings Section */}
        {company.jobs && company.jobs.length > 0 && (
          <section className="pub-section" style={{ backgroundColor: "rgba(15,23,42,0.2)" }}>
            <div className="pub-inner">
              {/* Divider */}
              <div style={{ height: "1px", width: "100%", marginBottom: "3.5rem", background: "linear-gradient(90deg, transparent, var(--color-card-border), transparent)" }} />

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem" }}>
                <div style={{ width: "3px", height: "1.25rem", borderRadius: "9999px", backgroundColor: accentColor }} />
                <h2 style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", color: "#6b7280" }}>Active Job Openings</h2>
              </div>

              <div className="jobs-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
                {company.jobs.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      padding: "1.5rem", borderRadius: "1.5rem", border: "1px solid rgba(255,255,255,0.05)",
                      background: "rgba(15,23,42,0.6)", display: "flex", flexDirection: "column", justifyContent: "between",
                      transition: "border-color 0.2s"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1rem" }}>
                        <h3 style={{ fontWeight: "bold", fontSize: "1.125rem", color: "white", marginBottom: "0.5rem" }}>{job.title}</h3>
                        <span style={{ padding: "0.15rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.55rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(205,36,38,0.1)", color: accentColor, border: "1px solid rgba(205,36,38,0.2)" }}>
                          {job.job_type ? job.job_type.replace("_", " ") : "Full-time"}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 300, marginBottom: "1rem", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {job.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        {job.location && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#6b7280" }}>
                            <MapPin size={11} /> <span>{job.location}</span>
                          </div>
                        )}
                        {job.salary_range && (
                          <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#4ade80" }}>
                            {job.salary_range}
                          </div>
                        )}
                      </div>
                      
                      <Link
                        to={isAuthenticated ? `/jobs/${job.id}/apply` : "/login"}
                        state={isAuthenticated ? undefined : { from: { pathname: `/jobs/${job.id}/apply` } }}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.5rem 1rem",
                          borderRadius: "0.75rem", fontSize: "0.75rem", fontWeight: "bold", color: "white",
                          textDecoration: "none", background: `linear-gradient(135deg, #3b82f6, ${accentColor})`,
                          transition: "transform 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      >
                        Apply <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Active RFPs Section */}
        {company.rfps && company.rfps.length > 0 && (
          <section className="pub-section">
            <div className="pub-inner">
              {/* Divider */}
              <div style={{ height: "1px", width: "100%", marginBottom: "3.5rem", background: "linear-gradient(90deg, transparent, var(--color-card-border), transparent)" }} />

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem" }}>
                <div style={{ width: "3px", height: "1.25rem", borderRadius: "9999px", backgroundColor: "#8b5cf6" }} />
                <h2 style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", color: "#6b7280" }}>Public RFPs</h2>
              </div>

              <div className="rfps-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
                {company.rfps.map((rfp) => (
                  <div
                    key={rfp.id}
                    style={{
                      padding: "1.5rem", borderRadius: "1.5rem", border: "1px solid rgba(255,255,255,0.05)",
                      background: "rgba(15,23,42,0.6)", display: "flex", flexDirection: "column", justifyContent: "between",
                      transition: "border-color 0.2s"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1rem" }}>
                        <h3 style={{ fontWeight: "bold", fontSize: "1.125rem", color: "white", marginBottom: "0.5rem" }}>{rfp.title}</h3>
                        {rfp.budget && (
                          <span style={{ padding: "0.15rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.55rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
                            Budget: {rfp.budget}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 300, marginBottom: "1rem", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {rfp.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifySpaceBetween: "true", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        {rfp.category && (
                          <span style={{ padding: "0.15rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.55rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(255,255,255,0.05)", color: "#6b7280" }}>
                            {rfp.category}
                          </span>
                        )}
                        {rfp.deadline && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#6b7280" }}>
                            <Calendar size={11} /> <span>Due: {new Date(rfp.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <Link
                        to={isAuthenticated ? `/rfps` : "/login"}
                        state={isAuthenticated ? undefined : { from: { pathname: "/rfps" } }}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.5rem 1rem",
                          borderRadius: "0.75rem", fontSize: "0.75rem", fontWeight: "bold", color: "white",
                          textDecoration: "none", background: "#8b5cf6",
                          transition: "transform 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      >
                        Submit Proposal <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Contact Section */}
        <section className="pub-section" style={{ backgroundColor: "rgba(2,6,23,0.6)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="pub-inner" style={{ textAlign: "center", maxWidth: "48rem", margin: "0 auto", padding: "2.5rem 0" }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "white", marginBottom: "1rem" }}>
              Interested in Working with Us?
            </h2>
            <p style={{ color: "#9ca3af", fontWeight: 300, fontSize: "1rem", marginBottom: "2rem", maxWidth: "32rem", margin: "0 auto 2rem auto" }}>
              Get in touch to discuss potential partnerships, RFP submissions, or general inquiries.
            </p>
            <div style={{ display: "flex", flexDirection: "column", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
              {/* Force horizontal alignment on screen sizes wider than mobile */}
              <style>{`
                @media (min-width: 640px) {
                  .cta-buttons { flex-direction: row !important; }
                }
              `}</style>
              <div className="cta-buttons" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", justifyContent: "center" }}>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem 2rem",
                      borderRadius: "1.25rem", fontWeight: "bold", color: "white", border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.05)", textDecoration: "none", fontSize: "0.875rem", transition: "transform 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    <Globe size={15} /> Visit Website
                  </a>
                )}
                {company.members_details && company.members_details.length > 0 && (
                  <a
                    href={`mailto:${company.members_details[0].email || ""}`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem 2rem",
                      borderRadius: "1.25rem", fontWeight: "bold", color: "white", textDecoration: "none", fontSize: "0.875rem",
                      background: `linear-gradient(135deg, #3b82f6, ${accentColor})`,
                      boxShadow: `0 8px 24px rgba(205,36,38,0.25)`,
                      transition: "transform 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    <Mail size={15} /> Email Primary Contact
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* Ratings & Reviews Section */}
        <section className="pub-section" style={{ backgroundColor: "rgba(15,23,42,0.3)" }}>
          <div className="pub-inner">
            {/* Tab selection */}
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem" }}>
              <button
                onClick={() => setReviewTab("employee")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0 0.5rem 0.75rem 0.5rem",
                  color: reviewTab === "employee" ? "white" : "#6b7280",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s"
                }}
              >
                Employee Reviews
                <span style={{ padding: "0.15rem 0.4rem", borderRadius: "0.25rem", fontSize: "0.6rem", fontWeight: 900, background: reviewTab === "employee" ? `${accentColor}20` : "rgba(255,255,255,0.05)", color: reviewTab === "employee" ? accentColor : "#6b7280", marginLeft: "0.5rem" }}>
                  {company.employee_reviews_count || 0}
                </span>
                {reviewTab === "employee" && (
                  <span style={{ position: "absolute", bottom: "-1px", left: 0, right: 0, height: "2px", backgroundColor: accentColor }} />
                )}
              </button>
              <button
                onClick={() => setReviewTab("partner")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0 0.5rem 0.75rem 0.5rem",
                  color: reviewTab === "partner" ? "white" : "#6b7280",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s"
                }}
              >
                Client & Partner Reviews
                <span style={{ padding: "0.15rem 0.4rem", borderRadius: "0.25rem", fontSize: "0.6rem", fontWeight: 900, background: reviewTab === "partner" ? `${accentColor}20` : "rgba(255,255,255,0.05)", color: reviewTab === "partner" ? accentColor : "#6b7280", marginLeft: "0.5rem" }}>
                  {company.partner_reviews_count || 0}
                </span>
                {reviewTab === "partner" && (
                  <span style={{ position: "absolute", bottom: "-1px", left: 0, right: 0, height: "2px", backgroundColor: accentColor }} />
                )}
              </button>
            </div>

            {/* Active Reviews Data */}
            {(() => {
              const activeReviews = reviewTab === "employee" ? (company.employee_reviews || []) : (company.partner_reviews || []);
              const activeCount = reviewTab === "employee" ? (company.employee_reviews_count || 0) : (company.partner_reviews_count || 0);
              const activeAvg = reviewTab === "employee" ? (company.employee_average_rating || 0.0) : (company.partner_average_rating || 0.0);
              const noReviewsMsg = reviewTab === "employee" 
                ? "No employee reviews have been submitted for this company yet." 
                : "No partner or client reviews have been submitted for this company yet.";

              if (activeCount === 0) {
                return (
                  <div style={{ textAlign: "center", padding: "3rem 1.5rem", borderRadius: "1.5rem", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(15,23,42,0.4)" }}>
                    <Star size={36} color="#4b5563" style={{ margin: "0 auto 1rem auto", opacity: 0.5 }} />
                    <p style={{ color: "#9ca3af", fontSize: "0.875rem", fontWeight: 400 }}>{noReviewsMsg}</p>
                  </div>
                );
              }

              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                  {/* Summary stat widget */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2rem", padding: "2rem", borderRadius: "1.5rem", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(15,23,42,0.4)" }}>
                    <div style={{ textAlign: "center", minWidth: "120px" }}>
                      <div style={{ fontSize: "3rem", fontWeight: 900, color: "white", lineHeight: 1 }}>{activeAvg}</div>
                      <div style={{ display: "flex", justifyContent: "center", gap: "0.15rem", margin: "0.5rem 0" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            style={{
                              fill: star <= Math.round(activeAvg) ? "#F59E0B" : "none",
                              stroke: star <= Math.round(activeAvg) ? "#F59E0B" : "#4b5563",
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800 }}>Average Rating</div>
                    </div>

                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        {[5, 4, 3, 2, 1].map((ratingVal) => {
                          const count = activeReviews.filter(r => r.rating === ratingVal).length;
                          const pct = activeCount > 0 ? (count / activeCount) * 100 : 0;
                          return (
                            <div key={ratingVal} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.75rem" }}>
                              <span style={{ color: "#9ca3af", width: "12px", fontWeight: "bold" }}>{ratingVal}</span>
                              <div style={{ flex: 1, height: "4px", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${pct}%`, borderRadius: "9999px", backgroundColor: "#F59E0B" }} />
                              </div>
                              <span style={{ color: "#6b7280", width: "15px", textAlign: "right" }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
                    {activeReviews.map((review) => (
                      <div
                        key={review.id}
                        style={{
                          padding: "1.5rem", borderRadius: "1.5rem", border: "1px solid rgba(255,255,255,0.05)",
                          background: "rgba(15,23,42,0.2)", display: "flex", flexDirection: "column", gap: "1rem"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{
                              width: "2.25rem", height: "2.25rem", borderRadius: "9999px",
                              backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
                            }}>
                              {review.reviewer_profile_picture ? (
                                <img src={review.reviewer_profile_picture} alt={review.reviewer_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <span style={{ fontSize: "0.875rem", fontWeight: "bold", color: "white" }}>
                                  {review.reviewer_name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize: "0.875rem", fontWeight: "bold", color: "white" }}>{review.reviewer_name}</div>
                              <div style={{ fontSize: "0.65rem", color: "#6b7280" }}>
                                {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "0.1rem" }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                style={{
                                  fill: star <= review.rating ? "#F59E0B" : "none",
                                  stroke: star <= review.rating ? "#F59E0B" : "#4b5563",
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <p style={{ fontSize: "0.875rem", color: "#d1d5db", fontWeight: 300, lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>
                          {review.review_text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="pub-section" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", backgroundColor: "black", padding: "2rem 0" }}>
        <div className="pub-inner" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          {/* Style for flex footer query */}
          <style>{`
            @media (min-width: 640px) {
              .footer-inner { flex-direction: row !important; }
            }
          `}</style>
          <div className="footer-inner" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", gap: "1rem", width: "100%" }}>
            <p style={{ fontSize: "0.75rem", color: "#4b5563" }}>© {new Date().getFullYear()} {company.name}. Powered by Xanatz.</p>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <button onClick={handleShare} style={{ background: "none", border: "none", color: "#4b5563", fontSize: "0.75rem", cursor: "pointer", padding: 0 }} onMouseEnter={(e) => e.currentTarget.style.color = "white"} onMouseLeave={(e) => e.currentTarget.style.color = "#4b5563"}>
                Share Profile
              </button>
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: "#4b5563", fontSize: "0.75rem", textDecoration: "none" }} onMouseEnter={(e) => e.currentTarget.style.color = "white"} onMouseLeave={(e) => e.currentTarget.style.color = "#4b5563"}>
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicCompanyProfile;
