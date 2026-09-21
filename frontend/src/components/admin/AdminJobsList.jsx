import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Briefcase, MapPin, Calendar, Users, Filter, X, Building2,
  Hash, Tag, RotateCcw, ChevronDown
} from "lucide-react";
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

const chipStyle = (color = "#10b981") => ({
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "3px 9px 3px 9px", borderRadius: 99,
  background: `${color}18`, border: `1px solid ${color}40`,
  color, fontSize: 11, fontWeight: 600,
});

/* ── helpers ── */
const startOfDay = (d) => { const dt = new Date(d); dt.setHours(0, 0, 0, 0); return dt; };
const endOfDay   = (d) => { const dt = new Date(d); dt.setHours(23, 59, 59, 999); return dt; };

const JOB_TYPE_OPTIONS = [
  { value: "full_time",  label: "Full-time"  },
  { value: "part_time",  label: "Part-time"  },
  { value: "contract",   label: "Contract"   },
  { value: "internship", label: "Internship" },
  { value: "remote",     label: "Remote"     },
];

const AdminJobsList = () => {
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  const [companyFilter, setCompanyFilter] = useState("");
  const [idFilter,      setIdFilter]      = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [showFilters, setShowFilters] = useState(true);

  /* ── fetch ── */
  const fetchJobs = (q = "") => {
    setLoading(true);
    api.get(`admin/jobs/?q=${encodeURIComponent(q)}`)
      .then(res => setJobs(res.data))
      .catch(err => console.error("Error fetching admin jobs", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  /* ── derived unique job types for dropdown ── */
  // JOB_TYPE_OPTIONS is a static constant — no dynamic derivation needed
  // CATEGORY_OPTIONS is imported — always shows the full list regardless of existing job data

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      if (companyFilter.trim()) {
        if (!(j.company_name || "").toLowerCase().includes(companyFilter.trim().toLowerCase())) return false;
      }
      if (idFilter.trim()) {
        if (!String(j.job_id || "").toLowerCase().includes(idFilter.trim().toLowerCase())) return false;
      }
      if (jobTypeFilter) {
        if ((j.job_type || "") !== jobTypeFilter) return false;
      }
      if (categoryFilter) {
        if ((j.category || "") !== categoryFilter) return false;
      }
      if (dateFrom) {
        if (!j.created_at || new Date(j.created_at) < startOfDay(dateFrom)) return false;
      }
      if (dateTo) {
        if (!j.created_at || new Date(j.created_at) > endOfDay(dateTo)) return false;
      }
      return true;
    });
  }, [jobs, companyFilter, idFilter, jobTypeFilter, categoryFilter, dateFrom, dateTo]);

  const activeCount = [companyFilter, idFilter, jobTypeFilter, categoryFilter, dateFrom, dateTo].filter(Boolean).length;

  const clearAll = () => {
    setCompanyFilter(""); setIdFilter("");
    setJobTypeFilter(""); setCategoryFilter(""); setDateFrom(""); setDateTo("");
  };

  /* ── active chips ── */
  const chips = [
    companyFilter  && { label: `Company: ${companyFilter}`,    onRemove: () => setCompanyFilter(""),  color: "#10b981" },
    idFilter       && { label: `ID: ${idFilter}`,              onRemove: () => setIdFilter(""),        color: "#3b82f6" },
    jobTypeFilter  && { label: `Type: ${jobTypeFilter}`,       onRemove: () => setJobTypeFilter(""),  color: "#f59e0b" },
    categoryFilter && { label: `Category: ${categoryFilter}`,  onRemove: () => setCategoryFilter(""), color: "#a78bfa" },
    dateFrom       && { label: `From: ${dateFrom}`,            onRemove: () => setDateFrom(""),        color: "#34d399" },
    dateTo         && { label: `To: ${dateTo}`,                onRemove: () => setDateTo(""),          color: "#34d399" },
  ].filter(Boolean);

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
            width: 38, height: 38, borderRadius: 10, background: "rgba(16,185,129,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Briefcase size={18} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>All Job Openings</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              {loading ? "Loading…" : `${filtered.length} of ${jobs.length} jobs`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Text search */}
          <div style={{ position: "relative", minWidth: 240 }}>
            <Search size={14} color="rgba(255,255,255,0.4)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search title, company, location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputBase, minWidth: 240 }}
            />
          </div>

          {/* Toggle filter panel */}
          <button
            onClick={() => setShowFilters(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 9, cursor: "pointer",
              background: activeCount > 0 ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)",
              border: activeCount > 0 ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.12)",
              color: activeCount > 0 ? "#10b981" : "rgba(255,255,255,0.7)",
              fontSize: 12, fontWeight: 600, transition: "all 0.2s",
            }}
          >
            <Filter size={13} />
            Filters
            {activeCount > 0 && (
              <span style={{
                background: "#10b981", color: "#022c22",
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
          background: activeCount > 0 ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
          border: activeCount > 0 ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14, padding: "14px 18px",
          display: "flex", flexDirection: "column", gap: 12,
          transition: "all 0.25s",
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>

            {/* Company filter */}
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
                    borderColor: companyFilter ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.1)",
                  }}
                />
                {companyFilter && (
                  <button onClick={() => setCompanyFilter("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 0 }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Job ID filter */}
            <div style={{ flex: "1 1 140px", minWidth: 120 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginBottom: 5 }}>JOB ID</div>
              <div style={{ position: "relative" }}>
                <Hash size={13} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="e.g. JOB-001…"
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

            {/* Job Type dropdown */}
            <div style={{ flex: "1 1 150px", minWidth: 130 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginBottom: 5 }}>JOB TYPE</div>
              <AdminSelectDropdown
                value={jobTypeFilter}
                onChange={setJobTypeFilter}
                options={JOB_TYPE_OPTIONS}
                placeholder="All job types"
                accentColor="#f59e0b"
                allLabel="All job types"
                icon={<Tag size={13} />}
                searchable={false}
              />
            </div>

            {/* Category dropdown */}
            <div style={{ flex: "1 1 150px", minWidth: 130 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", marginBottom: 5 }}>CATEGORY</div>
              <AdminSelectDropdown
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={CATEGORY_OPTIONS}
                placeholder="All categories"
                accentColor="#a78bfa"
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

          {/* Active filter chips */}
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

      {/* ── Jobs Grid ── */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Loading jobs…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
          {jobs.length === 0 ? "No jobs found." : "No jobs match the current filters."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {filtered.map(j => {
            const createdDate = j.created_at ? formatDate(j.created_at, "N/A") : "N/A";
            return (
              <div
                key={j.id}
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
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {j.is_flagged && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                        Flagged
                      </span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                      background: j.is_active ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.1)",
                      color: j.is_active ? "#10b981" : "rgba(255,255,255,0.4)",
                      border: `1px solid ${j.is_active ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.2)"}`,
                    }}>
                      {j.is_active ? "Active" : "Closed"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                  {j.category  && <span>Category: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{j.category}</strong></span>}
                  {j.job_type  && <span>Type: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{j.job_type}</strong></span>}
                  {j.salary_range && <span>Salary: <strong style={{ color: "rgba(255,255,255,0.7)" }}>{j.salary_range}</strong></span>}
                  {j.location  && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin size={11} /> {j.location}</span>}
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
