import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "./AnimatedBackground";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    axios.get("https://affinity-hub.onrender.com/api/match/matches", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => { setMatches(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #060608 0%, #0f0610 50%, #060608 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "16px",
      position: "relative"
    }}>
      <AnimatedBackground />
      <div style={{ fontSize: "52px", animation: "heartbeat 1.5s ease-in-out infinite", zIndex: 1 }}>💕</div>
      <p style={{ color: "rgba(255,255,255,0.4)", zIndex: 1 }}>Loading your matches...</p>
      <style>{`@keyframes heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.2)} 28%{transform:scale(1)} 42%{transform:scale(1.15)} 70%{transform:scale(1)} }`}</style>
    </div>
  );

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
        padding: "24px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(6,6,8,0.8)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <h1 style={{
          fontSize: "26px", fontWeight: "800",
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, #ff2d55, #ff6b35)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>Your Matches 💞</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", marginTop: "4px", fontSize: "13px" }}>
          {matches.length} {matches.length === 1 ? "match" : "matches"} found
        </p>
      </div>

      <div style={{ padding: "24px", position: "relative", zIndex: 1 }}>
        {matches.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "80px", animation: "fadeInUp 0.5s ease" }}>
            <div style={{ fontSize: "72px", marginBottom: "16px" }}>💔</div>
            <h2 style={{
              color: "#fff", fontSize: "24px",
              fontFamily: "'Playfair Display', serif",
              marginBottom: "10px"
            }}>No matches yet!</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "32px" }}>Keep swiping to find your match</p>
            <button
              onClick={() => navigate("/discover")}
              className="btn-primary"
              style={{ width: "auto", padding: "14px 36px" }}
            >Start Swiping 🔥</button>
          </div>
        ) : (
          <>
            {/* Top matches horizontal scroll */}
            <div style={{ marginBottom: "32px" }}>
              <p style={{
                color: "rgba(255,255,255,0.3)", fontSize: "11px",
                marginBottom: "16px", fontWeight: "700",
                letterSpacing: "2px", textTransform: "uppercase"
              }}>NEW MATCHES</p>
              <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px" }}>
                {matches.map((match, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/chat/${match._id}`)}
                    style={{
                      textAlign: "center", cursor: "pointer",
                      flexShrink: 0,
                      animation: `fadeInUp 0.4s ease ${i * 0.08}s both`
                    }}
                  >
                    <div style={{
                      width: "68px", height: "68px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #ff2d55, #ff6b35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "28px", margin: "0 auto 8px",
                      border: "2px solid rgba(255,45,85,0.4)",
                      boxShadow: "0 0 20px rgba(255,45,85,0.25)",
                      transition: "transform 0.2s"
                    }}
                      onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
                      onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                      {match.gender === "female" ? "👩" : "👨"}
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: "600" }}>
                      {match.name.split(" ")[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages section */}
            <p style={{
              color: "rgba(255,255,255,0.3)", fontSize: "11px",
              marginBottom: "16px", fontWeight: "700",
              letterSpacing: "2px", textTransform: "uppercase"
            }}>MESSAGES</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {matches.map((match, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/chat/${match._id}`)}
                  className="glass-card"
                  style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    padding: "16px 20px",
                    cursor: "pointer", transition: "all 0.2s",
                    animation: `fadeInUp 0.4s ease ${i * 0.08}s both`
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = "rgba(255,45,85,0.3)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,45,85,0.12)";
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    width: "54px", height: "54px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #ff2d55, #ff6b35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "24px", flexShrink: 0,
                    boxShadow: "0 4px 16px rgba(255,45,85,0.3)"
                  }}>
                    {match.gender === "female" ? "👩" : "👨"}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}>{match.name}</h3>
                      <span style={{
                        background: "rgba(255,45,85,0.12)", color: "#ff2d55",
                        padding: "2px 8px", borderRadius: "10px", fontSize: "11px",
                        border: "1px solid rgba(255,45,85,0.2)"
                      }}>{match.age}</span>
                    </div>
                    <p style={{
                      color: "rgba(255,255,255,0.3)", fontSize: "13px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>
                      {match.bio || "Tap to say hello! 👋"}
                    </p>
                  </div>

                  <div style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #ff2d55, #ff6b35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(255,45,85,0.3)"
                  }}>💬</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <button className="nav-btn" onClick={() => navigate("/discover")}>🔥</button>
        <button className="nav-btn active" onClick={() => navigate("/matches")}>❤️</button>
        <button className="nav-btn" onClick={() => navigate("/profile")}>👤</button>
      </div>

      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.2)} 28%{transform:scale(1)} 42%{transform:scale(1.15)} 70%{transform:scale(1)} }
      `}</style>
    </div>
  );
}

export default Matches;