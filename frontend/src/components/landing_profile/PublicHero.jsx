import React from "react";
import {
  MapPin,
  Globe,
  ArrowUpRight,
  ChevronDown,
  Sparkles,
  Briefcase,
  ShieldCheck,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import { backendUrl } from "../../api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
};

const PublicHero = ({
  profile,
  first_name,
  last_name,
  fullName,
  heroY,
  heroOpacity,
}) => {
  const currentCompany = profile?.experiences?.find(
    (exp) => exp.current,
  )?.company;

  const totalExp = React.useMemo(() => {
    if (!profile?.experiences || profile.experiences.length === 0) return null;
    let totalMonths = 0;
    profile.experiences.forEach((exp) => {
      const start = new Date(exp.start_date);
      const end = exp.current ? new Date() : new Date(exp.end_date);
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      totalMonths += months;
    });
    const years = Math.floor(totalMonths / 12);
    if (years === 0) return `${totalMonths % 12}m+`;
    return `${years}y+`;
  }, [profile?.experiences]);

  return (
    <section
      className="pub-section-hero"
      style={{
        minHeight: "auto",
        paddingTop: "6.5rem",
        paddingBottom: "3rem",
        alignItems: "center",
        paddingLeft: "clamp(2rem, 7vw, 10rem)",
        paddingRight: "clamp(2rem, 7vw, 10rem)",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "280px",
          pointerEvents: "none",
          opacity: 0.14,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(59,130,246,0.8), transparent)",
          filter: "blur(50px)",
        }}
      />

      <div className="pub-inner" style={{ position: "relative", zIndex: 10 }}>
        {/* Responsive 2-col grid */}
        <style>{`
          @media (min-width: 820px) {
            .hero-main-grid {
              grid-template-columns: 1fr 1fr !important;
              gap: 1.25rem !important;
              align-items: center !important;
            }
          }
          @media (min-width: 1100px) {
            .hero-main-grid {
              grid-template-columns: 1fr 1fr !important;
              gap: 1.75rem !important;
            }
          }
        `}</style>

        <div
          className="hero-main-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1rem",
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          {/* ══ LEFT ══ */}
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {/* Badges Row */}
            <motion.div
              variants={fadeUp}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.6rem",
                marginBottom: "1rem",
              }}
            >
              {/* Freelancer Badge */}
              {profile?.is_freelancer && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.35rem 0.8rem",
                    borderRadius: "9999px",
                    background: "rgba(139,92,246,0.08)",
                    border: "1px solid rgba(139,92,246,0.22)",
                    fontSize: "0.58rem",
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#c084fc",
                  }}
                >
                  <Sparkles size={10} color="#c084fc" strokeWidth={2.5} />
                  Freelancer
                </span>
              )}

              {/* Status badge */}
              {profile?.is_freelancer ? (
                profile.freelancer_availability === "available" ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.35rem 0.8rem",
                      borderRadius: "9999px",
                      background: "rgba(34,197,94,0.07)",
                      border: "1px solid rgba(34,197,94,0.18)",
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#4ade80",
                    }}
                  >
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "#4ade80",
                        boxShadow: "0 0 7px #4ade80",
                        flexShrink: 0,
                      }}
                    />
                    Available for Hire
                  </span>
                ) : profile.freelancer_availability === "busy" ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.35rem 0.8rem",
                      borderRadius: "9999px",
                      background: "rgba(245,158,11,0.07)",
                      border: "1px solid rgba(245,158,11,0.18)",
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#fbbf24",
                    }}
                  >
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "#fbbf24",
                        boxShadow: "0 0 7px #fbbf24",
                        flexShrink: 0,
                      }}
                    />
                    Busy / Contracted
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.35rem 0.8rem",
                      borderRadius: "9999px",
                      background: "rgba(239,68,68,0.07)",
                      border: "1px solid rgba(239,68,68,0.18)",
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#f87171",
                    }}
                  >
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "#f87171",
                        boxShadow: "0 0 7px #f87171",
                        flexShrink: 0,
                      }}
                    />
                    Unavailable
                  </span>
                )
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.35rem 0.8rem",
                    borderRadius: "9999px",
                    background: "rgba(34,197,94,0.07)",
                    border: "1px solid rgba(34,197,94,0.18)",
                    fontSize: "0.58rem",
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#4ade80",
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "#4ade80",
                      boxShadow: "0 0 7px #4ade80",
                      flexShrink: 0,
                    }}
                  />
                  Open to Opportunities
                </span>
              )}

              {/* Verified Badge */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.35rem 0.8rem",
                  borderRadius: "9999px",
                  background: "rgba(59,130,246,0.07)",
                  border: "1px solid rgba(59,130,246,0.18)",
                  fontSize: "0.58rem",
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#60a5fa",
                }}
              >
                <ShieldCheck size={11} strokeWidth={2.5} />
                Verified Professional
              </span>

              {/* Current Company */}
              {currentCompany && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.35rem 0.8rem",
                    borderRadius: "9999px",
                    background: "var(--color-glass)",
                    border: "1px solid var(--color-card-border)",
                    fontSize: "0.58rem",
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#9ca3af",
                  }}
                >
                  <Briefcase size={10} />
                  {currentCompany}
                </span>
              )}

              {/* Experience */}
              {totalExp && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.35rem 0.8rem",
                    borderRadius: "9999px",
                    background: "var(--color-glass)",
                    border: "1px solid var(--color-card-border)",
                    fontSize: "0.58rem",
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#9ca3af",
                  }}
                >
                  <Award size={10} />
                  {totalExp} Experience
                </span>
              )}
            </motion.div>

            {/* Name */}
            <motion.h1
              variants={fadeUp}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(2.6rem, 6vw, 5rem)",
                lineHeight: 0.92,
                letterSpacing: "0.02em",
                color: "white",
                marginBottom: "0.85rem",
              }}
            >
              {first_name}{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {last_name}
              </span>
            </motion.h1>

            {/* Headline */}
            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 300,
                fontSize: "clamp(0.85rem, 1.6vw, 1rem)",
                lineHeight: 1.6,
                color: "#9ca3af",
                marginBottom: "1rem",
              }}
            >
              {profile?.headline}
            </motion.p>

            {/* Meta chips */}
            {(profile?.location || profile?.website) && (
              <motion.div
                variants={fadeUp}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                {profile?.location && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.32rem 0.75rem",
                      borderRadius: "9999px",
                      background: "rgba(59,130,246,0.08)",
                      border: "1px solid rgba(59,130,246,0.18)",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      color: "#93c5fd",
                    }}
                  >
                    <MapPin size={11} color="#60a5fa" strokeWidth={2.5} />
                    {profile.location}
                  </span>
                )}
                {profile?.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.32rem 0.75rem",
                      borderRadius: "9999px",
                      background: "rgba(139,92,246,0.08)",
                      border: "1px solid rgba(139,92,246,0.18)",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      color: "#c4b5fd",
                      textDecoration: "none",
                    }}
                  >
                    <Globe size={11} color="#a78bfa" strokeWidth={2.5} />
                    Website <ArrowUpRight size={10} />
                  </a>
                )}
              </motion.div>
            )}

            {/* Divider */}
            <motion.div
              variants={fadeUp}
              style={{
                height: "1px",
                maxWidth: "260px",
                marginBottom: "1rem",
                background:
                  "linear-gradient(90deg, rgba(59,130,246,0.4), rgba(139,92,246,0.3), transparent)",
              }}
            />

            {/* Scroll hint */}
            <motion.div
              variants={fadeUp}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#374151",
              }}
            >
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                <ChevronDown size={13} />
              </motion.div>
              <span
                style={{
                  fontSize: "0.56rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                }}
              >
                Scroll to explore
              </span>
            </motion.div>
          </motion.div>

          {/* ══ RIGHT: Image ══ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            style={{
              display: "flex",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Glow */}
            <div
              style={{
                position: "absolute",
                inset: "-1.2rem",
                borderRadius: "2rem",
                opacity: 0.3,
                pointerEvents: "none",
                background:
                  "radial-gradient(circle, rgba(59,130,246,0.4), rgba(139,92,246,0.2), transparent 65%)",
                filter: "blur(24px)",
              }}
            />

            <div
              style={{ position: "relative", width: "100%", maxWidth: "300px" }}
            >
              {/* Card */}
              <div
                style={{
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                  background: "var(--color-glass)",
                  border: "1px solid var(--color-card-border)",
                  padding: "4px",
                  boxShadow: "0 32px 64px -16px rgba(0,0,0,0.8)",
                }}
              >
                <div
                  style={{
                    aspectRatio: "4/5",
                    width: "100%",
                    borderRadius: "1rem",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 10,
                      background:
                        "linear-gradient(to top, rgba(2,6,23,0.88) 0%, rgba(2,6,23,0.1) 38%, transparent 62%)",
                    }}
                  />

                  <img
                    src={
                      profile?.profile_picture
                        ? `${backendUrl}${profile.profile_picture}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=800&background=3b82f6&color=fff&bold=true`
                    }
                    alt={fullName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.8s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.04)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  />

                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "1rem",
                      zIndex: 20,
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.56rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        color: "var(--color-text-muted)",
                        marginBottom: "2px",
                      }}
                    >
                      {profile?.location || ""}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 900,
                        fontSize: "0.95rem",
                        color: "white",
                      }}
                    >
                      {fullName}
                    </p>
                  </div>
                </div>
              </div>

              {profile?.is_freelancer && profile?.hourly_rate && (
                <motion.div
                  initial={{ opacity: 0, x: 12, y: -6 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.85, type: "spring", stiffness: 200 }}
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "-0.9rem",
                    zIndex: 30,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.4rem 0.9rem",
                    borderRadius: "9999px",
                    background:
                      "linear-gradient(135deg, var(--color-accent-purple) 0%, #3b82f6 100%)",
                    boxShadow: "0 6px 20px rgba(139,92,246,0.4)",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <Sparkles size={11} />
                  {profile.freelancer_currency === "INR"
                    ? "₹"
                    : profile.freelancer_currency === "EUR"
                      ? "€"
                      : profile.freelancer_currency === "GBP"
                        ? "£"
                        : "$"}
                  {parseFloat(profile.hourly_rate)} / hr
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PublicHero;
