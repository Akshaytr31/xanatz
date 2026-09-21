import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

/**
 * AdminSelectDropdown
 * A premium custom select dropdown for the admin panel.
 *
 * Props:
 *   value        – current selected value (string)
 *   onChange     – (value: string) => void
 *   options      – [{ value, label }]  (or plain strings for simple lists)
 *   placeholder  – string shown when nothing selected
 *   accentColor  – hex/rgba for the active accent (default #10b981)
 *   allLabel     – label for the "clear / all" option (default "All")
 *   icon         – optional lucide icon element shown as prefix inside trigger
 *   searchable   – show a search box inside the dropdown (default true when > 6 options)
 */
const AdminSelectDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  accentColor = "#10b981",
  allLabel = "All",
  icon = null,
  searchable,
}) => {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const containerRef          = useRef(null);

  // normalise options to { value, label }
  const normalized = options.map(o =>
    typeof o === "string" ? { value: o, label: o } : o
  );

  const showSearch = searchable !== undefined ? searchable : normalized.length > 6;

  const filtered = query.trim()
    ? normalized.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : normalized;

  const selectedLabel = normalized.find(o => o.value === value)?.label;

  // close on outside click
  useEffect(() => {
    const handler = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (val) => {
    onChange(val);
    setOpen(false);
    setQuery("");
  };

  const isActive = !!value;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 10,
          border: isActive
            ? `1px solid ${accentColor}70`
            : "1px solid rgba(255,255,255,0.1)",
          background: isActive
            ? `linear-gradient(135deg, ${accentColor}18, ${accentColor}08)`
            : "rgba(0,0,0,0.3)",
          color: isActive ? accentColor : "rgba(255,255,255,0.5)",
          fontSize: 12,
          fontWeight: isActive ? 700 : 500,
          cursor: "pointer",
          outline: "none",
          textAlign: "left",
          transition: "all 0.2s",
          boxShadow: isActive ? `0 0 0 1px ${accentColor}30, 0 4px 14px ${accentColor}15` : "none",
        }}
      >
        {/* prefix icon */}
        {icon && (
          <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.4, color: isActive ? accentColor : "white" }}>
            {icon}
          </span>
        )}

        {/* label */}
        <span style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: isActive ? accentColor : "rgba(255,255,255,0.45)",
        }}>
          {selectedLabel || placeholder}
        </span>

        {/* clear × when active */}
        {isActive ? (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); select(""); }}
            style={{ flexShrink: 0, color: accentColor, opacity: 0.7, display: "flex", alignItems: "center" }}
          >
            <X size={12} />
          </span>
        ) : (
          <ChevronDown
            size={13}
            style={{
              flexShrink: 0,
              opacity: 0.4,
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        )}
      </button>

      {/* ── Floating panel ── */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 9999,
            borderRadius: 12,
            border: `1px solid rgba(255,255,255,0.1)`,
            background: "linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(17,28,52,0.98) 100%)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
            overflow: "hidden",
            animation: "ddSlideIn 0.15s ease both",
          }}
        >
          <style>{`
            @keyframes ddSlideIn {
              from { opacity: 0; transform: translateY(-6px) scale(0.98); }
              to   { opacity: 1; transform: translateY(0)   scale(1); }
            }
          `}</style>

          {/* Search inside panel */}
          {showSearch && (
            <div style={{
              padding: "10px 10px 8px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ position: "relative" }}>
                <Search size={12} color="rgba(255,255,255,0.3)"
                  style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search…"
                  style={{
                    width: "100%",
                    padding: "6px 10px 6px 28px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 7,
                    color: "white",
                    fontSize: 11,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          )}

          {/* Option list */}
          <div style={{ maxHeight: 220, overflowY: "auto", padding: "6px 6px" }}>
            {/* "All" option */}
            <button
              type="button"
              onClick={() => select("")}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                background: !value ? `${accentColor}20` : "transparent",
                border: "none",
                color: !value ? accentColor : "rgba(255,255,255,0.4)",
                fontSize: 12,
                fontWeight: !value ? 700 : 500,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "background 0.15s",
                marginBottom: 2,
              }}
              onMouseEnter={e => { if (value) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (value) e.currentTarget.style.background = "transparent"; }}
            >
              <span>{allLabel}</span>
              {!value && <Check size={12} />}
            </button>

            {filtered.length === 0 && (
              <div style={{ padding: "10px 12px", color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "center" }}>
                No options found
              </div>
            )}

            {filtered.map(opt => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => select(opt.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: isSelected ? `${accentColor}20` : "transparent",
                    border: "none",
                    color: isSelected ? accentColor : "rgba(255,255,255,0.75)",
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    transition: "background 0.15s",
                    marginBottom: 2,
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {opt.label}
                  </span>
                  {isSelected && <Check size={12} style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSelectDropdown;
