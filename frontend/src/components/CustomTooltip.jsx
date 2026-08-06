import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CustomTooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return children;

  return (
    <div
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "0.35rem 0.7rem",
              background: "rgba(10, 15, 30, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
              zIndex: 9999,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 0 14px rgba(59, 130, 246, 0.25)",
              backdropFilter: "blur(16px)",
              pointerEvents: "none",
              fontFamily: "var(--font-heading, inherit)",
              textTransform: "uppercase",
            }}
          >
            {content}
            {/* Tooltip Caret */}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                marginLeft: "-5px",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid rgba(10, 15, 30, 0.95)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomTooltip;
