import React from "react";
import { MapPin, Globe, ArrowUpRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { backendUrl } from "../../api";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
};

const PublicHero = ({ profile, first_name, last_name, fullName, heroY, heroOpacity }) => {
  return (
    <section className="pub-section-hero">
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "700px", height: "350px", pointerEvents: "none", opacity: 0.18,
        background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.7), transparent)",
        filter: "blur(40px)",
      }} />

      <div className="pub-inner" style={{ position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem", alignItems: "center" }}>

          {/* ── On large screens: split into 2 columns ── */}
          <style>{`
            @media (min-width: 900px) {
              .hero-grid { grid-template-columns: 1fr 340px !important; }
            }
          `}</style>

          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem", alignItems: "center" }}>

            {/* Text */}
            <motion.div
              style={{ y: heroY, opacity: heroOpacity }}
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {/* Status */}
              <motion.div variants={fadeUp} style={{ marginBottom: "1.5rem" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "0.6rem",
                  padding: "0.4rem 1rem", borderRadius: "9999px",
                  background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                  fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4ade80",
                }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80", flexShrink: 0 }} />
                  Open to Opportunities
                </span>
              </motion.div>

              {/* Name */}
              <motion.h1 variants={fadeUp} style={{
                fontFamily: "'Outfit', sans-serif", fontWeight: 900,
                fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
                lineHeight: 0.92, letterSpacing: "-0.04em",
                color: "white", marginBottom: "1.25rem",
              }}>
                {first_name}
                <br />
                <span style={{ background: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {last_name}
                </span>
              </motion.h1>

              {/* Headline */}
              <motion.p variants={fadeUp} style={{
                fontFamily: "'Inter', sans-serif", fontWeight: 300,
                fontSize: "clamp(0.9rem, 2vw, 1.15rem)", lineHeight: 1.65,
                color: "#9ca3af", maxWidth: "480px", marginBottom: "2rem",
              }}>
                {profile?.headline || "Digital craftsman building premium web experiences."}
              </motion.p>

              {/* Meta chips */}
              <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", marginBottom: "3rem" }}>
                {profile?.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", flexShrink: 0 }}>
                      <MapPin size={14} color="#60a5fa" />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "#4b5563", marginBottom: "2px" }}>Location</p>
                      <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "white" }}>{profile.location}</p>
                    </div>
                  </div>
                )}
                {profile?.website && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", flexShrink: 0 }}>
                      <Globe size={14} color="#a78bfa" />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "#4b5563", marginBottom: "2px" }}>Website</p>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "0.82rem", fontWeight: 600, color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "3px" }}>
                        Visit <ArrowUpRight size={11} />
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Scroll hint */}
              <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#374151" }}>
                <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <ChevronDown size={15} />
                </motion.div>
                <span style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em" }}>Scroll to explore</span>
              </motion.div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <div style={{ position: "relative", width: "100%", maxWidth: "260px" }}>
                {/* Glow */}
                <div style={{
                  position: "absolute", inset: "-1rem",
                  borderRadius: "1.5rem", opacity: 0.4, pointerEvents: "none",
                  background: "radial-gradient(circle, rgba(59,130,246,0.35), rgba(139,92,246,0.2), transparent 70%)",
                  filter: "blur(22px)",
                }} />
                {/* Card */}
                <div style={{
                  position: "relative", borderRadius: "1.25rem", overflow: "hidden",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  padding: "5px", boxShadow: "0 30px 60px -12px rgba(0,0,0,0.7)",
                }}>
                  <div style={{ aspectRatio: "3/4", width: "100%", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 10,
                      background: "linear-gradient(to top, rgba(2,6,23,0.85) 0%, rgba(2,6,23,0.1) 40%, transparent 70%)",
                    }} />
                    <img
                      src={profile?.profile_picture ? `${backendUrl}${profile.profile_picture}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=600&background=3b82f6&color=fff&bold=true`}
                      alt={fullName}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease" }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem", zIndex: 20 }}>
                      <p style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginBottom: "3px" }}>
                        {profile?.location || ""}
                      </p>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "1rem", color: "white" }}>{fullName}</p>
                    </div>
                  </div>
                </div>
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                  style={{
                    position: "absolute", top: "1.5rem", right: "-0.75rem", zIndex: 30,
                    padding: "0.4rem 0.8rem", borderRadius: "1rem",
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    boxShadow: "0 6px 18px rgba(59,130,246,0.4)",
                    fontSize: "0.7rem", fontWeight: 700, color: "white",
                  }}
                >
                  Profile
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicHero;
