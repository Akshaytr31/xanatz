import React, { useState, useEffect } from "react";
import { Search, Briefcase, MapPin, DollarSign, Calendar, Users, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import api from "../../api";

const AdminJobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchJobs = (q = "") => {
    setLoading(true);
    api.get(`admin/jobs/?q=${encodeURIComponent(q)}`)
      .then(res => setJobs(res.data))
      .catch(err => console.error("Error fetching admin jobs", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Bar with Search */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 14, background: "rgba(255,255,255,0.03)",
        padding: "16px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "rgba(16,185,129,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Briefcase size={18} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>All Job Openings</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Total {jobs.length} jobs listed</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: 260 }}>
          <Search size={15} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search job title, company, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "9px 12px 9px 36px",
              background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, color: "white", fontSize: 13, outline: "none"
            }}
          />
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>No jobs found matching your search.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {jobs.map(j => {
            const createdDate = j.created_at ? new Date(j.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";

            return (
              <div
                key={j.id}
                style={{
                  background: "linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: "18px 20px",
                  display: "flex", flexDirection: "column", gap: 12,
                  backdropFilter: "blur(10px)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{j.title}</span>
                      {j.job_id && (
                        <span style={{ fontSize: 10, color: "#10b981", background: "rgba(16,185,129,0.12)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                          {j.job_id}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600, marginTop: 2 }}>{j.company_name}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {j.is_flagged && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                        Flagged
                      </span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                      background: j.is_active ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.1)",
                      color: j.is_active ? "#10b981" : "rgba(255,255,255,0.4)",
                      border: `1px solid ${j.is_active ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.2)"}`
                    }}>
                      {j.is_active ? "Active" : "Closed"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                  {j.category && <span>Category: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{j.category}</strong></span>}
                  {j.job_type && <span>Type: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{j.job_type}</strong></span>}
                  {j.salary_range && <span>Salary: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{j.salary_range}</strong></span>}
                  {j.location && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin size={11} /> {j.location}</span>}
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={12} /> Posted {createdDate}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#3b82f6", fontWeight: 600 }}>
                    <Users size={12} /> {j.applications_count} Applications
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminJobsList;
