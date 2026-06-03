import React from "react";
import { ArrowUp, Share2, Heart } from "lucide-react";
import { motion } from "framer-motion";

const PublicFooter = ({ fullName, handleShare }) => {
  const year = new Date().getFullYear();
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      style={{
        position: "relative", zIndex: 20,
        borderTop: "1px solid var(--color-card-border)",
        paddingLeft: "clamp(1.5rem, 5vw, 5rem)",
        paddingRight: "clamp(1.5rem, 5vw, 5rem)",
        paddingTop: "2.5rem", paddingBottom: "2.5rem",
        background: "rgba(2,6,23,0.85)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="pub-inner">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          {/* Name */}
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "1.05rem", letterSpacing: "-0.04em", color: "white" }}>
            {fullName?.toUpperCase()}
            <span style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>.</span>
          </span>

          {/* Attribution */}
          {/* <p style={{ fontSize: "0.7rem", color: "#374151", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            Crafted with <Heart size={10} style={{ color: "#ef4444", fill: "#ef4444" }} /> in {year}
          </p> */}

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button onClick={handleShare}
              style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem", borderRadius: "8px", background: "transparent", border: "none", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#4b5563" }}
              onMouseEnter={e => e.currentTarget.style.color = "white"}
              onMouseLeave={e => e.currentTarget.style.color = "#4b5563"}
            >
              <Share2 size={11} /> Share
            </button>
            <div style={{ width: "1px", height: "14px", background: "var(--color-card-border)" }} />
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem", borderRadius: "8px", background: "transparent", border: "none", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#4b5563" }}
              onMouseEnter={e => e.currentTarget.style.color = "white"}
              onMouseLeave={e => e.currentTarget.style.color = "#4b5563"}
            >
              <ArrowUp size={11} /> Top
            </button>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default PublicFooter;
