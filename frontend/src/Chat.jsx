import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [matchUser, setMatchUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const { id } = useParams();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate("/"); return; }

    // Join socket with user ID
    socket.emit("join", currentUser.id);

    fetchMatchUser();
    fetchMessages();

    // ✅ Listen for real-time messages
    socket.on("receiveMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    // ✅ Listen for typing indicator
    socket.on("typing", ({ senderId }) => {
      if (senderId !== currentUser.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMatchUser = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/match/user/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMatchUser(res.data);
    } catch (err) {}
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chat/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (err) {}
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);

    const tempMsg = {
      message: newMessage,
      sender: currentUser.id,
      createdAt: new Date(),
      _id: Date.now()
    };

    // Show message instantly
    setMessages(prev => [...prev, tempMsg]);
    const msgText = newMessage;
    setNewMessage("");

    try {
      // Save to DB
      await axios.post(
        `http://localhost:5000/api/chat/${id}`,
        { message: msgText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Send via socket in real-time
      socket.emit("sendMessage", {
        senderId: currentUser.id,
        receiverId: id,
        message: msgText
      });

    } catch (err) {}
    setSending(false);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    // Emit typing event
    socket.emit("typing", {
      senderId: currentUser.id,
      receiverId: id
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) sendMessage();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div style={{ height: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{
        padding: "14px 20px",
        display: "flex", alignItems: "center", gap: "14px",
        borderBottom: "1px solid #1a1a1a",
        background: "#1a1a1a",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <button onClick={() => navigate("/matches")} style={{
          background: "none", border: "none",
          fontSize: "22px", color: "#fff", cursor: "pointer"
        }}>←</button>

        <div style={{
          width: "46px", height: "46px", borderRadius: "50%",
          background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px", flexShrink: 0,
          boxShadow: "0 4px 12px rgba(253,80,104,0.3)"
        }}>
          {matchUser?.gender === "female" ? "👩" : "👨"}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700" }}>
            {matchUser?.name || "Loading..."}
          </h3>
          {/* ✅ Typing indicator */}
          {isTyping ? (
            <p style={{ color: "#fd5068", fontSize: "12px" }}>typing...</p>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: "#00c853"
              }} />
              <p style={{ color: "#888", fontSize: "12px" }}>Online</p>
            </div>
          )}
        </div>

        <div style={{
          background: "#fd506820", color: "#fd5068",
          padding: "6px 12px", borderRadius: "20px",
          fontSize: "12px", fontWeight: "600"
        }}>❤️ Match</div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, padding: "20px",
        display: "flex", flexDirection: "column",
        gap: "8px", overflowY: "auto"
      }}>

        {messages.length === 0 && (
          <div style={{ textAlign: "center", margin: "auto" }}>
            <div style={{ fontSize: "60px", marginBottom: "16px" }}>💕</div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>
              You matched with {matchUser?.name || "someone"}!
            </h3>
            <p style={{ color: "#555", fontSize: "14px" }}>Break the ice 👋</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "20px" }}>
              {["👋 Hey there!", "😊 How are you?", "💕 Nice to meet you!"].map((q, i) => (
                <button key={i} onClick={() => setNewMessage(q)} style={{
                  padding: "8px 16px", background: "#1a1a1a",
                  border: "1px solid #fd5068", borderRadius: "20px",
                  color: "#fd5068", fontSize: "13px", cursor: "pointer"
                }}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender === currentUser.id;
          const showTime = i === messages.length - 1 ||
            messages[i + 1]?.sender !== msg.sender;

          return (
            <div key={msg._id || i}>
              <div style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                alignItems: "flex-end", gap: "8px"
              }}>
                {!isMe && (
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "13px",
                    flexShrink: 0,
                    visibility: showTime ? "visible" : "hidden"
                  }}>
                    {matchUser?.gender === "female" ? "👩" : "👨"}
                  </div>
                )}

                <div style={{ maxWidth: "70%" }}>
                  <div style={{
                    padding: "12px 16px",
                    borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isMe
                      ? "linear-gradient(135deg, #fd5068, #ff8c5a)"
                      : "#1a1a1a",
                    border: isMe ? "none" : "1px solid #2a2a2a",
                    color: "#fff", fontSize: "15px", lineHeight: "1.5",
                    boxShadow: isMe ? "0 4px 12px rgba(253,80,104,0.3)" : "none"
                  }}>
                    {msg.message}
                  </div>
                  {showTime && msg.createdAt && (
                    <p style={{
                      color: "#444", fontSize: "11px", marginTop: "4px",
                      textAlign: isMe ? "right" : "left"
                    }}>
                      {formatTime(msg.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* ✅ Typing bubble */}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "13px"
            }}>
              {matchUser?.gender === "female" ? "👩" : "👨"}
            </div>
            <div style={{
              background: "#1a1a1a", border: "1px solid #2a2a2a",
              borderRadius: "18px 18px 18px 4px",
              padding: "12px 16px", display: "flex", gap: "4px"
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#fd5068",
                  animation: `bounce 1s infinite ${i * 0.2}s`
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "14px 16px",
        borderTop: "1px solid #1a1a1a",
        background: "#1a1a1a",
        display: "flex", gap: "10px", alignItems: "center"
      }}>
        <input
          value={newMessage}
          onChange={handleTyping}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: "13px 18px",
            background: "#0a0a0a",
            border: "1px solid #2a2a2a",
            borderRadius: "24px",
            color: "#fff", fontSize: "15px", outline: "none"
          }}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: newMessage.trim()
              ? "linear-gradient(135deg, #fd5068, #ff8c5a)"
              : "#2a2a2a",
            fontSize: "20px", border: "none",
            display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
            cursor: newMessage.trim() ? "pointer" : "not-allowed",
            transition: "background 0.2s",
            boxShadow: newMessage.trim()
              ? "0 4px 14px rgba(253,80,104,0.4)" : "none"
          }}>➤</button>
      </div>
    </div>
  );
}

export default Chat;