import React from "react";
import { motion } from "framer-motion";

const PublicAbout = ({ about }) => {
  const paragraphs = about
    ? about.split("\n").filter((p) => p.trim())
    : ["Driven by a passion for design and technology, I focus on creating digital products that are both beautiful and highly functional. Every pixel has a purpose, every interaction tells a story."];

  return (
    <section className="pub-section">
      <div className="pub-inner">
        {/* Divider */}
        <div style={{ height: "1px", width: "100%", marginBottom: "3.5rem", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
          <style>{`
            @media (min-width: 768px) {
              .about-grid { grid-template-columns: 200px 1fr !important; gap: 3rem !important; }
            }
          `}</style>

          <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", alignItems: "start" }}>

            {/* Left label */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p style={{
                fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em",
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: "0.75rem",
              }}>About</p>
              <h2 style={{
                fontFamily: "'Outfit', sans-serif", fontWeight: 900,
                fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1, letterSpacing: "-0.04em",
                color: "white", marginBottom: "1.5rem",
              }}>
                Who<br />I Am
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 0 10px rgba(59,130,246,0.5)" }} />
                <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, rgba(59,130,246,0.5), transparent)" }} />
              </div>
            </motion.div>

            {/* Right card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div style={{
                borderRadius: "1.25rem", padding: "1.75rem", position: "relative", overflow: "hidden",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)", boxShadow: "0 20px 50px -15px rgba(0,0,0,0.5)",
              }}>
                {/* Corner glow */}
                <div style={{ position: "absolute", top: 0, right: 0, width: "150px", height: "150px", pointerEvents: "none", opacity: 0.2, background: "radial-gradient(circle, rgba(139,92,246,0.6), transparent 70%)", filter: "blur(25px)" }} />

                {/* Quote */}
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "5rem", lineHeight: 1, marginBottom: "0.25rem", marginLeft: "-0.25rem", userSelect: "none", background: "linear-gradient(180deg, rgba(59,130,246,0.4), transparent)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>"</div>

                <div style={{ position: "relative", zIndex: 10 }}>
                  {paragraphs.map((para, i) => (
                    <p key={i} style={{
                      fontFamily: "'Inter', sans-serif", fontWeight: 300,
                      fontSize: "clamp(0.9rem, 2vw, 1.1rem)", lineHeight: 1.75,
                      color: "#d1d5db", marginBottom: i < paragraphs.length - 1 ? "1rem" : 0,
                      wordBreak: "break-word", overflowWrap: "break-word",
                    }}>{para}</p>
                  ))}
                </div>

                <div style={{ marginTop: "1.5rem", height: "1px", background: "linear-gradient(90deg, rgba(59,130,246,0.5), rgba(139,92,246,0.4), transparent)" }} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicAbout;
