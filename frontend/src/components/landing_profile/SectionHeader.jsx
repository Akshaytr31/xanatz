import React from "react";
import { motion } from "framer-motion";

const SectionHeader = ({ title, subtitle, align = "left" }) => (
  <div className={`mb-14 md:mb-20 ${align === "center" ? "text-center" : "text-left"}`}>
    <motion.p
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-4"
      style={{
        background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "inline-block",
      }}
    >
      {subtitle}
    </motion.p>
    <motion.h2
      initial={{ y: 24, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="font-black tracking-tighter text-white leading-none"
      style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
      }}
    >
      {title}
    </motion.h2>
  </div>
);

export default SectionHeader;
