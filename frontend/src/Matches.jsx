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
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
      <div style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", paddingBottom: "80px", position: "relative" }}>
      <AnimatedBackground intensity="subtle" />

      {/* Header */}
      <div style={{
        padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px" }}>Matches</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", marginTop: "2px", fontSize: "13px" }}>
          {matches.length} {matches.length === 1 ? "match" : "matches"}
        </p>
      </div>

      <div style={{ padding: "20px", position: "relative", zIndex: 1 }}>
        {matches.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "100px", animation: "fadeInUp 0.5s ease" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>💔</div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px", letterSpacing: "-0.3px" }}>No matches yet</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", marginBottom: "28px", fontSize: "14px" }}>Keep swiping to find your match</p>
            <button onClick={() => navigate("/discover")} style={{
              padding: "13px 28px", background: "#fff", borderRadius: "12px",
              color: "#000", fontWeight: "700", fontSize: "15px", border: "none", cursor: "pointer"
            }}>Start Swiping</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "28px" }}>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "14px", textTransform: "uppercase" }}>
                New Matches
              </p>
              <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "4px" }}>
                {matches.map((match, i) => (
                  <div key={i} onClick={() => navigate(`/chat/${match._id}`)}
                    style={{ textAlign: "center", cursor: "pointer", flexShrink: 0, animation: `fadeInUp 0.4s ease ${i * 0.06}s both` }}>
                    <div style={{
                      width: "62px", height: "62px", borderRadius: "50%",
                      background: "#1a1a1a", border: "2px solid rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "26px", margin: "0 auto 6px",
                      transition: "all 0.2s", position: "relative"
                    }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "scale(1.05)"; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "scale(1)"; }}
                    >
                      {match.gender === "female" ? "👩" : "👨"}
                      <div style={{
                        position: "absolute", bottom: "1px", right: "1px",
                        width: "12px", height: "12px", borderRadius: "50%",
                        background: "#00c853", border: "2px solid #0a0a0a"
                      }} />
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: "500" }}>
                      {match.name.split(" ")[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "20px" }} />

            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", marginBottom: "14px", textTransform: "uppercase" }}>
              Messages
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {matches.map((match, i) => (
                <div key={i} onClick={() => navigate(`/chat/${match._id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 16px", borderRadius: "14px",
                    cursor: "pointer", transition: "all 0.15s",
                    animation: `fadeInUp 0.4s ease ${i * 0.06}s both`
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{
                    width: "52px", height: "52px", borderRadius: "50%",
                    background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "22px", flexShrink: 0, position: "relative"
                  }}>
                    {match.gender === "female" ? "👩" : "👨"}
                    <div style={{
                      position: "absolute", bottom: "1px", right: "1px",
                      width: "10px", height: "10px", borderRadius: "50%",
                      background: "#00c853", border: "2px solid #0a0a0a"
                    }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: "700" }}>{match.name}</h3>
                      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>now</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {match.bio || "Tap to say hello 👋"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bottom-nav">
        <button className="nav-btn" onClick={() => navigate("/discover")}><span className="icon">🔥</span><span>Discover</span></button>
        <button className="nav-btn active" onClick={() => navigate("/matches")}><span className="icon">❤️</span><span>Matches</span></button>
        <button className="nav-btn" onClick={() => navigate("/profile")}><span className="icon">👤</span><span>Profile</span></button>
      </div>

      <style>{`
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

export default Matches;