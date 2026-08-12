import React, { useState, useEffect } from "react";
import { Search, Building2, ExternalLink, MapPin, Mail, Clock, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api";

const AdminCompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCompanies = (q = "", status = "all") => {
    setLoading(true);
    api.get(`admin/companies/?q=${encodeURIComponent(q)}&status=${status}`)
      .then(res => setCompanies(res.data))
      .catch(err => console.error("Error fetching admin companies", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies(search, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const formatDate = (isoString) => {
    if (!isoString) return "No postings yet";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Bar with Search & Filter Tabs */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 14, background: "rgba(255,255,255,0.03)",
        padding: "16px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "rgba(59,130,246,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Building2 size={18} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>Registered Companies</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Total {companies.length} companies shown</div>
          </div>
        </div>

        {/* Status Filter Tabs & Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{
            display: "flex", background: "rgba(0,0,0,0.3)", padding: 4, borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            {[
              { id: "all", label: "All Companies" },
              { id: "active", label: "Active (Last 30 Days)" },
              { id: "inactive", label: "Inactive" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "all 0.2s",
                  background: statusFilter === tab.id ? "rgba(59,130,246,0.25)" : "transparent",
                  color: statusFilter === tab.id ? "#60a5fa" : "rgba(255,255,255,0.5)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: "relative", minWidth: 240 }}>
            <Search size={15} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search name, ID, industry..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px 8px 36px",
                background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10, color: "white", fontSize: 13, outline: "none"
              }}
            />
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Loading companies...</div>
      ) : companies.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>No companies found matching your query and status filter.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
          {companies.map(c => (
            <div
              key={c.id}
              style={{
                background: "linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "18px 20px",
                display: "flex", flexDirection: "column", gap: 14,
                backdropFilter: "blur(10px)", position: "relative"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{c.name}</span>
                    {c.company_id && (
                      <span style={{ fontSize: 10, color: "#3b82f6", background: "rgba(59,130,246,0.12)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                        {c.company_id}
                      </span>
                    )}
                  </div>
                  {c.tagline && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{c.tagline}</div>}
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  {/* Active / Inactive Status Badge based on 30 day job/rfp rule */}
                  {c.is_recently_active ? (
                    <span style={{
                      display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700,
                      color: "#10b981", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
                      padding: "3px 8px", borderRadius: 6
                    }}>
                      <CheckCircle2 size={12} /> Active (30d)
                    </span>
                  ) : (
                    <span style={{
                      display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700,
                      color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                      padding: "3px 8px", borderRadius: 6
                    }}>
                      <AlertCircle size={12} /> Inactive
                    </span>
                  )}

                  {c.public_id && (
                    <Link
                      to={`/c/${c.public_id}`}
                      target="_blank"
                      style={{ color: "#3b82f6", display: "flex", alignItems: "center", gap: 4, fontSize: 11, textDecoration: "none", fontWeight: 600 }}
                    >
                      Profile <ExternalLink size={11} />
                    </Link>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {c.industry && <span>Industry: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{c.industry}</strong></span>}
                {c.location && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin size={11} /> {c.location}</span>}
                {c.creator_email && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Mail size={11} /> {c.creator_email}</span>}
              </div>

              {/* 30-Day Activity Stats Sub-bar */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontSize: 11, background: "rgba(255,255,255,0.02)", padding: "6px 10px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.05)"
              }}>
                <span style={{ color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Activity size={12} color="#3b82f6" /> 30d Posts: <strong style={{ color: "white" }}>{(c.recent_jobs || 0) + (c.recent_rfps || 0)}</strong> ({c.recent_jobs || 0} jobs, {c.recent_rfps || 0} RFPs)
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={11} /> Last: {formatDate(c.last_activity_date)}
                </span>
              </div>

              {/* Overall Stats Footer */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
                background: "rgba(0,0,0,0.25)", padding: "10px 12px", borderRadius: 10, textAlign: "center"
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#10b981" }}>{c.total_jobs}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Total Jobs</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#8b5cf6" }}>{c.total_rfps}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Total RFPs</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#6366f1" }}>{c.members_count}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Members</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCompaniesList;
