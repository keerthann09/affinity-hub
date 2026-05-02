import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

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
      interests: Array.isArray(parsed.interests)
        ? parsed.interests.join(", ")
        : parsed.interests || ""
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(
        "https://affinity-hub.onrender.com/api/auth/profile",
        {
          ...form,
          age: Number(form.age),
          interests: form.interests.split(",").map(i => i.trim()).filter(Boolean)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Failed to save. Please try again.");
    }
    setSaving(false);
  };

  if (!user) return null;

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    background: "#0a0a0a",
    border: "1px solid #fd5068",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "15px",
    marginTop: "6px",
    boxSizing: "border-box"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      paddingBottom: "80px"
    }}>

      {/* Header */}
      <div style={{
        padding: "20px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid #1a1a1a",
        position: "sticky", top: 0, zIndex: 10,
        background: "#0a0a0a"
      }}>
        <h1 style={{
          fontSize: "22px", fontWeight: "800",
          background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>💕 My Profile</h1>

        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          style={{
            padding: "8px 18px",
            background: editing
              ? "linear-gradient(135deg, #fd5068, #ff8c5a)"
              : "transparent",
            border: editing ? "none" : "1px solid #fd5068",
            borderRadius: "20px",
            color: editing ? "#fff" : "#fd5068",
            fontWeight: "700", fontSize: "14px",
            cursor: "pointer"
          }}>
          {saving ? "Saving..." : editing ? "💾 Save" : "✏️ Edit"}
        </button>
      </div>

      <div style={{ padding: "24px", maxWidth: "480px", margin: "0 auto" }}>

        {/* Success Toast */}
        {saved && (
          <div style={{
            background: "#00c85320", border: "1px solid #00c853",
            borderRadius: "12px", padding: "12px 16px",
            color: "#00c853", textAlign: "center",
            marginBottom: "20px", fontSize: "14px", fontWeight: "600"
          }}>
            ✅ Profile updated successfully!
          </div>
        )}

        {/* Profile Card */}
        <div style={{
          background: "#1a1a1a", borderRadius: "24px",
          overflow: "hidden", border: "1px solid #2a2a2a",
          marginBottom: "20px"
        }}>
          {/* Cover */}
          <div style={{
            height: "100px",
            background: "linear-gradient(135deg, #fd5068, #ff8c5a)"
          }} />

          {/* Avatar */}
          <div style={{ textAlign: "center", marginTop: "-45px", paddingBottom: "20px" }}>
            <div style={{
              width: "90px", height: "90px", borderRadius: "50%",
              background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "40px", margin: "0 auto",
              border: "4px solid #0a0a0a"
            }}>
              {user.gender === "female" ? "👩" : "👨"}
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", marginTop: "10px" }}>
              {user.name}
            </h2>
            <p style={{ color: "#888", fontSize: "13px" }}>{user.email}</p>

            {/* Tags */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "10px" }}>
              <span style={{
                background: "#fd506820", color: "#fd5068",
                padding: "4px 12px", borderRadius: "20px", fontSize: "12px"
              }}>
                🎂 {user.age} yrs
              </span>
              <span style={{
                background: "#fd506820", color: "#fd5068",
                padding: "4px 12px", borderRadius: "20px", fontSize: "12px",
                textTransform: "capitalize"
              }}>
                ⚧ {user.gender}
              </span>
            </div>
          </div>
        </div>

        {/* Edit / View Form */}
        <div style={{
          background: "#1a1a1a", borderRadius: "20px",
          padding: "24px", border: "1px solid #2a2a2a",
          display: "flex", flexDirection: "column", gap: "18px"
        }}>

          {/* Name */}
          <div>
            <label style={{ color: "#888", fontSize: "12px", fontWeight: "600", letterSpacing: "1px" }}>
              👤 FULL NAME
            </label>
            {editing ? (
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
              />
            ) : (
              <p style={{ color: "#fff", fontSize: "16px", marginTop: "6px" }}>{user.name}</p>
            )}
          </div>

          {/* Age */}
          <div>
            <label style={{ color: "#888", fontSize: "12px", fontWeight: "600", letterSpacing: "1px" }}>
              🎂 AGE
            </label>
            {editing ? (
              <input
                type="number"
                value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })}
                style={inputStyle}
              />
            ) : (
              <p style={{ color: "#fff", fontSize: "16px", marginTop: "6px" }}>{user.age}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label style={{ color: "#888", fontSize: "12px", fontWeight: "600", letterSpacing: "1px" }}>
              ⚧ GENDER
            </label>
            {editing ? (
              <select
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
                style={inputStyle}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p style={{ color: "#fff", fontSize: "16px", marginTop: "6px", textTransform: "capitalize" }}>
                {user.gender}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label style={{ color: "#888", fontSize: "12px", fontWeight: "600", letterSpacing: "1px" }}>
              📝 BIO
            </label>
            {editing ? (
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                rows={3}
                placeholder="Tell something about yourself..."
                style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
              />
            ) : (
              <p style={{ color: "#fff", fontSize: "15px", marginTop: "6px", lineHeight: "1.6" }}>
                {user.bio || <span style={{ color: "#555" }}>No bio yet</span>}
              </p>
            )}
          </div>

          {/* Interests */}
          <div>
            <label style={{ color: "#888", fontSize: "12px", fontWeight: "600", letterSpacing: "1px" }}>
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                {(Array.isArray(user.interests) ? user.interests : []).map((interest, i) => (
                  <span key={i} style={{
                    background: "#2a2a2a", color: "#fd5068",
                    padding: "6px 14px", borderRadius: "20px", fontSize: "13px"
                  }}>#{interest}</span>
                ))}
                {(!user.interests || user.interests.length === 0) && (
                  <span style={{ color: "#555" }}>No interests added</span>
                )}
              </div>
            )}
          </div>

          {/* Cancel button when editing */}
          {editing && (
            <button
              onClick={() => setEditing(false)}
              style={{
                padding: "12px", background: "transparent",
                border: "1px solid #2a2a2a", borderRadius: "12px",
                color: "#888", fontSize: "15px", cursor: "pointer"
              }}>
              Cancel
            </button>
          )}
        </div>

        {/* Action Buttons */}
        {!editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
            <Link to="/discover" style={{
              display: "block", textAlign: "center", padding: "15px",
              background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
              borderRadius: "14px", color: "#fff",
              fontWeight: "700", fontSize: "16px",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(253,80,104,0.3)"
            }}>
              🔥 Discover People
            </Link>

            <Link to="/matches" style={{
              display: "block", textAlign: "center", padding: "15px",
              background: "transparent",
              border: "1px solid #2a2a2a",
              borderRadius: "14px", color: "#fff",
              fontWeight: "600", fontSize: "16px",
              textDecoration: "none"
            }}>
              ❤️ Your Matches
            </Link>

            <button
              onClick={() => { localStorage.clear(); navigate("/"); }}
              style={{
                padding: "15px", background: "transparent",
                border: "1px solid #ff000040",
                borderRadius: "14px", color: "#ff4444",
                fontSize: "16px", cursor: "pointer", fontWeight: "600"
              }}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#1a1a1a", borderTop: "1px solid #2a2a2a",
        display: "flex", justifyContent: "space-around", padding: "14px 0"
      }}>
        <button onClick={() => navigate("/discover")}
          style={{ background: "none", border: "none", fontSize: "26px", cursor: "pointer" }}>🔥</button>
        <button onClick={() => navigate("/matches")}
          style={{ background: "none", border: "none", fontSize: "26px", cursor: "pointer" }}>❤️</button>
        <button onClick={() => navigate("/profile")}
          style={{ background: "none", border: "none", fontSize: "26px", cursor: "pointer",
            filter: "drop-shadow(0 0 8px #fd5068)" }}>👤</button>
      </div>
    </div>
  );
}

export default Profile;