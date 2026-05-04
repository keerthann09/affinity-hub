import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Phone, Video, PhoneOff } from "lucide-react";
import { joinCall, leaveCall, onUserJoined } from "./useAgora";

const socket = io("https://affinity-hub.onrender.com");
const BASE_URL = "https://affinity-hub.onrender.com";

// ✅ Read receipt tick component
function ReadReceipt({ status, isMe }) {
  if (!isMe) return null;

  if (status === "seen") {
    return (
      <span style={{ fontSize: "11px", color: "#4fc3f7", marginLeft: "4px", fontWeight: "600" }}>✓✓</span>
    );
  }
  if (status === "delivered") {
    return (
      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginLeft: "4px" }}>✓✓</span>
    );
  }
  // sent
  return (
    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginLeft: "4px" }}>✓</span>
  );
}

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [matchUser, setMatchUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [callState, setCallState] = useState("idle");
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  // Delete state
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [deleteMenuPos, setDeleteMenuPos] = useState({ x: 0, y: 0 });
  const [deletingId, setDeletingId] = useState(null);
  const longPressTimer = useRef(null);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const { id } = useParams();
  const messagesEndRef = useRef(null);
  const tracksRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate("/"); return; }

    socket.emit("join", currentUser.id);
    fetchMatchUser();
    fetchMessages();

    socket.on("receiveMessage", (msg) => {
      setMessages(prev => [...prev, { ...msg, status: "delivered" }]);
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId !== currentUser.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    // ✅ Other person seen our messages → update all to seen
    socket.on("messagesSeen", ({ by }) => {
      if (by === id) {
        setMessages(prev => prev.map(m =>
          m.sender === currentUser.id || m.sender?.toString() === currentUser.id?.toString()
            ? { ...m, status: "seen" }
            : m
        ));
      }
    });

    // ✅ Messages delivered to receiver
    socket.on("messagesDelivered", ({ to }) => {
      if (to === id) {
        setMessages(prev => prev.map(m =>
          (m.sender === currentUser.id || m.sender?.toString() === currentUser.id?.toString()) && m.status === "sent"
            ? { ...m, status: "delivered" }
            : m
        ));
      }
    });

    socket.on("incomingCall", ({ callerId, callType }) => {
      setIncomingCall({ callerId, callType });
      setCallType(callType);
      setCallState("receiving");
    });

    socket.on("callAccepted", async ({ channelName, callType }) => {
      await startAgoraCall(channelName, callType);
      setCallState("ongoing");
    });

    socket.on("callRejected", () => { endCall(); alert("Call was declined."); });
    socket.on("callEnded", () => { endCall(); });

    // Real-time delete for everyone sync
    socket.on("messageDeletedForEveryone", ({ messageId }) => {
      setMessages(prev => prev.map(m =>
        (m._id === messageId || m._id?.toString() === messageId)
          ? { ...m, deletedForEveryone: true }
          : m
      ));
    });

    onUserJoined((user, mediaType) => {
      console.log("Remote user joined:", user, mediaType);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("messagesSeen");
      socket.off("messagesDelivered");
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callRejected");
      socket.off("callEnded");
      socket.off("messageDeletedForEveryone");
    };
  }, []);

  // ✅ Mark messages as seen when chat opens
  useEffect(() => {
    if (!id || !currentUser.id) return;

    const markSeen = async () => {
      try {
        // Tell DB
        await axios.patch(
          `${BASE_URL}/api/chat/seen/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Tell sender via socket
        socket.emit("markSeen", { viewerId: currentUser.id, senderId: id });
      } catch (err) {}
    };

    markSeen();
  }, [id, messages.length]); // re-run when new messages arrive

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close menu on outside tap
  useEffect(() => {
    const close = () => setSelectedMsg(null);
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, []);

  const fetchMatchUser = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/match/user/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMatchUser(res.data);
    } catch (err) {}
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/chat/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(res.data);

      // ✅ Mark as delivered when we load messages (we're online)
      await axios.patch(
        `${BASE_URL}/api/chat/delivered/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit("markDelivered", { receiverId: currentUser.id, senderId: id });
    } catch (err) {}
  };

  // ============ CALL LOGIC ============
  const startAgoraCall = async (channelName, type) => {
    try {
      const { tracks } = await joinCall(channelName, type);
      tracksRef.current = tracks;
    } catch (err) {
      alert("Could not access camera/microphone. Please allow permissions.");
      setCallState("idle");
    }
  };

  const startCall = async (type) => {
    setCallType(type); setCallState("calling");
    const channelName = [currentUser.id, id].sort().join("-");
    socket.emit("callUser", { callerId: currentUser.id, receiverId: id, callType: type, channelName });
    await startAgoraCall(channelName, type);
  };

  const acceptCall = async () => {
    const channelName = [currentUser.id, incomingCall.callerId].sort().join("-");
    socket.emit("acceptCall", { callerId: incomingCall.callerId, channelName, callType });
    await startAgoraCall(channelName, callType);
    setCallState("ongoing");
  };

  const rejectCall = () => {
    socket.emit("rejectCall", { callerId: incomingCall.callerId });
    setCallState("idle"); setIncomingCall(null);
  };

  const endCall = async () => {
    await leaveCall(tracksRef.current);
    tracksRef.current = null;
    socket.emit("endCall", { receiverId: id });
    setCallState("idle"); setCallType(null); setIncomingCall(null);
  };

  // ============ MESSAGE LOGIC ============
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);

    const tempId = Date.now();
    const tempMsg = {
      message: newMessage,
      sender: currentUser.id,
      createdAt: new Date(),
      _id: tempId,
      status: "sent", // ✅ starts as sent
      deletedFor: [],
      deletedForEveryone: false
    };
    setMessages(prev => [...prev, tempMsg]);
    const msgText = newMessage;
    setNewMessage("");

    try {
      const res = await axios.post(
        `${BASE_URL}/api/chat/${id}`,
        { message: msgText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Replace temp message with real one from DB (has real _id)
      setMessages(prev => prev.map(m =>
        m._id === tempId ? { ...res.data, status: "sent" } : m
      ));

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

  // ============ DELETE LOGIC ============
  const handlePressStart = (e, msg) => {
    e.preventDefault();
    longPressTimer.current = setTimeout(() => {
      const touch = e.touches?.[0] || e;
      const safeX = Math.min(touch.clientX, window.innerWidth - 210);
      const safeY = Math.min(touch.clientY, window.innerHeight - 130);
      setDeleteMenuPos({ x: safeX, y: safeY });
      setSelectedMsg(msg);
    }, 500);
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleDeleteForMe = async () => {
    if (!selectedMsg) return;
    const msgId = selectedMsg._id;
    setSelectedMsg(null);
    setDeletingId(msgId);
    try {
      await axios.patch(`${BASE_URL}/api/chat/${msgId}/delete-for-me`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setTimeout(() => {
        setMessages(prev => prev.map(m =>
          m._id === msgId ? { ...m, deletedFor: [...(m.deletedFor || []), currentUser.id] } : m
        ));
        setDeletingId(null);
      }, 300);
    } catch (err) { setDeletingId(null); }
  };

  const handleDeleteForEveryone = async () => {
    if (!selectedMsg) return;
    const msgId = selectedMsg._id;
    setSelectedMsg(null);
    setDeletingId(msgId);
    try {
      await axios.patch(`${BASE_URL}/api/chat/${msgId}/delete-for-everyone`, {}, { headers: { Authorization: `Bearer ${token}` } });
      socket.emit("deleteMessageForEveryone", { messageId: msgId, receiverId: id });
      setTimeout(() => {
        setMessages(prev => prev.map(m =>
          m._id === msgId ? { ...m, deletedForEveryone: true } : m
        ));
        setDeletingId(null);
      }, 300);
    } catch (err) { setDeletingId(null); }
  };

  const isHiddenForMe = (msg) => {
    if (!msg.deletedFor) return false;
    return msg.deletedFor.some(uid => uid?.toString() === currentUser.id?.toString());
  };

  const isMySender = (msg) =>
    msg.sender === currentUser.id || msg.sender?.toString() === currentUser.id?.toString();

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // ✅ Get status of last sent message (for showing receipt only on last msg)
  const getMessageStatus = (msg, i) => {
    if (!isMySender(msg)) return null;
    // Only show receipt on the last message sent by me
    const myMessages = messages.filter(m => isMySender(m) && !isHiddenForMe(m) && !m.deletedForEveryone);
    const lastMyMsg = myMessages[myMessages.length - 1];
    if (msg._id !== lastMyMsg?._id) return null;
    return msg.status || "sent";
  };

  return (
    <div style={{ height: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column" }}>

      {/* Long-press Context Menu */}
      {selectedMsg && (
        <div
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          style={{
            position: "fixed", left: deleteMenuPos.x, top: deleteMenuPos.y,
            zIndex: 300, background: "#1e1e1e",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "14px", overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
            animation: "scaleIn 0.15s cubic-bezier(0.16,1,0.3,1)",
            minWidth: "200px"
          }}
        >
          <button
            onClick={handleDeleteForMe}
            style={{
              width: "100%", padding: "14px 18px",
              background: "transparent", border: "none",
              color: "#fff", fontSize: "14px", fontWeight: "500",
              cursor: "pointer", textAlign: "left",
              display: "flex", alignItems: "center", gap: "10px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              transition: "background 0.15s"
            }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            onMouseOut={e => e.currentTarget.style.background = "transparent"}
          >
            <span>🙈</span> Delete for me
          </button>
          {isMySender(selectedMsg) && (
            <button
              onClick={handleDeleteForEveryone}
              style={{
                width: "100%", padding: "14px 18px",
                background: "transparent", border: "none",
                color: "#ff4444", fontSize: "14px", fontWeight: "500",
                cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: "10px",
                transition: "background 0.15s"
              }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(255,68,68,0.08)"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}
            >
              <span>🗑️</span> Delete for everyone
            </button>
          )}
        </div>
      )}

      {/* Incoming Call */}
      {callState === "receiving" && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#1a1a1a", borderRadius: "24px", padding: "40px", textAlign: "center", border: "1px solid #fd5068" }}>
            <div style={{ marginBottom: "16px", color: "#fd5068", display: "flex", justifyContent: "center" }}>
              {callType === "video" ? <Video size={60} /> : <Phone size={60} />}
            </div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>{matchUser?.name} is calling...</h3>
            <p style={{ color: "#888", marginBottom: "24px" }}>{callType === "video" ? "Video Call" : "Audio Call"}</p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <button onClick={acceptCall} style={{ background: "#00c853", border: "none", borderRadius: "50%", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Phone size={24} color="#fff" />
              </button>
              <button onClick={rejectCall} style={{ background: "#fd5068", border: "none", borderRadius: "50%", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <PhoneOff size={24} color="#fff" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ongoing Call */}
      {(callState === "calling" || callState === "ongoing") && (
        <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 99, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          {callType === "video" ? (
            <>
              <div id="remote-video" style={{ width: "100%", height: "60vh", borderRadius: "16px", background: "#111" }} />
              <div id="local-video" style={{ width: "120px", height: "160px", position: "absolute", bottom: "100px", right: "20px", borderRadius: "12px", border: "2px solid #fd5068", background: "#222" }} />
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", color: "#fd5068" }}><Phone size={80} /></div>
              <h2 style={{ color: "#fff", marginTop: "16px" }}>{callState === "calling" ? "Calling..." : "On Call"}</h2>
              <p style={{ color: "#888" }}>{matchUser?.name}</p>
            </div>
          )}
          <button onClick={endCall} style={{ background: "#fd5068", border: "none", borderRadius: "50%", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "absolute", bottom: "40px" }}>
            <PhoneOff size={28} color="#fff" />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "14px", borderBottom: "1px solid #1a1a1a", background: "#1a1a1a", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => navigate("/matches")} style={{ background: "none", border: "none", fontSize: "22px", color: "#fff", cursor: "pointer" }}>←</button>
        <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "linear-gradient(135deg, #fd5068, #ff8c5a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0, boxShadow: "0 4px 12px rgba(253,80,104,0.3)" }}>
          {matchUser?.gender === "female" ? "👩" : "👨"}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#fff" }}>{matchUser?.name || "Loading..."}</h3>
          {isTyping ? (
            <p style={{ color: "#fd5068", fontSize: "12px" }}>typing...</p>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00c853" }} />
              <p style={{ color: "#888", fontSize: "12px" }}>Online</p>
            </div>
          )}
        </div>
        <button onClick={() => startCall("audio")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", padding: "6px" }}><Phone size={22} /></button>
        <button onClick={() => startCall("video")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", padding: "6px" }}><Video size={22} /></button>
        <div style={{ background: "#fd506820", color: "#fd5068", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>❤️ Match</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", margin: "auto" }}>
            <div style={{ fontSize: "60px", marginBottom: "16px" }}>💕</div>
            <h3 style={{ color: "#fff", marginBottom: "8px" }}>You matched with {matchUser?.name || "someone"}!</h3>
            <p style={{ color: "#555", fontSize: "14px" }}>Break the ice 👋</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "20px" }}>
              {["👋 Hey there!", "😊 How are you?", "💕 Nice to meet you!"].map((q, i) => (
                <button key={i} onClick={() => setNewMessage(q)} style={{ padding: "8px 16px", background: "#1a1a1a", border: "1px solid #fd5068", borderRadius: "20px", color: "#fd5068", fontSize: "13px", cursor: "pointer" }}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = isMySender(msg);
          const showTime = i === messages.length - 1 || messages[i + 1]?.sender !== msg.sender;
          const hiddenForMe = isHiddenForMe(msg);
          if (hiddenForMe) return null;

          const isDeleting = deletingId === msg._id;
          const isDeletedForAll = msg.deletedForEveryone;
          const receiptStatus = getMessageStatus(msg, i);

          return (
            <div
              key={msg._id || i}
              style={{
                opacity: isDeleting ? 0 : 1,
                transform: isDeleting ? "scale(0.95)" : "scale(1)",
                transition: "opacity 0.3s ease, transform 0.3s ease"
              }}
            >
              <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "8px" }}>
                {!isMe && (
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #fd5068, #ff8c5a)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", flexShrink: 0,
                    visibility: showTime ? "visible" : "hidden"
                  }}>
                    {matchUser?.gender === "female" ? "👩" : "👨"}
                  </div>
                )}

                <div style={{ maxWidth: "70%" }}>
                  <div
                    onMouseDown={e => !isDeletedForAll && handlePressStart(e, msg)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={e => !isDeletedForAll && handlePressStart(e, msg)}
                    onTouchEnd={handlePressEnd}
                    onContextMenu={e => e.preventDefault()}
                    style={{
                      padding: "12px 16px",
                      borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: isDeletedForAll ? "transparent" : isMe ? "linear-gradient(135deg, #fd5068, #ff8c5a)" : "#1a1a1a",
                      border: isDeletedForAll ? "1px dashed rgba(255,255,255,0.15)" : isMe ? "none" : "1px solid #2a2a2a",
                      color: isDeletedForAll ? "rgba(255,255,255,0.3)" : "#fff",
                      fontSize: isDeletedForAll ? "13px" : "15px",
                      fontStyle: isDeletedForAll ? "italic" : "normal",
                      lineHeight: "1.5",
                      boxShadow: (!isDeletedForAll && isMe) ? "0 4px 12px rgba(253,80,104,0.3)" : "none",
                      userSelect: "none",
                      cursor: isDeletedForAll ? "default" : "pointer",
                      WebkitTouchCallout: "none",
                      WebkitUserSelect: "none"
                    }}
                  >
                    {isDeletedForAll ? "🚫 This message was deleted" : msg.message}
                  </div>

                  {/* ✅ Time + Read receipt row */}
                  {(showTime || receiptStatus) && (
                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      gap: "2px", marginTop: "4px"
                    }}>
                      {msg.createdAt && (
                        <p style={{ color: "#444", fontSize: "11px" }}>
                          {formatTime(msg.createdAt)}
                        </p>
                      )}
                      {/* ✅ Read receipt tick */}
                      <ReadReceipt status={receiptStatus} isMe={isMe} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing bubble */}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #fd5068, #ff8c5a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>
              {matchUser?.gender === "female" ? "👩" : "👨"}
            </div>
            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", display: "flex", gap: "4px" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fd5068", animation: `bounce 1s infinite ${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid #1a1a1a", background: "#1a1a1a", display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          value={newMessage}
          onChange={handleTyping}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "13px 18px", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: "24px", color: "#fff", fontSize: "15px", outline: "none" }}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: newMessage.trim() ? "linear-gradient(135deg, #fd5068, #ff8c5a)" : "#2a2a2a",
            fontSize: "20px", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            cursor: newMessage.trim() ? "pointer" : "not-allowed",
            transition: "background 0.2s",
            boxShadow: newMessage.trim() ? "0 4px 14px rgba(253,80,104,0.4)" : "none"
          }}>➤</button>
      </div>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
}

export default Chat;