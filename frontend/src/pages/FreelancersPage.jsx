import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Users, Star, MapPin, DollarSign, ExternalLink,
  MessageSquare, CheckCircle2, Clock, Filter, User, UserCheck,
  ChevronDown, Check, ArrowDownRight, ArrowUpRight
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api";

const cardStyle = {
  background: "var(--color-glass)",
  border: "1px solid var(--color-card-border)",
  borderRadius: "16px",
  backdropFilter: "blur(20px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
};

const AVAILABILITY_OPTIONS = [
  { key: "all", label: "All Freelancers" },
  { key: "available", label: "Available Now", color: "#10b981" },
  { key: "busy", label: "Busy", color: "#f59e0b" },
  { key: "unavailable", label: "Unavailable", color: "#ef4444" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Recently Joined", icon: Clock },
  { value: "rating", label: "Highest Rated", icon: Star, iconColor: "#f59e0b" },
  { value: "rate_low", label: "Rate: Low to High", icon: ArrowDownRight, iconColor: "#10b981" },
  { value: "rate_high", label: "Rate: High to Low", icon: ArrowUpRight, iconColor: "#8b5cf6" },
];

const FreelancersPage = () => {
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFreelancers(search, availabilityFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, availabilityFilter]);

  const fetchFreelancers = async (q = search, availability = availabilityFilter) => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (availability && availability !== "all") params.append("availability", availability);
      if (q && q.trim()) params.append("q", q.trim());
      
      const res = await api.get(`freelancers/?${params.toString()}`);
      setFreelancers(res.data);
    } catch (err) {
      console.error("Error fetching freelancers:", err);
      setError("Failed to load freelancers directory.");
    } finally {
      setLoading(false);
    }
  };

  // Client-side search and sort
  const filteredFreelancers = freelancers
    .filter((f) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const name = `${f.first_name || ""} ${f.last_name || ""}`.toLowerCase();
      const headline = (f.headline || "").toLowerCase();
      const about = (f.about || "").toLowerCase();
      const skillsStr = Array.isArray(f.skills) ? f.skills.join(" ").toLowerCase() : "";
      const location = (f.location || "").toLowerCase();

      return (
        name.includes(q) ||
        headline.includes(q) ||
        about.includes(q) ||
        skillsStr.includes(q) ||
        location.includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "rating") {
        return (b.average_rating || 0) - (a.average_rating || 0);
      }
      if (sortBy === "rate_low") {
        return (parseFloat(a.hourly_rate) || 0) - (parseFloat(b.hourly_rate) || 0);
      }
      if (sortBy === "rate_high") {
        return (parseFloat(b.hourly_rate) || 0) - (parseFloat(a.hourly_rate) || 0);
      }
      // default: newest
      return new Date(b.date_joined || 0) - new Date(a.date_joined || 0);
    });

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-dark, #07090e)", color: "white" }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 20px 60px 20px" }}>
        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <div style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 24,
          padding: "40px 32px",
          marginBottom: 32,
          background: "linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(59, 130, 246, 0.1))",
          border: "1px solid rgba(124, 58, 237, 0.25)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        }}>
          <div style={{
            position: "absolute", top: -50, right: -50, width: 250, height: 250,
            background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 650 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 99, marginBottom: 14,
              background: "rgba(124, 58, 237, 0.2)", border: "1px solid rgba(124, 58, 237, 0.35)",
              color: "#c4b5fd", fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
            }}>
              <UserCheck size={13} color="#a78bfa" />
              <span>FREELANCERS DIRECTORY</span>
            </div>

            <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 10, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
              Discover Top Independent Talent
            </h1>
            <p style={{ color: "var(--color-text-secondary, rgba(255,255,255,0.65))", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
              Connect with verified freelancers, specialized domain consultants, and experts available for your projects.
            </p>
          </div>
        </div>

        {/* ── Search & Filter Controls ───────────────────────────────────── */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 16, marginBottom: 28,
        }}>
          <div style={{
            display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyBetween: "space-between"
          }}>
            {/* Search Input */}
            <div style={{ position: "relative", flex: 1, minWidth: 280 }}>
              <Search size={16} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search freelancers by name, skill, title, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "11px 16px 11px 40px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-card-border)",
                  borderRadius: 12, color: "white", fontSize: 13, outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(124, 58, 237, 0.5)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--color-card-border)"; }}
              />
            </div>

            {/* Redesigned Glassmorphism Sort Dropdown */}
            <div ref={sortDropdownRef} style={{ position: "relative", zIndex: 30 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600, letterSpacing: "0.02em" }}>
                  Sort by:
                </span>
                <button
                  type="button"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 14px",
                    background: isSortOpen ? "rgba(124, 58, 237, 0.15)" : "rgba(15, 23, 42, 0.6)",
                    border: isSortOpen ? "1px solid rgba(124, 58, 237, 0.6)" : "1px solid var(--color-card-border)",
                    borderRadius: 12,
                    color: "white", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", outline: "none",
                    boxShadow: isSortOpen ? "0 0 16px rgba(124, 58, 237, 0.25)" : "0 2px 8px rgba(0,0,0,0.2)",
                    backdropFilter: "blur(12px)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSortOpen) {
                      e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.4)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.07)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSortOpen) {
                      e.currentTarget.style.borderColor = "var(--color-card-border)";
                      e.currentTarget.style.background = "rgba(15, 23, 42, 0.6)";
                    }
                  }}
                >
                  {(() => {
                    const currentOpt = SORT_OPTIONS.find((o) => o.value === sortBy) || SORT_OPTIONS[0];
                    const Icon = currentOpt.icon;
                    return (
                      <>
                        <Icon size={14} color={currentOpt.iconColor || "rgba(255,255,255,0.7)"} />
                        <span>{currentOpt.label}</span>
                      </>
                    );
                  })()}
                  <ChevronDown
                    size={14}
                    color="rgba(255,255,255,0.5)"
                    style={{
                      transform: isSortOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      marginLeft: 2,
                    }}
                  />
                </button>
              </div>

              {isSortOpen && (
                <div
                  style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    width: 195,
                    background: "rgba(10, 15, 30, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 14,
                    padding: "6px",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(124, 58, 237, 0.2)",
                    backdropFilter: "blur(24px)",
                    display: "flex", flexDirection: "column", gap: 3,
                  }}
                >
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = sortBy === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.value);
                          setIsSortOpen(false);
                        }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          width: "100%", padding: "8px 12px",
                          borderRadius: 9, border: "none",
                          background: isSelected ? "rgba(124, 58, 237, 0.25)" : "transparent",
                          color: isSelected ? "#c4b5fd" : "rgba(255,255,255,0.8)",
                          fontSize: 12, fontWeight: isSelected ? 700 : 500,
                          cursor: "pointer", textAlign: "left",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Icon size={14} color={opt.iconColor || (isSelected ? "#c4b5fd" : "rgba(255,255,255,0.5)")} />
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check size={14} color="#c4b5fd" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Availability Pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {AVAILABILITY_OPTIONS.map(({ key, label, color }) => {
              const isActive = availabilityFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setAvailabilityFilter(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 99, border: "none", cursor: "pointer",
                    background: isActive ? "rgba(124, 58, 237, 0.2)" : "rgba(255,255,255,0.03)",
                    color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                    border: isActive ? "1px solid rgba(124, 58, 237, 0.4)" : "1px solid rgba(255,255,255,0.07)",
                    fontSize: 12, fontWeight: isActive ? 700 : 500, transition: "all 0.2s",
                  }}
                >
                  {color && (
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                  )}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Error Alert ─────────────────────────────────────────────────── */}
        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: 12, marginBottom: 24,
            background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "#fca5a5", fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* ── Freelancers Grid ────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "rgba(255,255,255,0.4)" }}>
            <div style={{
              width: 36, height: 36, border: "3px solid rgba(124,58,237,0.2)",
              borderTopColor: "#7c3aed", borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 16px auto",
            }} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Loading freelancers...</span>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filteredFreelancers.length === 0 ? (
          <div style={{
            ...cardStyle, padding: "60px 20px", textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 54, height: 54, borderRadius: 16, background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Users size={24} color="#a78bfa" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>No Freelancers Found</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0, maxWidth: 400 }}>
              {search ? "No freelancers match your search criteria. Try a different keyword." : "No freelancers are currently listed under this filter."}
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 20,
          }}>
            {filteredFreelancers.map((f) => {
              const fullName = `${f.first_name || ""} ${f.last_name || ""}`.trim() || f.email || "Freelancer";
              const isAvailable = f.freelancer_availability === "available";

              return (
                <div
                  key={f.id}
                  style={{
                    ...cardStyle,
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(124, 58, 237, 0.4)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(124,58,237,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-card-border)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Card Header & Avatar */}
                  <div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 52, height: 52, borderRadius: 14, overflow: "hidden", flexShrink: 0,
                        background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.2))",
                        border: "1px solid rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {f.profile_picture ? (
                          <img src={f.profile_picture} alt={fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <User size={24} color="#c4b5fd" />
                        )}
                      </div>

                      {/* Name + Title + Availability */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: "white", letterSpacing: "-0.2px" }}>
                            {fullName}
                          </span>
                          {(() => {
                            const status = f.freelancer_availability || "available";
                            let label = "Available";
                            let bg = "rgba(16,185,129,0.15)";
                            let color = "#34d399";
                            let border = "1px solid rgba(16,185,129,0.25)";

                            if (status === "busy") {
                              label = "Busy";
                              bg = "rgba(245,158,11,0.15)";
                              color = "#fbbf24";
                              border = "1px solid rgba(245,158,11,0.25)";
                            } else if (status === "unavailable") {
                              label = "Unavailable";
                              bg = "rgba(239,68,68,0.15)";
                              color = "#f87171";
                              border = "1px solid rgba(239,68,68,0.25)";
                            }

                            return (
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                                background: bg, color, border, letterSpacing: "0.5px",
                              }}>
                                {label}
                              </span>
                            );
                          })()}
                        </div>

                        {f.headline && (
                          <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {f.headline}
                          </div>
                        )}

                        {f.location && (
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                            <MapPin size={11} /> {f.location}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta Row: Rate & Rating */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyBetween: "space-between", gap: 12,
                      padding: "10px 14px", borderRadius: 10, marginBottom: 14,
                      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                    }}>
                      {/* Hourly Rate */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>RATE:</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#6ee7b7" }}>
                          {f.hourly_rate ? `AED ${f.hourly_rate}/hr` : "Negotiable"}
                        </span>
                      </div>

                      {/* Rating */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
                        <Star size={12} style={{ fill: "#f59e0b", stroke: "#f59e0b" }} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: "white" }}>
                          {f.average_rating ? f.average_rating : "New"}
                        </span>
                        {f.reviews_count > 0 && (
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                            ({f.reviews_count})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* About Bio */}
                    {f.about && (
                      <p style={{
                        fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "0 0 14px 0",
                        lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                      }}>
                        {f.about}
                      </p>
                    )}

                    {/* Skills Chips */}
                    {Array.isArray(f.skills) && f.skills.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                        {f.skills.slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                              background: "rgba(124,58,237,0.12)", color: "#c4b5fd",
                              border: "1px solid rgba(124,58,237,0.25)",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                        {f.skills.length > 4 && (
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", padding: "3px 4px" }}>
                            +{f.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div style={{
                    display: "flex", gap: 8, pt: 12, borderTop: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    {f.public_id && (
                      <button
                        onClick={() => navigate(`/p/${f.public_id}`)}
                        style={{
                          flex: 1, padding: "9px", borderRadius: 8, cursor: "pointer",
                          background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                          border: "none", color: "white", fontSize: 12, fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
                          transition: "all 0.2s",
                        }}
                      >
                        <span>View Profile</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        navigate("/messages", {
                          state: {
                            startChatWith: {
                              id: f.id,
                              email: f.email,
                              name: `${f.first_name || ""} ${f.last_name || ""}`.trim() || f.email,
                              first_name: f.first_name,
                              last_name: f.last_name,
                              profile_picture: f.profile_picture || f.profile?.profile_picture,
                            },
                          },
                        })
                      }
                      style={{
                        padding: "9px 14px", borderRadius: 8, cursor: "pointer",
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                      title="Send Message"
                    >
                      <MessageSquare size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default FreelancersPage;
