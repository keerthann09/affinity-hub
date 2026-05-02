import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "16px"
    }}>
      <div style={{ fontSize: "50px" }}>💕</div>
      <p style={{ color: "#888" }}>Loading your matches...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", paddingBottom: "80px" }}>

      {/* Header */}
      <div style={{
        padding: "24px",
        borderBottom: "1px solid #1a1a1a",
        background: "#0a0a0a",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <h1 style={{
          fontSize: "26px", fontWeight: "800",
          background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>Your Matches 💞</h1>
        <p style={{ color: "#555", marginTop: "4px", fontSize: "14px" }}>
          {matches.length} {matches.length === 1 ? "match" : "matches"} found
        </p>
      </div>

      <div style={{ padding: "20px" }}>

        {matches.length === 0 ? (
          /* Empty State */
          <div style={{ textAlign: "center", marginTop: "80px" }}>
            <div style={{ fontSize: "70px", marginBottom: "16px" }}>💔</div>
            <h2 style={{ color: "#fff", fontSize: "22px", marginBottom: "8px" }}>No matches yet!</h2>
            <p style={{ color: "#555", marginBottom: "28px" }}>Keep swiping to find your match</p>
            <button
              onClick={() => navigate("/discover")}
              style={{
                padding: "14px 32px",
                background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
                borderRadius: "14px", color: "#fff",
                fontSize: "16px", fontWeight: "700",
                border: "none", cursor: "pointer",
                boxShadow: "0 8px 24px rgba(253,80,104,0.4)"
              }}>
              Start Swiping 🔥
            </button>
          </div>

        ) : (
          <>
            {/* Matches Grid - horizontal scroll for top matches */}
            <div style={{ marginBottom: "28px" }}>
              <p style={{ color: "#888", fontSize: "13px", marginBottom: "14px", fontWeight: "600", letterSpacing: "1px" }}>
                NEW MATCHES
              </p>
              <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px" }}>
                {matches.map((match, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/chat/${match._id}`)}
                    style={{ textAlign: "center", cursor: "pointer", flexShrink: 0 }}
                  >
                    <div style={{
                      width: "70px", height: "70px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "30px", margin: "0 auto 8px",
                      border: "3px solid #fd5068",
                      boxShadow: "0 4px 16px rgba(253,80,104,0.3)"
                    }}>
                      {match.gender === "female" ? "👩" : "👨"}
                    </div>
                    <p style={{ color: "#fff", fontSize: "12px", fontWeight: "600" }}>
                      {match.name.split(" ")[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "14px", fontWeight: "600", letterSpacing: "1px" }}>
              MESSAGES
            </p>

            {/* Matches List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {matches.map((match, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/chat/${match._id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    background: "#1a1a1a", borderRadius: "18px",
                    padding: "16px", border: "1px solid #2a2a2a",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = "#fd5068";
                    e.currentTarget.style.background = "#1f1f1f";
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = "#2a2a2a";
                    e.currentTarget.style.background = "#1a1a1a";
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: "56px", height: "56px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "26px", flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(253,80,104,0.3)"
                  }}>
                    {match.gender === "female" ? "👩" : "👨"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#fff" }}>
                        {match.name}
                      </h3>
                      <span style={{
                        background: "#fd506820", color: "#fd5068",
                        padding: "2px 8px", borderRadius: "10px", fontSize: "11px"
                      }}>
                        {match.age}
                      </span>
                    </div>
                    <p style={{
                      color: "#555", fontSize: "13px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>
                      {match.bio || "Tap to say hello! 👋"}
                    </p>
                  </div>

                  {/* Chat Icon */}
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px", flexShrink: 0
                  }}>💬</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#1a1a1a", borderTop: "1px solid #2a2a2a",
        display: "flex", justifyContent: "space-around",
        padding: "14px 0"
      }}>
        <button onClick={() => navigate("/discover")}
          style={{ background: "none", border: "none", fontSize: "26px", cursor: "pointer" }}>🔥</button>
        <button onClick={() => navigate("/matches")}
          style={{ background: "none", border: "none", fontSize: "26px", cursor: "pointer",
            filter: "drop-shadow(0 0 8px #fd5068)" }}>❤️</button>
        <button onClick={() => navigate("/profile")}
          style={{ background: "none", border: "none", fontSize: "26px", cursor: "pointer" }}>👤</button>
      </div>
    </div>
  );
}

export default Matches;