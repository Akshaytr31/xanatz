import React from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare } from "lucide-react";

const PublicReviews = ({ reviews = [], average_rating = 0, reviews_count = 0 }) => {
  const accentColor = "#10b981"; // Unified branding emerald color for success/approvals/proposals

  return (
    <section className="pub-section">
      <div className="pub-inner">
        {/* Divider */}
        <div style={{ height: "1px", width: "100%", marginBottom: "3.5rem", background: "linear-gradient(90deg, transparent, var(--color-card-border), transparent)" }} />

        {/* Section Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2.5rem" }}>
          <div style={{ width: "3px", height: "1.25rem", borderRadius: "9999px", backgroundColor: accentColor }} />
          <h2 style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3em", color: "#6b7280" }}>
            Client Reviews & Feedback
          </h2>
          <span style={{ padding: "0.15rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.55rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}30`, marginLeft: "0.5rem" }}>
            {reviews_count} {reviews_count === 1 ? "Review" : "Reviews"}
          </span>
        </div>

        {reviews_count === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: "center", padding: "4rem 2rem", borderRadius: "2rem", border: "1px solid var(--color-card-border)", background: "var(--color-glass)", backdropFilter: "blur(20px)", boxShadow: "0 20px 50px -15px rgba(0,0,0,0.5)" }}
          >
            <MessageSquare size={40} color="#4b5563" style={{ margin: "0 auto 1.25rem auto", opacity: 0.5 }} />
            <p style={{ color: "#9ca3af", fontSize: "0.875rem", fontWeight: 400 }}>No client reviews have been submitted for this freelancer yet.</p>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
            
            {/* Stats Summary Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2.5rem", padding: "2rem", borderRadius: "2rem", border: "1px solid var(--color-card-border)", background: "var(--color-glass)", backdropFilter: "blur(20px)", boxShadow: "0 20px 50px -15px rgba(0,0,0,0.5)" }}
            >
              <div style={{ textAlign: "center", minWidth: "140px" }}>
                <div style={{ fontSize: "3.5rem", fontWeight: 900, color: "white", lineHeight: 1, fontFamily: "'Outfit', sans-serif" }}>{average_rating}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: "0.2rem", margin: "0.75rem 0" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      style={{
                        fill: star <= Math.round(average_rating) ? "#F59E0B" : "none",
                        stroke: star <= Math.round(average_rating) ? "#F59E0B" : "#4b5563",
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800 }}>Average Rating</div>
              </div>

              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[5, 4, 3, 2, 1].map((ratingVal) => {
                    const count = reviews.filter(r => r.rating === ratingVal).length;
                    const pct = reviews_count > 0 ? (count / reviews_count) * 100 : 0;
                    return (
                      <div key={ratingVal} style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.8rem" }}>
                        <span style={{ color: "#9ca3af", width: "12px", fontWeight: "bold" }}>{ratingVal}</span>
                        <div style={{ flex: 1, height: "5px", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, borderRadius: "9999px", backgroundColor: "#F59E0B" }} />
                        </div>
                        <span style={{ color: "#6b7280", width: "20px", textAlign: "right" }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Reviews List */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
              {reviews.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  style={{
                    padding: "1.75rem", borderRadius: "2rem", border: "1px solid var(--color-card-border)",
                    background: "var(--color-glass)", backdropFilter: "blur(20px)",
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
                    display: "flex", flexDirection: "column", gap: "1rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <div style={{
                        width: "2.5rem", height: "2.5rem", borderRadius: "9999px",
                        backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
                      }}>
                        {review.reviewer_profile_picture ? (
                          <img src={review.reviewer_profile_picture} alt={review.reviewer_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: "1rem", fontWeight: "bold", color: "white" }}>
                            {review.reviewer_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.9rem", fontWeight: "bold", color: "white" }}>{review.reviewer_name}</div>
                        <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                          {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.15rem" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          style={{
                            fill: star <= review.rating ? "#F59E0B" : "none",
                            stroke: star <= review.rating ? "#F59E0B" : "#4b5563",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <p style={{
                    fontFamily: "'Inter', sans-serif", fontWeight: 300,
                    fontSize: "0.92rem", lineHeight: 1.65, color: "#d1d5db",
                    whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "break-word"
                  }}>
                    {review.review_text}
                  </p>
                </motion.div>
              ))}
            </div>

          </div>
        )}
      </div>
    </section>
  );
};

export default PublicReviews;
