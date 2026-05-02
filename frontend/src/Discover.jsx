import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Discover() {
  const [users, setUsers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animation, setAnimation] = useState("");
  const [matchPopup, setMatchPopup] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    axios.get("https://affinity-hub.onrender.com/api/match/discover", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => { setUsers(res.data); setLoading(false); })
    .catch(() => navigate("/"));
  }, []);

  const handleLike = async () => {
    setAnimation("like");
    setTimeout(async () => {
      try {
        const res = await axios.post(
          `https://affinity-hub.onrender.com/api/match/like/${users[current]._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.message.includes("match")) {
          setMatchedUser(users[current]);
          setMatchPopup(true);
        }
      } catch (err) {}
      setCurrent(c => c + 1);
      setAnimation("");
    }, 400);
  };

  const handleSkip = () => {
    setAnimation("skip");
    setTimeout(() => {
      setCurrent(c => c + 1);
      setAnimation("");
    }, 400);
  };

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px"
    }}>
      <div style={{ fontSize: "50px", animation: "pulse 1s infinite" }}>💕</div>
      <p style={{ color: "#888" }}>Finding people for you...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", paddingBottom: "80px" }}>

      {/* Match Popup */}
      {matchPopup && matchedUser && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            background: "#1a1a1a",
            borderRadius: "28px",
            padding: "40px",
            textAlign: "center",
            border: "1px solid #fd5068",
            maxWidth: "340px",
            width: "100%",
            boxShadow: "0 0 60px rgba(253,80,104,0.3)"
          }}>
            <div style={{ fontSize: "60px", marginBottom: "12px" }}>🎉</div>
            <h2 style={{
              fontSize: "28px", fontWeight: "800",
              background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "8px"
            }}>It's a Match!</h2>
            <p style={{ color: "#888", marginBottom: "24px" }}>
              You and <span style={{ color: "#fff", fontWeight: "600" }}>{matchedUser.name}</span> liked each other 💞
            </p>

            {/* Avatars */}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "28px" }}>
              {["You", matchedUser.name].map((name, i) => (
                <div key={i} style={{
                  width: "70px", height: "70px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "28px", border: "3px solid #fd5068"
                }}>
                  {i === 0 ? "😊" : matchedUser.gender === "female" ? "👩" : "👨"}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={() => { setMatchPopup(false); navigate("/matches"); }}
                style={{
                  padding: "14px",
                  background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
                  borderRadius: "12px", color: "#fff",
                  fontWeight: "700", fontSize: "16px", border: "none", cursor: "pointer"
                }}>
                💬 Send Message
              </button>
              <button
                onClick={() => setMatchPopup(false)}
                style={{
                  padding: "14px", background: "transparent",
                  border: "1px solid #2a2a2a", borderRadius: "12px",
                  color: "#888", fontSize: "15px", cursor: "pointer"
                }}>
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #1a1a1a"
      }}>
        <h1 style={{
          fontSize: "24px", fontWeight: "800",
          background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>💕 Affinity Hub</h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/matches")}
            style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>❤️</button>
          <button onClick={() => navigate("/profile")}
            style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>👤</button>
        </div>
      </div>

      {/* Card Area */}
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {!users[current] ? (
          <div style={{ textAlign: "center", marginTop: "100px" }}>
            <div style={{ fontSize: "70px" }}>😅</div>
            <h2 style={{ marginTop: "16px", color: "#fff", fontSize: "24px" }}>No more profiles!</h2>
            <p style={{ color: "#888", marginTop: "8px" }}>Check back later for new people</p>
            <button
              onClick={() => navigate("/matches")}
              style={{
                marginTop: "24px", padding: "14px 28px",
                background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
                borderRadius: "12px", color: "#fff",
                fontWeight: "700", fontSize: "16px",
                border: "none", cursor: "pointer"
              }}>
              See Your Matches ❤️
            </button>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div style={{
              width: "100%", maxWidth: "380px",
              background: "#1a1a1a", borderRadius: "4px",
              height: "4px", marginBottom: "16px"
            }}>
              <div style={{
                height: "100%",
                width: `${((current + 1) / users.length) * 100}%`,
                background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
                borderRadius: "4px",
                transition: "width 0.3s ease"
              }} />
            </div>

            {/* Profile Card */}
            <div style={{
              width: "100%", maxWidth: "380px",
              background: "#1a1a1a", borderRadius: "24px",
              overflow: "hidden", border: "1px solid #2a2a2a",
              transform: animation === "like"
                ? "translateX(120px) rotate(12deg)"
                : animation === "skip"
                ? "translateX(-120px) rotate(-12deg)"
                : "none",
              transition: "transform 0.4s ease, opacity 0.4s ease",
              opacity: animation ? 0 : 1,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }}>
              {/* Avatar Area */}
              <div style={{
                height: "280px",
                background: "linear-gradient(135deg, #fd5068 0%, #ff8c5a 100%)",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "110px",
                position: "relative"
              }}>
                {users[current].gender === "female" ? "👩" : "👨"}

                {/* Like / Skip overlay hints */}
                {animation === "like" && (
                  <div style={{
                    position: "absolute", top: "20px", left: "20px",
                    background: "#00c853", color: "#fff",
                    padding: "6px 16px", borderRadius: "8px",
                    fontWeight: "800", fontSize: "20px",
                    border: "3px solid #fff", transform: "rotate(-15deg)"
                  }}>LIKE ❤️</div>
                )}
                {animation === "skip" && (
                  <div style={{
                    position: "absolute", top: "20px", right: "20px",
                    background: "#fd5068", color: "#fff",
                    padding: "6px 16px", borderRadius: "8px",
                    fontWeight: "800", fontSize: "20px",
                    border: "3px solid #fff", transform: "rotate(15deg)"
                  }}>NOPE ❌</div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <h2 style={{ fontSize: "26px", fontWeight: "700" }}>
                    {users[current].name}
                  </h2>
                  <span style={{
                    background: "#fd5068", color: "#fff",
                    padding: "4px 12px", borderRadius: "20px",
                    fontSize: "14px", fontWeight: "600"
                  }}>{users[current].age}</span>
                </div>

                <p style={{ color: "#888", fontSize: "14px", textTransform: "capitalize", marginBottom: "12px" }}>
                  ⚧ {users[current].gender}
                </p>

                <p style={{ color: "#ccc", lineHeight: "1.6", marginBottom: "16px" }}>
                  {users[current].bio || "No bio yet ✨"}
                </p>

                {/* Interests */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {users[current].interests?.map((interest, i) => (
                    <span key={i} style={{
                      background: "#2a2a2a", color: "#fd5068",
                      padding: "6px 14px", borderRadius: "20px",
                      fontSize: "13px", fontWeight: "500"
                    }}>#{interest}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "28px", marginTop: "28px", alignItems: "center" }}>
              <button onClick={handleSkip} style={{
                width: "60px", height: "60px", borderRadius: "50%",
                background: "#1a1a1a", border: "2px solid #2a2a2a",
                fontSize: "26px", display: "flex",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "transform 0.2s",
              }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
              >❌</button>

              <button onClick={handleLike} style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
                fontSize: "32px", display: "flex",
                alignItems: "center", justifyContent: "center",
                border: "none", cursor: "pointer",
                boxShadow: "0 8px 28px rgba(253,80,104,0.5)",
                transition: "transform 0.2s",
              }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
              >❤️</button>

              <button onClick={() => navigate("/matches")} style={{
                width: "60px", height: "60px", borderRadius: "50%",
                background: "#1a1a1a", border: "2px solid #2a2a2a",
                fontSize: "26px", display: "flex",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "transform 0.2s",
              }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
              >⭐</button>
            </div>

            {/* Counter */}
            <p style={{ color: "#555", marginTop: "16px", fontSize: "13px" }}>
              {current + 1} / {users.length} profiles
            </p>
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
          style={{ background: "none", border: "none", fontSize: "26px", cursor: "pointer" }}>❤️</button>
        <button onClick={() => navigate("/profile")}
          style={{ background: "none", border: "none", fontSize: "26px", cursor: "pointer" }}>👤</button>
      </div>
    </div>
  );
}

export default Discover;