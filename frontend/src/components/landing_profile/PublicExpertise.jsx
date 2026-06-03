import React from "react";
import { Sparkles, GraduationCap, BookOpen, Award } from "lucide-react";
import { motion } from "framer-motion";

const PublicExpertise = ({ skills, educations, experiencesCount }) => {
  return (
    <section className="pub-section" style={{ overflow: "hidden" }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: "250px", height: "250px", pointerEvents: "none", opacity: 0.08, background: "radial-gradient(circle, rgba(139,92,246,0.6), transparent 70%)", filter: "blur(50px)" }} />

      <div className="pub-inner">
        {/* Section heading */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.6rem" }}>
            Knowledge Base
          </p>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1, letterSpacing: "-0.04em", color: "white" }}>
            Expertise &amp; <span style={{ color: "#4b5563" }}>Education</span>
          </h2>
        </motion.div>

        {/* Skills card */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ borderRadius: "1rem", padding: "1.5rem", marginBottom: "1rem", position: "relative", overflow: "hidden", background: "var(--color-glass)", border: "1px solid var(--color-card-border)", backdropFilter: "blur(20px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(59,130,246,0.25)" }}>
              <Sparkles size={16} color="#60a5fa" />
            </div>
            <div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "1rem", color: "white" }}>Technical Arsenal</p>
              <p style={{ fontSize: "0.72rem", color: "#4b5563", fontWeight: 500 }}>{skills?.length || 0} skills</p>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {skills?.length > 0 ? skills.map((skill, i) => (
              <motion.span key={i} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                style={{ padding: "0.35rem 0.85rem", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, cursor: "default", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)", color: "#93c5fd", transition: "all 0.2s ease" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.15)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(59,130,246,0.08)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.15)"; }}
              >{skill}</motion.span>
            )) : <p style={{ fontSize: "0.82rem", color: "#4b5563" }}>No skills listed yet.</p>}
          </div>
        </motion.div>

        {/* Stats + Education grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
          <style>{`
            @media (min-width: 600px) {
              .expertise-grid { grid-template-columns: repeat(2, 1fr) !important; }
            }
          `}</style>

          <div className="expertise-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
            {/* Stat card */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
              style={{ borderRadius: "1rem", padding: "1.5rem", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))", border: "1px solid rgba(59,130,246,0.2)", backdropFilter: "blur(20px)", boxShadow: "inset 0 1px 0 var(--color-card-border)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
                <Award size={16} color="#60a5fa" />
              </div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1, color: "white", marginBottom: "0.4rem" }}>{experiencesCount || 0}</p>
              <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", background: "linear-gradient(90deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Roles Navigated</p>
            </motion.div>

            {/* Education cards */}
            {educations?.length > 0 ? educations.map((edu, i) => (
              <motion.div key={edu.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 * i }}
                style={{ borderRadius: "1rem", padding: "1.5rem", position: "relative", overflow: "hidden", background: "var(--color-glass)", border: "1px solid var(--color-card-border)", backdropFilter: "blur(20px)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem", gap: "0.5rem" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.1))", border: "1px solid rgba(139,92,246,0.25)" }}>
                    <GraduationCap size={18} color="#a78bfa" />
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.6rem", borderRadius: "8px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", fontSize: "0.65rem", fontWeight: 700, color: "#a78bfa", whiteSpace: "nowrap" }}>
                    <BookOpen size={9} />
                    {new Date(edu.start_date).getFullYear()} — {edu.end_date ? new Date(edu.end_date).getFullYear() : "Present"}
                  </div>
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "clamp(1rem, 2.5vw, 1.2rem)", letterSpacing: "-0.02em", color: "white", marginBottom: "0.35rem" }}>{edu.school}</h3>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#c4b5fd", marginBottom: edu.description ? "0.75rem" : 0 }}>{edu.degree} — {edu.field_of_study}</p>
                {edu.description && (
                  <p style={{ fontSize: "0.8rem", fontWeight: 300, color: "#6b7280", lineHeight: 1.6, wordBreak: "break-word", overflowWrap: "break-word" }}>{edu.description}</p>
                )}
              </motion.div>
            )) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicExpertise;
