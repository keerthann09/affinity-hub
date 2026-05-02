import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "6px",
  background: "#0a0a0a",
  border: "1px solid #2a2a2a",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "16px"
};

const labelStyle = { color: "#888", fontSize: "14px" };

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
  // Basic validation first
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
    // ✅ Show actual error from backend instead of generic message
    const message = err.response?.data?.message || "Registration failed. Please try again.";
    alert(message);
    console.error("Full error:", err.response?.data);
  } finally {
    setLoading(false); // ✅ Always runs even if error
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
      <div style={{ width: "100%", maxWidth: "400px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "50px" }}>💕</div>
          <h1 style={{
            fontSize: "30px",
            fontWeight: "800",
            background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Affinity Hub</h1>
        </div>

        {/* Card */}
        <div style={{
          background: "#1a1a1a",
          borderRadius: "24px",
          padding: "40px",
          border: "1px solid #2a2a2a"
        }}>
          <h2 style={{ marginBottom: "24px", fontSize: "24px" }}>Create Account ✨</h2>

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
              <select name="gender" onChange={handleChange} style={{ ...inputStyle, marginTop: "6px" }}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
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
              style={{
                ...inputStyle,
                resize: "none",
                fontFamily: "inherit"
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Interests (comma separated)</label>
            <input name="interests" placeholder="Music, Travel, Gaming" onChange={handleChange} style={inputStyle} />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "700",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Creating account..." : "Create Account 🎉"}
          </button>

          <p style={{ textAlign: "center", marginTop: "20px", color: "#888" }}>
            Already have account?{" "}
            <Link to="/" style={{ color: "#fd5068", fontWeight: "600" }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;