import React, { useState, useEffect } from "react";
import { Plus, Edit2, Check, X, AlertCircle, Sparkles, ToggleLeft, ToggleRight, Loader } from "lucide-react";
import api from "../../api";

/* ─── Shared Styles ──────────────────────────────────────────── */
const card = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16, backdropFilter: "blur(20px)",
};

const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, color: "white", fontSize: 13, padding: "10px 14px", outline: "none",
  fontFamily: "inherit", transition: "border-color 0.2s",
};

const labelStyle = {
  fontSize: 10, fontWeight: 700, letterSpacing: "1.5px",
  color: "rgba(255,255,255,0.35)", marginBottom: 6, display: "block",
};

/* ─── Plan Card ──────────────────────────────────────────────── */
const PlanCard = ({ plan, onEdit, isEditing }) => (
  <div
    style={{
      ...card,
      padding: "18px 20px",
      border: isEditing ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.07)",
      boxShadow: isEditing ? "0 0 20px rgba(99,102,241,0.1)" : "none",
      transition: "all 0.25s",
      position: "relative", overflow: "hidden",
    }}
  >
    {/* Glow accent */}
    {isEditing && (
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
      }} />
    )}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{plan.display_name}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
            background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.5px",
          }}>
            {plan.name}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, letterSpacing: "0.5px",
            background: plan.is_active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
            color: plan.is_active ? "#10b981" : "#ef4444",
            border: plan.is_active ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)",
          }}>
            {plan.is_active ? "● ACTIVE" : "○ INACTIVE"}
          </span>
        </div>

        {/* Price & Limits */}
        <div style={{ display: "flex", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#a5b4fc", lineHeight: 1 }}>
              AED {plan.price}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>price</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{plan.max_jobs}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>max jobs</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{plan.job_duration_days}d</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>duration</div>
          </div>
        </div>

        {plan.description && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "6px 0", lineHeight: 1.5 }}>
            {plan.description}
          </p>
        )}

        {/* Features */}
        {plan.features?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {plan.features.map((feat, i) => (
              <span key={i} style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 10, color: "rgba(255,255,255,0.6)",
                background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 8px",
              }}>
                <Check size={8} color="#6366f1" /> {feat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Edit Button */}
      <button
        onClick={() => onEdit(plan)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 14px", borderRadius: 8, cursor: "pointer",
          background: isEditing ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
          border: isEditing ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
          color: isEditing ? "#a5b4fc" : "rgba(255,255,255,0.5)",
          fontSize: 11, fontWeight: 700, transition: "all 0.2s", flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.15)"; e.currentTarget.style.color = "#a5b4fc"; }}
        onMouseLeave={e => {
          if (!isEditing) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }
        }}
      >
        <Edit2 size={12} /> EDIT
      </button>
    </div>
  </div>
);

