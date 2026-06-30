import React from "react";
import { FolderGit2, ExternalLink, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { backendUrl } from "../../api";

const PublicProjects = ({ projects }) => {
  if (!projects || projects.length === 0) return null;

  return (
    <section className="pub-section" style={{ overflow: "hidden", position: "relative" }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", left: "-100px", bottom: "10%",
        width: "300px", height: "300px", pointerEvents: "none", opacity: 0.1,
        background: "radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)",
        filter: "blur(60px)"
      }} />

      <div className="pub-inner" style={{ position: "relative", zIndex: 10 }}>
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: "2.5rem" }}
        >
          <p style={{
            fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.3em", background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.6rem"
          }}>
            Craft &amp; Creation
          </p>
          <h2 style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 900,
            fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1, letterSpacing: "-0.04em", color: "white"
          }}>
            Portfolio &amp; <span style={{ color: "#4b5563" }}>Projects</span>
          </h2>
        </motion.div>

        {/* Responsive Grid */}
        <style>{`
          @media (min-width: 768px) {
            .pub-projects-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
        `}</style>

        <div className="pub-projects-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
              style={{
                borderRadius: "1.25rem",
                overflow: "hidden",
                background: "var(--color-glass)",
                border: "1px solid var(--color-card-border)",
                backdropFilter: "blur(20px)",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "rgba(139,92,246,0.35)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(139,92,246,0.12)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--color-card-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Project Image */}
              {project.image && (
                <div style={{ height: "200px", width: "100%", overflow: "hidden", position: "relative" }}>
                  <img
                    src={`${backendUrl}${project.image}`}
                    alt={project.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.8s ease"
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(2,6,23,0.4) 0%, transparent 60%)"
                  }} />
                </div>
              )}

              {/* Card Content */}
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "start", justifySelection: "space-between", gap: "1rem", marginBottom: "0.75rem" }}>
                  <h3 style={{
                    fontFamily: "'Outfit', sans-serif", fontWeight: 900,
                    fontSize: "clamp(1.1rem, 2.2vw, 1.30rem)", letterSpacing: "-0.01em", color: "white", flex: 1
                  }}>
                    {project.title}
                  </h3>
                  
                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
                        color: "#a78bfa", transition: "all 0.2s"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "var(--color-accent-purple)";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(139,92,246,0.1)";
                        e.currentTarget.style.color = "#a78bfa";
                      }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>

                <p style={{
                  fontSize: "0.85rem", fontWeight: 300, color: "#9ca3af",
                  lineHeight: 1.6, marginBottom: "1.5rem", flex: 1,
                  wordBreak: "break-word"
                }}>
                  {project.description}
                </p>

                {/* Tech Badges */}
                {project.technologies && project.technologies.length > 0 && (
                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: "0.4rem",
                    paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.06)"
                  }}>
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: "0.25rem 0.65rem", borderRadius: "6px",
                          fontSize: "0.68rem", fontWeight: 700,
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.6)"
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PublicProjects;
