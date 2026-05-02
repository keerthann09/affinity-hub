import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AnimatedBackground from "./AnimatedBackground";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "", gender: "", bio: "", interests: "" });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
        interests: form.interests.split(",").map(i => i.trim()).filter(Boolean)
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/discover");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused) => ({
    width: "100%", padding: "14px 16px",
    background: "#111", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px", color: "#fff", fontSize: "15px",
    transition: "all 0.25s", boxSizing: "border-box"
  });

  const labelStyle = {
    color: "rgba(255,255,255,0.4)", fontSize: "12px",
    fontWeight: "600", letterSpacing: "0.8px",
    marginBottom: "8px", textTransform: "uppercase",
    display: "block"
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative"
    }}>
      <AnimatedBackground />

      <div style={{
        width: "100%", maxWidth: "380px",
        position: "relative", zIndex: 2,
        animation: "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: "56px", height: "56px",
            background: "linear-gradient(135deg, #ff2d55, #ff6535)",
            borderRadius: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", margin: "0 auto 16px",
            boxShadow: "0 8px 28px rgba(255,45,85,0.2)",
            animation: "floatY 3s ease-in-out infinite"
          }}>💕</div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>Create account</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", marginTop: "6px", fontSize: "14px" }}>Join Affinity Hub today</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input name="name" placeholder="John Doe" onChange={handleChange}
              style={inputStyle()}
              onFocus={e => { e.target.style.borderColor = "rgba(255,45,85,0.4)"; e.target.style.background = "rgba(255,45,85,0.03)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "#111"; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input name="email" type="email" placeholder="your@email.com" onChange={handleChange}
              style={inputStyle()}
              onFocus={e => { e.target.style.borderColor = "rgba(255,45,85,0.4)"; e.target.style.background = "rgba(255,45,85,0.03)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "#111"; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input name="password" type="password" placeholder="••••••••" onChange={handleChange}
              style={inputStyle()}
              onFocus={e => { e.target.style.borderColor = "rgba(255,45,85,0.4)"; e.target.style.background = "rgba(255,45,85,0.03)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "#111"; }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Age</label>
              <input name="age" placeholder="21" onChange={handleChange}
                style={inputStyle()}
                onFocus={e => { e.target.style.borderColor = "rgba(255,45,85,0.4)"; e.target.style.background = "rgba(255,45,85,0.03)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "#111"; }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Gender</label>
              <select name="gender" onChange={handleChange}
                style={{ ...inputStyle(), marginTop: 0 }}
                onFocus={e => { e.target.style.borderColor = "rgba(255,45,85,0.4)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <option value="" style={{ background: "#111" }}>Select</option>
                <option value="male" style={{ background: "#111" }}>Male</option>
                <option value="female" style={{ background: "#111" }}>Female</option>
                <option value="other" style={{ background: "#111" }}>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Bio</label>
            <textarea name="bio" placeholder="Tell something about yourself..." onChange={handleChange} rows={3}
              style={{ ...inputStyle(), resize: "none" }}
              onFocus={e => { e.target.style.borderColor = "rgba(255,45,85,0.4)"; e.target.style.background = "rgba(255,45,85,0.03)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "#111"; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Interests</label>
            <input name="interests" placeholder="Music, Travel, Gaming" onChange={handleChange}
              style={inputStyle()}
              onFocus={e => { e.target.style.borderColor = "rgba(255,45,85,0.4)"; e.target.style.background = "rgba(255,45,85,0.03)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "#111"; }}
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: "100%", padding: "15px",
              background: "#fff", borderRadius: "12px",
              color: "#000", fontSize: "15px", fontWeight: "700",
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1, marginTop: "4px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseOver={e => !loading && (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseOut={e => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {loading && <span style={{ width: "14px", height: "14px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#000", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "14px", paddingBottom: "8px" }}>
            Already have an account?{" "}
            <Link to="/" style={{ color: "#fff", fontWeight: "600" }}>Log in</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes meshMove1 { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(150px,60px) scale(1.1)} }
        @keyframes meshMove2 { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(-60px,-100px) scale(1.2)} }
        @keyframes particleFloat { 0%{transform:translateY(110vh) rotate(0deg);opacity:0} 5%{opacity:1} 95%{opacity:0.4} 100%{transform:translateY(-10vh) rotate(720deg);opacity:0} }
        @keyframes scanMove { 0%{background-position:0 0} 100%{background-position:0 100px} }
      `}</style>
    </div>
  );
}

export default Register;