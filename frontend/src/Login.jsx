import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AnimatedBackground from "./AnimatedBackground";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post("https://affinity-hub.onrender.com/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/discover");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative"
    }}>
      <AnimatedBackground />

      <div style={{
        width: "100%",
        maxWidth: "380px",
        position: "relative",
        zIndex: 2,
        animation: "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{
            width: "64px", height: "64px",
            background: "linear-gradient(135deg, #ff2d55, #ff6535)",
            borderRadius: "18px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px",
            margin: "0 auto 20px",
            boxShadow: "0 8px 32px rgba(255,45,85,0.25)",
            animation: "floatY 3s ease-in-out infinite"
          }}>💕</div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "800",
            letterSpacing: "-0.5px",
            color: "#fff"
          }}>Affinity Hub</h1>
          <p style={{
            color: "rgba(255,255,255,0.35)",
            marginTop: "6px",
            fontSize: "14px"
          }}>Find your perfect match</p>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: "600", letterSpacing: "0.8px", marginBottom: "8px", textTransform: "uppercase" }}>Email</p>
            <input
              type="email"
              placeholder="your@email.com"
              onChange={e => setEmail(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleLogin()}
              className="input"
              style={{
                width: "100%", padding: "14px 16px",
                background: "#111", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", color: "#fff", fontSize: "15px",
                transition: "all 0.25s"
              }}
              onFocus={e => { e.target.style.borderColor = "rgba(255,45,85,0.4)"; e.target.style.background = "rgba(255,45,85,0.03)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "#111"; }}
            />
          </div>

          <div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: "600", letterSpacing: "0.8px", marginBottom: "8px", textTransform: "uppercase" }}>Password</p>
            <input
              type="password"
              placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", padding: "14px 16px",
                background: "#111", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", color: "#fff", fontSize: "15px",
                transition: "all 0.25s"
              }}
              onFocus={e => { e.target.style.borderColor = "rgba(255,45,85,0.4)"; e.target.style.background = "rgba(255,45,85,0.03)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "#111"; }}
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "15px",
            background: "#fff", borderRadius: "12px",
            color: "#000", fontSize: "15px", fontWeight: "700",
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}
          onMouseOver={e => !loading && (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseOut={e => (e.currentTarget.style.transform = "translateY(0)")}
        >
          {loading && (
            <span style={{
              width: "14px", height: "14px",
              border: "2px solid rgba(0,0,0,0.2)",
              borderTopColor: "#000",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.7s linear infinite"
            }} />
          )}
          {loading ? "Logging in..." : "Log in"}
        </button>

        <div style={{
          display: "flex", alignItems: "center", gap: "16px",
          margin: "24px 0"
        }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
        </div>

        <Link to="/register" style={{
          display: "block", width: "100%", padding: "15px",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px", color: "#fff",
          fontSize: "15px", fontWeight: "600",
          textAlign: "center", textDecoration: "none",
          transition: "all 0.2s"
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "transparent"; }}
        >
          Create new account
        </Link>

        <p style={{
          textAlign: "center", marginTop: "32px",
          color: "rgba(255,255,255,0.15)", fontSize: "11px",
          letterSpacing: "1.5px", textTransform: "uppercase"
        }}>✦ Love is just a swipe away ✦</p>
      </div>

      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes meshMove1 { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(100px,80px) scale(1.2)} 66%{transform:translate(50px,160px) scale(0.9)} 100%{transform:translate(150px,60px) scale(1.1)} }
        @keyframes meshMove2 { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(-80px,-60px) scale(1.15)} 66%{transform:translate(-140px,-30px) scale(0.95)} 100%{transform:translate(-60px,-100px) scale(1.2)} }
        @keyframes particleFloat { 0%{transform:translateY(110vh) rotate(0deg);opacity:0} 5%{opacity:1} 95%{opacity:0.4} 100%{transform:translateY(-10vh) rotate(720deg);opacity:0} }
        @keyframes scanMove { 0%{background-position:0 0} 100%{background-position:0 100px} }
      `}</style>
    </div>
  );
}

export default Login;