/* ─── Form Field ─────────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

/* ─── PlanManager ────────────────────────────────────────────── */
const PlanManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingPlanId, setEditingPlanId] = useState(null);

  const [form, setForm] = useState({
    name: "", display_name: "", price: "", max_jobs: "",
    job_duration_days: "", description: "", featuresText: "", is_active: true,
  });

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get("plans/");
      setPlans(res.data);
    } catch (err) {
      setError("Failed to load plans from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlanId(plan.id);
    setError(""); setSuccess("");
    setForm({
      name: plan.name, display_name: plan.display_name,
      price: plan.price.toString(), max_jobs: plan.max_jobs.toString(),
      job_duration_days: plan.job_duration_days.toString(),
      description: plan.description || "",
      featuresText: (plan.features || []).join("\n"),
      is_active: plan.is_active,
    });
    setTimeout(() => document.getElementById("plan-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleCancelEdit = () => { setEditingPlanId(null); clearForm(); };
  const clearForm = () => setForm({ name: "", display_name: "", price: "", max_jobs: "", job_duration_days: "", description: "", featuresText: "", is_active: true });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => {
      const updated = { ...p, [name]: value };
      if (name === "display_name" && !editingPlanId) {
        updated.name = value.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-");
      }
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    const rawSlug = form.name || form.display_name;
    const features = form.featuresText.split("\n").map(l => l.trim()).filter(Boolean);
    const payload = {
      name: rawSlug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-"),
      display_name: form.display_name,
      price: parseFloat(form.price) || 0,
      max_jobs: parseInt(form.max_jobs) || 1,
      job_duration_days: parseInt(form.job_duration_days) || 30,
      description: form.description, features, is_active: form.is_active,
    };
    try {
      if (editingPlanId) {
        await api.put(`plans/${editingPlanId}/`, payload);
        setSuccess("Plan updated successfully!");
      } else {
        await api.post("plans/", payload);
        setSuccess("New plan created successfully!");
      }
      clearForm(); setEditingPlanId(null); fetchPlans();
    } catch (err) {
      setError(err.response?.data?.name?.[0] || err.response?.data?.detail || "Failed to save plan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, gap: 10, color: "rgba(255,255,255,0.4)" }}>
      <Loader size={18} style={{ animation: "spin 1s linear infinite" }} />
      <span style={{ fontSize: 13 }}>Loading plans...</span>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}
      className="plan-manager-grid">
      {/* LEFT: Plan List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 4,
        }}>
          <div>
            <h2 style={{ color: "white", fontSize: 15, fontWeight: 700, margin: 0 }}>
              Active Plans <span style={{ color: "#6366f1" }}>({plans.length})</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "4px 0 0" }}>
              Click Edit on any plan to modify it in the form panel.
            </p>
          </div>
        </div>

        {plans.length === 0 ? (
          <div style={{
            ...card, padding: 40, textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}>
            <Sparkles size={28} color="rgba(255,255,255,0.2)" />
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>No plans configured yet.</p>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, margin: 0 }}>Use the form to create your first plan.</p>
          </div>
        ) : (
          plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} onEdit={handleEdit} isEditing={editingPlanId === plan.id} />
          ))
        )}
      </div>

      {/* RIGHT: Form */}
      <div id="plan-form" style={{ position: "sticky", top: 20 }}>
        <div style={{ ...card, padding: "24px 22px" }}>
          {/* Form header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
            paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {editingPlanId ? <Edit2 size={14} color="#a5b4fc" /> : <Plus size={14} color="#a5b4fc" />}
            </div>
            <div>
              <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>
                {editingPlanId ? "Edit Plan" : "Create Plan"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 1 }}>
                {editingPlanId ? "Modify plan parameters" : "Add a new subscription package"}
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div style={{
              display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", borderRadius: 10, marginBottom: 14,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 12,
            }}>
              <AlertCircle size={13} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}
          {success && (
            <div style={{
              display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", borderRadius: 10, marginBottom: 14,
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#6ee7b7", fontSize: 12,
            }}>
              <Check size={13} style={{ flexShrink: 0 }} /> {success}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="PLAN NAME *">
              <input
                style={inputStyle} name="display_name" value={form.display_name} onChange={handleChange}
                placeholder="e.g. Enterprise Plan" required
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Field label="PRICE (AED) *">
                <input
                  style={inputStyle} type="number" name="price" value={form.price} onChange={handleChange}
                  placeholder="0" required
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </Field>
              <Field label="MAX JOBS *">
                <input
                  style={inputStyle} type="number" name="max_jobs" value={form.max_jobs} onChange={handleChange}
                  placeholder="5" required
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </Field>
              <Field label="DURATION (DAYS) *">
                <input
                  style={inputStyle} type="number" name="job_duration_days" value={form.job_duration_days}
                  onChange={handleChange} placeholder="30" required
                  onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </Field>
            </div>

            <Field label="DESCRIPTION">
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Who is this plan for?" rows={2}
                style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </Field>

            <Field label="FEATURES (ONE PER LINE)">
              <textarea
                name="featuresText" value={form.featuresText} onChange={handleChange}
                placeholder={"Post up to 5 jobs\nJobs active for 30 days\nPremium support"} rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </Field>

            {/* Status Toggle */}
            <Field label="STATUS">
              <div style={{ display: "flex", gap: 8 }}>
                {[{ val: true, label: "Active" }, { val: false, label: "Inactive" }].map(({ val, label }) => (
                  <button
                    key={String(val)} type="button"
                    onClick={() => setForm(p => ({ ...p, is_active: val }))}
                    style={{
                      flex: 1, padding: "9px 12px", borderRadius: 9, cursor: "pointer",
                      border: form.is_active === val
                        ? `1px solid ${val ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`
                        : "1px solid rgba(255,255,255,0.07)",
                      background: form.is_active === val
                        ? (val ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)")
                        : "rgba(255,255,255,0.03)",
                      color: form.is_active === val
                        ? (val ? "#6ee7b7" : "#fca5a5")
                        : "rgba(255,255,255,0.35)",
                      fontSize: 12, fontWeight: 600, transition: "all 0.2s",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                type="submit" disabled={saving}
                style={{
                  flex: 1, padding: "11px", borderRadius: 10, cursor: saving ? "not-allowed" : "pointer",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  border: "none", color: "white", fontSize: 13, fontWeight: 700,
                  opacity: saving ? 0.7 : 1, transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
                }}
              >
                {saving ? <><Loader size={13} style={{ animation: "spin 1s linear infinite" }} /> Saving...</> : (editingPlanId ? "Update Plan" : "Create Plan")}
              </button>
              {editingPlanId && (
                <button
                  type="button" onClick={handleCancelEdit}
                  style={{
                    padding: "11px 16px", borderRadius: 10, cursor: "pointer",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media (max-width: 900px) {
          .plan-manager-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default PlanManager;
