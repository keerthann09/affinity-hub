import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AnimatedBackground from "./AnimatedBackground";

function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/"); return; }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    setForm({
      name: parsed.name || "",
      bio: parsed.bio || "",
      age: parsed.age || "",
      gender: parsed.gender || "",
      interests: Array.isArray(parsed.interests) ? parsed.interests.join(", ") : parsed.interests || ""
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(
        "https://affinity-hub.onrender.com/api/auth/profile",
        { ...form, age: Number(form.age), interests: form.interests.split(",").map(i => i.trim()).filter(Boolean) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert("Failed to save. Please try again.");
    }
    setSaving(false);
  };

  if (!user) return null;

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,45,85,0.3)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "15px",
    marginTop: "8px",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #060608 0%, #0f0610 50%, #060608 100%)",
      paddingBottom: "80px",
      position: "relative"
    }}>
      <AnimatedBackground />

      {/* Header */}
      <div style={{
        padding: "20px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(6,6,8,0.8)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <h1 style={{
          fontSize: "20px", fontWeight: "800",
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, #ff2d55, #ff6b35)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>💕 My Profile</h1>

        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          style={{
            padding: "9px 20px",
            background: editing ? "linear-gradient(135deg, #ff2d55, #ff6b35)" : "transparent",
            border: editing ? "none" : "1px solid rgba(255,45,85,0.4)",
            borderRadius: "20px",
            color: editing ? "#fff" : "#ff2d55",
            fontWeight: "700", fontSize: "13px",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: editing ? "0 4px 16px rgba(255,45,85,0.3)" : "none",
            transition: "all 0.2s"
          }}>
          {saving ? "Saving..." : editing ? "💾 Save" : "✏️ Edit"}
        </button>
      </div>

      <div style={{ padding: "24px", maxWidth: "480px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Success Toast */}
        {saved && (
          <div style={{
            background: "rgba(0,200,83,0.1)", border: "1px solid rgba(0,200,83,0.3)",
            borderRadius: "14px", padding: "14px 18px",
            color: "#00c853", textAlign: "center",
            marginBottom: "20px", fontSize: "14px", fontWeight: "600",
            animation: "fadeInUp 0.3s ease",
            backdropFilter: "blur(10px)"
          }}>
            ✅ Profile updated successfully!
          </div>
        )}

        {/* Profile Card */}
        <div className="glass-card" style={{ marginBottom: "20px", overflow: "hidden", padding: 0 }}>
          {/* Cover */}
          <div style={{
            height: "140px",
            background: "linear-gradient(135deg, #ff2d55 0%, #ff6b35 100%)",
            position: "relative", overflow: "hidden",
            borderRadius:"16px 16px 0 0"
          }}>
            <div style={{
              position: "absolute", width: "200px", height: "200px",
              borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)",
              top: "-80px", right: "-40px"
            }} />
            <div style={{
              position: "absolute", width: "120px", height: "120px",
              borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)",
              bottom: "-40px", left: "20px"
            }} />
          </div>

          {/* Avatar */}
          <div style={{ textAlign: "center", marginTop: "-48px", paddingBottom: "24px" }}>
            <div style={{
              width: "96px", height: "96px", borderRadius: "50%",
              background: "rgba(15,6,16,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "44px", margin: "0 auto",
              border: "4px solid rgba(255,45,85,0.4)",
              boxShadow: "0 0 24px rgba(255,45,85,0.2)"
            }}>
              {user.gender === "female" ? "👩" : "👨"}
            </div>
            <h2 style={{
              fontSize: "22px", fontWeight: "800",
              fontFamily: "'Playfair Display', serif",
              marginTop: "12px"
            }}>{user.name}</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", marginTop: "2px" }}>{user.email}</p>

            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "12px" }}>
              <span className="tag" style={{ fontSize: "12px" }}>🎂 {user.age} yrs</span>
              <span className="tag" style={{ fontSize: "12px", textTransform: "capitalize" }}>⚧ {user.gender}</span>
            </div>
          </div>
        </div>

        {/* Info / Edit Form */}
        <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {[
            { label: "👤 FULL NAME", key: "name", type: "text", placeholder: "Your name" },
            { label: "🎂 AGE", key: "age", type: "number", placeholder: "Your age" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px" }}>
                {label}
              </label>
              {editing ? (
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              ) : (
                <p style={{ color: "#fff", fontSize: "16px", marginTop: "6px", fontWeight: "500" }}>
                  {user[key] || <span style={{ color: "rgba(255,255,255,0.2)" }}>Not set</span>}
                </p>
              )}
            </div>
          ))}

          <div>
            <label style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px" }}>
              ⚧ GENDER
            </label>
            {editing ? (
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={{ ...inputStyle }}>
                <option value="male" style={{ background: "#0f0f14" }}>Male</option>
                <option value="female" style={{ background: "#0f0f14" }}>Female</option>
                <option value="other" style={{ background: "#0f0f14" }}>Other</option>
              </select>
            ) : (
              <p style={{ color: "#fff", fontSize: "16px", marginTop: "6px", textTransform: "capitalize", fontWeight: "500" }}>
                {user.gender}
              </p>
            )}
          </div>

          <div>
            <label style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px" }}>
              📝 BIO
            </label>
            {editing ? (
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                rows={3}
                placeholder="Tell something about yourself..."
                style={{ ...inputStyle, resize: "none" }}
              />
            ) : (
              <p style={{ color: "#fff", fontSize: "15px", marginTop: "6px", lineHeight: "1.7", fontWeight: "400" }}>
                {user.bio || <span style={{ color: "rgba(255,255,255,0.2)" }}>No bio yet</span>}
              </p>
            )}
          </div>

          <div>
            <label style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px" }}>
              🎯 INTERESTS
            </label>
            {editing ? (
              <input
                value={form.interests}
                onChange={e => setForm({ ...form, interests: e.target.value })}
                placeholder="Music, Travel, Gaming"
                style={inputStyle}
              />
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                {(Array.isArray(user.interests) ? user.interests : []).map((interest, i) => (
                  <span key={i} className="tag">#{interest}</span>
                ))}
                {(!user.interests || user.interests.length === 0) && (
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>No interests added</span>
                )}
              </div>
            )}
          </div>

          {editing && (
            <button
              onClick={() => setEditing(false)}
              style={{
                padding: "12px", background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px",
                color: "rgba(255,255,255,0.4)", fontSize: "15px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif"
              }}>Cancel</button>
          )}
        </div>

        {/* Action Buttons */}
        {!editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
            <Link to="/discover" style={{
              display: "block", textAlign: "center", padding: "16px",
              background: "linear-gradient(135deg, #ff2d55, #ff6b35)",
              borderRadius: "16px", color: "#fff",
              fontWeight: "700", fontSize: "15px",
              textDecoration: "none",
              boxShadow: "0 8px 28px rgba(255,45,85,0.3)",
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif"
            }}>🔥 Discover People</Link>

            <Link to="/matches" className="glass-card" style={{
              display: "block", textAlign: "center", padding: "16px",
              color: "rgba(255,255,255,0.7)", fontWeight: "600", fontSize: "15px",
              textDecoration: "none", borderRadius: "16px",
              fontFamily: "'DM Sans', sans-serif"
            }}>❤️ Your Matches</Link>

            <button
              onClick={() => { localStorage.clear(); navigate("/"); }}
              style={{
                padding: "16px", background: "rgba(255,0,0,0.05)",
                border: "1px solid rgba(255,0,0,0.15)",
                borderRadius: "16px", color: "#ff4444",
                fontSize: "15px", cursor: "pointer", fontWeight: "600",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s"
              }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(255,0,0,0.1)"}
              onMouseOut={e => e.currentTarget.style.background = "rgba(255,0,0,0.05)"}
            >🚪 Logout</button>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <button className="nav-btn" onClick={() => navigate("/discover")}>🔥</button>
        <button className="nav-btn" onClick={() => navigate("/matches")}>❤️</button>
        <button className="nav-btn active" onClick={() => navigate("/profile")}>👤</button>
      </div>

      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

export default Profile;