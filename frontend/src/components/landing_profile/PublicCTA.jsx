import React from "react";
import { motion } from "framer-motion";
import { Mail, ArrowUpRight, Sparkles } from "lucide-react";

const PublicCTA = ({ email }) => {
  return (
    <section className="pub-section">
      <div className="pub-inner">
        {/* Divider */}
        <div style={{ height: "1px", width: "100%", marginBottom: "3.5rem", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            borderRadius: "2rem", padding: "clamp(2rem, 6vw, 4rem)", textAlign: "center",
            position: "relative", overflow: "hidden",
            background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.07), rgba(244,114,182,0.04))",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 30px 60px -15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Glows */}
          <div style={{ position: "absolute", bottom: "-4rem", left: "-4rem", width: "260px", height: "260px", pointerEvents: "none", opacity: 0.25, background: "radial-gradient(circle, rgba(59,130,246,0.5), transparent 70%)", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", top: "-4rem", right: "-4rem", width: "260px", height: "260px", pointerEvents: "none", opacity: 0.18, background: "radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)", filter: "blur(40px)" }} />

          {/* Grid pattern */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.015, backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "55px 55px" }} />

          <div style={{ position: "relative", zIndex: 10 }}>
            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 1rem", borderRadius: "9999px", marginBottom: "1.75rem", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "#60a5fa" }}>
              <Sparkles size={11} /> Let's Collaborate
            </motion.div>

            {/* Headline */}
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 5vw, 4rem)", lineHeight: 1.05, letterSpacing: "-0.04em", color: "white", marginBottom: "1rem" }}>
              Let's build something{" "}
              <span style={{ background: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                extraordinary.
              </span>
            </motion.h2>

            {/* Sub-copy */}
            <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.22 }}
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "#6b7280", maxWidth: "380px", margin: "0 auto 2rem", lineHeight: 1.65 }}>
              Have a project in mind? I'm always open to discussing new ideas and opportunities.
            </motion.p>

            {/* CTA */}
            <motion.a
              href={`mailto:${email}`}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.6rem",
                padding: "0.9rem 2rem", borderRadius: "1rem",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                boxShadow: "0 0 28px rgba(59,130,246,0.4), 0 8px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "white",
                textDecoration: "none",
              }}
            >
              <Mail size={16} />
              Start a Conversation
              <ArrowUpRight size={16} />
            </motion.a>

            {email && (
              <p style={{ marginTop: "1.25rem", fontSize: "0.72rem", fontFamily: "monospace", color: "#374151" }}>{email}</p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PublicCTA;
