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
          {}, { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.message.includes("match")) {
          setMatchedUser(users[current]);
          setMatchPopup(true);
        }
      } catch (err) {}
      setCurrent(c => c + 1);
      setAnimation("");
    }, 350);
  };

  const handleSkip = () => {
    setAnimation("skip");
    setTimeout(() => { setCurrent(c => c + 1); setAnimation(""); }, 350);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", position: "relative" }}>
      <AnimatedBackground intensity="subtle" />
      <div style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", zIndex: 1 }} />
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", zIndex: 1 }}>Finding people for you</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", paddingBottom: "80px", position: "relative" }}>
      <AnimatedBackground />

      {/* Match Popup */}
      {matchPopup && matchedUser && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(16px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px", animation: "fadeIn 0.25s ease"
        }}>
          <div style={{
            background: "#111", borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "40px 32px", textAlign: "center",
            maxWidth: "340px", width: "100%",
            animation: "scaleIn 0.35s cubic-bezier(0.16,1,0.3,1)"
          }}>
            <div style={{ fontSize: "52px", marginBottom: "16px", animation: "heartPop 0.6s ease" }}>🎉</div>
            <h2 style={{ fontSize: "26px", fontWeight: "800", marginBottom: "8px", letterSpacing: "-0.5px" }}>It's a Match!</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "28px", lineHeight: "1.6", fontSize: "14px" }}>
              You and <span style={{ color: "#fff", fontWeight: "600" }}>{matchedUser.name}</span> liked each other
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "28px" }}>
              {[{ label: "You", icon: "😊" }, { label: matchedUser.name.split(" ")[0], icon: matchedUser.gender === "female" ? "👩" : "👨" }].map((item, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{
                    width: "64px", height: "64px", borderRadius: "50%",
                    background: "#1a1a1a", border: "2px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "26px", margin: "0 auto 6px"
                  }}>{item.icon}</div>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{item.label}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={() => { setMatchPopup(false); navigate("/matches"); }}
                style={{
                  padding: "14px", background: "#fff", borderRadius: "12px",
                  color: "#000", fontWeight: "700", fontSize: "15px",
                  border: "none", cursor: "pointer", transition: "all 0.2s"
                }}>Send Message</button>
              <button onClick={() => setMatchPopup(false)}
                style={{
                  padding: "14px", background: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px",
                  color: "rgba(255,255,255,0.5)", fontSize: "14px", cursor: "pointer",
                  fontFamily: "Inter, sans-serif"
                }}>Keep Swiping</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", background: "linear-gradient(135deg, #ff2d55, #ff6535)",
            borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px"
          }}>💕</div>
          <span style={{ fontWeight: "800", fontSize: "17px", letterSpacing: "-0.3px" }}>Affinity Hub</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => navigate("/matches")} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
            width: "36px", height: "36px", borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", cursor: "pointer", transition: "all 0.2s"
          }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          >❤️</button>
          <button onClick={() => navigate("/profile")} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
            width: "36px", height: "36px", borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", cursor: "pointer", transition: "all 0.2s"
          }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          >👤</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
        {!users[current] ? (
          <div style={{ textAlign: "center", marginTop: "100px", animation: "fadeInUp 0.5s ease" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>😅</div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.3px", marginBottom: "8px" }}>No more profiles</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", marginBottom: "28px", fontSize: "14px" }}>Check back later for new people</p>
            <button onClick={() => navigate("/matches")} style={{
              padding: "13px 28px", background: "#fff", borderRadius: "12px",
              color: "#000", fontWeight: "700", fontSize: "15px", border: "none", cursor: "pointer"
            }}>See Your Matches</button>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div style={{ width: "100%", maxWidth: "400px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", height: "2px", marginBottom: "16px" }}>
              <div style={{
                height: "100%", width: `${((current + 1) / users.length) * 100}%`,
                background: "#fff", borderRadius: "2px", transition: "width 0.3s ease"
              }} />
            </div>

            {/* Card */}
            <div style={{
              width: "100%", maxWidth: "400px",
              background: "#111", borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
              transform: animation === "like" ? "translateX(140px) rotate(12deg)" : animation === "skip" ? "translateX(-140px) rotate(-12deg)" : "none",
              transition: "transform 0.35s cubic-bezier(0.175,0.885,0.32,1), opacity 0.35s ease",
              opacity: animation ? 0 : 1,
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
              position: "relative"
            }}>
              {/* Shimmer effect */}
              <div style={{
                position: "absolute", top: 0, left: "-100%", width: "100%", height: "2px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                animation: "shimmerLine 3s ease-in-out infinite", zIndex: 2
              }} />

              {/* Avatar area */}
              <div style={{
                height: "280px", background: "#1a1a1a",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "100px", position: "relative", overflow: "hidden"
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "radial-gradient(ellipse at center, rgba(255,45,85,0.08) 0%, transparent 70%)",
                  animation: "meshMove1 8s ease-in-out infinite alternate"
                }} />
                <span style={{ position: "relative", zIndex: 1, animation: "floatY 4s ease-in-out infinite" }}>
                  {users[current].gender === "female" ? "👩" : "👨"}
                </span>

                {animation === "like" && (
                  <div style={{
                    position: "absolute", top: "20px", left: "16px",
                    background: "#fff", color: "#000",
                    padding: "6px 14px", borderRadius: "8px",
                    fontWeight: "800", fontSize: "16px", letterSpacing: "1px",
                    transform: "rotate(-12deg)"
                  }}>LIKE</div>
                )}
                {animation === "skip" && (
                  <div style={{
                    position: "absolute", top: "20px", right: "16px",
                    background: "#ff2d55", color: "#fff",
                    padding: "6px 14px", borderRadius: "8px",
                    fontWeight: "800", fontSize: "16px", letterSpacing: "1px",
                    transform: "rotate(12deg)"
                  }}>NOPE</div>
                )}

                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "80px",
                  background: "linear-gradient(to top, #111, transparent)"
                }} />
              </div>

              {/* Info */}
              <div style={{ padding: "20px 24px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <h2 style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                    {users[current].name}
                  </h2>
                  <span style={{
                    background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)",
                    padding: "3px 10px", borderRadius: "20px", fontSize: "13px", fontWeight: "600"
                  }}>{users[current].age}</span>
                </div>

                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", textTransform: "capitalize", marginBottom: "10px" }}>
                  {users[current].gender}
                </p>

                <p style={{ color: "rgba(255,255,255,0.65)", lineHeight: "1.6", marginBottom: "14px", fontSize: "14px" }}>
                  {users[current].bio || "No bio yet"}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {users[current].interests?.map((interest, i) => (
                    <span key={i} style={{
                      background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)",
                      padding: "5px 12px", borderRadius: "20px", fontSize: "12px",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}>#{interest}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "20px", marginTop: "24px", alignItems: "center" }}>
              <button onClick={handleSkip} style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: "#111", border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "22px", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s"
              }}
                onMouseOver={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              >✕</button>

              <button onClick={handleLike} style={{
                width: "68px", height: "68px", borderRadius: "50%",
                background: "#fff", fontSize: "28px",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", cursor: "pointer",
                boxShadow: "0 8px 28px rgba(255,255,255,0.15)",
                transition: "all 0.2s"
              }}
                onMouseOver={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(255,255,255,0.25)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(255,255,255,0.15)"; }}
              >❤️</button>

              <button onClick={() => navigate("/matches")} style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: "#111", border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "22px", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s"
              }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.08)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
              >⭐</button>
            </div>

            <p style={{ color: "rgba(255,255,255,0.15)", marginTop: "14px", fontSize: "12px", letterSpacing: "0.5px" }}>
              {current + 1} of {users.length}
            </p>
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <button className="nav-btn active" onClick={() => navigate("/discover")}>
          <span className="icon">🔥</span>
          <span>Discover</span>
        </button>
        <button className="nav-btn" onClick={() => navigate("/matches")}>
          <span className="icon">❤️</span>
          <span>Matches</span>
        </button>
        <button className="nav-btn" onClick={() => navigate("/profile")}>
          <span className="icon">👤</span>
          <span>Profile</span>
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        @keyframes heartPop{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes shimmerLine{0%{left:-100%}100%{left:200%}}
        @keyframes meshMove1{0%{transform:translate(0,0) scale(1)}100%{transform:translate(150px,60px) scale(1.1)}}
        @keyframes meshMove2{0%{transform:translate(0,0) scale(1)}100%{transform:translate(-60px,-100px) scale(1.2)}}
        @keyframes particleFloat{0%{transform:translateY(110vh) rotate(0deg);opacity:0}5%{opacity:1}95%{opacity:0.4}100%{transform:translateY(-10vh) rotate(720deg);opacity:0}}
        @keyframes scanMove{0%{background-position:0 0}100%{background-position:0 100px}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

export default Discover;