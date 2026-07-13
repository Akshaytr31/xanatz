import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

// Import landing profile components
import PublicHeader from "../components/landing_profile/PublicHeader";
import PublicHero from "../components/landing_profile/PublicHero";
import PublicAbout from "../components/landing_profile/PublicAbout";
import PublicExperience from "../components/landing_profile/PublicExperience";
import PublicExpertise from "../components/landing_profile/PublicExpertise";
import PublicProjects from "../components/landing_profile/PublicProjects";
import PublicReviews from "../components/landing_profile/PublicReviews";
import PublicCTA from "../components/landing_profile/PublicCTA";
import PublicFooter from "../components/landing_profile/PublicFooter";

const PublicProfile = () => {
  const { publicId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [flagModal, setFlagModal] = useState({
    isOpen: false,
    reviewId: null,
    status: 'confirm', // 'confirm' | 'success' | 'error'
    loading: false
  });

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`public-profile/${publicId}/`);
        setUser(response.data);
      } catch (err) {
        setError("Profile not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [publicId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenFlagModal = (reviewId) => {
    setFlagModal({
      isOpen: true,
      reviewId,
      status: 'confirm',
      loading: false
    });
  };

  const handleCloseFlagModal = () => {
    setFlagModal({
      isOpen: false,
      reviewId: null,
      status: 'confirm',
      loading: false
    });
  };

  const handleConfirmFlag = async () => {
    const { reviewId } = flagModal;
    if (!reviewId) return;

    setFlagModal(prev => ({ ...prev, loading: true }));
    try {
      await api.post(`freelancer-reviews/${reviewId}/flag/`);
      
      setUser(prev => {
        if (!prev) return prev;
        const updatedReviews = (prev.reviews || []).map(r => 
          r.id === reviewId ? { ...r, is_flagged: true } : r
        );
        return {
          ...prev,
          reviews: updatedReviews
        };
      });

      setFlagModal(prev => ({ ...prev, loading: false, status: 'success' }));
    } catch (err) {
      console.error("Error flagging review:", err);
      setFlagModal(prev => ({ ...prev, loading: false, status: 'error' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-white/5" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Loading Profile</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-white px-6">
        <h1
          className="font-black tracking-tighter mb-4"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(5rem, 20vw, 12rem)",
            color: "var(--color-glass)",
          }}
        >
          404
        </h1>
        <p className="text-gray-500 text-lg mb-8 font-light">{error}</p>
        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white hover:scale-105 transition-all"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            boxShadow: "0 8px 24px rgba(59,130,246,0.3)",
          }}
        >
          Return Home <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const { profile, first_name, last_name, email } = user;
  const fullName = `${first_name} ${last_name}`;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-primary text-white overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Premium animated background */}
      <div className="bg-mesh">
        <div
          className="bg-blob"
          style={{ top: "-15%", left: "-10%", width: "600px", height: "600px" }}
        />
        <div
          className="bg-blob"
          style={{
            bottom: "-15%",
            right: "-10%",
            animationDelay: "-5s",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
            width: "700px",
            height: "700px",
          }}
        />
        <div
          className="bg-blob"
          style={{
            top: "40%",
            left: "40%",
            animationDelay: "-10s",
            background: "radial-gradient(circle, rgba(244, 114, 182, 0.06) 0%, transparent 70%)",
            width: "400px",
            height: "400px",
          }}
        />
      </div>

      {/* Scroll progress bar — tri-color gradient */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[100]"
        style={{
          scaleX,
          background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #f472b6)",
        }}
      />

      <PublicHeader
        first_name={first_name}
        email={email}
        copied={copied}
        handleShare={handleShare}
        scrolled={scrolled}
      />

      <main className="relative z-10">
        <PublicHero
          profile={profile}
          first_name={first_name}
          last_name={last_name}
          fullName={fullName}
          heroY={heroY}
          heroOpacity={heroOpacity}
        />

        <PublicAbout about={profile?.about} />

        <PublicExperience
          experiences={profile?.experiences}
          scrollYProgress={scrollYProgress}
        />

        <PublicExpertise
          skills={profile?.skills}
          educations={profile?.educations}
          experiencesCount={profile?.experiences?.length}
        />

        {profile?.is_freelancer && (
          <PublicProjects projects={profile?.projects} />
        )}

        <PublicReviews
          reviews={user.reviews}
          average_rating={user.average_rating}
          reviews_count={user.reviews_count}
          onFlagReview={handleOpenFlagModal}
        />

        <PublicCTA email={email} />
      </main>

      <PublicFooter fullName={fullName} handleShare={handleShare} />

      {/* Premium Flag Confirmation Modal */}
      {flagModal.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
        >
          <div
            style={{
              backgroundColor: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "1.5rem",
              padding: "2rem",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center"
            }}
          >
            {flagModal.status === 'confirm' && (
              <>
                <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <ShieldAlert size={28} color="#EF4444" />
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "white", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>
                  Flag this review?
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: "1.5", marginBottom: "1.5rem" }}>
                  Are you sure you want to flag this review as inappropriate? It will be sent to the administrator for moderation.
                </p>
                <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                  <button
                    onClick={handleConfirmFlag}
                    disabled={flagModal.loading}
                    style={{
                      flex: 1,
                      backgroundColor: "#CD2426",
                      color: "white",
                      border: "none",
                      borderRadius: "0.75rem",
                      padding: "0.75rem",
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      transition: "opacity 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                  >
                    {flagModal.loading ? "Flagging..." : "Yes, Flag"}
                  </button>
                  <button
                    onClick={handleCloseFlagModal}
                    disabled={flagModal.loading}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "0.75rem",
                      padding: "0.75rem",
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {flagModal.status === 'success' && (
              <>
                <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <CheckCircle2 size={28} color="#10B981" />
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "white", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>
                  Review Flagged
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: "1.5", marginBottom: "1.5rem" }}>
                  Thank you. This review has been successfully flagged and sent to system administration for moderation.
                </p>
                <button
                  onClick={handleCloseFlagModal}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "0.75rem",
                    padding: "0.75rem",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
                >
                  Close
                </button>
              </>
            )}

            {flagModal.status === 'error' && (
              <>
                <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <ShieldAlert size={28} color="#EF4444" />
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "white", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>
                  Action Failed
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: "1.5", marginBottom: "1.5rem" }}>
                  Failed to flag this review. Please try again later.
                </p>
                <button
                  onClick={handleCloseFlagModal}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "0.75rem",
                    padding: "0.75rem",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
