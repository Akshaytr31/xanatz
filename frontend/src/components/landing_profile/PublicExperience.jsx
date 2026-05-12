import React, { useRef } from "react";
import { ExternalLink, Briefcase, Calendar, Building2 } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

/* ─── Animated vertical line that grows as the section scrolls into view ─── */
const TimelineLine = ({ containerRef }) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 30%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  return (
    /* Track */
    <div style={{
      position: "absolute",
      left: "19px",
      top: 0,
      bottom: 0,
      width: "2px",
      background: "rgba(255,255,255,0.05)",
      borderRadius: "9999px",
      overflow: "hidden",
    }}>
      {/* Animated fill */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          scaleY,
          originY: 0,
          background: "linear-gradient(to bottom, #3b82f6, #8b5cf6, #f472b6)",
          boxShadow: "0 0 12px rgba(59,130,246,0.6)",
          borderRadius: "9999px",
        }}
      />
    </div>
  );
};

/* ─── Single timeline item ─────────────────────────────────────────────────── */
const TimelineItem = ({ exp, index }) => {
  const isLast = false; // handled by parent

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "relative", paddingLeft: "54px", paddingBottom: "2rem" }}
    >
      {/* Timeline Node */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
        style={{
          position: "absolute",
          left: 0,
          top: "1.5rem",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(2,6,23,0.9)",
          border: "2px solid rgba(59,130,246,0.4)",
          zIndex: 10,
          boxShadow: "0 0 0 4px rgba(2,6,23,1), 0 0 16px rgba(59,130,246,0.3)",
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        }}
        whileHover={{
          borderColor: "rgba(59,130,246,0.9)",
          boxShadow: "0 0 0 4px rgba(2,6,23,1), 0 0 20px rgba(59,130,246,0.5)",
        }}
      >
        <Briefcase size={14} color="#60a5fa" />

        {/* Pulse ring on current role */}
        {exp.current && (
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: "-4px",
              borderRadius: "50%",
              border: "2px solid rgba(59,130,246,0.5)",
              pointerEvents: "none",
            }}
          />
        )}
      </motion.div>

      {/* Card */}
      <div
        style={{
          borderRadius: "1rem",
          padding: "1.25rem 1.4rem",
          position: "relative",
          overflow: "hidden",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 6px 24px -8px rgba(0,0,0,0.4)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateX(4px)";
          e.currentTarget.style.boxShadow = "0 12px 32px -8px rgba(0,0,0,0.5)";
          e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateX(0)";
          e.currentTarget.style.boxShadow = "0 6px 24px -8px rgba(0,0,0,0.4)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        }}
      >
        {/* Right accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0, width: "3px",
          background: "linear-gradient(to bottom, #3b82f6, #8b5cf6)",
          borderRadius: "9999px 0 0 9999px",
          opacity: 0.6,
        }} />

        {/* Hover glow overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(59,130,246,0.04), transparent)", borderRadius: "1rem", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 10 }}>
          {/* Company + Date row */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.6rem", marginBottom: "0.6rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <Building2 size={12} color="#60a5fa" />
              </div>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af" }}>{exp.company}</span>
              {exp.company_website && (
                <a href={exp.company_website} target="_blank" rel="noopener noreferrer" style={{ color: "#4b5563", lineHeight: 1 }}>
                  <ExternalLink size={11} />
                </a>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.28rem 0.6rem", borderRadius: "8px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)", fontSize: "0.67rem", fontWeight: 700, color: "#60a5fa", whiteSpace: "nowrap" }}>
                <Calendar size={10} />
                {new Date(exp.start_date).getFullYear()} — {exp.current ? "Present" : new Date(exp.end_date).getFullYear()}
              </div>
              {exp.current && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.65rem", fontWeight: 700, color: "#4ade80", whiteSpace: "nowrap" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", flexShrink: 0 }} />
                  Now
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 900,
            fontSize: "clamp(1rem, 2.5vw, 1.3rem)", letterSpacing: "-0.02em",
            color: "white", marginBottom: exp.description ? "0.5rem" : 0,
          }}>
            {exp.title}
          </h3>

          {/* Description */}
          {exp.description && (
            <p style={{
              fontSize: "0.82rem", fontWeight: 300, color: "#6b7280", lineHeight: 1.65,
              wordBreak: "break-word", overflowWrap: "break-word",
            }}>
              {exp.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Main component ───────────────────────────────────────────────────────── */
const PublicExperience = ({ experiences }) => {
  const sectionRef = useRef(null);

  return (
    <section className="pub-section" style={{ overflow: "hidden" }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
        width: "250px", height: "250px", pointerEvents: "none", opacity: 0.08,
        background: "radial-gradient(circle, rgba(59,130,246,0.6), transparent 70%)",
        filter: "blur(50px)",
      }} />

      <div className="pub-inner">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: "3rem" }}
        >
          <p style={{
            fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em",
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: "0.6rem",
          }}>Career Path</p>
          <h2 style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 900,
            fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1, letterSpacing: "-0.04em", color: "white",
          }}>
            Work Experience
          </h2>
        </motion.div>

        {experiences?.length > 0 ? (
          /* Timeline wrapper */
          <div ref={sectionRef} style={{ position: "relative", paddingTop: "0.5rem" }}>
            {/* Animated vertical line */}
            <TimelineLine containerRef={sectionRef} />

            {/* Items */}
            {experiences.map((exp, index) => (
              <TimelineItem key={exp.id} exp={exp} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "1rem", padding: "4rem 1rem", borderRadius: "1rem",
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Briefcase size={28} color="#374151" />
            <p style={{ fontSize: "0.85rem", color: "#4b5563" }}>No experience listed yet.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PublicExperience;
