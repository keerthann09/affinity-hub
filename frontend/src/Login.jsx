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
      const res = await axios.post("https://affinity-hub.onrender.com/api/auth/login", {
        email, password
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/discover");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please try again.";
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
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <div style={{
            fontSize: "64px",
            marginBottom: "12px",
            display: "inline-block",
            animation: "heartbeat 1.5s ease-in-out infinite"
          }}>💕</div>
          <h1 style={{
            fontSize: "40px",
            fontWeight: "800",
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, #ff2d55 0%, #ff6b35 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px"
          }}>Affinity Hub</h1>
          <p style={{
            color: "rgba(255,255,255,0.4)",
            marginTop: "8px",
            fontSize: "15px",
            letterSpacing: "0.5px"
          }}>Find your perfect match</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: "40px" }}>
          {/* Inner glow */}
          <div style={{
            position: "absolute",
            top: "-1px", left: "20%", right: "20%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(255,45,85,0.6), transparent)",
            borderRadius: "0 0 4px 4px"
          }} />

          <h2 style={{
            marginBottom: "28px",
            fontSize: "26px",
            fontWeight: "700",
            fontFamily: "'Playfair Display', serif",
            color: "#fff"
          }}>Welcome back 👋</h2>

          <div style={{ marginBottom: "18px" }}>
            <label style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              style={{ marginTop: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: "12px",
              fontWeight: "600",
              letterSpacing: "1px",
              textTransform: "uppercase"
            }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleLogin()}
              className="input-field"
              style={{ marginTop: "8px" }}
            />
          </div>

          <button
            onClick={handleLogin}
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
                Logging in...
              </span>
            ) : "Login 🚀"}
          </button>

          <p style={{ textAlign: "center", marginTop: "24px", color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
            No account?{" "}
            <Link to="/register" style={{
              color: "#ff2d55",
              fontWeight: "700",
              transition: "opacity 0.2s"
            }}>Register here</Link>
          </p>
        </div>

        {/* Bottom decorative text */}
        <p style={{
          textAlign: "center",
          marginTop: "28px",
          color: "rgba(255,255,255,0.15)",
          fontSize: "12px",
          letterSpacing: "2px",
          textTransform: "uppercase"
        }}>✦ Love is just a swipe away ✦</p>
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
      `}</style>
    </div>
  );
}

export default Login;