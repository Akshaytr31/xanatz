import React, { useState, useEffect } from "react";
import { FileText, Save, CheckCircle, AlertCircle, Loader, Eye, EyeOff } from "lucide-react";
import api from "../../api";

const PrivacyPolicyEditor = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await api.get("privacy-policy/");
        setContent(response.data.content);
        setCharCount(response.data.content?.length || 0);
      } catch (err) {
        console.error("Failed to fetch privacy policy", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  const handleChange = (e) => {
    setContent(e.target.value);
    setCharCount(e.target.value.length);
    setMessage("");
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.post("privacy-policy/", { content });
      setMessage("success");
    } catch (err) {
      setMessage("error");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 60, gap: 10, color: "rgba(255,255,255,0.4)",
    }}>
      <Loader size={18} style={{ animation: "spin 1s linear infinite" }} />
      <span style={{ fontSize: 13 }}>Loading editor...</span>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      {/* Editor Card */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18,
        overflow: "hidden", backdropFilter: "blur(20px)",
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FileText size={14} color="#a5b4fc" />
            </div>
            <div>
              <div style={{ color: "white", fontSize: 14, fontWeight: 700, lineHeight: 1 }}>Privacy Policy</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 2 }}>
                {charCount.toLocaleString()} characters
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setPreview(!preview)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 9, cursor: "pointer",
                background: preview ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                border: preview ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.08)",
                color: preview ? "#a5b4fc" : "rgba(255,255,255,0.45)",
                fontSize: 12, fontWeight: 600, transition: "all 0.2s",
              }}
            >
              {preview ? <EyeOff size={13} /> : <Eye size={13} />}
              {preview ? "Edit" : "Preview"}
            </button>

            <button
              onClick={handleSave} disabled={saving}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 18px", borderRadius: 9, cursor: saving ? "not-allowed" : "pointer",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", color: "white", fontSize: 12, fontWeight: 700,
                opacity: saving ? 0.7 : 1, transition: "all 0.2s",
                boxShadow: saving ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
              }}
            >
              {saving
                ? <><Loader size={12} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
                : <><Save size={12} /> Save Policy</>
              }
            </button>
          </div>
        </div>

        {/* Editor / Preview */}
        {preview ? (
          <div style={{
            minHeight: 480, padding: "24px 28px",
            color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.8,
            whiteSpace: "pre-wrap", fontFamily: "Georgia, 'Times New Roman', serif",
          }}>
            {content || <span style={{ color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>Nothing to preview yet...</span>}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={handleChange}
            placeholder="Enter your Privacy Policy content here...

You can use plain text or markdown formatting.

## Section Title
Content goes here..."
            style={{
              width: "100%", minHeight: 480, padding: "20px 24px",
              background: "transparent", border: "none", outline: "none",
              color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.8,
              resize: "vertical", fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              display: "block",
            }}
          />
        )}

        {/* Status Bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.15)",
        }}>
          {message ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 7, fontSize: 12,
              color: message === "success" ? "#6ee7b7" : "#fca5a5",
              fontWeight: 600,
            }}>
              {message === "success"
                ? <><CheckCircle size={13} /> Privacy policy saved successfully!</>
                : <><AlertCircle size={13} /> Failed to save. Please try again.</>
              }
            </div>
          ) : (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
              {preview ? "Preview mode" : "Plain text / Markdown supported"}
            </span>
          )}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            {content.split("\n").length} lines
          </span>
        </div>
      </div>

      {/* Info box */}
      <div style={{
        display: "flex", gap: 12, padding: "14px 16px", borderRadius: 12,
        background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)",
      }}>
        <FileText size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ color: "#a5b4fc", fontSize: 12, fontWeight: 600, marginBottom: 3 }}>
            Where is this displayed?
          </div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, lineHeight: 1.5 }}>
            This privacy policy is shown to users during the registration process and is available at
            the privacy policy link in the footer.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyEditor;
