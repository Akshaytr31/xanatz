import React, { useState, useEffect } from "react";
import { Search, Users, Shield, Calendar, Mail, Phone, CheckCircle2, XCircle, Clock } from "lucide-react";
import api from "../../api";

const AdminUsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "inactive"

  const fetchUsers = (q = "", status = "all") => {
    setLoading(true);
    api.get(`admin/users/?q=${encodeURIComponent(q)}&status=${status}`)
      .then(res => setUsers(res.data))
      .catch(err => console.error("Error fetching admin users", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Bar with Filter & Search */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 14, background: "rgba(255,255,255,0.03)",
        padding: "16px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "rgba(99,102,241,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Users size={18} color="#6366f1" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>Platform Users</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Showing {users.length} users</div>
          </div>
        </div>

        {/* Filter Pills & Search Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Status Filter Pills */}
          <div style={{
            display: "flex", gap: 4, background: "rgba(0,0,0,0.3)",
            padding: 4, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)"
          }}>
            {[
              { id: "all", label: "All Users" },
              { id: "active", label: "Active (≤30 Days)" },
              { id: "inactive", label: "Inactive (>30 Days)" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: statusFilter === f.id ? 700 : 500,
                  background: statusFilter === f.id ? "rgba(99,102,241,0.25)" : "transparent",
                  color: statusFilter === f.id ? "#a5b4fc" : "rgba(255,255,255,0.45)",
                  border: statusFilter === f.id ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", minWidth: 220 }}>
            <Search size={15} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px 8px 36px",
                background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10, color: "white", fontSize: 12, outline: "none"
              }}
            />
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Loading users...</div>
      ) : users.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>No users found for selected filter.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {users.map(u => {
            const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || "No Name";
            const joinedDate = u.date_joined ? new Date(u.date_joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";
            const lastActiveText = u.last_login 
              ? new Date(u.last_login).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) 
              : "Never";

            const isUserActive = u.is_user_active;

            return (
              <div
                key={u.id}
                style={{
                  background: "linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))",
                  border: `1px solid ${isUserActive ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 14, padding: "16px 18px",
                  display: "flex", flexDirection: "column", gap: 12,
                  backdropFilter: "blur(10px)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{fullName}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <Mail size={12} /> {u.email}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                    background: u.is_staff ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.15)",
                    color: u.is_staff ? "#ef4444" : "#a5b4fc",
                    border: `1px solid ${u.is_staff ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)"}`
                  }}>
                    {u.is_staff ? "Admin" : u.user_type || "User"}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={11} /> Last active: <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{lastActiveText}</span>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={12} /> Joined {joinedDate}
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    color: isUserActive ? "#10b981" : "#ef4444",
                    fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                    background: isUserActive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)"
                  }}>
                    {isUserActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {isUserActive ? "Active (≤30d)" : "Inactive"}
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

export default AdminUsersList;
