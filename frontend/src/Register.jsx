import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AnimatedBackground from "./AnimatedBackground";

const inputStyle = {
  width: "100%",
  padding: "13px 18px",
  marginTop: "8px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  color: "#fff",
  fontSize: "15px",
  fontFamily: "'DM Sans', sans-serif",
  transition: "all 0.3s ease",
  boxSizing: "border-box"
};

const labelStyle = {
  color: "rgba(255,255,255,0.45)",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "1px",
  textTransform: "uppercase"
};

function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    age: "", gender: "", bio: "", interests: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.age || !form.gender) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("https://affinity-hub.onrender.com/api/auth/register", {
        ...form,
        age: Number(form.age),
        interests: form.interests.split(",").map(i => i.trim())
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/discover");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #060608 0%, #0f0610 50%, #060608 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      position: "relative"
    }}>
      <AnimatedBackground />

      <div style={{
        width: "100%",
        maxWidth: "420px",
        position: "relative",
        zIndex: 1,
        animation: "fadeInUp 0.6s ease forwards"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "52px", marginBottom: "10px", display: "inline-block", animation: "heartbeat 1.5s ease-in-out infinite" }}>💕</div>
          <h1 style={{
            fontSize: "34px",
            fontWeight: "800",
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, #ff2d55 0%, #ff6b35 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Affinity Hub</h1>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: "36px" }}>
          <div style={{
            position: "absolute",
            top: "-1px", left: "20%", right: "20%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(255,45,85,0.6), transparent)"
          }} />

          <h2 style={{
            marginBottom: "24px",
            fontSize: "24px",
            fontWeight: "700",
            fontFamily: "'Playfair Display', serif"
          }}>Create Account ✨</h2>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Full Name</label>
            <input name="name" placeholder="John Doe" onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Email</label>
            <input name="email" type="email" placeholder="your@email.com" onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Password</label>
            <input name="password" type="password" placeholder="••••••••" onChange={handleChange} style={inputStyle} />
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Age</label>
              <input name="age" placeholder="21" onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Gender</label>
              <select name="gender" onChange={handleChange} style={{ ...inputStyle, marginTop: "8px" }}>
                <option value="" style={{ background: "#0f0f14" }}>Select</option>
                <option value="male" style={{ background: "#0f0f14" }}>Male</option>
                <option value="female" style={{ background: "#0f0f14" }}>Female</option>
                <option value="other" style={{ background: "#0f0f14" }}>Other</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Bio</label>
            <textarea
              name="bio"
              placeholder="Tell something about yourself..."
              onChange={handleChange}
              rows={3}
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={labelStyle}>Interests (comma separated)</label>
            <input name="interests" placeholder="Music, Travel, Gaming" onChange={handleChange} style={inputStyle} />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span style={{
                  width: "16px", height: "16px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite"
                }} />
                Creating account...
              </span>
            ) : "Create Account 🎉"}
          </button>

          <p style={{ textAlign: "center", marginTop: "20px", color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
            Already have account?{" "}
            <Link to="/" style={{ color: "#ff2d55", fontWeight: "700" }}>Login</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.2); }
          28% { transform: scale(1); }
          42% { transform: scale(1.15); }
          70% { transform: scale(1); }
        }
        input:focus, textarea:focus, select:focus {
          border-color: rgba(255,45,85,0.5) !important;
          background: rgba(255,45,85,0.05) !important;
          box-shadow: 0 0 0 3px rgba(255,45,85,0.1) !important;
        }
      `}</style>
    </div>
  );
}

export default Register;