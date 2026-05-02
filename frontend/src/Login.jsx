import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
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
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0f 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "60px" }}>💕</div>
          <h1 style={{
            fontSize: "36px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Affinity Hub</h1>
          <p style={{ color: "#888", marginTop: "8px" }}>Find your perfect match</p>
        </div>

        {/* Card */}
        <div style={{
          background: "#1a1a1a",
          borderRadius: "24px",
          padding: "40px",
          border: "1px solid #2a2a2a"
        }}>
          <h2 style={{ marginBottom: "24px", fontSize: "24px" }}>Welcome back 👋</h2>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "#888", fontSize: "14px" }}>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              onChange={e => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "6px",
                background: "#0a0a0a",
                border: "1px solid #2a2a2a",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ color: "#888", fontSize: "14px" }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "6px",
                background: "#0a0a0a",
                border: "1px solid #2a2a2a",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "16px"
              }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "700",
              opacity: loading ? 0.7 : 1,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Logging in..." : "Login 🚀"}
          </button>

          <p style={{ textAlign: "center", marginTop: "20px", color: "#888" }}>
            No account?{" "}
            <Link to="/register" style={{
              color: "#fd5068",
              fontWeight: "600"
            }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;