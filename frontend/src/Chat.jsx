import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Phone, Video, PhoneOff } from "lucide-react";
import { joinCall, leaveCall, onUserJoined } from "./useAgora";

const socket = io("https://affinity-hub.onrender.com");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [matchUser, setMatchUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [callState, setCallState] = useState("idle");
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const { id } = useParams();
  const messagesEndRef = useRef(null);
  const tracksRef = useRef(null);
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate("/"); return; }

    socket.emit("join", currentUser.id);
    fetchMatchUser();
    fetchMessages();

    socket.on("receiveMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId !== currentUser.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    // ✅ Incoming call signal
    socket.on("incomingCall", ({ callerId, callType }) => {
      setIncomingCall({ callerId, callType });
      setCallType(callType);
      setCallState("receiving");
    });

    // ✅ Call accepted — both join same channel
    socket.on("callAccepted", async ({ channelName, callType }) => {
      await startAgoraCall(channelName, callType);
      setCallState("ongoing");
    });

    socket.on("callRejected", () => {
      endCall();
      alert("Call was declined.");
    });

    socket.on("callEnded", () => {
      endCall();
    });

    // ✅ Listen for remote user
    onUserJoined((user, mediaType) => {
      if (mediaType === "video" && remoteVideoRef.current) {
        user.videoTrack?.play(remoteVideoRef.current);
      }
      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callRejected");
      socket.off("callEnded");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMatchUser = async () => {
    try {
      const res = await axios.get(
        `https://affinity-hub.onrender.com/api/match/user/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMatchUser(res.data);
    } catch (err) {}
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `https://affinity-hub.onrender.com/api/chat/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (err) {}
  };

  // ✅ Start Agora call
  const startAgoraCall = async (channelName, type) => {
    try {
      const { tracks } = await joinCall(channelName, type);
      tracksRef.current = tracks;

      // Play local video
      if (type === "video" && myVideoRef.current) {
        const videoTrack = tracks.find(t => t.trackMediaType === "video");
        if (videoTrack) videoTrack.play(myVideoRef.current);
      }
    } catch (err) {
      alert("Could not access camera/microphone. Please allow permissions.");
      setCallState("idle");
    }
  };

  // ✅ Caller starts call
  const startCall = async (type) => {
    setCallType(type);
    setCallState("calling");

    // Channel name = sorted user IDs so both join same channel
    const channelName = [currentUser.id, id].sort().join("-");

    socket.emit("callUser", {
      callerId: currentUser.id,
      receiverId: id,
      callType: type,
      channelName
    });

    await startAgoraCall(channelName, type);
  };

  // ✅ Receiver accepts call
  const acceptCall = async () => {
    const channelName = [currentUser.id, incomingCall.callerId].sort().join("-");

    socket.emit("acceptCall", {
      callerId: incomingCall.callerId,
      channelName,
      callType
    });

    await startAgoraCall(channelName, callType);
    setCallState("ongoing");
  };

  const rejectCall = () => {
    socket.emit("rejectCall", { callerId: incomingCall.callerId });
    setCallState("idle");
    setIncomingCall(null);
  };

  const endCall = async () => {
    await leaveCall(tracksRef.current);
    tracksRef.current = null;
    socket.emit("endCall", { receiverId: id });
    setCallState("idle");
    setCallType(null);
    setIncomingCall(null);
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
    setMessages(prev => [...prev, tempMsg]);
    const msgText = newMessage;
    setNewMessage("");
    try {
      await axios.post(
        `https://affinity-hub.onrender.com/api/chat/${id}`,
        { message: msgText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
    socket.emit("typing", { senderId: currentUser.id, receiverId: id });
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

      {/* Incoming Call Popup */}
      {callState === "receiving" && (
        <div style={{
          position: "fixed", inset: 0, background: "#000000cc",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100
        }}>
          <div style={{
            background: "#1a1a1a", borderRadius: "24px",
            padding: "40px", textAlign: "center",
            border: "1px solid #fd5068"
          }}>
            <div style={{ marginBottom: "16px", color: "#fd5068", display: "flex", justifyContent: "center" }}>
              {callType === "video" ? <Video size={60} /> : <Phone size={60} />}
            </div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>
              {matchUser?.name} is calling...
            </h3>
            <p style={{ color: "#888", marginBottom: "24px" }}>
              {callType === "video" ? "Video Call" : "Audio Call"}
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <button onClick={acceptCall} style={{
                background: "#00c853", border: "none",
                borderRadius: "50%", width: "60px", height: "60px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer"
              }}>
                <Phone size={24} color="#fff" />
              </button>
              <button onClick={rejectCall} style={{
                background: "#fd5068", border: "none",
                borderRadius: "50%", width: "60px", height: "60px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer"
              }}>
                <PhoneOff size={24} color="#fff" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ongoing Call Screen */}
      {(callState === "calling" || callState === "ongoing") && (
        <div style={{
          position: "fixed", inset: 0, background: "#000",
          zIndex: 99, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "16px"
        }}>
          {callType === "video" ? (
            <>
              <div ref={remoteVideoRef} style={{
                width: "100%", maxHeight: "60vh",
                borderRadius: "16px", background: "#111"
              }} />
              <div ref={myVideoRef} style={{
                width: "120px", height: "160px",
                position: "absolute", bottom: "100px", right: "20px",
                borderRadius: "12px", border: "2px solid #fd5068",
                background: "#222", overflow: "hidden"
              }} />
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", color: "#fd5068" }}>
                <Phone size={80} />
              </div>
              <h2 style={{ color: "#fff", marginTop: "16px" }}>
                {callState === "calling" ? "Calling..." : "On Call"}
              </h2>
              <p style={{ color: "#888" }}>{matchUser?.name}</p>
            </div>
          )}
          <button onClick={endCall} style={{
            background: "#fd5068", border: "none",
            borderRadius: "50%", width: "64px", height: "64px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "absolute", bottom: "40px"
          }}>
            <PhoneOff size={28} color="#fff" />
          </button>
        </div>
      )}

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
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#fff" }}>
            {matchUser?.name || "Loading..."}
          </h3>
          {isTyping ? (
            <p style={{ color: "#fd5068", fontSize: "12px" }}>typing...</p>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00c853" }} />
              <p style={{ color: "#888", fontSize: "12px" }}>Online</p>
            </div>
          )}
        </div>

        <button onClick={() => startCall("audio")} style={{
          background: "none", border: "none", color: "#fff",
          cursor: "pointer", display: "flex", alignItems: "center", padding: "6px"
        }}>
          <Phone size={22} />
        </button>

        <button onClick={() => startCall("video")} style={{
          background: "none", border: "none", color: "#fff",
          cursor: "pointer", display: "flex", alignItems: "center", padding: "6px"
        }}>
          <Video size={22} />
        </button>

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