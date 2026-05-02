import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "./AnimatedBackground";

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
    setTimeout(() => { setCurrent(c => c + 1); setAnimation(""); }, 400);
  };

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #060608 0%, #0f0610 50%, #060608 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "16px",
      position: "relative"
    }}>
      <AnimatedBackground />
      <div style={{ fontSize: "56px", animation: "heartbeat 1.5s ease-in-out infinite", zIndex: 1 }}>💕</div>
      <p style={{ color: "rgba(255,255,255,0.4)", zIndex: 1, letterSpacing: "1px" }}>Finding people for you...</p>
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

      {/* Match Popup */}
      {matchPopup && matchedUser && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
          animation: "fadeIn 0.3s ease"
        }}>
          <div className="glass-card" style={{
            padding: "44px 36px",
            textAlign: "center",
            maxWidth: "360px",
            width: "100%",
            border: "1px solid rgba(255,45,85,0.3)",
            boxShadow: "0 0 80px rgba(255,45,85,0.2), 0 0 160px rgba(255,45,85,0.1)"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "12px", animation: "heartbeat 1s ease-in-out infinite" }}>🎉</div>
            <h2 style={{
              fontSize: "32px", fontWeight: "800",
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg, #ff2d55, #ff6b35)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "10px"
            }}>It's a Match!</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "28px", lineHeight: "1.6" }}>
              You and <span style={{ color: "#fff", fontWeight: "700" }}>{matchedUser.name}</span> liked each other 💞
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "32px" }}>
              {["You", matchedUser.name].map((name, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{
                    width: "72px", height: "72px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #ff2d55, #ff6b35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "30px", border: "3px solid rgba(255,45,85,0.5)",
                    boxShadow: "0 0 24px rgba(255,45,85,0.4)"
                  }}>
                    {i === 0 ? "😊" : matchedUser.gender === "female" ? "👩" : "👨"}
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", marginTop: "6px" }}>{name.split(" ")[0]}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => { setMatchPopup(false); navigate("/matches"); }}
                className="btn-primary"
                style={{ padding: "14px" }}
              >💬 Send Message</button>
              <button
                onClick={() => setMatchPopup(false)}
                style={{
                  padding: "14px", background: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px",
                  color: "rgba(255,255,255,0.5)", fontSize: "15px", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif"
                }}>Keep Swiping</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: "20px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(6,6,8,0.8)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <h1 style={{
          fontSize: "22px", fontWeight: "800",
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, #ff2d55, #ff6b35)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>💕 Affinity Hub</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => navigate("/matches")} style={{
            background: "rgba(255,45,85,0.1)", border: "1px solid rgba(255,45,85,0.2)",
            fontSize: "20px", cursor: "pointer", width: "40px", height: "40px",
            borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center"
          }}>❤️</button>
          <button onClick={() => navigate("/profile")} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            fontSize: "20px", cursor: "pointer", width: "40px", height: "40px",
            borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center"
          }}>👤</button>
        </div>
      </div>

      {/* Card Area */}
      <div style={{
        padding: "24px",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative", zIndex: 1
      }}>
        {!users[current] ? (
          <div style={{ textAlign: "center", marginTop: "80px", animation: "fadeInUp 0.5s ease" }}>
            <div style={{ fontSize: "72px", marginBottom: "16px" }}>😅</div>
            <h2 style={{ color: "#fff", fontSize: "26px", fontFamily: "'Playfair Display', serif", marginBottom: "10px" }}>No more profiles!</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "28px" }}>Check back later for new people</p>
            <button onClick={() => navigate("/matches")} className="btn-primary" style={{ width: "auto", padding: "14px 32px" }}>
              See Your Matches ❤️
            </button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div style={{
              width: "100%", maxWidth: "390px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "4px", height: "3px", marginBottom: "18px"
            }}>
              <div style={{
                height: "100%",
                width: `${((current + 1) / users.length) * 100}%`,
                background: "linear-gradient(90deg, #ff2d55, #ff6b35)",
                borderRadius: "4px", transition: "width 0.3s ease",
                boxShadow: "0 0 8px rgba(255,45,85,0.5)"
              }} />
            </div>

            {/* Profile Card */}
            <div className="glass-card" style={{
              width: "100%", maxWidth: "390px",
              transform: animation === "like"
                ? "translateX(130px) rotate(14deg)"
                : animation === "skip"
                  ? "translateX(-130px) rotate(-14deg)"
                  : "none",
              transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease",
              opacity: animation ? 0 : 1,
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(255,45,85,0.08)"
            }}>
              {/* Avatar */}
              <div style={{
                height: "300px",
                background: "linear-gradient(135deg, #ff2d55 0%, #ff6b35 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "120px", position: "relative", overflow: "hidden"
              }}>
                {/* Decorative circles */}
                <div style={{
                  position: "absolute", width: "200px", height: "200px",
                  borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)",
                  top: "-40px", right: "-40px"
                }} />
                <div style={{
                  position: "absolute", width: "150px", height: "150px",
                  borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)",
                  bottom: "-30px", left: "-30px"
                }} />
                <span style={{ position: "relative", zIndex: 1 }}>
                  {users[current].gender === "female" ? "👩" : "👨"}
                </span>

                {animation === "like" && (
                  <div style={{
                    position: "absolute", top: "24px", left: "20px",
                    background: "#00c853", color: "#fff",
                    padding: "8px 18px", borderRadius: "10px",
                    fontWeight: "800", fontSize: "18px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    transform: "rotate(-15deg)",
                    boxShadow: "0 4px 16px rgba(0,200,83,0.4)"
                  }}>LIKE ❤️</div>
                )}
                {animation === "skip" && (
                  <div style={{
                    position: "absolute", top: "24px", right: "20px",
                    background: "#ff2d55", color: "#fff",
                    padding: "8px 18px", borderRadius: "10px",
                    fontWeight: "800", fontSize: "18px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    transform: "rotate(15deg)",
                    boxShadow: "0 4px 16px rgba(255,45,85,0.4)"
                  }}>NOPE ❌</div>
                )}

                {/* Gradient overlay */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: "80px",
                  background: "linear-gradient(to top, rgba(15,6,16,0.8), transparent)"
                }} />
              </div>

              {/* Info */}
              <div style={{ padding: "24px 28px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <h2 style={{
                    fontSize: "28px", fontWeight: "800",
                    fontFamily: "'Playfair Display', serif"
                  }}>{users[current].name}</h2>
                  <span style={{
                    background: "linear-gradient(135deg, #ff2d55, #ff6b35)",
                    color: "#fff", padding: "4px 12px",
                    borderRadius: "20px", fontSize: "13px", fontWeight: "700"
                  }}>{users[current].age}</span>
                </div>

                <p style={{
                  color: "rgba(255,255,255,0.4)", fontSize: "13px",
                  textTransform: "capitalize", marginBottom: "12px",
                  display: "flex", alignItems: "center", gap: "4px"
                }}>
                  ⚧ {users[current].gender}
                </p>

                <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.7", marginBottom: "16px", fontSize: "15px" }}>
                  {users[current].bio || "No bio yet ✨"}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {users[current].interests?.map((interest, i) => (
                    <span key={i} className="tag">#{interest}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "24px", marginTop: "28px", alignItems: "center" }}>
              <button onClick={handleSkip} style={{
                width: "58px", height: "58px", borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "24px", display: "flex",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s",
                backdropFilter: "blur(10px)"
              }}
                onMouseOver={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.borderColor = "rgba(255,45,85,0.4)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              >❌</button>

              <button onClick={handleLike} style={{
                width: "74px", height: "74px", borderRadius: "50%",
                background: "linear-gradient(135deg, #ff2d55, #ff6b35)",
                fontSize: "32px", display: "flex",
                alignItems: "center", justifyContent: "center",
                border: "none", cursor: "pointer",
                boxShadow: "0 8px 32px rgba(255,45,85,0.5)",
                transition: "all 0.2s"
              }}
                onMouseOver={e => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,45,85,0.7)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,45,85,0.5)"; }}
              >❤️</button>

              <button onClick={() => navigate("/matches")} style={{
                width: "58px", height: "58px", borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "24px", display: "flex",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s",
                backdropFilter: "blur(10px)"
              }}
                onMouseOver={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >⭐</button>
            </div>

            <p style={{ color: "rgba(255,255,255,0.2)", marginTop: "16px", fontSize: "12px", letterSpacing: "1px" }}>
              {current + 1} / {users.length} profiles
            </p>
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <button className="nav-btn active" onClick={() => navigate("/discover")}>🔥</button>
        <button className="nav-btn" onClick={() => navigate("/matches")}>❤️</button>
        <button className="nav-btn" onClick={() => navigate("/profile")}>👤</button>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.2)} 28%{transform:scale(1)} 42%{transform:scale(1.15)} 70%{transform:scale(1)} }
      `}</style>
    </div>
  );
}

export default Discover;