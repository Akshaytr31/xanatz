import React, { useState, useEffect, useMemo } from "react";
import {
  Search, FolderKanban, Calendar, Users, ExternalLink,
  Filter, X, Building2, Hash, Tag, RotateCcw, ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api";
import { formatDate } from "../../utils/dateUtils";
import { CATEGORY_OPTIONS } from "../company/JobOpeningModal";
import AdminSelectDropdown from "./AdminSelectDropdown";

/* ── Tiny shared styles ── */
const inputBase = {
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 9,
  color: "white",
  fontSize: 12,
  outline: "none",
  padding: "7px 10px 7px 30px",
  width: "100%",
  boxSizing: "border-box",
};

const chipStyle = (color = "#8b5cf6") => ({
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "3px 9px", borderRadius: 99,
  background: `${color}18`, border: `1px solid ${color}40`,
  color, fontSize: 11, fontWeight: 600,
});

const startOfDay = (d) => { const dt = new Date(d); dt.setHours(0, 0, 0, 0); return dt; };
const endOfDay   = (d) => { const dt = new Date(d); dt.setHours(23, 59, 59, 999); return dt; };

const AdminRFPsList = () => {
  const [rfps, setRfps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  /* ── filter state ── */
  const [companyFilter,  setCompanyFilter]  = useState("");
  const [idFilter,       setIdFilter]       = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [showFilters, setShowFilters] = useState(true);

  /* ── fetch ── */
  const fetchRFPs = (q = "") => {
    setLoading(true);
    api.get(`admin/rfps/?q=${encodeURIComponent(q)}`)
      .then(res => setRfps(res.data))
      .catch(err => console.error("Error fetching admin RFPs", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchRFPs(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  /* ── derived unique categories ── */
  // CATEGORY_OPTIONS is now a static import — always shows the full list

  /* ── filtered list ── */
  const filtered = useMemo(() => {
    return rfps.filter(r => {
      if (companyFilter.trim()) {
        if (!(r.company_name || "").toLowerCase().includes(companyFilter.trim().toLowerCase())) return false;
      }
      if (idFilter.trim()) {
        if (!String(r.rfp_id || "").toLowerCase().includes(idFilter.trim().toLowerCase())) return false;
      }
      if (categoryFilter) {
        if ((r.category || "") !== categoryFilter) return false;
      }
      if (dateFrom) {
        if (!r.created_at || new Date(r.created_at) < startOfDay(dateFrom)) return false;
      }
      if (dateTo) {
        if (!r.created_at || new Date(r.created_at) > endOfDay(dateTo)) return false;
      }
      return true;
    });
  }, [rfps, companyFilter, idFilter, categoryFilter, dateFrom, dateTo]);

  /* ── active filter count ── */
  const activeCount = [companyFilter, idFilter, categoryFilter, dateFrom, dateTo].filter(Boolean).length;

  const clearAll = () => {
    setCompanyFilter(""); setIdFilter("");
    setCategoryFilter(""); setDateFrom(""); setDateTo("");
  };

  /* ── chips ── */
  const chips = [
    companyFilter  && { label: `Company: ${companyFilter}`,   onRemove: () => setCompanyFilter(""),  color: "#8b5cf6" },
    idFilter       && { label: `ID: ${idFilter}`,             onRemove: () => setIdFilter(""),        color: "#3b82f6" },
    categoryFilter && { label: `Category: ${categoryFilter}`, onRemove: () => setCategoryFilter(""), color: "#f59e0b" },
    dateFrom       && { label: `From: ${dateFrom}`,           onRemove: () => setDateFrom(""),        color: "#a78bfa" },
    dateTo         && { label: `To: ${dateTo}`,               onRemove: () => setDateTo(""),          color: "#a78bfa" },
  ].filter(Boolean);

  const accent = "#8b5cf6";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Top Bar ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 14, background: "rgba(255,255,255,0.03)",
        padding: "16px 20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "rgba(139,92,246,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FolderKanban size={18} color={accent} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>All RFPs (Request for Proposals)</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              {loading ? "Loading…" : `${filtered.length} of ${rfps.length} RFPs`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Text search */}
          <div style={{ position: "relative", minWidth: 240 }}>
            <Search size={14} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search title, company, category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputBase, minWidth: 240 }}
            />
          </div>

          {/* Toggle filters */}
          <button
            onClick={() => setShowFilters(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 9, cursor: "pointer",
              background: activeCount > 0 ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.06)",
              border: activeCount > 0 ? `1px solid rgba(139,92,246,0.4)` : "1px solid rgba(255,255,255,0.12)",
              color: activeCount > 0 ? accent : "rgba(255,255,255,0.7)",
              fontSize: 12, fontWeight: 600, transition: "all 0.2s",
            }}
          >
            <Filter size={13} />
            Filters
            {activeCount > 0 && (
              <span style={{
                background: accent, color: "white",
                borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 800,
              }}>{activeCount}</span>
            )}
            <ChevronDown size={13} style={{ transform: showFilters ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div style={{
          background: activeCount > 0 ? "rgba(139,92,246,0.05)" : "rgba(255,255,255,0.02)",
          border: activeCount > 0 ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: "14px 18px",
          display: "flex", flexDirection: "column", gap: 12,
          transition: "all 0.25s",
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>

            {/* Company */}
            <div style={{ flex: "1 1 180px", minWidth: 160 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginBottom: 5 }}>COMPANY</div>
              <div style={{ position: "relative" }}>
                <Building2 size={13} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Filter by company name…"
                  value={companyFilter}
                  onChange={e => setCompanyFilter(e.target.value)}
                  style={{
                    ...inputBase,
                    borderColor: companyFilter ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.1)",
                  }}
                />
                {companyFilter && (
                  <button onClick={() => setCompanyFilter("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 0 }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* RFP ID */}
            <div style={{ flex: "1 1 140px", minWidth: 120 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginBottom: 5 }}>RFP ID</div>
              <div style={{ position: "relative" }}>
                <Hash size={13} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="e.g. RFP-001…"
                  value={idFilter}
                  onChange={e => setIdFilter(e.target.value)}
                  style={{
                    ...inputBase,
                    borderColor: idFilter ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)",
                  }}
                />
                {idFilter && (
                  <button onClick={() => setIdFilter("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 0 }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Category dropdown */}
            <div style={{ flex: "1 1 160px", minWidth: 140 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginBottom: 5 }}>CATEGORY</div>
              <AdminSelectDropdown
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={CATEGORY_OPTIONS}
                placeholder="All categories"
                accentColor="#f59e0b"
                allLabel="All categories"
                icon={<Tag size={13} />}
              />
            </div>

            {/* Date From */}
            <div style={{ flex: "1 1 140px", minWidth: 120 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginBottom: 5 }}>DATE FROM</div>
              <div style={{ position: "relative" }}>
                <Calendar size={13} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  style={{
                    ...inputBase,
                    colorScheme: "dark",
                    borderColor: dateFrom ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.1)",
                  }}
                />
              </div>
            </div>

            {/* Date To */}
            <div style={{ flex: "1 1 140px", minWidth: 120 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginBottom: 5 }}>DATE TO</div>
              <div style={{ position: "relative" }}>
                <Calendar size={13} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  style={{
                    ...inputBase,
                    colorScheme: "dark",
                    borderColor: dateTo ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.1)",
                  }}
                />
              </div>
            </div>

            {/* Clear all */}
            {activeCount > 0 && (
              <div style={{ flex: "0 0 auto", display: "flex", alignItems: "flex-end", paddingBottom: 1 }}>
                <button
                  onClick={clearAll}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "7px 13px", borderRadius: 9, cursor: "pointer",
                    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171", fontSize: 11, fontWeight: 700,
                  }}
                >
                  <RotateCcw size={11} /> Clear All
                </button>
              </div>
            )}
          </div>

          {/* Active chips */}
          {chips.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {chips.map((chip, i) => (
                <span key={i} style={chipStyle(chip.color)}>
                  {chip.label}
                  <button onClick={chip.onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex", alignItems: "center" }}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── RFPs Grid ── */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Loading RFPs…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
          {rfps.length === 0 ? "No RFPs found." : "No RFPs match the current filters."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {filtered.map(r => {
            const createdDate = r.created_at ? formatDate(r.created_at, "N/A") : "N/A";
            return (
              <div
                key={r.id}
                style={{
                  background: "linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: "18px 20px",
                  display: "flex", flexDirection: "column", gap: 12,
                  backdropFilter: "blur(10px)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{r.title}</span>
                      {r.rfp_id && (
                        <span style={{ fontSize: 10, color: accent, background: "rgba(139,92,246,0.12)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                          {r.rfp_id}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginTop: 2 }}>{r.company_name}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {r.is_flagged && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                        Flagged
                      </span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                      background: r.is_active ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.1)",
                      color: r.is_active ? accent : "rgba(255,255,255,0.4)",
                      border: `1px solid ${r.is_active ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.2)"}`,
                    }}>
                      {r.is_active ? "Active" : "Closed"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                  {r.category     && <span>Category: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{r.category}</strong></span>}
                  {r.sub_category && <span>Sub-cat: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{r.sub_category}</strong></span>}
                  {r.budget       && <span>Budget: <strong style={{ color: "#10b981" }}>{r.budget}</strong></span>}
                  {r.deadline     && <span>Deadline: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{formatDate(r.deadline)}</strong></span>}
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={12} /> Posted {createdDate}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: accent, fontWeight: 600 }}>
                      <Users size={12} /> {r.interests_count} Interested
                    </span>
                    <Link to={`/rfps/${r.id}`} target="_blank" style={{ color: accent, display: "flex", alignItems: "center", gap: 3, textDecoration: "none", fontWeight: 600 }}>
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
