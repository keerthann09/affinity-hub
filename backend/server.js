require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// PeerJS server
const peerServer = ExpressPeerServer(server, { debug: true });
app.use('/peerjs', peerServer);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const matchRoutes = require("./routes/match");
app.use("/api/match", matchRoutes);

const chatRoutes = require("./routes/chat");
app.use("/api/chat", chatRoutes);

// Agora token route
const agoraRoutes = require("./routes/agora");
app.use("/api/agora", agoraRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("User joined:", userId);

    // ✅ Notify all senders that this user is now online (delivered)
    // We broadcast to everyone who might have sent messages to this user
    socket.broadcast.emit("userOnline", { userId });
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", {
        sender: senderId,
        message,
        createdAt: new Date()
      });

      // ✅ Receiver is online so mark as delivered immediately
      io.to(receiverSocket).emit("messageDelivered", { senderId });
    }
  });

  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", { senderId });
    }
  });

  // ✅ Receiver opened the chat — mark all as seen
  socket.on("markSeen", ({ viewerId, senderId }) => {
    const senderSocket = onlineUsers[senderId];
    if (senderSocket) {
      io.to(senderSocket).emit("messagesSeen", { by: viewerId });
    }
  });

  // ✅ Messages delivered to receiver
  socket.on("markDelivered", ({ receiverId, senderId }) => {
    const senderSocket = onlineUsers[senderId];
    if (senderSocket) {
      io.to(senderSocket).emit("messagesDelivered", { to: receiverId });
    }
  });

  socket.on("callUser", ({ callerId, receiverId, callType, channelName }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("incomingCall", { callerId, callType, channelName });
    }
  });

  socket.on("acceptCall", ({ callerId, channelName, callType }) => {
    const callerSocket = onlineUsers[callerId];
    if (callerSocket) {
      io.to(callerSocket).emit("callAccepted", { channelName, callType });
    }
  });

  socket.on("rejectCall", ({ callerId }) => {
    const callerSocket = onlineUsers[callerId];
    if (callerSocket) {
      io.to(callerSocket).emit("callRejected");
    }
  });

  socket.on("endCall", ({ receiverId }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("callEnded");
    }
  });

  // ✅ Delete message for everyone
  socket.on("deleteMessageForEveryone", ({ messageId, receiverId }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("messageDeletedForEveryone", { messageId });
    }
  });

  socket.on("disconnect", () => {
    Object.keys(onlineUsers).forEach(userId => {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
      }
    });
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Affinity Hub API Running");
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});