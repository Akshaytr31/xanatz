import React from "react";
import { ArrowUpRight, Share2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PublicHeader = ({ first_name, email, copied, handleShare, scrolled }) => {
  return (
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
        background: scrolled ? "rgba(2,6,23,0.85)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.5)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      <div className="pub-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: "1.15rem", letterSpacing: "-0.04em", color: "white" }}>
          {first_name?.toUpperCase()}
          <span style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>.</span>
        </span>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <motion.button
            onClick={handleShare}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.5rem 0.85rem",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              color: copied ? "#4ade80" : "#9ca3af",
              cursor: "pointer",
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

          <motion.a
            href={`mailto:${email}`}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.55rem 1rem",
              borderRadius: "9999px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              boxShadow: "0 0 18px rgba(59,130,246,0.35)",
              fontSize: "0.75rem", fontWeight: 700, color: "white",
              textDecoration: "none",
            }}
          >
            Hire Me <ArrowUpRight size={13} />
          </motion.a>
        </div>
      </div>
    </motion.header>
  );
};

export default PublicHeader;
