import React, { useState, useEffect } from "react";
import { Search, FolderKanban, Calendar, DollarSign, ExternalLink, ShieldAlert, CheckCircle2, XCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api";

const AdminRFPsList = () => {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRFPs = (q = "") => {
    setLoading(true);
    api.get(`admin/rfps/?q=${encodeURIComponent(q)}`)
      .then(res => setRfps(res.data))
      .catch(err => console.error("Error fetching admin RFPs", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRFPs(search);
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
            width: 38, height: 38, borderRadius: 10, background: "rgba(139,92,246,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <FolderKanban size={18} color="#8b5cf6" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>All RFPs (Request for Proposals)</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Total {rfps.length} RFPs listed</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: 260 }}>
          <Search size={15} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search RFP title, ID, company, category..."
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

      {/* RFPs Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Loading RFPs...</div>
      ) : rfps.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>No RFPs found matching your search.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {rfps.map(r => {
            const createdDate = r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";

            return (
              <div
                key={r.id}
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
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{r.title}</span>
                      {r.rfp_id && (
                        <span style={{ fontSize: 10, color: "#8b5cf6", background: "rgba(139,92,246,0.12)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                          {r.rfp_id}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 600, marginTop: 2 }}>{r.company_name}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {r.is_flagged && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                        Flagged
                      </span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                      background: r.is_active ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.1)",
                      color: r.is_active ? "#8b5cf6" : "rgba(255,255,255,0.4)",
                      border: `1px solid ${r.is_active ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.2)"}`
                    }}>
                      {r.is_active ? "Active" : "Closed"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                  {r.category && <span>Category: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{r.category}</strong></span>}
                  {r.sub_category && <span>Sub-cat: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{r.sub_category}</strong></span>}
                  {r.budget && <span>Budget: <strong style={{ color: "#10b981" }}>{r.budget}</strong></span>}
                  {r.deadline && <span>Deadline: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{r.deadline}</strong></span>}
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={12} /> Posted {createdDate}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#8b5cf6", fontWeight: 600 }}>
                      <Users size={12} /> {r.interests_count} Interested
                    </span>
                    <Link to={`/rfps/${r.id}`} target="_blank" style={{ color: "#8b5cf6", display: "flex", alignItems: "center", gap: 3, textDecoration: "none", fontWeight: 600 }}>
                      View <ExternalLink size={11} />
                    </Link>
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

export default AdminRFPsList;
